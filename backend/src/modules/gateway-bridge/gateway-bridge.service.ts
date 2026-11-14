import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicSettingsService } from '../settings/dynamic-settings.service';
import { InitiateGatewayCheckoutDto } from './dto/initiate-gateway-checkout.dto';

export interface GatewaySettlementPayload {
  stripeSessionId: string;
  stripeEventId: string;
  merchantRefId: string;
  resellerId: string;
  orderId: string;
  grossAmount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class GatewayBridgeService {
  private readonly logger = new Logger(GatewayBridgeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dynamicSettingsService: DynamicSettingsService,
  ) {}

  /**
   * Initiates a Stripe Checkout Session through the e-commerce storefront
   * on behalf of PGX Gateway / Arxopay sub-merchants.
   */
  async initiateCheckout(dto: InitiateGatewayCheckoutDto) {
    const { client: stripeClient, profile } = await this.dynamicSettingsService.getStripeClient();

    if (!stripeClient) {
      throw new InternalServerErrorException('Stripe payment processor is not configured on the e-commerce platform.');
    }

    const currency = (dto.currency || profile.currency || 'USD').toLowerCase();
    const unitAmountCents = Math.round(dto.amount * 100);

    if (unitAmountCents < 50) {
      throw new BadRequestException('Transaction amount must be at least $0.50.');
    }

    // Authentic e-commerce line item presentation
    const productTitle = dto.productName || 'PGX Digital Software Asset & Commercial License';
    const productDesc = `Order Ref #${dto.orderId} - Merchant: ${dto.merchantRefId}`;

    try {
      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: productTitle,
                description: productDesc,
              },
              unit_amount: unitAmountCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          source: 'pgx_gateway',
          merchant_ref_id: dto.merchantRefId,
          reseller_id: dto.resellerId || 'admin_root',
          order_id: dto.orderId,
          gateway_amount: String(dto.amount),
        },
        payment_intent_data: {
          description: `${productTitle} (#${dto.orderId})`,
          metadata: {
            source: 'pgx_gateway',
            merchant_ref_id: dto.merchantRefId,
            reseller_id: dto.resellerId || 'admin_root',
            order_id: dto.orderId,
            gateway_amount: String(dto.amount),
          },
        },
        customer_email: dto.customerEmail || undefined,
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
      });

      this.logger.log(
        `Created Gateway Bridge Stripe session: ${session.id} for merchant ${dto.merchantRefId} ($${dto.amount} ${currency.toUpperCase()})`,
      );

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create Stripe Checkout session: ${err.message}`, err.stack);
      throw new BadRequestException(`Stripe error: ${err.message}`);
    }
  }

  /**
   * Forwards a verified Stripe payment event to PGX Gateway Backend
   * for sub-merchant and reseller ledger credit.
   */
  async forwardSettlementToGateway(payload: GatewaySettlementPayload): Promise<boolean> {
    const gatewayUrl = (this.configService.get<string>('PGX_GATEWAY_BE_URL') || 'http://localhost:5000').replace(
      /\/+$/,
      '',
    );
    const bridgeSecret = this.configService.get<string>('GATEWAY_BRIDGE_SECRET') || '';

    const targetEndpoint = `${gatewayUrl}/api/v1/webhooks/gateway-settle`;

    try {
      this.logger.log(`Forwarding payment settlement to PGX Gateway: ${targetEndpoint} for session ${payload.stripeSessionId}`);

      const response = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gateway-bridge-secret': bridgeSecret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`PGX Gateway settlement webhook failed with status ${response.status}: ${errorText}`);
        return false;
      }

      const result = await response.json();
      this.logger.log(`PGX Gateway successfully processed settlement: ${JSON.stringify(result)}`);
      return true;
    } catch (fetchErr: any) {
      this.logger.error(`Network error forwarding settlement to PGX Gateway: ${fetchErr.message}`);
      return false;
    }
  }
}
