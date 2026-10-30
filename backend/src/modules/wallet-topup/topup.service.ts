// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, MongoClient } from 'mongodb';
import {
  ensureStripeEventIndexes,
  ensureWalletTopupIndexes,
  STRIPE_EVENTS_COLLECTION,
  StripeEventDocument,
  TopupPaymentStatus,
  TopupWalletCreditStatus,
  WALLET_TOPUP_COLLECTION,
  WalletTopupDocument,
} from './topup.schema';

const DUPLICATE_KEY = 11000;
// Claimable states a top-up's walletCreditStatus may be in when a recovery
// worker looks for unresolved paid-but-uncredited top-ups. Deliberately
// excludes 'crediting' and 'completed' - see topup.schema.ts's comment on
// why 'crediting' exists.
const CLAIMABLE_CREDIT_STATUSES: TopupWalletCreditStatus[] = ['not_started', 'pending', 'failed'];

export interface CreatePendingTopupInput {
  pgxCasinoUserId: string;
  pgxsportsUserId: string;
  amountMinor: number;
  currency: string;
  provider: string;
  idempotencyKey: string;
}

@Injectable()
export class WalletTopupService implements OnModuleDestroy {
  private readonly logger = new Logger(WalletTopupService.name);
  private client: MongoClient | null = null;
  private collectionPromise: Promise<Collection<WalletTopupDocument>> | null = null;
  private stripeEventsCollectionPromise: Promise<Collection<StripeEventDocument>> | null = null;
  private dbName = 'pgx_wallet';

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('WALLET_MONGODB_URI'));
  }

  /** Test-only hook: lets wallet-topup tests point this service at an
   * in-memory mongodb-memory-server instance instead of a real deployment. */
  async connectForTests(uri: string, dbName: string): Promise<void> {
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.dbName = dbName;
    const collection = this.client.db(dbName).collection<WalletTopupDocument>(WALLET_TOPUP_COLLECTION);
    await ensureWalletTopupIndexes(collection);
    this.collectionPromise = Promise.resolve(collection);
  }

  /** Lazily connects once, shared by both collections below - the same
   * MongoDB deployment as PGX Casino's walletLedger, per the architecture
   * doc, just a different collection per concern. */
  private async connect(): Promise<MongoClient> {
    if (this.client) return this.client;
    const uri = this.configService.get<string>('WALLET_MONGODB_URI');
    if (!uri) {
      throw new Error('WALLET_MONGODB_URI is not configured');
    }
    this.dbName = this.configService.get<string>('WALLET_MONGODB_DB') || 'pgx_wallet';
    this.client = new MongoClient(uri);
    await this.client.connect();
    return this.client;
  }

  private async getCollection(): Promise<Collection<WalletTopupDocument>> {
    if (!this.collectionPromise) {
      this.collectionPromise = (async () => {
        const client = await this.connect();
        const collection = client.db(this.dbName).collection<WalletTopupDocument>(WALLET_TOPUP_COLLECTION);
        await ensureWalletTopupIndexes(collection);
        return collection;
      })();
    }
    return this.collectionPromise;
  }

  private async getStripeEventsCollection(): Promise<Collection<StripeEventDocument>> {
    if (!this.stripeEventsCollectionPromise) {
      this.stripeEventsCollectionPromise = (async () => {
        const client = await this.connect();
        const collection = client.db(this.dbName).collection<StripeEventDocument>(STRIPE_EVENTS_COLLECTION);
        await ensureStripeEventIndexes(collection);
        return collection;
      })();
    }
    return this.stripeEventsCollectionPromise;
  }

  /**
   * Insert-first claim of a Stripe event id (mirrors PGX Casino's
   * App/Models/paymentEvent.js claimEventOrDetectDuplicate). Returns
   * `{isDuplicate:true}` on a replayed/redelivered event - the caller must
   * then return 200 and do nothing further, never reprocess.
   */
  async claimStripeEventOrDetectDuplicate(eventId: string, eventType: string): Promise<{ isDuplicate: boolean }> {
    const collection = await this.getStripeEventsCollection();
    try {
      await collection.insertOne({ eventId, eventType, receivedAt: new Date() });
      return { isDuplicate: false };
    } catch (err: any) {
      if (err?.code === DUPLICATE_KEY) {
        return { isDuplicate: true };
      }
      throw err;
    }
  }

  /**
   * Insert-first claim of `idempotencyKey`, same pattern as Phase 1's
   * walletLedgerServices.claimIdempotencyKey: a duplicate create (same
   * key, e.g. a retried "Add Funds" click) returns the EXISTING document
   * rather than creating a second top-up record or throwing.
   */
  async createPending(input: CreatePendingTopupInput): Promise<WalletTopupDocument> {
    const collection = await this.getCollection();
    const now = new Date();
    const doc: WalletTopupDocument = {
      pgxCasinoUserId: input.pgxCasinoUserId,
      pgxsportsUserId: input.pgxsportsUserId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      provider: input.provider,
      paymentStatus: 'created',
      walletCreditStatus: 'not_started',
      idempotencyKey: input.idempotencyKey,
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    try {
      const result = await collection.insertOne(doc);
      return { ...doc, _id: result.insertedId };
    } catch (err: any) {
      if (err?.code === DUPLICATE_KEY) {
        const existing = await collection.findOne({ idempotencyKey: input.idempotencyKey });
        if (existing) return existing;
      }
      throw err;
    }
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<WalletTopupDocument | null> {
    const collection = await this.getCollection();
    return collection.findOne({ idempotencyKey });
  }

  async findByStripeSessionId(stripeSessionId: string): Promise<WalletTopupDocument | null> {
    const collection = await this.getCollection();
    return collection.findOne({ stripeSessionId });
  }

  async setStripeSessionId(idempotencyKey: string, stripeSessionId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { idempotencyKey },
      { $set: { stripeSessionId, paymentStatus: 'pending', updatedAt: new Date() } },
    );
  }

  async markPaymentStatus(
    idempotencyKey: string,
    paymentStatus: TopupPaymentStatus,
    failureReason?: string,
  ): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { idempotencyKey },
      { $set: { paymentStatus, failureReason, updatedAt: new Date() } },
    );
  }

  async markWalletCreditStatus(idempotencyKey: string, walletCreditStatus: TopupWalletCreditStatus): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ idempotencyKey }, { $set: { walletCreditStatus, updatedAt: new Date() } });
  }

  async markCreditCompleted(idempotencyKey: string, walletLedgerId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { idempotencyKey },
      { $set: { walletCreditStatus: 'completed', walletLedgerId, updatedAt: new Date() } },
    );
  }

  /**
   * Atomically claims ONE paid-but-uncredited top-up for crediting. The
   * WHERE clause (walletCreditStatus must be one of CLAIMABLE_CREDIT_STATUSES,
   * paymentStatus must be 'completed') IS the concurrency guard - two
   * workers calling this at the same instant can never both receive the
   * same document, because the second one's filter no longer matches once
   * the first has flipped the status to 'crediting'. Safe across an
   * application restart: the claim lives in MongoDB, not in memory.
   */
  async claimForCrediting(idempotencyKey: string): Promise<WalletTopupDocument | null> {
    const collection = await this.getCollection();
    return collection.findOneAndUpdate(
      { idempotencyKey, paymentStatus: 'completed', walletCreditStatus: { $in: CLAIMABLE_CREDIT_STATUSES } },
      { $set: { walletCreditStatus: 'crediting', updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  }

  /**
   * "A safe way to identify unresolved paid-but-uncredited top-ups"
   * (payment confirmed successful, but the Central Wallet Service credit
   * never completed - e.g. it was unreachable at webhook-processing time).
   * This is what a recovery worker/operator script polls.
   */
  async findUnresolvedPaidButUncredited(limit = 50): Promise<WalletTopupDocument[]> {
    const collection = await this.getCollection();
    return collection
      .find({ paymentStatus: 'completed', walletCreditStatus: { $in: CLAIMABLE_CREDIT_STATUSES } })
      .sort({ createdAt: 1 })
      .limit(limit)
      .toArray();
  }

  async recordRetry(idempotencyKey: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { idempotencyKey },
      { $inc: { retryCount: 1 }, $set: { lastRetryAt: new Date(), updatedAt: new Date() } },
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.collectionPromise = null;
      this.stripeEventsCollectionPromise = null;
    }
  }
}
