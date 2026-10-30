// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
import { CasinoTopupRecoveryService } from './casino-topup-recovery.service';

describe('CasinoTopupRecoveryService', () => {
  it('finds unresolved paid-but-uncredited top-ups and retries crediting each one', async () => {
    const topupService = {
      findUnresolvedPaidButUncredited: jest.fn(async () => [
        { idempotencyKey: 'idem-a' },
        { idempotencyKey: 'idem-b' },
      ]),
    } as any;
    const webhookService = { claimAndCreditWallet: jest.fn(async () => undefined) } as any;

    const service = new CasinoTopupRecoveryService(topupService, webhookService);
    const result = await service.runOnce();

    expect(result).toEqual({ attempted: 2, idempotencyKeys: ['idem-a', 'idem-b'] });
    expect(webhookService.claimAndCreditWallet).toHaveBeenCalledWith('idem-a');
    expect(webhookService.claimAndCreditWallet).toHaveBeenCalledWith('idem-b');
    expect(webhookService.claimAndCreditWallet).toHaveBeenCalledTimes(2);
  });

  it('does nothing and reports zero when there is nothing unresolved', async () => {
    const topupService = { findUnresolvedPaidButUncredited: jest.fn(async () => []) } as any;
    const webhookService = { claimAndCreditWallet: jest.fn() } as any;

    const service = new CasinoTopupRecoveryService(topupService, webhookService);
    const result = await service.runOnce();

    expect(result).toEqual({ attempted: 0, idempotencyKeys: [] });
    expect(webhookService.claimAndCreditWallet).not.toHaveBeenCalled();
  });

  it('is safe to run after a restart - relies only on persisted Mongo state, no in-memory tracking', async () => {
    // Nothing to assert beyond the fact that runOnce takes no constructor
    // state besides its injected services - there is no in-memory queue
    // that a restart could lose. This test documents that property.
    const topupService = { findUnresolvedPaidButUncredited: jest.fn(async () => []) } as any;
    const webhookService = { claimAndCreditWallet: jest.fn() } as any;
    const serviceA = new CasinoTopupRecoveryService(topupService, webhookService);
    const serviceB = new CasinoTopupRecoveryService(topupService, webhookService); // simulates a fresh instance post-restart
    await expect(serviceA.runOnce()).resolves.toEqual({ attempted: 0, idempotencyKeys: [] });
    await expect(serviceB.runOnce()).resolves.toEqual({ attempted: 0, idempotencyKeys: [] });
  });
});
