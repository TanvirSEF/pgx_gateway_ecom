// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
//
// Handles: "Stripe payment succeeds, but the Central Wallet API is
// temporarily unavailable." The webhook already marked paymentStatus
// 'completed' and walletCreditStatus 'failed' in that case (see
// CasinoTopupWebhookService.claimAndCreditWallet) - this service is what
// an operator or a scheduled job calls to retry those specific top-ups.
//
// Deliberately NOT a built-in NestJS @Cron/@Interval here - this sandbox
// has no scheduler infrastructure to verify against, and bolting one on
// untested would be worse than being explicit that `runOnce()` is the
// unit a real scheduler (or a manual ops command) should call. See the
// final report's "Remaining blockers" for exactly what wiring a real
// schedule needs.
import { Injectable, Logger } from '@nestjs/common';
import { WalletTopupService } from '../wallet-topup/topup.service';
import { CasinoTopupWebhookService } from './casino-topup-webhook.service';

@Injectable()
export class CasinoTopupRecoveryService {
  private readonly logger = new Logger(CasinoTopupRecoveryService.name);

  constructor(
    private readonly topupService: WalletTopupService,
    private readonly webhookService: CasinoTopupWebhookService,
  ) {}

  /**
   * Finds every paid-but-not-yet-(successfully)-credited top-up and
   * retries crediting each one, using the SAME idempotencyKey it was
   * created with. Safe to call repeatedly, safe across a restart (all
   * state is in MongoDB), and safe if called concurrently with the
   * webhook or with another recovery run - claimAndCreditWallet's atomic
   * claim is what actually prevents a double credit, not this loop.
   */
  async runOnce(limit = 50): Promise<{ attempted: number; idempotencyKeys: string[] }> {
    const unresolved = await this.topupService.findUnresolvedPaidButUncredited(limit);
    if (unresolved.length === 0) {
      return { attempted: 0, idempotencyKeys: [] };
    }
    this.logger.log(`Recovery: found ${unresolved.length} paid-but-uncredited top-up(s)`);
    for (const topup of unresolved) {
      await this.webhookService.claimAndCreditWallet(topup.idempotencyKey);
    }
    return { attempted: unresolved.length, idempotencyKeys: unresolved.map((t) => t.idempotencyKey) };
  }
}
