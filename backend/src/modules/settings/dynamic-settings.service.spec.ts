// Covers the fix for: an active StripeProfile DB row whose secret cannot be
// decrypted must never be returned as usable - it must fall back to the
// environment variables, exactly like "no active profile" does. Before the
// fix, getActiveStripeProfile() returned early with secretKey: '' whenever
// an active row existed, even if decryption failed or produced an empty
// string - which then crashed getStripeClient()'s `new Stripe('', ...)`
// uncaught, 500ing every storefront webhook request.
import { DynamicSettingsService } from './dynamic-settings.service';

function makePrisma(stripeProfile: any = null) {
  return {
    stripeProfile: {
      findFirst: jest.fn(async () => stripeProfile),
    },
  } as any;
}

function makeConfigService(values: Record<string, string> = {}) {
  return { get: (key: string) => values[key] } as any;
}

const DB_PROFILE_ROW = {
  id: 'profile-1',
  label: 'Live store profile',
  mode: 'TEST',
  publishableKey: 'pk_test_db',
  encryptedSecretKey: 'enc-secret',
  secretKeyIv: 'iv-secret',
  secretKeyTag: 'tag-secret',
  encryptedWebhookSecret: 'enc-webhook',
  webhookSecretIv: 'iv-webhook',
  webhookSecretTag: 'tag-webhook',
  currency: 'eur',
  isActive: true,
};

describe('DynamicSettingsService.getActiveStripeProfile', () => {
  it('returns the database profile when its secret decrypts successfully', async () => {
    const crypto = {
      decrypt: jest.fn((cipher: string) =>
        cipher === 'enc-secret' ? 'sk_test_db_secret' : 'whsec_db_webhook',
      ),
    } as any;
    const service = new DynamicSettingsService(
      makePrisma(DB_PROFILE_ROW),
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_test_env', STRIPE_WEBHOOK_SECRET: 'whsec_env' }),
      crypto,
    );

    const profile = await service.getActiveStripeProfile();

    expect(profile.source).toBe('database');
    expect(profile.secretKey).toBe('sk_test_db_secret');
    expect(profile.webhookSecret).toBe('whsec_db_webhook');
  });

  it('falls back to environment variables when the active profile fails to decrypt (throws)', async () => {
    const crypto = {
      decrypt: jest.fn(() => {
        throw new Error('Failed to decrypt sensitive configuration data');
      }),
    } as any;
    const service = new DynamicSettingsService(
      makePrisma(DB_PROFILE_ROW),
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_test_env', STRIPE_WEBHOOK_SECRET: 'whsec_env' }),
      crypto,
    );

    const profile = await service.getActiveStripeProfile();

    expect(profile.source).toBe('environment');
    expect(profile.secretKey).toBe('sk_test_env');
    expect(profile.webhookSecret).toBe('whsec_env');
  });

  it('falls back to environment variables when the active profile decrypts to an empty secret', async () => {
    // decrypt() itself never throws here - it just returns '' (e.g. the
    // row's ciphertext/iv/tag fields are blank) - this is the exact case
    // the early-return bug missed, since no exception was ever thrown.
    const crypto = { decrypt: jest.fn(() => '') } as any;
    const service = new DynamicSettingsService(
      makePrisma(DB_PROFILE_ROW),
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_test_env', STRIPE_WEBHOOK_SECRET: 'whsec_env' }),
      crypto,
    );

    const profile = await service.getActiveStripeProfile();

    expect(profile.source).toBe('environment');
    expect(profile.secretKey).toBe('sk_test_env');
  });

  it('never throws and never returns an empty secretKey when the active profile is unusable', async () => {
    const crypto = { decrypt: jest.fn(() => '') } as any;
    const service = new DynamicSettingsService(
      makePrisma(DB_PROFILE_ROW),
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_test_env', STRIPE_WEBHOOK_SECRET: 'whsec_env' }),
      crypto,
    );

    await expect(service.getActiveStripeProfile()).resolves.toMatchObject({
      secretKey: 'sk_test_env',
    });
  });

  it('uses the environment profile when no active database profile exists (pre-existing behavior, unchanged)', async () => {
    const crypto = { decrypt: jest.fn() } as any;
    const service = new DynamicSettingsService(
      makePrisma(null),
      makeConfigService({ STRIPE_SECRET_KEY: 'sk_test_env', STRIPE_WEBHOOK_SECRET: 'whsec_env' }),
      crypto,
    );

    const profile = await service.getActiveStripeProfile();

    expect(profile.source).toBe('environment');
    expect(profile.secretKey).toBe('sk_test_env');
    expect(profile.webhookSecret).toBe('whsec_env');
    expect(crypto.decrypt).not.toHaveBeenCalled();
  });
});
