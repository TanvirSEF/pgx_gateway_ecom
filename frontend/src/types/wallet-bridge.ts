// Implements: Phase 4 - PGXSports wallet-bridge page (receives the PGX
// Casino handoff and starts Stripe Checkout). Mirrors the backend's
// RedeemHandoffDto request and WalletBridgeController#redeem response
// exactly - see backend/src/modules/wallet-bridge/{dto/redeem-handoff.dto,
// wallet-bridge.controller}.ts. Do not add fields that endpoint does not
// actually return.

export interface RedeemWalletHandoffPayload {
  token: string;
}

export interface RedeemWalletHandoffResponse {
  success: boolean;
  globalUserId: string;
  pgxsportsUserId: string;
  accountCreated: boolean;
  amountMinor: number;
  currency: string;
  returnUrl: string;
  /** Present only when Stripe Checkout session creation succeeded. */
  checkoutUrl?: string;
  /** Present only when the handoff itself was valid but Checkout could not
   * be started (Stripe/Mongo unavailable) - the token is still consumed. */
  checkoutError?: string;
}

/** The shape of a 400 error body from POST /wallet-bridge/redeem - Nest
 * returns the HandoffError's {code, message} object as-is (verified by
 * reading BaseExceptionFilter: an object exception response is sent
 * unmodified, no extra `statusCode` key). */
export interface RedeemWalletHandoffErrorBody {
  code?:
    | "MISSING_TOKEN"
    | "EXPIRED"
    | "TAMPERED"
    | "REPLAYED"
    | "INVALID_CLAIMS"
    | "INVALID_AMOUNT"
    | "UNSUPPORTED_CURRENCY"
    | "RETURN_URL_NOT_ALLOWLISTED"
    | "NOT_CONFIGURED";
  message?: string;
}
