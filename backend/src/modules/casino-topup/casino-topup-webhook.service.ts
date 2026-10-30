// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
//
// Verified Stripe webhook settlement for the CASINO wallet top-up flow -
// intentionally its OWN controller/route/secret, never folded into the
// existing webhook.service.ts (that one serves PGXSports' e-commerce
// Stripe profiles; mixing the two would be exactly the "e-commerce Stripe
// account conceals casino/gambling wallet funding" risk the architecture
// doc warns against, even though code-level metadata.type checks would
// also prevent cross-crediting).
//
// NEVER credits the wallet from the Checkout success REDIRECT - only from
// here, a verified server-to-server webhook (architecture doc: "returning
// to a success page NEVER credits a wallet").
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CasinoTopupStripeConfig } from './casino-topup-stripe.config';
import { WalletTopupService } from '../wallet-topup/topup.service';
import { WalletServiceClientService } from '../wallet-service-client/wallet-service-client.service';
import { WalletServiceError } from '../wallet-service-client/wallet-service-client.types';

const CASINO_TOPUP_METADATA_TYPE = 'casino_wallet_topup';

@Injectable()
export class CasinoTopupWebhookService {
  private readonly logger = new Logger(CasinoTopupWebhookService.name);

  constructor(
    private readonly stripeConfig: CasinoTopupStripeConfig,
    private readonly topupService: WalletTopupService,
    private readonly walletServiceClient: WalletServiceClientService,
  ) {}

  async handleWebhook(signature: string, rawBody: Buffer): Promise<{ received: true }> {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }
    const client = this.stripeConfig.getClient();
    const webhookSecret = this.stripeConfig.getWebhookSecret();
    if (!client || !webhookSecret) {
      // Deliberately NO permissive dev-mode JSON-parse fallback here (unlike
      // webhook.service.ts's legacy e-commerce path) - this settles real
      // wallet money, so an unconfigured endpoint must refuse everything,
      // never guess.
      throw new BadRequestException('Casino wallet top-up Stripe webhook is not configured');
    }

    let event: Stripe.Event;
    try {
      event = client.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Signature verification failed: ${err?.message}`);
      throw new BadRequestException(`Webhook Error: ${err?.message || 'Invalid signature'}`);
    }

    const { isDuplicate } = await this.topupService.claimStripeEventOrDetectDuplicate(event.id, event.type);
    if (isDuplicate) {
      this.logger.warn(`Duplicate Stripe event ${event.id} (${event.type}) - already processed, skipping`);
      return { received: true };
    }

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await this.processPaymentSucceeded(event.data.object as Stripe.Checkout.Session, client);
        break;
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired':
        await this.processPaymentFailed(event.data.object as Stripe.Checkout.Session, event.type);
        break;
      default:
        this.logger.log(`Unhandled casino-topup Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  private async processPaymentFailed(session: Stripe.Checkout.Session, eventType: string) {
    const idempotencyKey = session.metadata?.idempotencyKey;
    if (!idempotencyKey || session.metadata?.type !== CASINO_TOPUP_METADATA_TYPE) return;
    await this.topupService.markPaymentStatus(idempotencyKey, 'failed', `Stripe event: ${eventType}`);
    this.logger.warn(`Top-up ${idempotencyKey} failed/expired (${eventType}) - wallet not credited`);
  }

  private async processPaymentSucceeded(session: Stripe.Checkout.Session, client: Stripe) {
    const idempotencyKey = session.metadata?.idempotencyKey;
    const isCasinoTopup = session.metadata?.type === CASINO_TOPUP_METADATA_TYPE;
    if (!isCasinoTopup || !idempotencyKey) {
      this.logger.log(`Checkout session ${session.id} is not a casino wallet top-up; skipping`);
      return;
    }

    const topup = await this.topupService.findByIdempotencyKey(idempotencyKey);
    if (!topup) {
      // "Unknown session" - a webhook for a top-up we have no record of.
      // Never credit anything in this case; just log it for investigation.
      this.logger.error(`No wallet_topups record for idempotencyKey=${idempotencyKey} (session ${session.id})`);
      return;
    }

    if (topup.paymentStatus === 'completed' && topup.walletCreditStatus === 'completed') {
      // Already fully settled (e.g. checkout.session.completed arriving
      // after async_payment_succeeded already processed it) - idempotent no-op.
      return;
    }

    // Never trust the webhook/session body for the amount/currency actually
    // paid - re-derive both from Stripe's own PaymentIntent, mirroring PGX
    // Casino's own Stripe.js settleTopup discipline.
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    const paymentIntent = paymentIntentId ? await client.paymentIntents.retrieve(paymentIntentId) : null;
    const confirmedMinor = paymentIntent?.amount_received ?? session.amount_total ?? 0;
    const confirmedCurrency = String(paymentIntent?.currency || session.currency || '').toUpperCase();

    if (confirmedMinor !== topup.amountMinor) {
      await this.topupService.markPaymentStatus(
        idempotencyKey,
        'failed',
        `Amount mismatch: expected ${topup.amountMinor}, Stripe confirmed ${confirmedMinor}`,
      );
      this.logger.error(`Top-up ${idempotencyKey}: amount mismatch - NOT crediting`);
      return;
    }
    if (confirmedCurrency !== topup.currency.toUpperCase()) {
      await this.topupService.markPaymentStatus(
        idempotencyKey,
        'failed',
        `Currency mismatch: expected ${topup.currency}, Stripe confirmed ${confirmedCurrency}`,
      );
      this.logger.error(`Top-up ${idempotencyKey}: currency mismatch - NOT crediting`);
      return;
    }

    await this.topupService.markPaymentStatus(idempotencyKey, 'completed');
    await this.claimAndCreditWallet(idempotencyKey);
  }

  /**
   * Shared by webhook settlement AND the recovery worker - this is the
   * ONLY path either of them uses to reach walletServiceClient.credit, so
   * "prevent concurrent workers from crediting the same top-up twice" is
   * enforced HERE (via WalletTopupService.claimForCrediting's atomic
   * findOneAndUpdate claim) rather than left to chance. If the claim
   * returns null, some other caller already owns this top-up right now
   * (or it is already completed) - this call simply returns, never
   * attempts the credit itself.
   *
   * Even without the claim, Phase 1's own ledger idempotency (insert-first
   * on {source, idempotencyKey}) would still prevent a double MONEY
   * credit - the claim's job is to also keep THIS app's own bookkeeping
   * (paymentStatus/walletCreditStatus) consistent, which Phase 1 cannot do
   * on PGXSports' behalf.
   */
  async claimAndCreditWallet(idempotencyKey: string): Promise<void> {
    const claimed = await this.topupService.claimForCrediting(idempotencyKey);
    if (!claimed) {
      this.logger.log(`Top-up ${idempotencyKey}: not claimable right now (already crediting/completed) - skipping`);
      return;
    }

    try {
      const res = await this.walletServiceClient.credit({
        globalUserId: claimed.pgxCasinoUserId,
        amountMinor: claimed.amountMinor,
        currency: claimed.currency,
        walletField: 'chips',
        referenceId: idempotencyKey,
        idempotencyKey,
        metadata: { description: 'PGXSports Stripe wallet top-up', source: 'casino-topup' },
      });
      await this.topupService.markCreditCompleted(idempotencyKey, res.ledgerId);
      this.logger.log(`Top-up ${idempotencyKey}: wallet credited, ledgerId=${res.ledgerId}`);
    } catch (err: any) {
      const message = err instanceof WalletServiceError ? err.message : err?.message;
      this.logger.error(`Top-up ${idempotencyKey}: wallet credit failed (will retry) - ${message}`);
      await this.topupService.markWalletCreditStatus(idempotencyKey, 'failed');
      await this.topupService.recordRetry(idempotencyKey);
    }
  }
}
