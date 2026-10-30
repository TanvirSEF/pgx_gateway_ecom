// Implements: Phase 2 - PGXSports Shared Wallet Integration
//
// Real MongoDB index proof, not a mock - same technique Phase 1 itself
// used on the PGX Casino side (walletLedger.js) to prove its compound
// unique index actually builds and rejects a real duplicate insert, given
// this project's own documented lesson that autoIndex can be silently
// false in a shared production connection.
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { ensureWalletTopupIndexes, WALLET_TOPUP_COLLECTION, WalletTopupDocument } from './topup.schema';
import { WalletTopupService } from './topup.service';

jest.setTimeout(60000);

describe('Wallet top-up MongoDB model (Test category 12: MongoDB top-up uniqueness)', () => {
  let mongo: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    client = new MongoClient(mongo.getUri());
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await mongo.stop();
  });

  afterEach(async () => {
    await client.db('pgx_wallet_test').collection(WALLET_TOPUP_COLLECTION).deleteMany({});
  });

  function collection() {
    return client.db('pgx_wallet_test').collection<WalletTopupDocument>(WALLET_TOPUP_COLLECTION);
  }

  it('builds the unique idempotencyKey index and REJECTS a real duplicate insert', async () => {
    const col = collection();
    await ensureWalletTopupIndexes(col);

    const base: WalletTopupDocument = {
      pgxCasinoUserId: '507f1f77bcf86cd799439011',
      pgxsportsUserId: 'local-1',
      amountMinor: 5000,
      currency: 'EUR',
      provider: 'stripe',
      paymentStatus: 'created',
      walletCreditStatus: 'not_started',
      idempotencyKey: 'dup-key-1',
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await col.insertOne(base);

    await expect(col.insertOne({ ...base, pgxsportsUserId: 'local-2' })).rejects.toMatchObject({ code: 11000 });
  });

  it('builds the partial unique stripeSessionId index - two documents may both omit it, but not share a real value', async () => {
    const col = collection();
    await ensureWalletTopupIndexes(col);

    const base: Omit<WalletTopupDocument, 'idempotencyKey'> = {
      pgxCasinoUserId: '507f1f77bcf86cd799439011',
      pgxsportsUserId: 'local-1',
      amountMinor: 5000,
      currency: 'EUR',
      provider: 'stripe',
      paymentStatus: 'created',
      walletCreditStatus: 'not_started',
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Two docs with NO stripeSessionId at all - allowed, the partial index
    // does not apply to missing/non-string values.
    await col.insertOne({ ...base, idempotencyKey: 'k1' });
    await col.insertOne({ ...base, idempotencyKey: 'k2' });

    // Two docs that both set the SAME real stripeSessionId - rejected.
    await col.insertOne({ ...base, idempotencyKey: 'k3', stripeSessionId: 'cs_shared' });
    await expect(
      col.insertOne({ ...base, idempotencyKey: 'k4', stripeSessionId: 'cs_shared' }),
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('WalletTopupService.createPending claims idempotencyKey insert-first and returns the EXISTING document on a retried call (never creates a second record)', async () => {
    const service = new WalletTopupService({ get: () => undefined } as any);
    await service.connectForTests(mongo.getUri(), 'pgx_wallet_test');

    const input = {
      pgxCasinoUserId: '507f1f77bcf86cd799439011',
      pgxsportsUserId: 'local-1',
      amountMinor: 5000,
      currency: 'EUR',
      provider: 'stripe',
      idempotencyKey: 'retry-key',
    };

    const first = await service.createPending(input);
    const second = await service.createPending(input);

    expect(String(second._id)).toBe(String(first._id));
    const count = await collection().countDocuments({ idempotencyKey: 'retry-key' });
    expect(count).toBe(1);

    await service.onModuleDestroy();
  });

  it('keeps paymentStatus and walletCreditStatus as independent fields (per the architecture doc)', async () => {
    const service = new WalletTopupService({ get: () => undefined } as any);
    await service.connectForTests(mongo.getUri(), 'pgx_wallet_test');

    await service.createPending({
      pgxCasinoUserId: '507f1f77bcf86cd799439011',
      pgxsportsUserId: 'local-1',
      amountMinor: 5000,
      currency: 'EUR',
      provider: 'stripe',
      idempotencyKey: 'status-split-key',
    });

    await service.markPaymentStatus('status-split-key', 'completed');
    await service.markWalletCreditStatus('status-split-key', 'pending');

    const doc = await service.findByIdempotencyKey('status-split-key');
    expect(doc?.paymentStatus).toBe('completed');
    expect(doc?.walletCreditStatus).toBe('pending');

    await service.onModuleDestroy();
  });
});
