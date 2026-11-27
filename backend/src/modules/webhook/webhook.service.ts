import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayBridgeService } from '../gateway-bridge/gateway-bridge.service';
import { MailService } from '../mail/mail.service';
import { DynamicSettingsService } from '../settings/dynamic-settings.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly dynamicSettingsService: DynamicSettingsService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly gatewayBridgeService: GatewayBridgeService,
  ) {}

  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }

    const { client: stripeClient } = await this.dynamicSettingsService.getStripeClient();
    const webhookSecrets = await this.dynamicSettingsService.getAllWebhookSecrets();

    let event: Stripe.Event | null = null;
    let lastError: Error | null = null;

    // Attempt signature verification across available secrets (active first, then secondary profiles, then env)
    for (const item of webhookSecrets) {
      const sec = item.secret;
      if (!sec || sec === 'whsec_test_placeholder_or_live_secret') continue;
      try {
        event = stripeClient.webhooks.constructEvent(rawBody, signature, sec);
        if (event) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    // If no secret succeeded, only allow unsigned JSON fallback in non-production dev/test when no secret is configured
    if (!event) {
      const hasAnyConfiguredSecret = webhookSecrets.some(
        (s) => s.secret && s.secret !== 'whsec_test_placeholder_or_live_secret',
      );
      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

      if (!hasAnyConfiguredSecret && !isProduction) {
        this.logger.warn('No valid Stripe webhook secret configured (non-production). Using JSON parse fallback for event.');
        try {
          event = JSON.parse(rawBody.toString()) as Stripe.Event;
        } catch (jsonErr: any) {
          throw new BadRequestException(`Invalid JSON payload: ${jsonErr.message}`);
        }
      } else {
        this.logger.error(`Webhook signature verification failed: ${lastError?.message || 'No valid webhook secret configured'}`);
        throw new BadRequestException(`Webhook Error: ${lastError?.message || 'Invalid signature'}`);
      }
    }

    this.logger.log(`Received Stripe webhook event: ${event.type} [${event.id}]`);

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.processCheckoutSessionCompleted(session, event.id);
        break;
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.processCheckoutSessionAsyncFailed(session, event.id);
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.processCheckoutSessionExpired(session, event.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.processPaymentIntentFailed(paymentIntent, event.id, stripeClient);
        break;
      }
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  private async processCheckoutSessionCompleted(session: Stripe.Checkout.Session, eventId: string) {
    // Delayed/async payment methods (e.g. SEPA Direct Debit, ACH) fire
    // checkout.session.completed with payment_status === 'unpaid' and settle
    // later via checkout.session.async_payment_succeeded. Never fulfill early.
    if (session.payment_status && session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      this.logger.log(
        `Checkout session ${session.id} has payment_status=${session.payment_status}; awaiting async settlement before fulfilling.`,
      );
      return;
    }

    // 1. Check if session originated from Gateway Bridge (supports disguised 'cid' or legacy 'merchant_ref_id' / 'source')
    if (session.metadata?.cid || session.metadata?.merchant_ref_id || session.metadata?.source === 'pgx_gateway') {
      await this.processGatewayBridgePayment(session, eventId);
      return;
    }

    const sessionType = session.metadata?.type;

    if (sessionType === 'order_payment') {
      await this.processOrderPaymentCompleted(session);
      return;
    }

    const userId = session.metadata?.user_id;
    const amountEurStr = session.metadata?.amount_eur;
    const isWalletTopUp = session.metadata?.type === 'wallet_topup';

    if (!isWalletTopUp || !userId) {
      this.logger.log(`Checkout session ${session.id} is not a wallet topup or has no user_id; skipping wallet credit.`);
      return;
    }

    // Implements: Phase 2 - PGXSports Shared Wallet Integration (safety
    // guard, paired with wallet.service.ts's createTopUpSession guard).
    // This branch still credits the OLD Supabase wallet directly - with
    // wallet.service.ts's getBalance/deductFunds/refundFunds now reading
    // from the Central Wallet Service, letting this run would silently
    // credit a balance product purchases can no longer see. A session
    // created before this guard existed could still arrive here, so the
    // check lives at settlement time too, not only at session-creation
    // time in wallet.service.ts.
    if (this.configService.get<string>('WALLET_LEGACY_TOPUP_ENABLED') !== 'true') {
      this.logger.warn(
        `Checkout session ${session.id} is a legacy Supabase wallet topup, which is disabled (WALLET_LEGACY_TOPUP_ENABLED!=true). Not crediting - this payment needs manual review/refund.`,
      );
      return;
    }

    // Determine amount in EUR (convert from total cents if metadata missing)
    const amountTotalCents = session.amount_total ?? 0;
    const amountVal = amountEurStr ? parseFloat(amountEurStr) : amountTotalCents / 100;

    if (!amountVal || amountVal <= 0) {
      this.logger.error(`Invalid deposit amount (${amountVal}) in checkout session ${session.id}`);
      return;
    }

    const supabase = this.supabaseService.getAdminClient();
    if (!supabase) {
      this.logger.error('Cannot process webhook topup: Supabase Admin Client is not initialized.');
      throw new InternalServerErrorException('Database client unavailable');
    }

    // Idempotency check: see if a transaction with this session ID already exists in transactions table
    const descText = `Stripe Top-Up (Session: ${session.id})`;
    const { data: existingTx, error: checkError } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('description', descText)
      .maybeSingle();

    if (checkError) {
      this.logger.warn(`Could not verify idempotency for session ${session.id}: ${checkError.message}`);
    }

    if (existingTx && existingTx.status === 'completed') {
      this.logger.warn(`Top-up for session ${session.id} already processed. Skipping duplicate execution.`);
      return;
    }

    this.logger.log(`Crediting wallet for user ${userId}: €${amountVal.toFixed(2)} via add_funds RPC`);

    try {
      const { error: rpcError } = await supabase.rpc('add_funds', {
        user_uuid: userId,
        amount_val: amountVal,
        desc_text: descText,
      });

      if (rpcError) {
        this.logger.error(`add_funds RPC failed for user ${userId}, session ${session.id}:`, rpcError);
        throw new InternalServerErrorException(`Database RPC failed: ${rpcError.message}`);
      }

      this.logger.log(`Successfully credited €${amountVal.toFixed(2)} to user ${userId} wallet`);
    } catch (err: any) {
      this.logger.error(`Failed to credit wallet for session ${session.id}:`, err);
      throw err;
    }
  }

  private async processOrderPaymentCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    const orderNumber = session.metadata?.orderNumber;

    if (!orderId && !orderNumber) {
      this.logger.warn(`Stripe session ${session.id} marked as order_payment has no orderId or orderNumber in metadata.`);
      return;
    }

    this.logger.log(`Processing Stripe card order payment for orderId: ${orderId}, orderNumber: ${orderNumber}`);

    const order = await this.prisma.order.findFirst({
      where: orderId ? { id: orderId } : { orderNumber },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        invoice: true,
      },
    });

    if (!order) {
      this.logger.error(`Order not found for Stripe session ${session.id} (orderId: ${orderId}, orderNumber: ${orderNumber})`);
      return;
    }

    // Idempotency: if already marked PAID, skip duplicate processing
    if (order.paymentStatus === PaymentStatus.PAID) {
      this.logger.log(`Order ${order.orderNumber} is already marked as PAID; skipping duplicate fulfillment.`);
      return;
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

    // Update order status to PAID and PROCESSING
    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
        statusHistory: {
          create: {
            status: OrderStatus.PROCESSING,
            note: `Payment confirmed via Stripe Card Checkout (Session: ${session.id}, Tx: ${paymentIntentId})`,
          },
        },
      },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        invoice: true,
      },
    });

    this.logger.log(`Order ${order.orderNumber} successfully marked PAID and PROCESSING via Stripe.`);

    // Send confirmation email to guest or user
    const recipientEmail =
      updatedOrder.guestEmail ||
      (updatedOrder.userId
        ? (await this.prisma.user.findUnique({ where: { id: updatedOrder.userId } }))?.email
        : null);

    if (recipientEmail) {
      try {
        await this.mailService.sendOrderConfirmation(recipientEmail, updatedOrder as any);
        this.logger.log(`Sent order confirmation email to ${recipientEmail} for order ${order.orderNumber}`);
      } catch (err: any) {
        this.logger.error(`Failed to send order confirmation email for order ${order.orderNumber}: ${err.message}`);
      }
    }
  }

  private async processGatewayBridgePayment(session: Stripe.Checkout.Session, eventId: string) {
    const metadata = session.metadata || {};
    const merchantRefId = metadata.cid || metadata.merchant_ref_id || '';
    const rawReseller = metadata.rid || metadata.reseller_id || 'admin_root';
    const resellerId =
      rawReseller === 'AR'
        ? 'ARXO'
        : rawReseller === 'PX'
          ? 'admin_root'
          : rawReseller;
    const orderId = metadata.oid || metadata.order_id || '';
    const grossAmount = (session.amount_total || 0) / 100;
    const currency = (session.currency || 'USD').toUpperCase();
    const cloakedSku = metadata.sku || '';

    this.logger.log(
      `Processing PGX Gateway payment completion for client ${merchantRefId} (Session: ${session.id}, Gross: $${grossAmount} ${currency}) [SKU: ${cloakedSku}]`,
    );

    const forwarded = await this.gatewayBridgeService.forwardSettlementToGateway({
      stripeSessionId: session.id,
      stripeEventId: eventId,
      merchantRefId,
      resellerId,
      orderId,
      grossAmount,
      currency,
      customerEmail: session.customer_details?.email || undefined,
      customerName: session.customer_details?.name || undefined,
      metadata: {
        ...metadata,
        cloakedSku,
      },
    });

    if (!forwarded) {
      this.logger.warn(
        `Settlement forwarding to PGX Gateway returned unsuccessful status for session ${session.id}. May require retry.`,
      );
    }
  }

  private async forwardGatewayBridgeFailure(params: {
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    stripeEventId: string;
    metadata: Record<string, any>;
    grossAmount: number;
    currency: string;
    customerEmail?: string;
    customerName?: string;
    failureReason: string;
    declineCode: string;
  }) {
    const merchantRefId = params.metadata.cid || params.metadata.merchant_ref_id || '';
    if (!merchantRefId) return;

    const rawReseller = params.metadata.rid || params.metadata.reseller_id || 'admin_root';
    const resellerId =
      rawReseller === 'AR'
        ? 'ARXO'
        : rawReseller === 'PX'
          ? 'admin_root'
          : rawReseller;
    const orderId = params.metadata.oid || params.metadata.order_id || '';

    this.logger.warn(
      `Forwarding PGX Gateway payment failure for client ${merchantRefId} (Session: ${params.stripeSessionId || 'N/A'}, PI: ${params.stripePaymentIntentId || 'N/A'}, Reason: ${params.declineCode})`,
    );

    await this.gatewayBridgeService.forwardSettlementToGateway({
      status: 'failed',
      stripeSessionId: params.stripeSessionId,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeEventId: params.stripeEventId,
      merchantRefId,
      resellerId,
      orderId,
      grossAmount: params.grossAmount,
      currency: params.currency,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      failureReason: params.failureReason,
      declineCode: params.declineCode,
      metadata: {
        ...params.metadata,
        cloakedSku: params.metadata.sku || '',
      },
    });
  }

  private async processCheckoutSessionExpired(session: Stripe.Checkout.Session, eventId: string) {
    const metadata = session.metadata || {};
    if (metadata.cid || metadata.merchant_ref_id || metadata.source === 'pgx_gateway') {
      await this.forwardGatewayBridgeFailure({
        stripeSessionId: session.id,
        stripeEventId: eventId,
        metadata,
        grossAmount: (session.amount_total || 0) / 100,
        currency: (session.currency || 'USD').toUpperCase(),
        customerEmail: session.customer_details?.email || session.customer_email || undefined,
        customerName: session.customer_details?.name || undefined,
        failureReason: 'Checkout session expired without payment',
        declineCode: 'checkout.session.expired',
      });
    }
  }

  private async processPaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
    eventId: string,
    stripeClient: Stripe,
  ) {
    const metadata = paymentIntent.metadata || {};
    if (!metadata.cid && !metadata.merchant_ref_id && metadata.source !== 'pgx_gateway') {
      return;
    }

    let resolvedSessionId: string | undefined;
    try {
      const sessions = await stripeClient.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1,
      });
      resolvedSessionId = sessions.data[0]?.id;
    } catch (err: any) {
      this.logger.warn(`Could not resolve Checkout Session for failed PI ${paymentIntent.id}: ${err.message}`);
    }

    const lastErr = paymentIntent.last_payment_error;
    await this.forwardGatewayBridgeFailure({
      stripeSessionId: resolvedSessionId,
      stripePaymentIntentId: paymentIntent.id,
      stripeEventId: eventId,
      metadata,
      grossAmount: (paymentIntent.amount || 0) / 100,
      currency: (paymentIntent.currency || 'USD').toUpperCase(),
      customerEmail: paymentIntent.receipt_email || undefined,
      failureReason: lastErr?.message || 'Card payment declined or blocked by Stripe',
      declineCode: lastErr?.decline_code || lastErr?.code || 'payment_failed',
    });
  }

  private async processCheckoutSessionAsyncFailed(session: Stripe.Checkout.Session, eventId: string) {
    this.logger.warn(`Async Stripe Checkout payment failed for session ${session.id}`);

    const metadata = session.metadata || {};
    if (metadata.cid || metadata.merchant_ref_id || metadata.source === 'pgx_gateway') {
      await this.forwardGatewayBridgeFailure({
        stripeSessionId: session.id,
        stripeEventId: eventId,
        metadata,
        grossAmount: (session.amount_total || 0) / 100,
        currency: (session.currency || 'USD').toUpperCase(),
        customerEmail: session.customer_details?.email || session.customer_email || undefined,
        customerName: session.customer_details?.name || undefined,
        failureReason: 'Async payment failed in Stripe',
        declineCode: 'async_payment_failed',
      });
      return;
    }

    if (session.metadata?.type !== 'order_payment') {
      return;
    }

    const orderId = session.metadata?.orderId;
    const orderNumber = session.metadata?.orderNumber;
    if (!orderId && !orderNumber) return;

    const order = await this.prisma.order.findFirst({
      where: orderId ? { id: orderId } : { orderNumber },
    });

    if (!order || order.paymentStatus === PaymentStatus.PAID || order.status === OrderStatus.CANCELLED) {
      return;
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        statusHistory: {
          create: {
            status: OrderStatus.CANCELLED,
            note: `Async payment failed via Stripe Checkout (Session: ${session.id})`,
          },
        },
      },
    });
  }
}
