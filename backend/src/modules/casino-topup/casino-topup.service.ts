// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
//
// Given an ALREADY-VERIFIED handoff (HandoffService.verifyAndConsume has
// run - this service never re-derives identity/amount from anything else),
// creates the pending MongoDB top-up and the Stripe Checkout session.
// Mirrors the architecture doc's "Payment Bridge: create pending top-up
// BEFORE calling Stripe" ordering (doc: "Create wallet_topups before
// calling Stripe. This record binds the expected amount and currency to
// one wallet and one payment attempt.").
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerifiedHandoff } from '../wallet-bridge/handoff.types';
import { CasinoTopupStripeConfig } from './casino-topup-stripe.config';
import { WalletTopupService } from '../wallet-topup/topup.service';

const PROVIDER = 'casino-stripe-topup';

@Injectable()
export class CasinoTopupService {
  private readonly logger = new Logger(CasinoTopupService.name);

  constructor(
    private readonly stripeConfig: CasinoTopupStripeConfig,
    private readonly topupService: WalletTopupService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creates (or, on a retried call for the SAME handoff nonce, returns the
   * EXISTING) pending top-up + Stripe Checkout session, and returns the
   * Checkout URL for the browser.
   */
  async createCheckoutSessionForVerifiedHandoff(
    verified: VerifiedHandoff,
    pgxsportsUserId: string,
  ): Promise<{ checkoutUrl: string; idempotencyKey: string }> {
    if (!this.topupService.isConfigured()) {
      throw new ServiceUnavailableException('The wallet top-up database is not currently available.');
    }
    const client = this.stripeConfig.getClient();
    if (!client) {
      this.logger.warn(`Stripe wallet top-up is disabled: ${JSON.stringify(this.stripeConfig.describeStatus())}`);
      throw new ServiceUnavailableException('Wallet top-up via Stripe is not currently available.');
    }

    // Deterministic key derived from the handoff's own one-time nonce - a
    // retried call for the SAME handoff (e.g. a double-submitted redeem
    // request arriving before the nonce-consumption race resolves, or a
    // genuine network retry) returns the SAME pending top-up/session,
    // never a second one.
    const idempotencyKey = `casino-topup:${verified.nonce}`;

    const topup = await this.topupService.createPending({
      pgxCasinoUserId: verified.globalUserId,
      pgxsportsUserId,
      amountMinor: verified.amountMinor,
      currency: verified.currency,
      provider: PROVIDER,
      idempotencyKey,
    });

    // Retried call for a top-up that already has a session - return the
    // existing Checkout URL rather than minting a second Stripe session.
    if (topup.stripeSessionId) {
      const existingSession = await client.checkout.sessions.retrieve(topup.stripeSessionId);
      if (existingSession.url) {
        return { checkoutUrl: existingSession.url, idempotencyKey };
      }
    }

    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || '').replace(/\/+$/, '');
    const successUrl = `${verified.returnUrl || frontendUrl}?status=success&topup=${idempotencyKey}`;
    const cancelUrl = `${verified.returnUrl || frontendUrl}?status=cancelled&topup=${idempotencyKey}`;

    try {
      const session = await client.checkout.sessions.create(
        {
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: verified.currency.toLowerCase(),
                unit_amount: verified.amountMinor,
                product_data: { name: 'PGX Casino shared wallet top-up' },
              },
              quantity: 1,
            },
          ],
          customer_email: verified.email,
          // doc §9.1: internal identifiers travel in metadata, but the
          // webhook never trusts metadata for amount/currency - it always
          // re-reads those off Stripe's own confirmed objects.
          metadata: {
            type: 'casino_wallet_topup',
            idempotencyKey,
            pgxCasinoUserId: verified.globalUserId,
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
        // Stripe-level idempotency: a retried create() call for the SAME
        // key returns the ALREADY-created session instead of minting a
        // second one - defense in depth alongside the Mongo-level check above.
        { idempotencyKey: `stripe-checkout-${idempotencyKey}` },
      );

      await this.topupService.setStripeSessionId(idempotencyKey, session.id);

      if (!session.url) {
        throw new ServiceUnavailableException('Stripe did not return a Checkout URL');
      }
      return { checkoutUrl: session.url, idempotencyKey };
    } catch (err: any) {
      this.logger.error(`Failed to create Stripe Checkout session for ${idempotencyKey}: ${err?.message}`);
      throw new ServiceUnavailableException('Could not create a Stripe Checkout session');
    }
  }
}
