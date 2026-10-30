// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
import { ServiceUnavailableException } from '@nestjs/common';
import { CasinoTopupService } from './casino-topup.service';
import { VerifiedHandoff } from '../wallet-bridge/handoff.types';

const VERIFIED: VerifiedHandoff = {
  globalUserId: '507f1f77bcf86cd799439011',
  amountMinor: 2500,
  currency: 'EUR',
  returnUrl: 'https://staging.pgxcasino.com/wallet?topup=stripe',
  email: 'player@example.test',
  nonce: 'nonce-abc-123',
};

function makeConfigService(values: Record<string, string> = {}) {
  return { get: (key: string) => values[key] } as any;
}

describe('CasinoTopupService.createCheckoutSessionForVerifiedHandoff', () => {
  function makeDeps() {
    const topupService = {
      isConfigured: jest.fn(() => true),
      createPending: jest.fn(),
      setStripeSessionId: jest.fn(async () => undefined),
    } as any;
    const sessionsCreate = jest.fn();
    const sessionsRetrieve = jest.fn();
    const stripeConfig = {
      getClient: jest.fn(() => ({ checkout: { sessions: { create: sessionsCreate, retrieve: sessionsRetrieve } } })),
      describeStatus: jest.fn(() => ({ enabled: true })),
    } as any;
    return { topupService, stripeConfig, sessionsCreate, sessionsRetrieve };
  }

  it('creates a pending top-up, a Checkout session, and returns its URL', async () => {
    const { topupService, stripeConfig, sessionsCreate } = makeDeps();
    topupService.createPending.mockResolvedValue({
      pgxCasinoUserId: VERIFIED.globalUserId,
      pgxsportsUserId: 'local-1',
      amountMinor: 2500,
      currency: 'EUR',
      idempotencyKey: 'casino-topup:nonce-abc-123',
    });
    sessionsCreate.mockResolvedValue({ id: 'cs_test_1', url: 'https://checkout.stripe.com/pay/cs_test_1' });

    const service = new CasinoTopupService(stripeConfig, topupService, makeConfigService({ FRONTEND_URL: 'https://staging.pgxcasino.com' }));
    const result = await service.createCheckoutSessionForVerifiedHandoff(VERIFIED, 'local-1');

    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_1');
    expect(result.idempotencyKey).toBe('casino-topup:nonce-abc-123');
    expect(topupService.createPending).toHaveBeenCalledWith({
      pgxCasinoUserId: VERIFIED.globalUserId,
      pgxsportsUserId: 'local-1',
      amountMinor: 2500,
      currency: 'EUR',
      provider: 'casino-stripe-topup',
      idempotencyKey: 'casino-topup:nonce-abc-123',
    });
    expect(sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        line_items: [expect.objectContaining({ price_data: expect.objectContaining({ currency: 'eur', unit_amount: 2500 }) })],
        metadata: expect.objectContaining({ type: 'casino_wallet_topup', idempotencyKey: 'casino-topup:nonce-abc-123' }),
      }),
      expect.objectContaining({ idempotencyKey: 'stripe-checkout-casino-topup:nonce-abc-123' }),
    );
    expect(topupService.setStripeSessionId).toHaveBeenCalledWith('casino-topup:nonce-abc-123', 'cs_test_1');
  });

  it('is disabled (ServiceUnavailableException) when Stripe is not configured, and creates no pending top-up', async () => {
    const { topupService, stripeConfig } = makeDeps();
    stripeConfig.getClient.mockReturnValue(null);

    const service = new CasinoTopupService(stripeConfig, topupService, makeConfigService());
    await expect(service.createCheckoutSessionForVerifiedHandoff(VERIFIED, 'local-1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(topupService.createPending).not.toHaveBeenCalled();
  });

  it('is disabled (ServiceUnavailableException) when the wallet-topup Mongo connection is not configured', async () => {
    const { topupService, stripeConfig } = makeDeps();
    topupService.isConfigured.mockReturnValue(false);

    const service = new CasinoTopupService(stripeConfig, topupService, makeConfigService());
    await expect(service.createCheckoutSessionForVerifiedHandoff(VERIFIED, 'local-1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('retrying for the SAME handoff nonce returns the EXISTING session, never creates a second one', async () => {
    const { topupService, stripeConfig, sessionsCreate, sessionsRetrieve } = makeDeps();
    topupService.createPending.mockResolvedValue({
      pgxCasinoUserId: VERIFIED.globalUserId,
      pgxsportsUserId: 'local-1',
      amountMinor: 2500,
      currency: 'EUR',
      idempotencyKey: 'casino-topup:nonce-abc-123',
      stripeSessionId: 'cs_test_existing',
    });
    sessionsRetrieve.mockResolvedValue({ id: 'cs_test_existing', url: 'https://checkout.stripe.com/pay/cs_test_existing' });

    const service = new CasinoTopupService(stripeConfig, topupService, makeConfigService());
    const result = await service.createCheckoutSessionForVerifiedHandoff(VERIFIED, 'local-1');

    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_existing');
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it('wraps a Stripe API failure in a ServiceUnavailableException rather than leaking the raw error', async () => {
    const { topupService, stripeConfig, sessionsCreate } = makeDeps();
    topupService.createPending.mockResolvedValue({
      pgxCasinoUserId: VERIFIED.globalUserId,
      pgxsportsUserId: 'local-1',
      amountMinor: 2500,
      currency: 'EUR',
      idempotencyKey: 'casino-topup:nonce-abc-123',
    });
    sessionsCreate.mockRejectedValue(new Error('Stripe API down'));

    const service = new CasinoTopupService(stripeConfig, topupService, makeConfigService());
    await expect(service.createCheckoutSessionForVerifiedHandoff(VERIFIED, 'local-1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
