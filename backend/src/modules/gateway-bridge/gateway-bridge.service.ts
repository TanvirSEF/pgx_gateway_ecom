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
      max: 5000,
      name: 'Custom High-Volume Cloud Automation Architecture Suite',
      sku: 'ENT-AUTO-SUITE',
      description: 'Enterprise-grade cloud infrastructure deployment templates, multi-region clustering, and corporate license.',
    },
    {
      min: 5000,
      max: 20000,
      name: 'Apple Mac Pro Rack System - Dual M2 Ultra Enterprise Studio Cluster',
      sku: 'PGX-ENT-APPL-01',
      description: 'Enterprise 19-inch 5U rackmount Mac Pro with dual Apple M2 Ultra processors, 192GB Unified Memory, and 8TB Ultra-Fast SSD.',
    },
    {
      min: 20000,
      max: 45000,
      name: 'RED V-RAPTOR XL 8K VV Multi-Format Large Cinema Camera Package',
      sku: 'PGX-ENT-RED-04',
      description: 'Unified flagship studio camera with 8K VV sensor, integrated wireless timecode, genlock, electronic ND, and multi-voltage auxiliary power.',
    },
    {
      min: 45000,
      max: Infinity,
      name: 'NVIDIA DGX H100 Enterprise AI Supercomputer Flagship Cluster',
      sku: 'PGX-ENT-NVDGX-09',
      description: 'The global benchmark for generative AI and LLM training. 8x NVIDIA H100 SXM5 80GB GPUs with 640GB aggregate VRAM and 32 PFLOPS FP8 compute.',
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

    // 1. Resolve clean order number for line item display (e.g. 'Order #2781')
    // Sanitizes order ID to remove any merchant/site names and leave pure neutral reference numbers
    const rawOrderId = String(dto.orderId || '').trim();
    const digitsOnly = rawOrderId.replace(/\D/g, '');
    const cleanOrderNum = digitsOnly.length >= 2
      ? digitsOnly
      : (rawOrderId.replace(/[^a-zA-Z0-9]/g, '').slice(-8) || Date.now().toString().slice(-6));
    const displayProductName = `Order #${cleanOrderNum}`;

    // Cloaked internal catalog fallback for metadata tracking
    const cloakedItem = await this.resolveCloakedProduct(dto.amount);

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
      oid: dto.orderId || `ORD-${cleanOrderNum}`,
      sku: cloakedItem.sku,
      cart_id: `CR-${Date.now().toString(36).toUpperCase()}`,
    };

    // 3. Cloak success and cancel URLs to pgxdigital.shop domain
    // Stripe will strictly see https://pgxdigital.shop as the return destination
    const rawFrontend = this.configService.get<string>('FRONTEND_URL') || 'https://pgxmarketplace.shop';
    const storefrontUrl = (rawFrontend.includes(',') ? rawFrontend.split(',')[0].trim() : rawFrontend.trim()).replace(/\/+$/, '');

    const encodedSuccess = dto.successUrl ? Buffer.from(dto.successUrl).toString('base64url') : '';
    const encodedCancel = dto.cancelUrl ? Buffer.from(dto.cancelUrl).toString('base64url') : '';

    const cloakedSuccessUrl = `${storefrontUrl}/api/gateway-bridge/return?status=success&session_id={CHECKOUT_SESSION_ID}&redir=${encodedSuccess}`;
    const cloakedCancelUrl = `${storefrontUrl}/api/gateway-bridge/return?status=cancel&redir=${encodedCancel}`;

    try {
      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        payment_method_options: {
          card: {
            request_three_d_secure: 'any',
          },
        },
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: displayProductName,
                description: `Payment for ${displayProductName}`,
              },
              unit_amount: unitAmountCents,
            },
            quantity: 1,
          },
        ],
        metadata: cloakedMetadata,
        payment_intent_data: {
          description: `${displayProductName} (${cloakedItem.sku})`,
          metadata: cloakedMetadata,
        },
        customer_email: dto.customerEmail || undefined,
        success_url: cloakedSuccessUrl,
        cancel_url: cloakedCancelUrl,
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
