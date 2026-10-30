// Implements: Phase 4 - Casino <-> PGXSports top-up payment-status tracking
//
// The conceptual states the task asks for, mapped from the EXISTING stored
// fields (WalletTopupDocument.paymentStatus / walletCreditStatus) - no new
// status values are stored, this is a pure read-side presentation mapping.
export type TopupStatusState =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_SUCCEEDED_CREDIT_PENDING'
  | 'PAYMENT_SUCCEEDED_CREDIT_COMPLETED'
  | 'CREDIT_REQUIRES_ATTENTION';

export interface TopupStatusResponse {
  topupId: string; // the idempotencyKey - the one identifier that survives the whole flow (Checkout success/cancel URL, recovery queries)
  state: TopupStatusState;
  paymentStatus: string;
  walletCreditStatus: string;
  currency: string;
  amountMinor: number;
}
