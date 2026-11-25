// Implements: Phase 2 - PGXSports Shared Wallet Integration
//
// getBalance/deductFunds/refundFunds below now delegate to PGX Casino's
// Central Wallet Service instead of mutating Supabase `wallets`/
// `transactions` directly (confirmed client decision: PGXSports uses the
// Central Wallet Service instead of its own Supabase wallet). This closes
// the "independent PGXSports wallet mutation" path those three methods
// used to have - see wallet.service.spec.ts "Supabase wallet mutation
// prevention" tests, which assert supabase.from('wallets').update/insert
// is never called by any of them again.
//
// createTopUpSession is UNCHANGED - deliberately. Migrating it means
// wiring Stripe Checkout + webhook settlement onto the new flow, which
// this task's Strict Phase Boundaries explicitly exclude from Phase 2
// ("Do not implement: Full Stripe Checkout creation, Stripe webhook
// settlement"). See the final report for the resulting interim risk
// (an orphaned EUR/Supabase top-up path) and the guard added for it.
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDynamicCheckoutSession } from '../../common/stripe/checkout-session.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalUserLinkService } from '../global-user-link/global-user-link.service';
import { DynamicSettingsService } from '../settings/dynamic-settings.service';
import { SupabaseService } from '../supabase/supabase.service';
import { WalletServiceClientService } from '../wallet-service-client/wallet-service-client.service';
import { WalletServiceError } from '../wallet-service-client/wallet-service-client.types';
import { TopUpDto } from './dto/top-up.dto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Maps a WalletServiceError (Central Wallet Service) to the exception
 * shape this module's existing callers (orders.service.ts) already expect
 * to catch. Never swallows the original code/message. */
function toHttpException(err: WalletServiceError): Error {
  switch (err.code) {
    case 'INSUFFICIENT_BALANCE':
      return new BadRequestException(err.message);
    case 'USER_NOT_FOUND':
    case 'WALLET_NOT_FOUND':
      return new NotFoundException(err.message);
    case 'ACCOUNT_LOCKED':
    case 'IDEMPOTENCY_KEY_CONFLICT':
      return new BadRequestException(err.message);
    case 'NOT_CONFIGURED':
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      return new ServiceUnavailableException('The shared wallet service is temporarily unavailable');
    default:
      return new InternalServerErrorException(err.message);
  }
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly dynamicSettingsService: DynamicSettingsService,
    private readonly globalUserLinkService: GlobalUserLinkService,
    private readonly walletServiceClient: WalletServiceClientService,
  ) {}

  /** Throws a clean, intentional BadRequestException - never a crash - when
   * this PGXSports-native user has never gone through the PGX Casino
   * handoff and therefore has no Central Wallet Service account linked
   * yet. Deliberately fails closed rather than falling back to the old
   * Supabase wallet or treating an unlinked user as a $0 balance. */
  private async requireLinkedGlobalUserId(userId: string): Promise<string> {
    const globalUserId = await this.globalUserLinkService.findGlobalUserId(userId);
    if (!globalUserId) {
      throw new BadRequestException(
        'No linked PGX Casino wallet for this account yet. Top up via PGX Casino to create one.',
      );
    }
    return globalUserId;
  }

  /**
   * Helper to resolve the correct Supabase UUID for a given local user ID or Supabase ID.
   */
  async resolveSupabaseUserId(userIdOrCuid: string): Promise<string | null> {
    if (UUID_REGEX.test(userIdOrCuid)) {
      return userIdOrCuid;
    }

    // Try finding user by local Prisma cuid
    const localUser = await this.prisma.user.findUnique({
      where: { id: userIdOrCuid },
      select: { id: true, email: true, supabaseUserId: true },
    });

    if (localUser?.supabaseUserId && UUID_REGEX.test(localUser.supabaseUserId)) {
      return localUser.supabaseUserId;
    }

    // If local user exists, look up by email in Supabase Auth to find their UUID
    if (localUser?.email) {
      const supabase = this.supabaseService.getAdminClient();
      if (supabase) {
        try {
          const { data: usersData } = await supabase.auth.admin.listUsers();
          const matched = (usersData?.users as any[])?.find(
            (u: any) => u.email?.toLowerCase().trim() === localUser.email.toLowerCase().trim(),
          );
          if (matched?.id) {
            await this.prisma.user.update({
              where: { id: localUser.id },
              data: { supabaseUserId: matched.id },
            });
            return matched.id;
          }
        } catch (lookupErr) {
          this.logger.warn(`Could not lookup Supabase user by email for ${localUser.email}:`, lookupErr);
        }
      }
    }

    return null;
  }

  async getBalance(userId: string) {
    const globalUserId = await this.requireLinkedGlobalUserId(userId);
    try {
      const res = await this.walletServiceClient.getBalance(globalUserId);
      return {
        userId,
        balance: res.balances.chips.major,
        currency: res.currency,
      };
    } catch (err: any) {
      if (err instanceof WalletServiceError) throw toHttpException(err);
      throw err;
    }
  }

  async createTopUpSession(userId: string, userEmail: string | undefined, dto: TopUpDto) {
    // Safety guard added in Phase 2 (not a feature, a data-integrity fix):
    // getBalance/deductFunds/refundFunds above now read/write the Central
    // Wallet Service, but this method still creates a Stripe Checkout
    // session whose webhook credits the OLD Supabase wallet directly
    // (webhook.service.ts - unmigrated, see this file's header). Left
    // enabled, a user could keep adding EUR to a Supabase balance that
    // product-purchase debits can no longer see or spend from - two
    // silently diverging balances, not fixed by anything else in Phase 2.
    // Defaults OFF until Phase 3 rewires this path onto the shared wallet.
    if (this.configService.get<string>('WALLET_LEGACY_TOPUP_ENABLED') !== 'true') {
      throw new BadRequestException(
        'Wallet top-up is moving to the new shared PGX Casino wallet. Please use the PGX Casino Add Funds flow.',
      );
    }
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const amountInCents = Math.round(dto.amount * 100);

    const successReturnUrl = dto.returnUrl || `${frontendUrl}/my-account/wallet`;
    const cancelReturnUrl = dto.returnUrl || `${frontendUrl}/my-account/wallet`;

    const successUrl = `${successReturnUrl}?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${cancelReturnUrl}?status=cancelled`;

    const targetUserId = (await this.resolveSupabaseUserId(userId)) || userId;

    try {
      const { client: stripeClient, profile } = await this.dynamicSettingsService.getStripeClient();
      const currency = (profile.currency || 'eur').toLowerCase();

      const session = await createDynamicCheckoutSession(
        stripeClient,
        {
          mode: 'payment',
          customer_email: userEmail,
          line_items: [
            {
              price_data: {
                currency,
                product_data: {
                  name: 'PGX Wallet Deposit',
                  description: `Add ${currency.toUpperCase()} ${dto.amount.toFixed(2)} credits to your universal PGX wallet`,
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          metadata: {
            user_id: targetUserId,
            amount_eur: dto.amount.toString(),
            type: 'wallet_topup',
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
        {
          configService: this.configService,
          mode: profile.mode === 'LIVE' ? 'live' : 'test',
          logger: this.logger,
        },
      );

      this.logger.log(`Created Stripe Checkout session ${session.id} for user ${userId}, amount: €${dto.amount}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create Stripe Checkout session for user ${userId}:`, err);
      throw new InternalServerErrorException(err.message || 'Failed to create Stripe payment session');
    }
  }

  /**
   * Atomically debits a user's wallet for an order payment.
   */
  async deductFunds(userId: string, amount: number, orderNumber: string, description?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Debit amount must be greater than 0');
    }

    const globalUserId = await this.requireLinkedGlobalUserId(userId);
    const descText = description || `Order Payment (#${orderNumber})`;
    // Deterministic key: retrying the SAME order never double-debits, and
    // Phase 1's own idempotency layer (not an app-level balance check
    // alone) is the actual guard against a concurrent double-spend - see
    // walletServiceController.js's insert-first ledger claim.
    const idempotencyKey = `pgxsports-order-debit:${orderNumber}`;

    try {
      const res = await this.walletServiceClient.debit({
        globalUserId,
        amountMinor: Math.round(amount * 100),
        currency: 'EUR',
        walletField: 'chips',
        referenceId: orderNumber,
        idempotencyKey,
        metadata: { description: descText, orderNumber },
      });
      this.logger.log(`Debited €${amount} from global user ${globalUserId} for order ${orderNumber}`);
      return { success: true, targetUserId: globalUserId, newBalance: res.balanceAfter };
    } catch (err: any) {
      if (err instanceof WalletServiceError) throw toHttpException(err);
      throw err;
    }
  }

  /**
   * Credits funds back to the user's wallet upon order cancellation/refund.
   */
  async refundFunds(userId: string, amount: number, orderNumber: string, reason?: string) {
    // Preserves the original method's non-throwing, best-effort contract:
    // this runs during order cancellation and must never block that flow,
    // so every failure path here logs and returns rather than throwing.
    if (amount <= 0) return;

    const globalUserId = await this.globalUserLinkService.findGlobalUserId(userId);
    if (!globalUserId) {
      this.logger.warn(`Cannot refund order ${orderNumber}: user ${userId} has no linked PGX Casino wallet`);
      return;
    }

    const descText = reason || `Order Refund (#${orderNumber})`;
    const idempotencyKey = `pgxsports-order-refund:${orderNumber}`;

    try {
      await this.walletServiceClient.credit({
        globalUserId,
        amountMinor: Math.round(amount * 100),
        currency: 'EUR',
        walletField: 'chips',
        referenceId: orderNumber,
        idempotencyKey,
        metadata: { description: descText, orderNumber },
      });
      this.logger.log(`Successfully refunded €${amount} to global user ${globalUserId} for order ${orderNumber}`);
    } catch (err: any) {
      this.logger.error(`Failed to refund order ${orderNumber} via Central Wallet Service:`, err?.message || err);
    }
  }
}
