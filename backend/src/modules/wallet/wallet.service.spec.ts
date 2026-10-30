// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletServiceError } from '../wallet-service-client/wallet-service-client.types';

const LOCAL_USER_ID = 'local-user-1';
const GLOBAL_USER_ID = '507f1f77bcf86cd799439011';

function makeSupabaseService() {
  // `.from` fails the test outright if ever called - this IS the "Supabase
  // wallet mutation prevention" assertion for the three migrated methods.
  const from = jest.fn(() => {
    throw new Error('TEST FAILURE: wallet.service.ts touched Supabase directly after migration');
  });
  return { getAdminClient: jest.fn(() => ({ from })) } as any;
}

function makeConfigService(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = { ...overrides };
  return { get: (key: string) => values[key] } as any;
}

describe('WalletService (Phase 2 - Central Wallet Service delegation)', () => {
  let supabaseService: ReturnType<typeof makeSupabaseService>;
  let globalUserLinkService: any;
  let walletServiceClient: any;
  let service: WalletService;

  beforeEach(() => {
    supabaseService = makeSupabaseService();
    globalUserLinkService = {
      findGlobalUserId: jest.fn(async () => GLOBAL_USER_ID),
    };
    walletServiceClient = {
      getBalance: jest.fn(),
      credit: jest.fn(),
      debit: jest.fn(),
    };
    service = new WalletService(
      makeConfigService(),
      supabaseService,
      {} as any, // PrismaService - unused by the migrated methods
      {} as any, // DynamicSettingsService - unused by the migrated methods
      globalUserLinkService,
      walletServiceClient,
    );
  });

  describe('getBalance', () => {
    it('delegates to the Central Wallet Service for a linked user and never touches Supabase', async () => {
      walletServiceClient.getBalance.mockResolvedValue({
        success: true,
        globalUserId: GLOBAL_USER_ID,
        currency: 'EUR',
        balances: { chips: { minor: 10000, major: 100 }, bonusChips: { minor: 0, major: 0 } },
      });

      const result = await service.getBalance(LOCAL_USER_ID);

      expect(result).toEqual({ userId: LOCAL_USER_ID, balance: 100, currency: 'EUR' });
      expect(walletServiceClient.getBalance).toHaveBeenCalledWith(GLOBAL_USER_ID);
      expect(supabaseService.getAdminClient).not.toHaveBeenCalled();
    });

    it('fails closed with BadRequestException for a user with no linked PGX Casino wallet, never touching Supabase', async () => {
      globalUserLinkService.findGlobalUserId.mockResolvedValue(null);

      await expect(service.getBalance(LOCAL_USER_ID)).rejects.toBeInstanceOf(BadRequestException);
      expect(supabaseService.getAdminClient).not.toHaveBeenCalled();
      expect(walletServiceClient.getBalance).not.toHaveBeenCalled();
    });

    it('maps a Central Wallet Service error to the matching Nest exception', async () => {
      walletServiceClient.getBalance.mockRejectedValue(
        new WalletServiceError('WALLET_NOT_FOUND', 'No wallet linked to this user.', 404),
      );

      await expect(service.getBalance(LOCAL_USER_ID)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('deductFunds', () => {
    it('debits via the Central Wallet Service with a deterministic order-scoped idempotency key', async () => {
      walletServiceClient.debit.mockResolvedValue({
        success: true,
        status: 'completed',
        ledgerId: 'l1',
        walletField: 'chips',
        balanceAfter: 50,
        balanceMinorAfter: 5000,
      });

      const result = await service.deductFunds(LOCAL_USER_ID, 50, 'ORDER-123', 'Order payment');

      expect(walletServiceClient.debit).toHaveBeenCalledWith({
        globalUserId: GLOBAL_USER_ID,
        amountMinor: 5000,
        currency: 'EUR',
        walletField: 'chips',
        referenceId: 'ORDER-123',
        idempotencyKey: 'pgxsports-order-debit:ORDER-123',
        metadata: { description: 'Order payment', orderNumber: 'ORDER-123' },
      });
      expect(result).toEqual({ success: true, targetUserId: GLOBAL_USER_ID, newBalance: 50 });
      expect(supabaseService.getAdminClient).not.toHaveBeenCalled();
    });

    it('rejects a non-positive amount before calling the Central Wallet Service', async () => {
      await expect(service.deductFunds(LOCAL_USER_ID, 0, 'ORDER-1')).rejects.toBeInstanceOf(BadRequestException);
      expect(walletServiceClient.debit).not.toHaveBeenCalled();
    });

    it('maps INSUFFICIENT_BALANCE from the Central Wallet Service to a BadRequestException', async () => {
      walletServiceClient.debit.mockRejectedValue(
        new WalletServiceError('INSUFFICIENT_BALANCE', 'The wallet balance is insufficient for this debit.', 400),
      );

      await expect(service.deductFunds(LOCAL_USER_ID, 999, 'ORDER-456')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reusing the SAME order number produces the SAME idempotency key (safe to retry)', async () => {
      walletServiceClient.debit.mockResolvedValue({
        success: true,
        status: 'completed',
        ledgerId: 'l1',
        walletField: 'chips',
        balanceAfter: 50,
        balanceMinorAfter: 5000,
      });

      await service.deductFunds(LOCAL_USER_ID, 50, 'ORDER-SAME');
      await service.deductFunds(LOCAL_USER_ID, 50, 'ORDER-SAME');

      const keys = walletServiceClient.debit.mock.calls.map((c: any) => c[0].idempotencyKey);
      expect(keys[0]).toBe(keys[1]);
    });
  });

  describe('refundFunds', () => {
    it('credits via the Central Wallet Service and never touches Supabase', async () => {
      walletServiceClient.credit.mockResolvedValue({
        success: true,
        status: 'completed',
        ledgerId: 'l2',
        walletField: 'chips',
        balanceAfter: 150,
        balanceMinorAfter: 15000,
      });

      await service.refundFunds(LOCAL_USER_ID, 50, 'ORDER-789', 'Order cancelled');

      expect(walletServiceClient.credit).toHaveBeenCalledWith({
        globalUserId: GLOBAL_USER_ID,
        amountMinor: 5000,
        currency: 'EUR',
        walletField: 'chips',
        referenceId: 'ORDER-789',
        idempotencyKey: 'pgxsports-order-refund:ORDER-789',
        metadata: { description: 'Order cancelled', orderNumber: 'ORDER-789' },
      });
      expect(supabaseService.getAdminClient).not.toHaveBeenCalled();
    });

    it('silently no-ops (never throws) for a zero amount, preserving the original method contract', async () => {
      await expect(service.refundFunds(LOCAL_USER_ID, 0, 'ORDER-0')).resolves.toBeUndefined();
      expect(walletServiceClient.credit).not.toHaveBeenCalled();
    });

    it('never throws for an unlinked user (best-effort contract) and never touches Supabase', async () => {
      globalUserLinkService.findGlobalUserId.mockResolvedValue(null);
      await expect(service.refundFunds(LOCAL_USER_ID, 50, 'ORDER-X')).resolves.toBeUndefined();
      expect(supabaseService.getAdminClient).not.toHaveBeenCalled();
    });

    it('never throws even when the Central Wallet Service call itself fails (best-effort contract)', async () => {
      walletServiceClient.credit.mockRejectedValue(new WalletServiceError('NETWORK_ERROR', 'down', 502));
      await expect(service.refundFunds(LOCAL_USER_ID, 50, 'ORDER-Y')).resolves.toBeUndefined();
    });
  });

  describe('createTopUpSession legacy guard', () => {
    it('is disabled by default - throws before reaching the old Supabase/Stripe EUR path', async () => {
      await expect(service.createTopUpSession(LOCAL_USER_ID, 'a@b.com', { amount: 10 } as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(supabaseService.getAdminClient).not.toHaveBeenCalled();
    });

    it('does not throw the guard error when WALLET_LEGACY_TOPUP_ENABLED=true', async () => {
      const enabledService = new WalletService(
        makeConfigService({ WALLET_LEGACY_TOPUP_ENABLED: 'true', FRONTEND_URL: 'http://localhost:3000' }),
        supabaseService,
        { user: { findUnique: jest.fn(async () => null) } } as any,
        { getStripeClient: jest.fn(async () => ({ client: { checkout: { sessions: { create: jest.fn(async () => ({ id: 's1', url: 'https://x' })) } } }, profile: { currency: 'eur' } })) } as any,
        globalUserLinkService,
        walletServiceClient,
      );

      await expect(
        enabledService.createTopUpSession(LOCAL_USER_ID, 'a@b.com', { amount: 10 } as any),
      ).resolves.toMatchObject({ sessionId: 's1' });
    });
  });
});
