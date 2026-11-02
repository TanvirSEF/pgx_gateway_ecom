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
      'STRIPE_WEBHOOK_SECRET',
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
        STRIPE_WEBHOOK_SECRET: 'whsec_abc',
      }),
    );
    expect(config.isEnabled()).toBe(true);
    expect(config.getClient()).not.toBeNull();
    expect(config.getWebhookSecret()).toBe('whsec_abc');
  });

  it('reports mode from the secret key prefix, never from a separate env flag', () => {
    const test = new CasinoTopupStripeConfig(
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_test_abc', STRIPE_WEBHOOK_SECRET: 'x' }),
    );
    expect(test.mode).toBe('test');

    const live = new CasinoTopupStripeConfig(
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_live_abc', STRIPE_WEBHOOK_SECRET: 'x' }),
    );
    expect(live.mode).toBe('live');
  });

  it('never includes a secret value in describeStatus()', () => {
    const config = new CasinoTopupStripeConfig(
      makeConfigService({
        STRIPE_SECRET_KEY: 'sk_live_super_secret_value',
        STRIPE_WEBHOOK_SECRET: 'whsec_super_secret_value',
      }),
    );
    const status = JSON.stringify(config.describeStatus());
    expect(status).not.toContain('sk_live_super_secret_value');
    expect(status).not.toContain('whsec_super_secret_value');
  });
});
