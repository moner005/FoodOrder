import { ConflictException, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const customerId = '8a6dfab9-a89d-4473-8cf4-6ebce3ea4b55';
const requestId = 'abcdfab9-a89d-4473-8cf4-6ebce3ea4b55';
const mealOneId = '10000000-0000-4000-8000-000000000001';
const mealTwoId = '20000000-0000-4000-8000-000000000002';
const restaurantOneId = '30000000-0000-4000-8000-000000000003';
const restaurantTwoId = '40000000-0000-4000-8000-000000000004';
const decimal = (amount: string) => ({ toFixed: () => amount });

describe('OrdersService marketplace checkout', () => {
  let service: OrdersService;
  let orderCreates: number;
  let mealRows: Array<Record<string, unknown>>;
  let batch: (Record<string, unknown> & { orders: Array<Record<string, unknown>> }) | null;
  let prisma: Record<string, unknown>;

  beforeEach(() => {
    orderCreates = 0;
    batch = null;
    mealRows = [
      {
        id: mealOneId,
        name: 'Margherita',
        price: decimal('10.00'),
        isAvailable: true,
        restaurantId: restaurantOneId,
        restaurant: {
          id: restaurantOneId,
          name: 'Salford & Co',
          status: 'ACTIVE',
          isOpen: true,
          deliveryFee: decimal('2.00'),
          minimumSubtotal: decimal('10.00'),
          deliveryAreas: ['Willow Quarter'],
        },
      },
      {
        id: mealTwoId,
        name: 'Rigatoni',
        price: decimal('15.00'),
        isAvailable: true,
        restaurantId: restaurantTwoId,
        restaurant: {
          id: restaurantTwoId,
          name: 'Olive & Ember',
          status: 'ACTIVE',
          isOpen: true,
          deliveryFee: decimal('3.00'),
          minimumSubtotal: decimal('15.00'),
          deliveryAreas: ['Willow Quarter'],
        },
      },
    ];
    const includeOrders = () =>
      batch ? { ...batch, orders: [...batch.orders] } : null;
    const tx = {
      checkoutBatch: {
        findUnique: async () => includeOrders(),
        create: async ({ data }: { data: Record<string, unknown> }) => {
          batch = {
            id: '50000000-0000-4000-8000-000000000005',
            createdAt: new Date('2026-11-27T12:00:00.000Z'),
            ...data,
            orders: [],
          };
          return batch;
        },
      },
      meal: {
        findMany: async ({ where }: { where: { id: { in: string[] } } }) =>
          mealRows.filter((meal) => where.id.in.includes(String(meal.id))),
      },
      order: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          orderCreates += 1;
          const restaurantId = String(data.restaurantId);
          const restaurantName = restaurantId === restaurantOneId ? 'Salford & Co' : 'Olive & Ember';
          const nestedItems = data.items as { create: Array<Record<string, unknown>> };
          const order = {
            id: `60000000-0000-4000-8000-${String(orderCreates).padStart(12, '0')}`,
            status: 'PENDING',
            createdAt: new Date('2026-11-27T12:00:00.000Z'),
            ...data,
            items: nestedItems.create,
            restaurant: { id: restaurantId, name: restaurantName },
          };
          batch?.orders.push(order);
          return order;
        },
      },
    };
    prisma = {
      checkoutBatch: { findUnique: async () => includeOrders() },
      $transaction: async (operation: (transaction: typeof tx) => Promise<unknown>) => operation(tx),
    };
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  it('creates one durable batch with exact grouped fees and replays without duplicate child orders', async () => {
    const input = {
      requestId,
      deliveryAddress: '18 Market Lane',
      deliveryArea: ' willow quarter ',
      expectedTotalMinor: 3000,
      items: [
        { mealId: mealOneId, quantity: 1, expectedUnitPriceMinor: 1000 },
        { mealId: mealTwoId, quantity: 1, expectedUnitPriceMinor: 1500 },
      ],
    };

    const first = await service.checkout(customerId, input);
    const second = await service.checkout(customerId, input);

    expect(first.checkoutId).toBe('50000000-0000-4000-8000-000000000005');
    expect(first.subtotal).toBe('25.00');
    expect(first.deliveryFee).toBe('5.00');
    expect(first.total).toBe('30.00');
    expect(first.ordersCreated).toBe(2);
    expect(first.orders[0].deliveryArea).toBe('Willow Quarter');
    expect(first.orders[0].checkoutBatchId).toBe(first.checkoutId);
    expect(first.orders[0].restaurantName).toBe('Salford & Co');
    expect(second.checkoutId).toBe(first.checkoutId);
    expect(second.replayed).toBe(true);
    expect(orderCreates).toBe(2);
  });

  it('rejects reuse of a customer request ID with changed payload', async () => {
    const input = {
      requestId,
      deliveryAddress: '18 Market Lane',
      deliveryArea: 'Willow Quarter',
      items: [{ mealId: mealOneId, quantity: 1 }],
    };
    await service.checkout(customerId, input);

    await expect(
      service.checkout(customerId, { ...input, items: [{ mealId: mealOneId, quantity: 2 }] }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(orderCreates).toBe(1);
  });

  it('rejects a stale per-meal unit quote before creating a batch', async () => {
    await expect(
      service.checkout(customerId, {
        requestId,
        deliveryAddress: '18 Market Lane',
        deliveryArea: 'Willow Quarter',
        items: [{ mealId: mealOneId, quantity: 1, expectedUnitPriceMinor: 999 }],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(batch).toBeNull();
    expect(orderCreates).toBe(0);
  });

  it('restricts grouped checkout to customer accounts', async () => {
    await expect(
      service.checkout(customerId, {
        deliveryAddress: '18 Market Lane',
        items: [{ mealId: mealOneId, quantity: 1 }],
      }, 'ADMIN'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(orderCreates).toBe(0);
  });
});
