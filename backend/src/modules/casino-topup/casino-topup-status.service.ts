// Implements: Phase 4 - Casino <-> PGXSports top-up payment-status tracking
import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { WalletTopupDocument } from '../wallet-topup/topup.schema';
import { WalletTopupService } from '../wallet-topup/topup.service';
import { TopupStatusResponse, TopupStatusState } from './casino-topup-status.types';

/**
 * Pure mapping, no I/O - exported standalone so it has a direct unit test
 * that does not need Mongo. Deliberately does NOT invent new stored status
 * values; it only reads the two EXISTING fields side by side (the whole
 * reason they are separate fields in the first place - see
 * topup.schema.ts's own header comment).
 */
export function mapTopupToStatusState(doc: Pick<WalletTopupDocument, 'paymentStatus' | 'walletCreditStatus'>): TopupStatusState {
  if (doc.paymentStatus === 'failed' || doc.paymentStatus === 'cancelled') {
    return 'PAYMENT_FAILED';
  }
  if (doc.paymentStatus !== 'completed') {
    // 'created' | 'pending' | 'processing' - Checkout started, Stripe
    // hasn't confirmed success or failure yet.
    return 'PENDING_PAYMENT';
  }
  // paymentStatus === 'completed' from here on - Stripe's webhook already
  // confirmed the payment itself (never the frontend redirect alone).
  switch (doc.walletCreditStatus) {
    case 'completed':
      return 'PAYMENT_SUCCEEDED_CREDIT_COMPLETED';
    case 'failed':
      // The recovery worker (casino-topup-recovery.service.ts) keeps
      // retrying this automatically, but from the player's perspective
      // right now it genuinely needs attention/recovery, per the task's
      // own taxonomy - not the same as "still pending".
      return 'CREDIT_REQUIRES_ATTENTION';
    default:
      // 'not_started' | 'pending' | 'crediting'
      return 'PAYMENT_SUCCEEDED_CREDIT_PENDING';
  }
}

@Injectable()
export class CasinoTopupStatusService {
  private readonly logger = new Logger(CasinoTopupStatusService.name);

  constructor(private readonly topupService: WalletTopupService) {}

  /**
   * Looks up ONE top-up by its idempotencyKey (the "top-up ID" this whole
   * flow already threads through the Checkout success/cancel URL) and
   * verifies it belongs to the calling globalUserId.
   *
   * Returns the SAME NotFoundException, with the SAME message, whether the
   * top-up genuinely does not exist OR exists but belongs to someone else -
   * deliberately indistinguishable, so a caller cannot use this endpoint to
   * enumerate other players' top-up ids or probe their existence.
   */
  async getStatusForCasinoUser(topupId: string, globalUserId: string): Promise<TopupStatusResponse> {
    if (!this.topupService.isConfigured()) {
      throw new ServiceUnavailableException('The wallet top-up database is not currently available.');
    }
    if (!topupId || typeof topupId !== 'string') {
      throw new NotFoundException('No top-up found for that id.');
    }

    const doc = await this.topupService.findByIdempotencyKey(topupId);
    if (!doc || doc.pgxCasinoUserId !== globalUserId) {
      if (doc) {
        this.logger.warn(`Rejected cross-user top-up status lookup for ${topupId}`);
      }
      throw new NotFoundException('No top-up found for that id.');
    }

    return {
      topupId,
      state: mapTopupToStatusState(doc),
      paymentStatus: doc.paymentStatus,
      walletCreditStatus: doc.walletCreditStatus,
      currency: doc.currency,
      amountMinor: doc.amountMinor,
    };
  }
}
