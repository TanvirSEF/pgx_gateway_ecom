// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet integration
//
// Deliberately NOT behind SupabaseAuthGuard: the caller has no PGXSports
// session yet (that is the whole point of the handoff - no second manual
// login). Identity comes from the signed token itself, verified inside
// HandoffService; nothing here trusts req.body for identity or amount.
//
// Verifies the handoff, resolves/creates the linked PGXSports account,
// THEN creates the pending top-up + Stripe Checkout session in the SAME
// call (architecture doc's "Payment Bridge: create pending top-up" step
// runs immediately after the handoff is accepted - there is no separate
// user action in between). If Checkout-session creation is unavailable
// (Stripe not configured, Mongo not configured), the handoff itself still
// reports as successfully verified+linked - only `checkoutUrl` is omitted,
// with `checkoutError` explaining why, so a caller can tell "your token
// was valid" apart from "but payment setup isn't available right now".
import { BadRequestException, Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GlobalUserLinkService } from '../global-user-link/global-user-link.service';
import { CasinoTopupService } from '../casino-topup/casino-topup.service';
import { RedeemHandoffDto } from './dto/redeem-handoff.dto';
import { HandoffError } from './handoff.types';
import { HandoffService } from './handoff.service';

@ApiTags('Wallet Bridge')
@Controller('wallet-bridge')
export class WalletBridgeController {
  // Diagnostic logging only (no behaviour change) - added to help confirm
  // this route is actually being reached in a given deployment. Never logs
  // the token itself or any other secret - see each log call below.
  private readonly logger = new Logger(WalletBridgeController.name);

  constructor(
    private readonly handoffService: HandoffService,
    private readonly globalUserLinkService: GlobalUserLinkService,
    private readonly casinoTopupService: CasinoTopupService,
  ) {}

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem a PGX Casino payment handoff token (one-time use) and start Stripe Checkout' })
  @ApiResponse({ status: 200, description: 'Token verified; linked PGXSports account resolved' })
  @ApiResponse({ status: 400, description: 'Missing, expired, tampered, or already-used token' })
  async redeem(@Body() dto: RedeemHandoffDto) {
    this.logger.log('POST /wallet-bridge/redeem received');
    let verified;
    try {
      verified = await this.handoffService.verifyAndConsume(dto.token);
    } catch (err: any) {
      if (err instanceof HandoffError) {
        this.logger.warn(`Handoff rejected: ${err.code}`);
        throw new BadRequestException({ code: err.code, message: err.message });
      }
      throw err;
    }
    this.logger.log(`Handoff verified for globalUserId=${verified.globalUserId}`);

    const link = await this.globalUserLinkService.findOrCreateByGlobalUserId(verified.globalUserId, {
      email: verified.email,
      displayName: verified.displayName,
    });

    const result: Record<string, unknown> = {
      success: true,
      globalUserId: verified.globalUserId,
      pgxsportsUserId: link.pgxsportsUserId,
      accountCreated: link.created,
      amountMinor: verified.amountMinor,
      currency: verified.currency,
      returnUrl: verified.returnUrl,
    };

    // The handoff is already consumed at this point (verifyAndConsume's
    // nonce claim is unconditional) - a Checkout-creation failure here must
    // NOT be reported as "your token was invalid" (it was valid; Stripe or
    // Mongo just wasn't reachable), so this is deliberately a separate,
    // non-throwing field rather than a 400/503 for the whole request.
    try {
      const { checkoutUrl } = await this.casinoTopupService.createCheckoutSessionForVerifiedHandoff(
        verified,
        link.pgxsportsUserId,
      );
      result.checkoutUrl = checkoutUrl;
      this.logger.log(`Checkout session created for globalUserId=${verified.globalUserId}`);
    } catch (err: any) {
      result.checkoutError = err?.message || 'Could not start the Stripe Checkout session';
      // Full diagnostic detail server-side only - never added to the HTTP
      // response above. type/code cover Stripe SDK errors (StripeConnectionError
      // etc.); code/syscall/cause cover plain Node network errors (ECONNRESET,
      // TLS alerts). Never logs the Stripe key or any request/response body.
      this.logger.error(
        `Checkout session creation failed for globalUserId=${verified.globalUserId}: ${result.checkoutError} ` +
          `[type=${err?.type ?? 'n/a'} code=${err?.code ?? 'n/a'} syscall=${err?.syscall ?? 'n/a'} ` +
          `cause=${err?.cause?.message ?? 'n/a'}]`,
        err?.stack,
      );
    }

    return result;
  }
}
