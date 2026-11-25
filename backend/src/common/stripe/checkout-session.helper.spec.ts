import { Logger } from '@nestjs/common';
import { createDynamicCheckoutSession } from './checkout-session.helper';

function makeConfigService(values: Record<string, string | undefined> = {}) {
  return { get: (key: string) => values[key] };
}

describe('createDynamicCheckoutSession', () => {
  it('omits payment_method_types so Stripe Dynamic Payment Methods are enabled', async () => {
    const create = jest.fn(async (params: any) => ({ id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1', params }));
    const client = { checkout: { sessions: { create } } } as any;

    await createDynamicCheckoutSession(
      client,
      {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price_data: { currency: 'usd', unit_amount: 1000, product_data: { name: 'Item' } }, quantity: 1 }],
        success_url: 'https://example.com/ok',
        cancel_url: 'https://example.com/cancel',
      },
      { configService: makeConfigService() },
    );

    const passedParams = create.mock.calls[0][0];
    expect(passedParams.payment_method_types).toBeUndefined();
    expect(passedParams.adaptive_pricing).toEqual({ enabled: true });
    expect(passedParams.payment_method_configuration).toBeUndefined();
  });

  it('applies mode-specific payment_method_configuration when configured', async () => {
    const create = jest.fn(async () => ({ id: 'cs_2', url: 'https://checkout.stripe.com/c/pay/cs_2' }));
    const client = { checkout: { sessions: { create } } } as any;

    await createDynamicCheckoutSession(
      client,
      {
        mode: 'payment',
        line_items: [],
        success_url: 'https://example.com/ok',
        cancel_url: 'https://example.com/cancel',
      },
      {
        mode: 'live',
        configService: makeConfigService({
          STRIPE_PAYMENT_METHOD_CONFIGURATION: 'pmc_default',
          STRIPE_LIVE_PAYMENT_METHOD_CONFIGURATION: 'pmc_live_override',
        }),
      },
    );

    expect(create.mock.calls[0][0]).toMatchObject({
      payment_method_configuration: 'pmc_live_override',
      adaptive_pricing: { enabled: true },
    });
  });

  it('respects STRIPE_ADAPTIVE_PRICING_ENABLED=false', async () => {
    const create = jest.fn(async () => ({ id: 'cs_3' }));
    const client = { checkout: { sessions: { create } } } as any;

    await createDynamicCheckoutSession(
      client,
      { mode: 'payment', line_items: [], success_url: 'https://a', cancel_url: 'https://b' },
      { configService: makeConfigService({ STRIPE_ADAPTIVE_PRICING_ENABLED: 'false' }) },
    );

    expect(create.mock.calls[0][0].adaptive_pricing).toBeUndefined();
  });

  it('retries without adaptive_pricing if Stripe rejects adaptive_pricing for account/currency', async () => {
    const create = jest
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('Adaptive Pricing is not enabled on this account'), { param: 'adaptive_pricing' }))
      .mockResolvedValueOnce({ id: 'cs_retry', url: 'https://checkout.stripe.com/c/pay/cs_retry' });
    const client = { checkout: { sessions: { create } } } as any;
    const logger = { warn: jest.fn() } as unknown as Logger;

    const session = await createDynamicCheckoutSession(
      client,
      { mode: 'payment', line_items: [], success_url: 'https://a', cancel_url: 'https://b' },
      { configService: makeConfigService(), logger },
    );

    expect(session.id).toBe('cs_retry');
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[0][0].adaptive_pricing).toEqual({ enabled: true });
    expect(create.mock.calls[1][0].adaptive_pricing).toBeUndefined();
    expect(logger.warn).toHaveBeenCalled();
  });
});
