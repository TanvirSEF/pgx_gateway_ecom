// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { Prisma } from '@prisma/client';
import { GlobalUserLinkService } from './global-user-link.service';

function prismaUniqueError() {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  } as any);
}

function makePrisma() {
  const linksByGlobalUserId = new Map<string, { pgxsportsUserId: string }>();
  const linksByLocalUserId = new Map<string, string>();
  const usedEmails = new Set<string>();
  let userCounter = 0;

  return {
    globalUserLink: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where.globalUserId) {
          const row = linksByGlobalUserId.get(where.globalUserId);
          return row ? { globalUserId: where.globalUserId, pgxsportsUserId: row.pgxsportsUserId } : null;
        }
        if (where.pgxsportsUserId) {
          const globalUserId = linksByLocalUserId.get(where.pgxsportsUserId);
          return globalUserId ? { globalUserId, pgxsportsUserId: where.pgxsportsUserId } : null;
        }
        return null;
      }),
    },
    $transaction: jest.fn(async (fn: any) => {
      const tx = {
        user: {
          create: jest.fn(async ({ data }: any) => {
            if (usedEmails.has(data.email)) throw prismaUniqueError();
            usedEmails.add(data.email);
            userCounter += 1;
            return { id: `local-user-${userCounter}`, ...data };
          }),
        },
        globalUserLink: {
          create: jest.fn(async ({ data }: any) => {
            if (linksByGlobalUserId.has(data.globalUserId)) throw prismaUniqueError();
            linksByGlobalUserId.set(data.globalUserId, { pgxsportsUserId: data.pgxsportsUserId });
            linksByLocalUserId.set(data.pgxsportsUserId, data.globalUserId);
            return { id: `link-${data.globalUserId}`, ...data };
          }),
        },
      };
      return fn(tx);
    }),
    _debug: { linksByGlobalUserId, usedEmails },
  };
}

describe('GlobalUserLinkService', () => {
  const GLOBAL_USER_ID = '507f1f77bcf86cd799439011';

  // Test category 1: User mapping and duplicate prevention
  it('creates exactly one linked account for a brand-new global user', async () => {
    const prisma = makePrisma();
    const service = new GlobalUserLinkService(prisma as any);

    const result = await service.findOrCreateByGlobalUserId(GLOBAL_USER_ID);

    expect(result.created).toBe(true);
    expect(result.globalUserId).toBe(GLOBAL_USER_ID);
    expect(prisma._debug.linksByGlobalUserId.size).toBe(1);
  });

  it('returns the SAME linked account on a second call - no duplicate account is created', async () => {
    const prisma = makePrisma();
    const service = new GlobalUserLinkService(prisma as any);

    const first = await service.findOrCreateByGlobalUserId(GLOBAL_USER_ID);
    const second = await service.findOrCreateByGlobalUserId(GLOBAL_USER_ID);

    expect(second.created).toBe(false);
    expect(second.pgxsportsUserId).toBe(first.pgxsportsUserId);
    expect(prisma._debug.linksByGlobalUserId.size).toBe(1);
  });

  it('never creates a duplicate account when two provisioning attempts for the same new global user race', async () => {
    const prisma = makePrisma();
    const service = new GlobalUserLinkService(prisma as any);

    const [a, b] = await Promise.all([
      service.findOrCreateByGlobalUserId(GLOBAL_USER_ID),
      service.findOrCreateByGlobalUserId(GLOBAL_USER_ID),
    ]);

    // Exactly one of the two calls actually created the account; the loser
    // transparently returns the winner's row - never a second account.
    expect([a.created, b.created].filter(Boolean)).toHaveLength(1);
    expect(a.pgxsportsUserId).toBe(b.pgxsportsUserId);
    expect(prisma._debug.linksByGlobalUserId.size).toBe(1);
  });

  it('does not expose unnecessary personal data - defaults to a non-PII placeholder email/name when no hints are given', async () => {
    const prisma = makePrisma();
    const service = new GlobalUserLinkService(prisma as any);

    await service.findOrCreateByGlobalUserId(GLOBAL_USER_ID);

    const createdEmail = [...prisma._debug.usedEmails][0];
    expect(createdEmail).toBe(`pgx-${GLOBAL_USER_ID}@users.pgxsports.internal`);
  });

  it('uses the supplied email/displayName hints when the handoff provides them', async () => {
    const prisma = makePrisma();
    const service = new GlobalUserLinkService(prisma as any);

    await service.findOrCreateByGlobalUserId(GLOBAL_USER_ID, {
      email: 'real-player@example.com',
      displayName: 'Real Player',
    });

    expect(prisma._debug.usedEmails.has('real-player@example.com')).toBe(true);
  });

  it('reverse lookup (findGlobalUserId) resolves a linked local user id back to its globalUserId', async () => {
    const prisma = makePrisma();
    const service = new GlobalUserLinkService(prisma as any);

    const { pgxsportsUserId } = await service.findOrCreateByGlobalUserId(GLOBAL_USER_ID);
    const resolved = await service.findGlobalUserId(pgxsportsUserId);

    expect(resolved).toBe(GLOBAL_USER_ID);
  });

  it('reverse lookup returns null for a local user that has never been linked', async () => {
    const prisma = makePrisma();
    const service = new GlobalUserLinkService(prisma as any);

    expect(await service.findGlobalUserId('never-linked-local-id')).toBeNull();
  });
});
