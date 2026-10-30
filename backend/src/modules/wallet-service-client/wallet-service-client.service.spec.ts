// Implements: Phase 2 - PGXSports Shared Wallet Integration
import * as crypto from 'node:crypto';
import { WalletServiceClientService } from './wallet-service-client.service';
import { WalletServiceError } from './wallet-service-client.types';

const BASE_URL = 'https://staging.pgxcasino.com/api';
const API_KEY = 'test-wallet-service-key';

function makeConfigService(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    WALLET_SERVICE_BASE_URL: BASE_URL,
    WALLET_SERVICE_API_KEY: API_KEY,
    WALLET_SERVICE_SOURCE: 'pgxsports-stripe',
    ...overrides,
  };
  return { get: (key: string) => values[key] } as any;
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as any;
}

describe('WalletServiceClientService', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  // Test category 8: Wallet-service HMAC authentication
  it('signs every request as HMAC_SHA256(apiKey, `${timestamp}.${rawBody}`) - byte-for-byte the pgx_frontend_api_node walletServiceAuth.js construction', async () => {
    let capturedHeaders: any;
    let capturedBody: any;
    global.fetch = jest.fn(async (_url: any, init: any) => {
      capturedHeaders = init.headers;
      capturedBody = init.body;
      return jsonResponse({
        success: true,
        status: 'completed',
        ledgerId: 'l1',
        walletField: 'chips',
        balanceAfter: 50,
        balanceMinorAfter: 5000,
      });
    }) as any;

    const client = new WalletServiceClientService(makeConfigService());
    await client.credit({
      globalUserId: '507f1f77bcf86cd799439011',
      amountMinor: 1000,
      currency: 'EUR',
      walletField: 'chips',
      idempotencyKey: 'key-1',
    });

    expect(capturedHeaders['x-api-key']).toBe(API_KEY);
    const timestamp = capturedHeaders['x-timestamp'];
    expect(Number(timestamp)).toBeGreaterThan(0);
    const expectedSignature = crypto
      .createHmac('sha256', API_KEY)
      .update(`${timestamp}.${capturedBody}`)
      .digest('hex');
    expect(capturedHeaders['x-signature']).toBe(expectedSignature);
  });

  it('signs a GET request with an empty-string rawBody, matching walletServiceAuth.js default-to-empty-body behaviour', async () => {
    let capturedHeaders: any;
    global.fetch = jest.fn(async (_url: any, init: any) => {
      capturedHeaders = init.headers;
      return jsonResponse({
        success: true,
        globalUserId: '507f1f77bcf86cd799439011',
        currency: 'EUR',
        balances: { chips: { minor: 0, major: 0 }, bonusChips: { minor: 0, major: 0 } },
      });
    }) as any;

    const client = new WalletServiceClientService(makeConfigService());
    await client.getBalance('507f1f77bcf86cd799439011');

    const expectedSignature = crypto
      .createHmac('sha256', API_KEY)
      .update(`${capturedHeaders['x-timestamp']}.`)
      .digest('hex');
    expect(capturedHeaders['x-signature']).toBe(expectedSignature);
  });

  it('never includes the API key in a thrown error message', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('ECONNREFUSED');
    }) as any;

    const client = new WalletServiceClientService(makeConfigService());
    await expect(client.getBalance('507f1f77bcf86cd799439011')).rejects.toThrow(
      expect.not.stringContaining(API_KEY),
    );
  });

  // Test category 7: Unsupported currency
  it('rejects a non-EUR currency before making any network call', async () => {
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as any;

    const client = new WalletServiceClientService(makeConfigService());
    await expect(
      client.credit({
        globalUserId: '507f1f77bcf86cd799439011',
        amountMinor: 1000,
        currency: 'USD',
        walletField: 'chips',
        idempotencyKey: 'key-usd',
      }),
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_CURRENCY' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // Test category 9: Wallet-service failure handling
  it('maps a network-level fetch rejection to a NETWORK_ERROR WalletServiceError', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('getaddrinfo ENOTFOUND');
    }) as any;

    const client = new WalletServiceClientService(makeConfigService());
    await expect(client.getBalance('507f1f77bcf86cd799439011')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });

  it('maps an abort (timeout) to a TIMEOUT WalletServiceError', async () => {
    global.fetch = jest.fn((_url: any, init: any) => {
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          const err: any = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    }) as any;

    const client = new WalletServiceClientService(makeConfigService({ WALLET_SERVICE_TIMEOUT_MS: '20' }));
    await expect(client.getBalance('507f1f77bcf86cd799439011')).rejects.toMatchObject({ code: 'TIMEOUT' });
  });

  it('maps a 4xx error response body to a WalletServiceError carrying the real code/message', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ success: false, error: { code: 'INSUFFICIENT_BALANCE', message: 'not enough funds' } }, 400),
    ) as any;

    const client = new WalletServiceClientService(makeConfigService());
    await expect(client.debit({
      globalUserId: '507f1f77bcf86cd799439011',
      amountMinor: 1000,
      currency: 'EUR',
      walletField: 'chips',
      idempotencyKey: 'key-insufficient',
    })).rejects.toMatchObject({ code: 'INSUFFICIENT_BALANCE', httpStatus: 400 });
  });

  it('throws NOT_CONFIGURED without any network call when WALLET_SERVICE_API_KEY is missing', async () => {
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as any;

    const client = new WalletServiceClientService(makeConfigService({ WALLET_SERVICE_API_KEY: '' }));
    await expect(client.getBalance('507f1f77bcf86cd799439011')).rejects.toMatchObject({ code: 'NOT_CONFIGURED' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // Test category 10: Duplicate idempotency keys
  it('sends the exact same idempotencyKey unchanged on a repeated call (never mutates/regenerates it)', async () => {
    const seenKeys: string[] = [];
    global.fetch = jest.fn(async (_url: any, init: any) => {
      seenKeys.push(JSON.parse(init.body).idempotencyKey);
      return jsonResponse({
        success: true,
        status: 'completed',
        replay: seenKeys.length > 1,
        ledgerId: 'l1',
        walletField: 'chips',
        balanceAfter: 50,
        balanceMinorAfter: 5000,
      });
    }) as any;

    const client = new WalletServiceClientService(makeConfigService());
    const params = {
      globalUserId: '507f1f77bcf86cd799439011',
      amountMinor: 1000,
      currency: 'EUR',
      walletField: 'chips' as const,
      idempotencyKey: 'same-key-retried',
    };

    await client.credit(params);
    const second = await client.credit(params);

    expect(seenKeys).toEqual(['same-key-retried', 'same-key-retried']);
    expect(second.replay).toBe(true);
  });

  it('isConfigured()/describeStatus() report presence only - never the key value', () => {
    const client = new WalletServiceClientService(makeConfigService());
    expect(client.isConfigured()).toBe(true);
    const status = JSON.stringify(client.describeStatus());
    expect(status).not.toContain(API_KEY);

    const unconfigured = new WalletServiceClientService(makeConfigService({ WALLET_SERVICE_API_KEY: '' }));
    expect(unconfigured.isConfigured()).toBe(false);
  });
});
