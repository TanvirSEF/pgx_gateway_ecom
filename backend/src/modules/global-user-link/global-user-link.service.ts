// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';

const PRISMA_UNIQUE_CONSTRAINT = 'P2002';

export interface LinkedUser {
  pgxsportsUserId: string;
  globalUserId: string;
  /** true only when THIS call provisioned a brand-new local account. */
  created: boolean;
}

@Injectable()
export class GlobalUserLinkService {
  private readonly logger = new Logger(GlobalUserLinkService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the PGXSports local user linked to `globalUserId` (PGX Casino's
   * own Mongo User _id), Just-In-Time provisioning one if none exists yet.
   *
   * Insert-first, not find-then-create: two concurrent handoffs for a
   * global user never seen before both attempt the create; the loser's
   * unique-constraint violation (P2002, on either global_user_links.
   * globalUserId or the deterministic placeholder email) is caught and
   * turned into a re-read of the winner's row - never a second local
   * account. Mirrors App/Models/paymentEvent.js's
   * claimEventOrDetectDuplicate lesson from the PGX Casino side (same race
   * shape, same fix).
   */
  async findOrCreateByGlobalUserId(
    globalUserId: string,
    hints: { email?: string; displayName?: string } = {},
  ): Promise<LinkedUser> {
    const existing = await this.prisma.globalUserLink.findUnique({ where: { globalUserId } });
    if (existing) {
      return { pgxsportsUserId: existing.pgxsportsUserId, globalUserId, created: false };
    }

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        // No PII beyond what the handoff optionally supplies, and no real
        // password: this account's identity comes from the verified
        // handoff token, never from a local PGXSports login (see
        // HandoffService). A placeholder, unusable bcrypt hash of a random
        // UUID fills the required `password` column without creating a
        // crackable secret.
        const placeholderPassword = await bcrypt.hash(crypto.randomUUID(), 12);
        const user = await tx.user.create({
          data: {
            email: hints.email || `pgx-${globalUserId}@users.pgxsports.internal`,
            name: hints.displayName || 'PGX Casino User',
            password: placeholderPassword,
            role: 'CUSTOMER',
          },
        });
        return tx.globalUserLink.create({
          data: { globalUserId, pgxsportsUserId: user.id },
        });
      });
      this.logger.log(`JIT-provisioned a PGXSports account for global user ${globalUserId}`);
      return { pgxsportsUserId: created.pgxsportsUserId, globalUserId, created: true };
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === PRISMA_UNIQUE_CONSTRAINT) {
        const winner = await this.prisma.globalUserLink.findUnique({ where: { globalUserId } });
        if (winner) {
          return { pgxsportsUserId: winner.pgxsportsUserId, globalUserId, created: false };
        }
      }
      throw err;
    }
  }

  /** Reverse lookup, for callers that only have the existing PGXSports-native
   * `req.user.id` (e.g. the product-checkout wallet debit in orders.service.ts). */
  async findGlobalUserId(pgxsportsUserId: string): Promise<string | null> {
    const link = await this.prisma.globalUserLink.findUnique({ where: { pgxsportsUserId } });
    return link?.globalUserId ?? null;
  }
}
