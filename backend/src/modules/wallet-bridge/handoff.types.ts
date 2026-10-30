// Implements: Phase 2 - PGXSports Shared Wallet Integration

export class HandoffError extends Error {
  constructor(
    public readonly code:
      | 'MISSING_TOKEN'
      | 'EXPIRED'
      | 'TAMPERED'
      | 'REPLAYED'
      | 'INVALID_CLAIMS'
      | 'INVALID_AMOUNT'
      | 'UNSUPPORTED_CURRENCY'
      | 'RETURN_URL_NOT_ALLOWLISTED'
      | 'NOT_CONFIGURED',
    message: string,
  ) {
    super(message);
    this.name = 'HandoffError';
  }
}

/** The signed JWT claims PGX Casino's backend must issue. Verified and
 * consumed by HandoffService.verifyAndConsume - never trust any of these
 * fields from an unsigned source. */
export interface HandoffTokenClaims {
  /** PGX Casino's own Mongo User _id - the shared `global_user_id`. */
  sub: string;
  amountMinor: number;
  currency: string;
  returnUrl: string;
  /** One-time use value - consumed into HandoffNonce on redemption. */
  nonce: string;
  email?: string;
  displayName?: string;
  aud: string;
  iss: string;
  exp?: number;
  iat?: number;
}

export interface VerifiedHandoff {
  globalUserId: string;
  amountMinor: number;
  currency: string;
  returnUrl: string;
  email?: string;
  displayName?: string;
  /** The (now-consumed) one-time nonce - stable and unique per handoff, so
   * callers that need a deterministic idempotency key for a FOLLOW-ON
   * operation (e.g. CasinoTopupService's pending top-up) can derive one
   * from it instead of minting their own, uncoordinated key. */
  nonce: string;
}
