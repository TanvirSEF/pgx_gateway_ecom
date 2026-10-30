// Implements: Phase 2 - PGXSports Shared Wallet Integration
//
// The `wallet_topups` collection from the shared-wallet architecture doc
// (§8/§26), scoped to PGXSports' side of the Stripe top-up flow. Lives in
// the same MongoDB deployment as PGX Casino's walletLedger (separate
// collection, separate concern) - NOT a Postgres/Prisma model, per the
// doc's own instruction that financial collections needing one atomic
// operation together belong on the same deployment. Phase 2 defines the
// schema/indexes only; nothing here creates a Stripe Checkout session or
// writes a real document outside this module's own tests.
import type { Collection, ObjectId } from 'mongodb';

export const WALLET_TOPUP_COLLECTION = 'wallet_topups';

export type TopupPaymentStatus = 'created' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Deliberately separate from paymentStatus, per the architecture doc: a
// payment can be verified-complete while the wallet credit is still
// pending/retrying (Central Wallet Service unreachable at the moment of
// webhook processing) - collapsing the two into one status would make
// that in-between state unrepresentable.
//
// 'crediting' (added for the casino-topup recovery worker, see
// casino-topup-recovery.service.ts) is a short-lived CLAIM state: a worker
// atomically flips pending/failed -> crediting via an update whose WHERE
// clause excludes 'crediting' itself, so two concurrent workers can never
// both claim the same top-up - the second one's findOneAndUpdate simply
// matches nothing. This is the same "the WHERE clause IS the guard, not a
// separate read" lesson Phase 1's walletServiceController.js documents.
export type TopupWalletCreditStatus = 'not_started' | 'pending' | 'crediting' | 'completed' | 'failed';

export interface WalletTopupDocument {
  _id?: ObjectId;
  /** PGX Casino's Mongo User _id - the shared `global_user_id`. */
  pgxCasinoUserId: string;
  /** PGXSports' own local (Prisma) User id for the same linked account. */
  pgxsportsUserId: string;
  amountMinor: number;
  currency: string;
  provider: string;
  paymentStatus: TopupPaymentStatus;
  walletCreditStatus: TopupWalletCreditStatus;
  /** Optional until a Stripe Checkout Session is actually created. */
  stripeSessionId?: string;
  idempotencyKey: string;
  /** Set once the Central Wallet Service confirms the credit - the receipt,
   * not a cause of the credit (the credit is caused by the idempotencyKey
   * reaching walletServiceClient.credit). Useful for support/audit lookup. */
  walletLedgerId?: string;
  failureReason?: string;
  retryCount: number;
  lastRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates the collection's required unique indexes. Idempotent - safe to
 * call on every connection, matching PGX Casino's own walletLedger.js
 * pattern of asserting its indexes exist rather than trusting a one-time
 * migration step (and the project's own autoIndex:false production
 * lesson: an index that was never explicitly verified to exist is not
 * trustworthy to assume).
 */
export async function ensureWalletTopupIndexes(collection: Collection<WalletTopupDocument>): Promise<void> {
  await collection.createIndex({ idempotencyKey: 1 }, { unique: true, name: 'uniq_idempotency_key' });
  await collection.createIndex(
    { stripeSessionId: 1 },
    {
      unique: true,
      name: 'uniq_stripe_session_id',
      partialFilterExpression: { stripeSessionId: { $exists: true, $type: 'string' } },
    },
  );
  await collection.createIndex({ pgxCasinoUserId: 1, createdAt: -1 }, { name: 'by_casino_user_recent' });
  // Supports the recovery worker's "find unresolved paid-but-uncredited
  // top-ups" query (casino-topup-recovery.service.ts).
  await collection.createIndex(
    { paymentStatus: 1, walletCreditStatus: 1 },
    { name: 'by_payment_and_credit_status' },
  );
}

/**
 * Duplicate-Stripe-event-id guard, in the SAME MongoDB deployment as
 * wallet_topups - mirrors PGX Casino's own App/Models/paymentEvent.js
 * (claimEventOrDetectDuplicate): insert-first, not findOne-first, so a
 * truly concurrent redelivery of the same Stripe event hits the unique
 * index, not an app-level race window.
 */
export const STRIPE_EVENTS_COLLECTION = 'casino_topup_stripe_events';

export interface StripeEventDocument {
  _id?: ObjectId;
  eventId: string;
  eventType: string;
  receivedAt: Date;
}

export async function ensureStripeEventIndexes(collection: Collection<StripeEventDocument>): Promise<void> {
  await collection.createIndex({ eventId: 1 }, { unique: true, name: 'uniq_stripe_event_id' });
}
