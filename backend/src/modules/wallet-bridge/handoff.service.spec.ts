// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { HandoffService } from './handoff.service';

const SECRET = 'test-handoff-secret';
const ALLOWED_RETURN_URL = 'https://playgroundfitnex.com/wallet/return';
const VALID_GLOBAL_USER_ID = '507f1f77bcf86cd799439011';

function makeConfigService(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    CASINO_HANDOFF_SECRET: SECRET,
    CASINO_HANDOFF_RETURN_URL_ALLOWLIST: ALLOWED_RETURN_URL,
    ...overrides,
  };
  return { get: (key: string) => values[key] } as any;
}

function makePrisma(nonceStore: Set<string>) {
  return {
    handoffNonce: {
      create: jest.fn(async ({ data }: any) => {
        if (nonceStore.has(data.nonce)) {
          throw new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'test',
          } as any);
        }
        nonceStore.add(data.nonce);
        return { id: 'x', ...data, consumedAt: new Date() };
      }),
    },
  } as any;
}

function sign(jwt: JwtService, overrides: Record<string, unknown> = {}) {
  const payload = {
    sub: VALID_GLOBAL_USER_ID,
    amountMinor: 5000,
    currency: 'EUR',
    returnUrl: ALLOWED_RETURN_URL,
    nonce: `nonce-${Math.random()}`,
    ...overrides,
  };
  return jwt.sign(payload, {
    secret: SECRET,
    audience: 'pgxsports-payment',
    issuer: 'pgx-casino',
    expiresIn: overrides.expiresIn as any || '120s',
  });
}

describe('HandoffService', () => {
  let jwt: JwtService;
  let nonceStore: Set<string>;

  beforeEach(() => {
    jwt = new JwtService();
    nonceStore = new Set();
  });

  function buildService(configOverrides: Record<string, string> = {}) {
    return new HandoffService(jwt, makeConfigService(configOverrides), makePrisma(nonceStore));
  }

  // Test category 2: Valid handoff
  it('accepts a correctly signed, unexpired, unused token and returns verified claims', async () => {
    const service = buildService();
    const token = sign(jwt);

    const result = await service.verifyAndConsume(token);

    expect(result.globalUserId).toBe(VALID_GLOBAL_USER_ID);
    expect(result.amountMinor).toBe(5000);
    expect(result.currency).toBe('EUR');
    expect(result.returnUrl).toBe(ALLOWED_RETURN_URL);
  });

  // Test category 3: Expired handoff
  it('rejects an expired token with code EXPIRED', async () => {
    const service = buildService();
    const token = jwt.sign(
      { sub: VALID_GLOBAL_USER_ID, amountMinor: 5000, currency: 'EUR', returnUrl: ALLOWED_RETURN_URL, nonce: 'n1' },
      { secret: SECRET, audience: 'pgxsports-payment', issuer: 'pgx-casino', expiresIn: '-10s' },
    );

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'EXPIRED' });
  });

  // Test category 4: Tampered handoff
  it('rejects a token signed with the wrong secret with code TAMPERED', async () => {
    const service = buildService();
    const token = jwt.sign(
      { sub: VALID_GLOBAL_USER_ID, amountMinor: 5000, currency: 'EUR', returnUrl: ALLOWED_RETURN_URL, nonce: 'n2' },
      { secret: 'someone-elses-secret', audience: 'pgxsports-payment', issuer: 'pgx-casino', expiresIn: '120s' },
    );

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'TAMPERED' });
  });

  it('rejects a token with a bit flipped in its payload (signature no longer matches) with code TAMPERED', async () => {
    const service = buildService();
    const token = sign(jwt);
    const parts = token.split('.');
    // Flip the payload segment without re-signing - classic tamper attempt.
    const flipped = parts[1].slice(0, -1) + (parts[1].slice(-1) === 'A' ? 'B' : 'A');
    const tamperedToken = [parts[0], flipped, parts[2]].join('.');

    await expect(service.verifyAndConsume(tamperedToken)).rejects.toMatchObject({ code: 'TAMPERED' });
  });

  it('rejects a token issued for a different audience with code TAMPERED', async () => {
    const service = buildService();
    const token = jwt.sign(
      { sub: VALID_GLOBAL_USER_ID, amountMinor: 5000, currency: 'EUR', returnUrl: ALLOWED_RETURN_URL, nonce: 'n3' },
      { secret: SECRET, audience: 'some-other-service', issuer: 'pgx-casino', expiresIn: '120s' },
    );

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'TAMPERED' });
  });

  // Test category 5: Handoff replay
  it('rejects a second redemption of the same token/nonce with code REPLAYED', async () => {
    const service = buildService();
    const token = sign(jwt, { nonce: 'single-use-nonce' });

    await expect(service.verifyAndConsume(token)).resolves.toBeDefined();
    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'REPLAYED' });
  });

  it('rejects replay even when the two redemptions are concurrent (race, not sequential)', async () => {
    const service = buildService();
    const token = sign(jwt, { nonce: 'concurrent-nonce' });

    const [a, b] = await Promise.allSettled([service.verifyAndConsume(token), service.verifyAndConsume(token)]);
    const fulfilled = [a, b].filter((r) => r.status === 'fulfilled');
    const rejected = [a, b].filter((r) => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({ code: 'REPLAYED' });
  });

  // Test category 6: Invalid amount
  it('rejects a zero amountMinor with code INVALID_AMOUNT', async () => {
    const service = buildService();
    const token = sign(jwt, { amountMinor: 0 });

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'INVALID_AMOUNT' });
  });

  it('rejects a negative amountMinor with code INVALID_AMOUNT', async () => {
    const service = buildService();
    const token = sign(jwt, { amountMinor: -500 });

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'INVALID_AMOUNT' });
  });

  it('rejects a non-integer amountMinor with code INVALID_AMOUNT', async () => {
    const service = buildService();
    const token = sign(jwt, { amountMinor: 50.5 });

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'INVALID_AMOUNT' });
  });

  // Test category 7: Unsupported currency
  it('rejects a non-EUR currency with code UNSUPPORTED_CURRENCY', async () => {
    const service = buildService();
    const token = sign(jwt, { currency: 'USD' });

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'UNSUPPORTED_CURRENCY' });
  });

  it('rejects a returnUrl that is not on the configured allowlist', async () => {
    const service = buildService();
    const token = sign(jwt, { returnUrl: 'https://evil.example.com/steal' });

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'RETURN_URL_NOT_ALLOWLISTED' });
  });

  it('rejects when no handoff secret is configured, without ever calling jwt.verify on an empty secret', async () => {
    const service = buildService({ CASINO_HANDOFF_SECRET: '' });
    const token = sign(jwt);

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'NOT_CONFIGURED' });
  });

  it('rejects a missing token with code MISSING_TOKEN', async () => {
    const service = buildService();
    await expect(service.verifyAndConsume('')).rejects.toMatchObject({ code: 'MISSING_TOKEN' });
  });

  it('rejects a sub that is not a valid 24-char hex ObjectId', async () => {
    const service = buildService();
    const token = sign(jwt, { sub: 'not-an-object-id' });

    await expect(service.verifyAndConsume(token)).rejects.toMatchObject({ code: 'INVALID_CLAIMS' });
  });
});
