// Implements: Phase 2 - PGXSports Shared Wallet Integration
//
// Test category 13: Existing functionality regression. orders.service.ts
// itself is UNMODIFIED by Phase 2 (zero diff) - this proves its existing
// "pay with Universal Wallet" checkout still works against the call
// contract wallet.service.ts still exposes after migrating to the
// Central Wallet Service (getBalance(userId) -> {balance}; deductFunds
// (userId, amount, orderNumber, description) -> throws on failure).
import { BadRequestException } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { OrdersService } from './orders.service';

function makePrisma(overrides: any = {}) {
  const order = { id: 'order-1', orderNumber: 'ORD-0001' };
  return {
    shippingZone: { findUnique: jest.fn(async () => ({ slug: 'inside_dhaka', cost: 5 })) },
    product: {
      findUnique: jest.fn(async () => ({ id: 'p1', name: 'Widget', price: 20, variants: [] })),
      update: jest.fn(async () => ({})),
    },
    productVariant: { update: jest.fn(async () => ({})) },
    coupon: { update: jest.fn(async () => ({})) },
    user: { findUnique: jest.fn(async () => ({ email: 'player@example.com' })) },
    order: {
      findFirst: jest.fn(async () => null),
      update: jest.fn(async () => ({})),
    },
    $transaction: jest.fn(async (fn: any) =>
      fn({
        order: { create: jest.fn(async () => order) },
        coupon: { update: jest.fn(async () => ({})) },
        productVariant: { update: jest.fn(async () => ({})) },
        product: { update: jest.fn(async () => ({})) },
      }),
    ),
    ...overrides,
  };
}

function makeMail() {
  return { sendOrderConfirmation: jest.fn(async () => undefined) } as any;
}

function makeCoupons() {
  return { validateForOrder: jest.fn() } as any;
}

describe('OrdersService (unmodified) against the migrated WalletService contract', () => {
  it('completes a WALLET-paid checkout when the Central-Wallet-Service-backed balance is sufficient', async () => {
    const wallet = {
      getBalance: jest.fn(async () => ({ userId: 'u1', balance: 100, currency: 'USD' })),
      deductFunds: jest.fn(async () => ({ success: true, targetUserId: 'g1', newBalance: 75 })),
    } as any;
    const service = new OrdersService(makePrisma() as any, makeMail(), makeCoupons(), wallet, {} as any, {} as any);

    const result = await service.create({
      userId: 'u1',
      zone: 'inside_dhaka',
      items: [{ productId: 'p1', quantity: 1 }],
      paymentMethod: PaymentMethod.WALLET,
    });

    expect(result).toMatchObject({ orderNumber: 'ORD-0001' });
    expect(wallet.getBalance).toHaveBeenCalledWith('u1');
    expect(wallet.deductFunds).toHaveBeenCalledWith('u1', 25, 'ORD-0001', expect.stringContaining('ORD-0001'));
  });

  it('rejects checkout BEFORE creating an order when the Central-Wallet-Service-backed balance is insufficient', async () => {
    const prisma = makePrisma();
    const wallet = {
      getBalance: jest.fn(async () => ({ userId: 'u1', balance: 5, currency: 'USD' })),
      deductFunds: jest.fn(),
    } as any;
    const service = new OrdersService(prisma as any, makeMail(), makeCoupons(), wallet, {} as any, {} as any);

    await expect(
      service.create({
        userId: 'u1',
        zone: 'inside_dhaka',
        items: [{ productId: 'p1', quantity: 1 }],
        paymentMethod: PaymentMethod.WALLET,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(wallet.deductFunds).not.toHaveBeenCalled();
  });

  it('rolls the order back to CANCELLED and surfaces the error when the Central Wallet Service debit fails after the order is created', async () => {
    const prisma = makePrisma();
    const wallet = {
      getBalance: jest.fn(async () => ({ userId: 'u1', balance: 100, currency: 'USD' })),
      deductFunds: jest.fn(async () => {
        throw new BadRequestException('The wallet balance is insufficient for this debit.');
      }),
    } as any;
    const service = new OrdersService(prisma as any, makeMail(), makeCoupons(), wallet, {} as any, {} as any);

    await expect(
      service.create({
        userId: 'u1',
        zone: 'inside_dhaka',
        items: [{ productId: 'p1', quantity: 1 }],
        paymentMethod: PaymentMethod.WALLET,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'order-1' }, data: expect.objectContaining({ status: 'CANCELLED' }) }),
    );
  });
});
