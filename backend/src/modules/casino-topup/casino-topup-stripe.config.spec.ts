// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
import { CasinoTopupStripeConfig } from './casino-topup-stripe.config';

function makeConfigService(values: Record<string, string> = {}) {
  return { get: (key: string) => values[key] } as any;
}

describe('CasinoTopupStripeConfig', () => {
  it('is disabled when neither secret key nor webhook secret is set', () => {
    const config = new CasinoTopupStripeConfig(makeConfigService());
    expect(config.isEnabled()).toBe(false);
    expect(config.getClient()).toBeNull();
    expect(config.describeStatus().missing).toEqual([
      'STRIPE_SECRET_KEY',
      'CASINO_TOPUP_STRIPE_WEBHOOK_SECRET',
    ]);
  });

  it('is disabled when only one of the two required secrets is set', () => {
    const config = new CasinoTopupStripeConfig(
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_test_abc' }),
    );
    expect(config.isEnabled()).toBe(false);
    expect(config.getClient()).toBeNull();
  });

  it('is enabled and builds a real client when both secrets are present', () => {
    const config = new CasinoTopupStripeConfig(
      makeConfigService({
        STRIPE_SECRET_KEY: 'sk_test_abc',
        CASINO_TOPUP_STRIPE_WEBHOOK_SECRET: 'whsec_casino',
      }),
    );
    expect(config.isEnabled()).toBe(true);
    expect(config.getClient()).not.toBeNull();
    expect(config.getWebhookSecret()).toBe('whsec_casino');
  });

  it('reports mode from the secret key prefix, never from a separate env flag', () => {
    const test = new CasinoTopupStripeConfig(
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_test_abc', CASINO_TOPUP_STRIPE_WEBHOOK_SECRET: 'x' }),
    );
    expect(test.mode).toBe('test');

    const live = new CasinoTopupStripeConfig(
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_live_abc', CASINO_TOPUP_STRIPE_WEBHOOK_SECRET: 'x' }),
    );
    expect(live.mode).toBe('live');
  });

  it('never includes a secret value in describeStatus()', () => {
    const config = new CasinoTopupStripeConfig(
      makeConfigService({
        STRIPE_SECRET_KEY: 'sk_live_super_secret_value',
        CASINO_TOPUP_STRIPE_WEBHOOK_SECRET: 'whsec_super_secret_value',
      }),
    );
    const status = JSON.stringify(config.describeStatus());
    expect(status).not.toContain('sk_live_super_secret_value');
    expect(status).not.toContain('whsec_super_secret_value');
  });

  it('reads its webhook secret from CASINO_TOPUP_STRIPE_WEBHOOK_SECRET, never from the storefront\'s STRIPE_WEBHOOK_SECRET', () => {
    // Shared API key, but each webhook endpoint keeps its own signing secret
    // (Stripe issues one per endpoint, not per account) - this proves the
    // casino config cannot accidentally fall back to the storefront's value.
    const config = new CasinoTopupStripeConfig(
      makeConfigService({
        STRIPE_SECRET_KEY: 'sk_test_abc',
        STRIPE_WEBHOOK_SECRET: 'whsec_storefront_only',
        CASINO_TOPUP_STRIPE_WEBHOOK_SECRET: 'whsec_casino_only',
      }),
    );
    expect(config.getWebhookSecret()).toBe('whsec_casino_only');
    expect(config.getWebhookSecret()).not.toBe('whsec_storefront_only');
  });

  it('stays disabled if only the storefront webhook secret is set, even though the API key is shared', () => {
    const config = new CasinoTopupStripeConfig(
      makeConfigService({
        STRIPE_SECRET_KEY: 'sk_test_abc',
        STRIPE_WEBHOOK_SECRET: 'whsec_storefront_only',
      }),
    );
    expect(config.isEnabled()).toBe(false);
    expect(config.describeStatus().missing).toEqual(['CASINO_TOPUP_STRIPE_WEBHOOK_SECRET']);
  });
});
