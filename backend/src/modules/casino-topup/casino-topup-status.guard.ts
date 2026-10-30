// Implements: Phase 4 - Casino <-> PGXSports top-up payment-status tracking
//
// Inbound gate for GET /casino-topup/status/:idempotencyKey - the ONLY
// caller is PGX Casino's OWN backend, proxying an already-authenticated
// player's own status check (never the browser directly - the task's own
// "Casino frontend must not require PGXSports service secrets" rule).
//
// Deliberately a SIMPLER constant-time shared-secret check, not the full
// HMAC-over-body + timestamp replay-window scheme Phase 1's
// walletServiceAuth.js uses for /internal/wallet/credit|debit. That scheme
// earns its complexity by guarding a MONEY MUTATION; this guards a
// same-user READ of data that is otherwise meaningless without ALSO
// knowing the exact topupId string (not guessable/enumerable - see
// CasinoTopupStatusService's uniform 404). A leaked key here lets someone
// read payment status strings, never move money - proportionate control
// for the risk, not a skipped one (minimal-code: least sufficient control).
//
// DEDICATED SECRET - CASINO_TOPUP_STATUS_API_KEY is its own value, never
// WALLET_SERVICE_API_KEY (that authenticates the OPPOSITE direction:
// PGXSports calling Casino's /internal/wallet/*) and never
// CASINO_HANDOFF_SECRET (that signs/verifies the one-time handoff JWT, a
// different purpose entirely).
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

const HEADER = 'x-casino-status-key';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(String(a ?? ''));
  const bufB = Buffer.from(String(b ?? ''));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

@Injectable()
export class CasinoTopupStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const expected = process.env.CASINO_TOPUP_STATUS_API_KEY;
    if (!expected) {
      // Fail closed, never guess - same discipline as
      // CasinoTopupStripeConfig/walletServiceAuth.js.
      throw new UnauthorizedException('Top-up status lookup is not configured');
    }
    const provided = req.headers[HEADER];
    if (!provided || !safeEqual(String(provided), expected)) {
      throw new UnauthorizedException('Invalid status service credential');
    }
    return true;
  }
}
