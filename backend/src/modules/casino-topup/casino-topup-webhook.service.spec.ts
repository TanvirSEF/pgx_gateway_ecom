// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
//
// Uses a REAL mongodb-memory-server-backed WalletTopupService (same
// technique as topup.service.spec.ts) so the duplicate-event guard and the
// concurrency-safe credit claim are proven against real MongoDB unique-
// index/findOneAndUpdate semantics, not an in-memory mock. Stripe webhook
// signatures are REAL too (Stripe.webhooks.generateTestHeaderString/
// constructEvent are pure local HMAC operations - no network call, no real
// API key needed), so signature verification is proven against the actual
// `stripe` SDK, not a stubbed check.
import { BadRequestException } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Stripe from 'stripe';
import { WalletTopupService } from '../wallet-topup/topup.service';
import { CasinoTopupStripeConfig } from './casino-topup-stripe.config';
import { CasinoTopupWebhookService } from './casino-topup-webhook.service';
import { WalletServiceError } from '../wallet-service-client/wallet-service-client.types';

jest.setTimeout(60000);

const WEBHOOK_SECRET = 'whsec_test_secret';
const stripeForSigning = new Stripe('sk_test_doesnotneedtoberealforSigning', { apiVersion: '2025-02-24.acacia' as any });

function signedHeaders(payload: object) {
  const rawBody = Buffer.from(JSON.stringify(payload));
  const header = stripeForSigning.webhooks.generateTestHeaderString({
    payload: rawBody.toString(),
    secret: WEBHOOK_SECRET,
  });
  return { rawBody, header };
}

function makeStripeConfig(overrides: Partial<Record<string, any>> = {}) {
  const client = {
    webhooks: stripeForSigning.webhooks,
    paymentIntents: { retrieve: jest.fn() },
  };
  return {
    getClient: jest.fn(() => (overrides.unconfigured ? null : client)),
    getWebhookSecret: jest.fn(() => (overrides.unconfigured ? '' : WEBHOOK_SECRET)),
    _client: client,
  } as any;
}

function checkoutEvent(type: string, session: Record<string, unknown>, id = `evt_${Math.random()}`) {
  return { id, type, data: { object: { object: 'checkout.session', ...session } } };
}

describe('CasinoTopupWebhookService', () => {
  let mongo: MongoMemoryServer;
  let topupService: WalletTopupService;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
  });
  afterAll(async () => {
    await mongo.stop();
  });
  beforeEach(async () => {
    topupService = new WalletTopupService({ get: () => undefined } as any);
    await topupService.connectForTests(mongo.getUri(), `casino_topup_test_${Date.now()}_${Math.floor(Math.random() * 1e9)}`);
  });
  afterEach(async () => {
    await topupService.onModuleDestroy();
  });

  async function seedTopup(idempotencyKey: string, amountMinor = 2500, currency = 'EUR') {
    return topupService.createPending({
      pgxCasinoUserId: '507f1f77bcf86cd799439011',
      pgxsportsUserId: 'local-1',
      amountMinor,
      currency,
      provider: 'casino-stripe-topup',
      idempotencyKey,
    });
  }

  function makeWalletClient() {
    return { credit: jest.fn(), debit: jest.fn(), getBalance: jest.fn() } as any;
  }

  // ---- Signature verification -------------------------------------------
  it('rejects a webhook with an invalid signature', async () => {
    const stripeConfig = makeStripeConfig();
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, makeWalletClient());
    const { rawBody } = signedHeaders({ id: 'evt_1' });

    await expect(service.handleWebhook('t=1,v1=invalidsignature', rawBody)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a webhook with no signature header at all', async () => {
    const stripeConfig = makeStripeConfig();
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, makeWalletClient());
    await expect(service.handleWebhook('', Buffer.from('{}'))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses the webhook (never falls back to a permissive JSON parse) when not configured', async () => {
    const stripeConfig = makeStripeConfig({ unconfigured: true });
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, makeWalletClient());
    const { rawBody, header } = signedHeaders({ id: 'evt_1' });
    await expect(service.handleWebhook(header, rawBody)).rejects.toBeInstanceOf(BadRequestException);
  });

  // ---- Duplicate event protection ---------------------------------------
  it('processes checkout.session.completed once, and a REPLAYED identical event id a second time is a no-op', async () => {
    await seedTopup('idem-1');
    const walletClient = makeWalletClient();
    walletClient.credit.mockResolvedValue({ ledgerId: 'l1', balanceAfter: 25, balanceMinorAfter: 2500 });
    const stripeConfig = makeStripeConfig();
    stripeConfig._client.paymentIntents.retrieve.mockResolvedValue({ amount_received: 2500, currency: 'eur' });
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent(
      'checkout.session.completed',
      { id: 'cs_1', payment_intent: 'pi_1', metadata: { type: 'casino_wallet_topup', idempotencyKey: 'idem-1' } },
      'evt_fixed_1',
    );
    const { rawBody, header } = signedHeaders(event);

    await service.handleWebhook(header, rawBody);
    await service.handleWebhook(header, rawBody); // exact replay, same event.id

    expect(walletClient.credit).toHaveBeenCalledTimes(1);
    const topup = await topupService.findByIdempotencyKey('idem-1');
    expect(topup?.walletCreditStatus).toBe('completed');
  });

  // ---- Payment success credits the wallet --------------------------------
  it('credits the wallet exactly once on a successful payment, with the topup idempotencyKey', async () => {
    await seedTopup('idem-2');
    const walletClient = makeWalletClient();
    walletClient.credit.mockResolvedValue({ ledgerId: 'ledger-xyz', balanceAfter: 25, balanceMinorAfter: 2500 });
    const stripeConfig = makeStripeConfig();
    stripeConfig._client.paymentIntents.retrieve.mockResolvedValue({ amount_received: 2500, currency: 'eur' });
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent('checkout.session.completed', {
      id: 'cs_2',
      payment_intent: 'pi_2',
      metadata: { type: 'casino_wallet_topup', idempotencyKey: 'idem-2' },
    });
    const { rawBody, header } = signedHeaders(event);
    await service.handleWebhook(header, rawBody);

    expect(walletClient.credit).toHaveBeenCalledWith(
      expect.objectContaining({ globalUserId: '507f1f77bcf86cd799439011', amountMinor: 2500, currency: 'EUR', idempotencyKey: 'idem-2' }),
    );
    const topup = await topupService.findByIdempotencyKey('idem-2');
    expect(topup?.paymentStatus).toBe('completed');
    expect(topup?.walletCreditStatus).toBe('completed');
    expect(topup?.walletLedgerId).toBe('ledger-xyz');
  });

  // ---- Payment failure / cancellation ------------------------------------
  it('marks the topup failed on async_payment_failed, and never credits the wallet', async () => {
    await seedTopup('idem-3');
    const walletClient = makeWalletClient();
    const stripeConfig = makeStripeConfig();
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent('checkout.session.async_payment_failed', {
      id: 'cs_3',
      metadata: { type: 'casino_wallet_topup', idempotencyKey: 'idem-3' },
    });
    const { rawBody, header } = signedHeaders(event);
    await service.handleWebhook(header, rawBody);

    expect(walletClient.credit).not.toHaveBeenCalled();
    const topup = await topupService.findByIdempotencyKey('idem-3');
    expect(topup?.paymentStatus).toBe('failed');
    expect(topup?.walletCreditStatus).toBe('not_started');
  });

  it('marks the topup failed on checkout.session.expired (cancellation), and never credits the wallet', async () => {
    await seedTopup('idem-4');
    const walletClient = makeWalletClient();
    const stripeConfig = makeStripeConfig();
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent('checkout.session.expired', {
      id: 'cs_4',
      metadata: { type: 'casino_wallet_topup', idempotencyKey: 'idem-4' },
    });
    const { rawBody, header } = signedHeaders(event);
    await service.handleWebhook(header, rawBody);

    expect(walletClient.credit).not.toHaveBeenCalled();
  });

  // ---- Amount / currency mismatch ---------------------------------------
  it('refuses to credit on an amount mismatch between the topup record and Stripe', async () => {
    await seedTopup('idem-5', 2500, 'EUR');
    const walletClient = makeWalletClient();
    const stripeConfig = makeStripeConfig();
    stripeConfig._client.paymentIntents.retrieve.mockResolvedValue({ amount_received: 100, currency: 'eur' }); // wrong amount
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent('checkout.session.completed', {
      id: 'cs_5',
      payment_intent: 'pi_5',
      metadata: { type: 'casino_wallet_topup', idempotencyKey: 'idem-5' },
    });
    const { rawBody, header } = signedHeaders(event);
    await service.handleWebhook(header, rawBody);

    expect(walletClient.credit).not.toHaveBeenCalled();
    const topup = await topupService.findByIdempotencyKey('idem-5');
    expect(topup?.paymentStatus).toBe('failed');
    expect(topup?.failureReason).toMatch(/Amount mismatch/);
  });

  it('refuses to credit on a currency mismatch between the topup record and Stripe', async () => {
    await seedTopup('idem-6', 2500, 'EUR');
    const walletClient = makeWalletClient();
    const stripeConfig = makeStripeConfig();
    stripeConfig._client.paymentIntents.retrieve.mockResolvedValue({ amount_received: 2500, currency: 'usd' }); // wrong currency
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent('checkout.session.completed', {
      id: 'cs_6',
      payment_intent: 'pi_6',
      metadata: { type: 'casino_wallet_topup', idempotencyKey: 'idem-6' },
    });
    const { rawBody, header } = signedHeaders(event);
    await service.handleWebhook(header, rawBody);

    expect(walletClient.credit).not.toHaveBeenCalled();
    const topup = await topupService.findByIdempotencyKey('idem-6');
    expect(topup?.failureReason).toMatch(/Currency mismatch/);
  });

  // ---- Unknown session -----------------------------------------------------
  it('logs and does nothing (never throws) for a webhook referencing an unknown idempotencyKey', async () => {
    const walletClient = makeWalletClient();
    const stripeConfig = makeStripeConfig();
    stripeConfig._client.paymentIntents.retrieve.mockResolvedValue({ amount_received: 2500, currency: 'eur' });
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent('checkout.session.completed', {
      id: 'cs_unknown',
      payment_intent: 'pi_unknown',
      metadata: { type: 'casino_wallet_topup', idempotencyKey: 'never-seen-before' },
    });
    const { rawBody, header } = signedHeaders(event);

    await expect(service.handleWebhook(header, rawBody)).resolves.toEqual({ received: true });
    expect(walletClient.credit).not.toHaveBeenCalled();
  });

  // ---- Wallet API failure + recovery (retry) --------------------------------
  it('marks walletCreditStatus failed-retryable (never throws to the webhook caller) when the Central Wallet Service is unreachable', async () => {
    await seedTopup('idem-7');
    const walletClient = makeWalletClient();
    walletClient.credit.mockRejectedValue(new WalletServiceError('NETWORK_ERROR', 'down', 502));
    const stripeConfig = makeStripeConfig();
    stripeConfig._client.paymentIntents.retrieve.mockResolvedValue({ amount_received: 2500, currency: 'eur' });
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent('checkout.session.completed', {
      id: 'cs_7',
      payment_intent: 'pi_7',
      metadata: { type: 'casino_wallet_topup', idempotencyKey: 'idem-7' },
    });
    const { rawBody, header } = signedHeaders(event);

    await expect(service.handleWebhook(header, rawBody)).resolves.toEqual({ received: true });
    const topup = await topupService.findByIdempotencyKey('idem-7');
    expect(topup?.paymentStatus).toBe('completed'); // payment itself is NOT lost
    expect(topup?.walletCreditStatus).toBe('failed'); // retryable
    expect(topup?.retryCount).toBe(1);
  });

  it('retrying claimAndCreditWallet with the SAME idempotencyKey after a prior failure succeeds and never double-credits', async () => {
    await seedTopup('idem-8');
    const walletClient = makeWalletClient();
    walletClient.credit.mockRejectedValueOnce(new WalletServiceError('NETWORK_ERROR', 'down', 502));
    walletClient.credit.mockResolvedValueOnce({ ledgerId: 'ledger-retry', balanceAfter: 25, balanceMinorAfter: 2500 });
    const stripeConfig = makeStripeConfig();
    stripeConfig._client.paymentIntents.retrieve.mockResolvedValue({ amount_received: 2500, currency: 'eur' });
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    const event = checkoutEvent('checkout.session.completed', {
      id: 'cs_8',
      payment_intent: 'pi_8',
      metadata: { type: 'casino_wallet_topup', idempotencyKey: 'idem-8' },
    });
    const { rawBody, header } = signedHeaders(event);
    await service.handleWebhook(header, rawBody); // first attempt fails

    await service.claimAndCreditWallet('idem-8'); // recovery retry

    expect(walletClient.credit).toHaveBeenCalledTimes(2);
    const topup = await topupService.findByIdempotencyKey('idem-8');
    expect(topup?.walletCreditStatus).toBe('completed');
    expect(topup?.walletLedgerId).toBe('ledger-retry');
  });

  // ---- Concurrent webhook / worker claim safety -----------------------------
  it('two concurrent claimAndCreditWallet calls for the SAME topup credit the wallet only once', async () => {
    const topup = await seedTopup('idem-9');
    await topupService.markPaymentStatus('idem-9', 'completed');
    const walletClient = makeWalletClient();
    let resolveCredit: (v: any) => void;
    walletClient.credit.mockImplementation(
      () => new Promise((resolve) => { resolveCredit = resolve; setTimeout(() => resolve({ ledgerId: 'l-concurrent', balanceAfter: 25, balanceMinorAfter: 2500 }), 20); }),
    );
    const stripeConfig = makeStripeConfig();
    const service = new CasinoTopupWebhookService(stripeConfig, topupService, walletClient);

    await Promise.all([service.claimAndCreditWallet('idem-9'), service.claimAndCreditWallet('idem-9')]);

    expect(walletClient.credit).toHaveBeenCalledTimes(1);
    const final = await topupService.findByIdempotencyKey('idem-9');
    expect(final?.walletCreditStatus).toBe('completed');
    void topup;
  });
});
