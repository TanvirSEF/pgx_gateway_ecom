import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface DynamicCheckoutSessionOptions {
  configService?: Pick<ConfigService, 'get'>;
  mode?: 'test' | 'live';
  paymentMethodConfiguration?: string;
  adaptivePricingEnabled?: boolean;
  requestOptions?: Stripe.RequestOptions;
  logger?: Logger;
}

/**
 * Resolves an optional Stripe Payment Method Configuration ID (pmc_...)
 * from environment configuration, supporting mode-specific overrides.
 */
export function resolvePaymentMethodConfiguration(
  configService?: Pick<ConfigService, 'get'>,
  mode?: 'test' | 'live',
): string | undefined {
  if (!configService) return undefined;

  const modeSpecific =
    mode === 'live'
      ? configService.get<string>('STRIPE_LIVE_PAYMENT_METHOD_CONFIGURATION')
      : mode === 'test'
        ? configService.get<string>('STRIPE_TEST_PAYMENT_METHOD_CONFIGURATION')
        : undefined;

  const pmc = (modeSpecific || configService.get<string>('STRIPE_PAYMENT_METHOD_CONFIGURATION') || '').trim();
  return pmc.length > 0 ? pmc : undefined;
}

/**
 * Resolves whether Adaptive Pricing should be enabled on Checkout Sessions.
 * Defaults to true unless explicitly disabled via STRIPE_ADAPTIVE_PRICING_ENABLED=false.
 */
export function resolveAdaptivePricingEnabled(configService?: Pick<ConfigService, 'get'>): boolean {
  const flag = configService?.get<string>('STRIPE_ADAPTIVE_PRICING_ENABLED');
  return String(flag || '').trim().toLowerCase() !== 'false';
}

function isAdaptivePricingRejection(err: any): boolean {
  const message = String(err?.message || '');
  const param = String(err?.param || err?.raw?.param || '');
  return param === 'adaptive_pricing' || /adaptive_pricing/i.test(message);
}

/**
 * Creates a Stripe Hosted Checkout Session configured for Dynamic Payment Methods
 * (omitting hardcoded `payment_method_types`), optional Payment Method Configuration
 * (`pmc_...`), and Adaptive Pricing with a safe fallback if the Stripe account is
 * not yet eligible for Adaptive Pricing.
 */
export async function createDynamicCheckoutSession(
  client: Stripe,
  params: Stripe.Checkout.SessionCreateParams,
  options: DynamicCheckoutSessionOptions = {},
): Promise<Stripe.Checkout.Session> {
  const { configService, mode, requestOptions, logger } = options;

  // Never restrict Checkout to a hardcoded payment_method_types array (e.g. ['card']).
  // Omitting payment_method_types lets Stripe Dashboard's Dynamic Payment Methods
  // present all eligible options (cards, wallets, BNPL, local redirect methods).
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    ...params,
  };
  delete sessionParams.payment_method_types;

  const pmcId = options.paymentMethodConfiguration ?? resolvePaymentMethodConfiguration(configService, mode);
  if (pmcId && !sessionParams.payment_method_configuration) {
    sessionParams.payment_method_configuration = pmcId;
  }

  const adaptiveEnabled = options.adaptivePricingEnabled ?? resolveAdaptivePricingEnabled(configService);
  if (adaptiveEnabled && !sessionParams.adaptive_pricing) {
    sessionParams.adaptive_pricing = { enabled: true };
  }

  try {
    return await client.checkout.sessions.create(sessionParams, requestOptions);
  } catch (err: any) {
    if (sessionParams.adaptive_pricing && isAdaptivePricingRejection(err)) {
      logger?.warn(
        `Stripe rejected adaptive_pricing on Checkout Session (${err?.message}). Retrying without adaptive_pricing override so Dashboard defaults apply.`,
      );
      const fallbackParams: Stripe.Checkout.SessionCreateParams = { ...sessionParams };
      delete fallbackParams.adaptive_pricing;
      return await client.checkout.sessions.create(fallbackParams, requestOptions);
    }
    throw err;
  }
}
