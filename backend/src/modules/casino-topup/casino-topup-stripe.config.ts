// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
//
// API KEY SHARED, WEBHOOK SECRET DEDICATED (2026-11-02, client decision, revised).
// The Stripe API key (STRIPE_SECRET_KEY) is shared with the storefront's
// e-commerce-approved Stripe account, per the client's explicit 2026-11-02
// decision - both credential pairs already held the identical value, and
// that compliance trade-off is the client's call, not this code's (see the
// architecture doc's "An e-commerce Stripe account must NOT conceal
// casino/gambling wallet funding").
//
// The webhook signing secret is NOT shared, and never can be: Stripe issues
// a unique signing secret per registered webhook ENDPOINT, not per account
// or API key. The casino top-up flow is served by its own endpoint/route
// (POST /api/webhook/casino-stripe, separate from the storefront's POST
// /api/webhook/stripe), so it has its own CASINO_TOPUP_STRIPE_WEBHOOK_SECRET,
// restored here - reusing STRIPE_WEBHOOK_SECRET for this endpoint would be
// simply wrong (Stripe would reject the signature), not just a compliance
// concern.
//
// Still mirrors PGX Casino's own App/Config/stripeConfig.js gate: fails
// closed by construction until BOTH values are present and non-empty -
// credential presence alone is the switch, no separate on/off flag, no
// package require()'d unguarded at module-load time.
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class CasinoTopupStripeConfig {
  private readonly logger = new Logger(CasinoTopupStripeConfig.name);
  private cachedClient: { secretKey: string; client: Stripe } | null = null;

  constructor(private readonly configService: ConfigService) {}

  private get secretKey(): string {
    return this.configService.get<string>('STRIPE_SECRET_KEY') || '';
  }

  private get webhookSecret(): string {
    return this.configService.get<string>('CASINO_TOPUP_STRIPE_WEBHOOK_SECRET') || '';
  }

  /** 'test' | 'live' - informational only (which Stripe mode the configured
   * secret key belongs to), read from the key's own prefix so it can never
   * drift from the actual credential in use. Never trust an env flag for
   * this - the key itself is the source of truth. */
  get mode(): 'test' | 'live' | 'unknown' {
    if (this.secretKey.startsWith('sk_test_')) return 'test';
    if (this.secretKey.startsWith('sk_live_')) return 'live';
    return 'unknown';
  }

  isEnabled(): boolean {
    return Boolean(this.secretKey) && Boolean(this.webhookSecret);
  }

  /** Names/booleans only - never values. Safe to log. */
  describeStatus() {
    return {
      enabled: this.isEnabled(),
      mode: this.mode,
      missing: [
        ...(this.secretKey ? [] : ['STRIPE_SECRET_KEY']),
        ...(this.webhookSecret ? [] : ['CASINO_TOPUP_STRIPE_WEBHOOK_SECRET']),
      ],
    };
  }

  getWebhookSecret(): string {
    return this.webhookSecret;
  }

  /** Returns null (never throws) when not configured - callers MUST check
   * for null and fail closed, never attempt a Checkout session or wallet
   * credit without a real client. */
  getClient(): Stripe | null {
    if (!this.isEnabled()) return null;
    if (this.cachedClient && this.cachedClient.secretKey === this.secretKey) {
      return this.cachedClient.client;
    }
    try {
      // Same literal + `as any` as dynamic-settings.service.ts's own
      // getStripeClient() - the installed `stripe` SDK's TS types pin
      // apiVersion to its own latest known literal, which this repo has
      // already chosen to work around the same way elsewhere.
      const client = new Stripe(this.secretKey, { apiVersion: '2025-02-24.acacia' as any });
      this.cachedClient = { secretKey: this.secretKey, client };
      return client;
    } catch (err: any) {
      this.logger.error(`Could not construct Stripe client: ${err?.message}`);
      return null;
    }
  }
}
