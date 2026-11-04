// Implements: Phase 2 - PGXSports Shared Wallet Integration
//
// Verifies the one-time "Add Funds" handoff PGX Casino's backend issues
// when a user clicks Add Funds. This is the CONSUMER side only - the
// issuer lives in pgx_frontend_api_node, a separate tracked repo this task
// does not modify (see the final report's "Required environment
// variables"/"Remaining blockers" sections for the exact contract the
// issuer must produce).
//
// Trust boundary: everything after a successful verifyAndConsume() may
// treat `globalUserId`/`amountMinor`/`currency` as authoritative. Nothing
// before it may - in particular, no controller may accept these fields
// from request body/query instead of from this service's return value.
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { HandoffError, HandoffTokenClaims, VerifiedHandoff } from './handoff.types';

const PRISMA_UNIQUE_CONSTRAINT = 'P2002';
// EUR, matching Phase 1's corrected ALLOWED_CURRENCIES and the casino
// issuer (pgxsportsHandoffService.js) - this was missed in the first EUR
// correction pass (that pass covered wallet-service-client.service.ts and
// wallet.service.ts but not this file) and found while building the
// issuer side, which is why it's fixed here rather than separately.
const SUPPORTED_CURRENCIES = ['EUR'];
const EXPECTED_AUDIENCE = 'pgxsports-payment';
const EXPECTED_ISSUER = 'pgx-casino';

@Injectable()
export class HandoffService {
  private readonly logger = new Logger(HandoffService.name);

  constructor(
    // A separate JwtService instance (not the one AuthModule wires to
    // JWT_SECRET for player sessions) so this ALWAYS verifies against
    // CASINO_HANDOFF_SECRET explicitly, per-call. Reusing the player-
    // session secret for a cross-service trust boundary is exactly the
    // mistake walletServiceAuth.js's own header comment on the PGX Casino
    // side documents paying for once already (collapsing two directions/
    // purposes onto one key).
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get secret(): string {
    return this.configService.get<string>('CASINO_HANDOFF_SECRET') || '';
  }

  private get returnUrlAllowlist(): string[] {
    return (this.configService.get<string>('CASINO_HANDOFF_RETURN_URL_ALLOWLIST') || '')
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
  }

  isConfigured(): boolean {
    return Boolean(this.secret) && this.returnUrlAllowlist.length > 0;
  }

  /**
   * Verifies signature + expiry + audience/issuer, validates every claim,
   * checks the return URL against the allowlist, and atomically consumes
   * the nonce (replay protection). Throws HandoffError on any failure -
   * never returns a partially-trusted result.
   */
  async verifyAndConsume(token: string): Promise<VerifiedHandoff> {
    if (!token) {
      throw new HandoffError('MISSING_TOKEN', 'No handoff token was provided');
    }
    if (!this.secret) {
      throw new HandoffError('NOT_CONFIGURED', 'CASINO_HANDOFF_SECRET is not configured');
    }

    let claims: HandoffTokenClaims;
    try {
      claims = this.jwtService.verify<HandoffTokenClaims>(token, {
        secret: this.secret,
        audience: EXPECTED_AUDIENCE,
        issuer: EXPECTED_ISSUER,
      });
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        this.logger.warn('Handoff token rejected: EXPIRED');
        throw new HandoffError('EXPIRED', 'This payment handoff has expired - ask PGX Casino for a new one');
      }
      // Wrong signature, wrong audience/issuer, malformed token, etc. -
      // all are "tampered or not genuinely from PGX Casino" from this
      // service's point of view; never reveal which check failed. The log
      // below never includes the token itself or the underlying jwt error
      // detail, only the fact that verification failed.
      this.logger.warn('Handoff token rejected: TAMPERED (signature/audience/issuer/format check failed)');
      throw new HandoffError('TAMPERED', 'This payment handoff is invalid');
    }

    this.assertValidClaims(claims);

    // Replay protection - insert-first, not exists-then-insert (same
    // reasoning as GlobalUserLinkService / Phase 1's own ledger claim): a
    // second redemption attempt of the same nonce, even arriving
    // concurrently with the first, hits the unique constraint and is
    // rejected, never silently allowed through a race window.
    try {
      await this.prisma.handoffNonce.create({
        data: { nonce: claims.nonce, globalUserId: claims.sub },
      });
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === PRISMA_UNIQUE_CONSTRAINT) {
        this.logger.warn(`Handoff token rejected: REPLAYED for globalUserId=${claims.sub}`);
        throw new HandoffError('REPLAYED', 'This payment handoff has already been used');
      }
      throw err;
    }

    this.logger.log(`Handoff verified and consumed for globalUserId=${claims.sub}`);
    return {
      globalUserId: claims.sub,
      amountMinor: claims.amountMinor,
      currency: claims.currency.toUpperCase(),
      returnUrl: claims.returnUrl,
      email: claims.email,
      displayName: claims.displayName,
      nonce: claims.nonce,
    };
  }

  private assertValidClaims(claims: HandoffTokenClaims) {
    if (!claims || typeof claims.sub !== 'string' || !/^[0-9a-fA-F]{24}$/.test(claims.sub)) {
      throw new HandoffError('INVALID_CLAIMS', 'Handoff token is missing a valid user identity');
    }
    if (!claims.nonce || typeof claims.nonce !== 'string') {
      throw new HandoffError('INVALID_CLAIMS', 'Handoff token is missing a nonce');
    }
    if (!Number.isInteger(claims.amountMinor) || claims.amountMinor <= 0) {
      throw new HandoffError('INVALID_AMOUNT', 'amountMinor must be a positive integer number of cents');
    }
    if (!claims.currency || !SUPPORTED_CURRENCIES.includes(String(claims.currency).toUpperCase())) {
      throw new HandoffError('UNSUPPORTED_CURRENCY', 'Only EUR is supported');
    }
    if (!claims.returnUrl || !this.returnUrlAllowlist.includes(claims.returnUrl)) {
      throw new HandoffError('RETURN_URL_NOT_ALLOWLISTED', 'returnUrl is not on the configured allowlist');
    }
  }
}
