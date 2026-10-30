// Implements: Phase 2 - PGXSports Shared Wallet Integration
//
// Response/request shapes match PGX Casino's ACTUAL deployed Phase 1
// contract (pgx_frontend_api_node@ec5ee86b,
// App/Controller/integration/walletServiceController.js) - read from the
// real source, not re-derived from the architecture doc's illustrative
// examples, which use different field names.

export class WalletServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = 'WalletServiceError';
  }
}

export interface WalletBalances {
  chips: { minor: number; major: number };
  bonusChips: { minor: number; major: number };
}

export interface WalletBalanceResponse {
  success: true;
  globalUserId: string;
  currency: string;
  balances: WalletBalances;
}

export type WalletField = 'chips' | 'bonusChips';

export interface CreditDebitParams {
  globalUserId: string;
  amountMinor: number;
  currency: string;
  walletField: WalletField;
  referenceId?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface WalletOperationResponse {
  success: boolean;
  status: 'completed' | 'pending' | 'failed';
  replay?: boolean;
  ledgerId: string;
  walletField: string;
  balanceBefore?: number;
  balanceAfter: number;
  balanceMinorAfter: number;
}

export interface WalletHistoryTransaction {
  ledgerId: string;
  operationType: 'CREDIT' | 'DEBIT';
  amountMinor: number;
  currency: string;
  walletField: string;
  balanceBefore: number;
  balanceAfter: number;
  source: string;
  referenceId: string;
  status: string;
  createdAt: string;
}

export interface WalletHistoryResponse {
  success: true;
  globalUserId: string;
  page: number;
  limit: number;
  total: number;
  transactions: WalletHistoryTransaction[];
}

export interface WalletStatusResponse {
  success: true;
  found: boolean;
  ledgerId?: string;
  status?: string;
  operationType?: string;
  walletField?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt?: string;
  updatedAt?: string;
}
