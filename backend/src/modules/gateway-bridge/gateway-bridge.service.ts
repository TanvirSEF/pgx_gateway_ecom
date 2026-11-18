import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
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
  cloakedProductName?: string;
  realProductName?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class GatewayBridgeService {
  private readonly logger = new Logger(GatewayBridgeService.name);

  // Curated authentic digital software & cloud service tiers from pgxdigital.shop
  private readonly DEFAULT_CLOAKED_TIERS = [
    {
      min: 0,
      max: 45,
      name: 'Digital Marketing Automation SOP Pack',
      sku: 'DM-SOP-01',
      description: 'Comprehensive digital marketing templates, social workflows, and single-user commercial license.',
    },
    {
      min: 45,
      max: 95,
      name: 'AI Business Chatbot Pro - Annual Access',
      sku: 'AI-BOT-PRO-01',
      description: 'Plug-and-play multi-channel AI customer agent with real-time translation and CRM integration.',
    },
    {
      min: 95,
      max: 180,
      name: 'E-commerce Full-Stack Website Kit & Commercial License',
      sku: 'WEB-KIT-ECOM-01',
      description: 'High-converting responsive storefront UI kit with React/Next.js components and lifetime license.',
    },
    {
      min: 180,
      max: 350,
      name: 'Business CRM Platform - Annual Commercial License',
      sku: 'CRM-SUB-01',
      description: 'Cloud business pipeline platform with visual deal stages, automated invoicing, and unlimited users.',
    },
    {
      min: 350,
      max: 700,
      name: 'Enterprise Cloud Architecture & Multi-Seat Developer License',
      sku: 'CLOUD-DEV-MULTI',
      description: 'High-availability cloud automation suite, custom API endpoints, and corporate developer license.',
    },
    {
      min: 700,
      max: Infinity,
      name: 'Custom High-Volume Cloud Automation Architecture Suite',
      sku: 'ENT-AUTO-SUITE',
      description: 'Enterprise-grade cloud infrastructure deployment templates, multi-region clustering, and corporate license.',
    },
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly dynamicSettingsService: DynamicSettingsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Resolves a cloaked product title and description that matches
   * or closely approximates the transaction price on pgxdigital.shop.
   * Ensures zero real merchant or gateway indicators leak to Stripe.
   */
  async resolveCloakedProduct(amount: number): Promise<{ name: string; description: string; sku: string }> {
    try {
      // Query active products from pgxdigital catalog
      const products = await this.prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, sku: true, price: true, shortDesc: true },
      });

      if (products && products.length > 0) {
        // Find product with the closest price
        let closest = products[0];
        let minDiff = Math.abs(Number(closest.price) - amount);

        for (const prod of products) {
          const diff = Math.abs(Number(prod.price) - amount);
          if (diff < minDiff) {
            minDiff = diff;
            closest = prod;
          }
        }

        // If price is within a close range (within $25 or 25%), use the exact catalog product
        if (minDiff <= 25 || minDiff / amount <= 0.25) {
          return {
            name: closest.name,
            sku: closest.sku || `SKU-${closest.id.slice(-6).toUpperCase()}`,
            description: closest.shortDesc || 'Electronic Software Delivery & Commercial Cloud Access License',
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(`Could not query database for catalog cloaking: ${err.message}. Using built-in tiers.`);
    }

    // Match against official pgxdigital.shop digital software tiers
    const matchedTier =
      this.DEFAULT_CLOAKED_TIERS.find((t) => amount >= t.min && amount < t.max) ||
      this.DEFAULT_CLOAKED_TIERS[this.DEFAULT_CLOAKED_TIERS.length - 1];

    return {
      name: matchedTier.name,
      sku: matchedTier.sku,
      description: matchedTier.description,
    };
  }

  /**
   * Initiates a Stripe Checkout Session through the e-commerce storefront
   * on behalf of PGX Gateway / Arxopay sub-merchants.
   * Completely cloaks product information and disguises metadata fields.
   */
  async initiateCheckout(dto: InitiateGatewayCheckoutDto) {
    const targetMode = dto.mode === 'live' ? 'live' : 'test';
    const { client: stripeClient, profile } = await this.dynamicSettingsService.getStripeClient(targetMode);

    if (!stripeClient) {
      throw new InternalServerErrorException('Stripe payment processor is not configured on the e-commerce platform.');
    }

    const currency = (dto.currency || profile.currency || 'USD').toLowerCase();
    const unitAmountCents = Math.round(dto.amount * 100);

    if (unitAmountCents < 50) {
      throw new BadRequestException('Transaction amount must be at least $0.50.');
    }

    // 1. Cloak product description by matching price with pgxdigital catalog
    const cloakedItem = await this.resolveCloakedProduct(dto.amount);
    const shortRef = dto.orderId
      ? dto.orderId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()
      : Date.now().toString(36).toUpperCase();
    const lineItemDesc = `${cloakedItem.description} (Ref: #${shortRef})`;

    // 2. Disguise metadata into innocuous short codes (cid, rid, oid, sku)
    // Avoids any explicit keywords: 'merchant_ref_id', 'reseller_id', 'pgx_gateway', 'gateway_amount'
    const rawReseller = String(dto.resellerId || 'admin_root').toUpperCase();
    const partnerCode = rawReseller.includes('ARXO')
      ? 'AR'
      : rawReseller === 'ADMIN_ROOT' || rawReseller === 'ROOT'
        ? 'PX'
        : rawReseller.slice(0, 2);

    const cloakedMetadata: Record<string, string> = {
      cid: dto.merchantRefId,
      rid: partnerCode,
      oid: dto.orderId || `ORD-${shortRef}`,
      sku: cloakedItem.sku,
      cart_id: `CR-${Date.now().toString(36).toUpperCase()}`,
    };

    try {
      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: cloakedItem.name,
                description: lineItemDesc,
              },
              unit_amount: unitAmountCents,
            },
            quantity: 1,
          },
        ],
        metadata: cloakedMetadata,
        payment_intent_data: {
          description: `${cloakedItem.name} (${cloakedItem.sku})`,
          metadata: cloakedMetadata,
        },
        customer_email: dto.customerEmail || undefined,
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
      });

      this.logger.log(
        `Created Cloaked Bridge Stripe session: ${session.id} for client ${dto.merchantRefId} ($${dto.amount} ${currency.toUpperCase()}) [Item: ${cloakedItem.name} | SKU: ${cloakedItem.sku}]`,
      );

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
        cloakedProduct: {
          name: cloakedItem.name,
          sku: cloakedItem.sku,
        },
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
