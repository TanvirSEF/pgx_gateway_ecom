// Implements: Phase 2 - PGXSports Shared Wallet Integration
//
// Reusable backend client for PGX Casino's Central Wallet Service
// (pgx_frontend_api_node, /internal/wallet/*, deployed to staging at
// ec5ee86b). Every method mirrors the REAL deployed contract read from
// App/Controller/integration/walletServiceController.js and
// App/Middlware/walletServiceAuth.js - not the architecture doc's
// illustrative examples, which use different field/endpoint shapes.
//
// SECRET HANDLING: WALLET_SERVICE_API_KEY is read once from config and
// used only inside the HMAC signer and the `x-api-key` header. It is never
// interpolated into a log line, error message, or thrown object - see
// `isConfigured()` and `describeStatus()`, which report presence only,
// matching pgx_frontend_api_node's own App/Config/stripeConfig.js pattern.
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';
import {
  CreditDebitParams,
  WalletBalanceResponse,
  WalletHistoryResponse,
  WalletOperationResponse,
  WalletServiceError,
  WalletStatusResponse,
} from './wallet-service-client.types';

// Phase 1's own allow-list is EUR-only (ALLOWED_CURRENCIES in
// walletServiceController.js - corrected 2026-10-29: PGX Casino's actual
// player/account currency defaults to EUR, confirmed live on
// pgxcasino.com; USD was an unverified assumption at Phase 1 build time).
// Rejecting anything else here, before a network call, fails fast instead
// of spending a round trip to learn the same thing from a 400.
const SUPPORTED_CURRENCIES = ['EUR'];

@Injectable()
export class WalletServiceClientService {
  private readonly logger = new Logger(WalletServiceClientService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly source: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (this.configService.get<string>('WALLET_SERVICE_BASE_URL') || '').replace(/\/+$/, '');
    this.apiKey = this.configService.get<string>('WALLET_SERVICE_API_KEY') || '';
    // 'pgxsports-stripe' is Phase 1's ONE approved caller identity
    // (WALLET_SERVICE_CALLER_ID in walletServiceAuth.js) - not configurable
    // to a different value without a Phase 1 change on the PGX Casino side.
    this.source = this.configService.get<string>('WALLET_SERVICE_SOURCE') || 'pgxsports-stripe';
    this.timeoutMs = Number(this.configService.get<string>('WALLET_SERVICE_TIMEOUT_MS')) || 10000;
  }

  /** Names only - never values. Safe to log, mirrors stripeConfig.describeStatus(). */
  describeStatus() {
    return {
      configured: this.isConfigured(),
      missing: [
        ...(this.baseUrl ? [] : ['WALLET_SERVICE_BASE_URL']),
        ...(this.apiKey ? [] : ['WALLET_SERVICE_API_KEY']),
      ],
    };
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.apiKey);
  }

  async getBalance(globalUserId: string): Promise<WalletBalanceResponse> {
    return this.request<WalletBalanceResponse>('GET', `/internal/wallet/balance/${globalUserId}`);
  }

  async credit(params: CreditDebitParams): Promise<WalletOperationResponse> {
    this.assertSupportedCurrency(params.currency);
    return this.request<WalletOperationResponse>('POST', '/internal/wallet/credit', this.buildBody(params));
  }

  async debit(params: CreditDebitParams): Promise<WalletOperationResponse> {
    this.assertSupportedCurrency(params.currency);
    return this.request<WalletOperationResponse>('POST', '/internal/wallet/debit', this.buildBody(params));
  }

  async getHistory(
    globalUserId: string,
    opts: { page?: number; limit?: number } = {},
  ): Promise<WalletHistoryResponse> {
    const qs = new URLSearchParams();
    if (opts.page) qs.set('page', String(opts.page));
    if (opts.limit) qs.set('limit', String(opts.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<WalletHistoryResponse>('GET', `/internal/wallet/transactions/${globalUserId}${suffix}`);
  }

  /**
   * Looks up a PRIOR operation by idempotencyKey. Callers MUST reuse the
   * same idempotencyKey to retry a credit/debit after a timeout/5xx - this
   * client never invents a new key on retry, and never auto-retries
   * internally, because a credit/debit retried under a NEW key would
   * double-apply. See wallet-service-client.spec.ts "duplicate idempotency
   * keys" cases.
   */
  async getStatus(idempotencyKey: string): Promise<WalletStatusResponse> {
    return this.request<WalletStatusResponse>('GET', `/internal/wallet/transactions/status/${idempotencyKey}`);
  }

  /** HMAC-SHA256 over `${timestamp}.${rawBody}`, keyed by WALLET_SERVICE_API_KEY -
   * byte-for-byte the same construction as walletServiceAuth.js's
   * signPayload(). `rawBody` must be the EXACT string sent as the request
   * body (or '' for a GET), never re-serialized separately. */
  private sign(timestamp: string, rawBody: string): string {
    return crypto.createHmac('sha256', this.apiKey).update(`${timestamp}.${rawBody}`).digest('hex');
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    if (!this.isConfigured()) {
      throw new WalletServiceError(
        'NOT_CONFIGURED',
        'WALLET_SERVICE_BASE_URL/WALLET_SERVICE_API_KEY is not configured',
        503,
      );
    }

    const timestamp = String(Math.floor(Date.now() / 1000));
    const rawBody = body !== undefined ? JSON.stringify(body) : '';
    const signature = this.sign(timestamp, rawBody);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'x-timestamp': timestamp,
          'x-signature': signature,
        },
        body: method === 'POST' ? rawBody : undefined,
        signal: controller.signal,
      });

      const json: any = await res.json().catch(() => null);
      if (!res.ok || !json || json.success === false) {
        const code = json?.error?.code || `HTTP_${res.status}`;
        const message = json?.error?.message || `Wallet service request failed with status ${res.status}`;
        throw new WalletServiceError(code, message, res.status);
      }
      return json as T;
    } catch (err: any) {
      if (err instanceof WalletServiceError) throw err;
      if (err?.name === 'AbortError') {
        throw new WalletServiceError(
          'TIMEOUT',
          `Wallet service request timed out after ${this.timeoutMs}ms`,
          504,
        );
      }
      // Never interpolate `this.apiKey` here - only the error message.
      this.logger.error(`Wallet service request to ${path} failed: ${err?.message}`);
      throw new WalletServiceError('NETWORK_ERROR', 'Could not reach the Central Wallet Service', 502);
    } finally {
      clearTimeout(timer);
    }
  }

  private assertSupportedCurrency(currency: string) {
    if (!SUPPORTED_CURRENCIES.includes(String(currency).toUpperCase())) {
      throw new WalletServiceError(
        'UNSUPPORTED_CURRENCY',
        `Currency ${currency} is not supported by the Central Wallet Service - only EUR`,
        400,
      );
    }
  }

  private buildBody(params: CreditDebitParams) {
    return {
      globalUserId: params.globalUserId,
      amountMinor: params.amountMinor,
      currency: params.currency.toUpperCase(),
      walletField: params.walletField,
      source: this.source,
      referenceId: params.referenceId || '',
      idempotencyKey: params.idempotencyKey,
      metadata: params.metadata || {},
    };
  }
}
