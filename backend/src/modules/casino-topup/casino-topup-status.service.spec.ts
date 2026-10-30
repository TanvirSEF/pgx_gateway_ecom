// Implements: Phase 4 - Casino <-> PGXSports top-up payment-status tracking
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CasinoTopupStatusService, mapTopupToStatusState } from './casino-topup-status.service';

describe('mapTopupToStatusState (pure mapping, no I/O)', () => {
  it('maps a not-yet-confirmed payment to PENDING_PAYMENT', () => {
    for (const paymentStatus of ['created', 'pending', 'processing'] as const) {
      expect(mapTopupToStatusState({ paymentStatus, walletCreditStatus: 'not_started' })).toBe('PENDING_PAYMENT');
    }
  });

  it('maps a failed or cancelled payment to PAYMENT_FAILED regardless of walletCreditStatus', () => {
    expect(mapTopupToStatusState({ paymentStatus: 'failed', walletCreditStatus: 'not_started' })).toBe('PAYMENT_FAILED');
    expect(mapTopupToStatusState({ paymentStatus: 'cancelled', walletCreditStatus: 'not_started' })).toBe('PAYMENT_FAILED');
  });

  it('maps a completed payment with the wallet credit still in flight to PAYMENT_SUCCEEDED_CREDIT_PENDING', () => {
    for (const walletCreditStatus of ['not_started', 'pending', 'crediting'] as const) {
      expect(mapTopupToStatusState({ paymentStatus: 'completed', walletCreditStatus })).toBe(
        'PAYMENT_SUCCEEDED_CREDIT_PENDING',
      );
    }
  });

  it('maps a completed payment with a completed wallet credit to PAYMENT_SUCCEEDED_CREDIT_COMPLETED', () => {
    expect(mapTopupToStatusState({ paymentStatus: 'completed', walletCreditStatus: 'completed' })).toBe(
      'PAYMENT_SUCCEEDED_CREDIT_COMPLETED',
    );
  });

  it('maps a completed payment with a failed wallet credit to CREDIT_REQUIRES_ATTENTION', () => {
    expect(mapTopupToStatusState({ paymentStatus: 'completed', walletCreditStatus: 'failed' })).toBe(
      'CREDIT_REQUIRES_ATTENTION',
    );
  });
});

describe('CasinoTopupStatusService.getStatusForCasinoUser', () => {
  function makeService(doc: any, isConfigured = true) {
    const topupService = {
      isConfigured: jest.fn(() => isConfigured),
      findByIdempotencyKey: jest.fn(async () => doc),
    } as any;
    return { service: new CasinoTopupStatusService(topupService), topupService };
  }

  it('returns the mapped status for the owning user', async () => {
    const { service } = makeService({
      pgxCasinoUserId: 'user-1',
      paymentStatus: 'completed',
      walletCreditStatus: 'completed',
      currency: 'EUR',
      amountMinor: 2500,
    });
    const result = await service.getStatusForCasinoUser('casino-topup:abc', 'user-1');
    expect(result).toEqual({
      topupId: 'casino-topup:abc',
      state: 'PAYMENT_SUCCEEDED_CREDIT_COMPLETED',
      paymentStatus: 'completed',
      walletCreditStatus: 'completed',
      currency: 'EUR',
      amountMinor: 2500,
    });
  });

  it('rejects with the SAME NotFoundException when the top-up does not exist at all', async () => {
    const { service } = makeService(null);
    await expect(service.getStatusForCasinoUser('casino-topup:unknown', 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects with the SAME NotFoundException (never leaking that it exists) when it belongs to a different user', async () => {
    const { service } = makeService({
      pgxCasinoUserId: 'owner-user',
      paymentStatus: 'completed',
      walletCreditStatus: 'completed',
      currency: 'EUR',
      amountMinor: 2500,
    });
    let ownerError: Error | undefined;
    let strangerError: Error | undefined;
    try {
      await service.getStatusForCasinoUser('casino-topup:unknown-to-this-test', 'nobody');
    } catch (e) {
      ownerError = e as Error;
    }
    try {
      await service.getStatusForCasinoUser('casino-topup:abc', 'attacker-user');
    } catch (e) {
      strangerError = e as Error;
    }
    expect(ownerError).toBeInstanceOf(NotFoundException);
    expect(strangerError).toBeInstanceOf(NotFoundException);
    expect((strangerError as NotFoundException).message).toBe((ownerError as NotFoundException).message);
  });

  it('refuses when the wallet-topup database is not configured', async () => {
    const { service } = makeService(null, false);
    await expect(service.getStatusForCasinoUser('casino-topup:abc', 'user-1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
