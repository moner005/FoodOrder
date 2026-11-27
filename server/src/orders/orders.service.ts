import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { MultiRestaurantCheckoutDto } from './dto/multi-restaurant-checkout.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

const MAX_DECIMAL_CENTS = 9_999_999_999n;
const MAX_ORDER_QUANTITY = 2_147_483_647;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function decimalToCents(value: { toFixed(decimalPlaces: number): string }): bigint {
  const fixed = value.toFixed(2);
  if (fixed.startsWith('-')) {
    throw new BadRequestException('Prices and delivery charges cannot be negative');
  }
  const [whole, fraction = '00'] = fixed.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0').slice(0, 2));
}

function centsToDecimal(cents: bigint): string {
  if (cents < 0n || cents > MAX_DECIMAL_CENTS) {
    throw new BadRequestException('The checkout total is outside the supported amount range');
  }
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, '0')}`;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeArea(value: string): string {
  return normalizeText(value).toLocaleLowerCase();
}

function checkoutFingerprint(
  deliveryAddress: string,
  notes: string | undefined,
  deliveryArea: string | undefined,
  expectedTotalMinor: number | undefined,
  items: Array<{ mealId: string; quantity: number; expectedUnitPriceMinor?: number }>,
): string {
  const canonical = {
    deliveryAddress: normalizeText(deliveryAddress),
    notes: normalizeText(notes ?? ''),
    deliveryArea: normalizeArea(deliveryArea ?? ''),
    expectedTotalMinor: expectedTotalMinor ?? null,
    items: [...items]
      .map(({ mealId, quantity, expectedUnitPriceMinor }) => ({ mealId: mealId.toLowerCase(), quantity, expectedUnitPriceMinor: expectedUnitPriceMinor ?? null }))
      .sort((left, right) => left.mealId.localeCompare(right.mealId)),
  };
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertAdmin(adminId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true, isSuspended: true } });
    if (!admin || admin.role !== 'ADMIN' || admin.isSuspended) throw new ForbiddenException('Administrator access required');
  }

  async findAllForAdmin(adminId: string) {
    await this.assertAdmin(adminId);
    return this.prisma.order.findMany({
      include: { restaurant: { select: { id: true, name: true } }, items: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatusForAdmin(id: string, status: string, adminId: string) {
    await this.assertAdmin(adminId);
    return this.updateStatus(id, status, adminId, 'ADMIN');
  }

  // Create a new order
  async create(userId: string, dto: CreateOrderDto) {
    const result = await this.checkout(userId, {
      deliveryAddress: dto.deliveryAddress,
      notes: dto.notes,
      deliveryArea: dto.deliveryArea,
      items: dto.items,
    }, 'CUSTOMER', dto.restaurantId);
    return result.orders[0];
  }

  // Get logged-in user's orders
  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get one order
  async findOne(id: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You cannot access this order');
    }

    return order;
  }

  // Cancel a pending order
  async cancel(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You cannot cancel this order');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const updated = await this.prisma.order.updateMany({
      where: { id, userId, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });
    if (updated.count !== 1) {
      throw new ConflictException(
        'This order changed before cancellation; reload its current status',
      );
    }
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  // Get all orders for a restaurant (Owner / Staff / Admin)
  async findByRestaurant(
    restaurantId: string,
    userId: string,
    userRole: string,
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (userRole !== 'ADMIN') {
      const membership = await this.prisma.restaurantMember.findUnique({
        where: {
          userId_restaurantId: {
            userId,
            restaurantId,
          },
        },
      });

      if (
        !membership ||
        !['RESTAURANT_OWNER', 'RESTAURANT_STAFF'].includes(membership.role)
      ) {
        throw new ForbiddenException('You cannot view this restaurant orders');
      }
    }

    return this.prisma.order.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Update order status (Owner / Staff / Admin)
  async updateStatus(
    id: string,
    status: string,
    userId: string,
    userRole: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userRole !== 'ADMIN') {
      const membership = await this.prisma.restaurantMember.findUnique({
        where: {
          userId_restaurantId: {
            userId,
            restaurantId: order.restaurantId,
          },
        },
      });

      if (
        !membership ||
        !['RESTAURANT_OWNER', 'RESTAURANT_STAFF'].includes(membership.role)
      ) {
        throw new ForbiddenException('You cannot update this order');
      }
    }

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED'],
      CONFIRMED: ['PREPARING'],
      PREPARING: ['READY'],
      READY: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Cannot change order status from ${order.status} to ${status}`,
      );
    }

    const updated = await this.prisma.order.updateMany({
      where: { id, status: order.status },
      data: { status: status as any },
    });
    if (updated.count !== 1) {
      throw new ConflictException('This order status changed; reload before advancing it');
    }
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        restaurant: { select: { id: true, name: true } },
      },
    });
  }

  async checkout(
    userId: string,
    dto: MultiRestaurantCheckoutDto,
    userRole = 'CUSTOMER',
    requiredRestaurantId?: string,
  ) {
    if (userRole !== 'CUSTOMER') {
      throw new ForbiddenException('Only customer accounts can submit checkout');
    }
    if (dto?.expectedCustomerId !== undefined && dto.expectedCustomerId !== userId) {
      throw new ForbiddenException('Sign in to the customer account that prepared this checkout');
    }
    if (!dto || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('Add at least one meal to checkout');
    }
    if (typeof dto.deliveryAddress !== 'string') {
      throw new BadRequestException('Enter a valid delivery address');
    }
    const deliveryAddress = normalizeText(dto.deliveryAddress ?? '');
    if (!deliveryAddress || deliveryAddress.length > 300) {
      throw new BadRequestException('Enter a valid delivery address');
    }
    if (dto.notes !== undefined && typeof dto.notes !== 'string') {
      throw new BadRequestException('Checkout notes must be text');
    }
    if (dto.deliveryArea !== undefined && typeof dto.deliveryArea !== 'string') {
      throw new BadRequestException('Enter a valid delivery area');
    }
    if (dto.requestId !== undefined && typeof dto.requestId !== 'string') {
      throw new BadRequestException('The checkout request ID must be a UUID');
    }
    const notes = dto.notes === undefined ? undefined : normalizeText(dto.notes);
    const requestedArea = dto.deliveryArea === undefined ? undefined : normalizeText(dto.deliveryArea);
    if (dto.deliveryArea !== undefined && (!requestedArea || requestedArea.length > 120)) {
      throw new BadRequestException('Enter a valid delivery area');
    }
    if (
      dto.expectedTotalMinor !== undefined &&
      (!Number.isSafeInteger(dto.expectedTotalMinor) || dto.expectedTotalMinor < 0)
    ) {
      throw new BadRequestException('The quoted total is invalid');
    }
    const requestId = dto.requestId?.trim().toLowerCase() ?? randomUUID();
    if (!UUID_PATTERN.test(requestId)) {
      throw new BadRequestException('The checkout request ID must be a UUID');
    }

    const quantities = new Map<
      string,
      { quantity: number; expectedUnitPriceMinor?: number }
    >();
    for (const item of dto.items) {
      if (
        !item ||
        typeof item.mealId !== 'string' ||
        !UUID_PATTERN.test(item.mealId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_ORDER_QUANTITY ||
        (item.expectedUnitPriceMinor !== undefined &&
          (!Number.isSafeInteger(item.expectedUnitPriceMinor) ||
            item.expectedUnitPriceMinor < 1))
      ) {
        throw new BadRequestException('A checkout meal or quantity is invalid');
      }
      const mealId = item.mealId.toLowerCase();
      const current = quantities.get(mealId);
      if (
        current?.expectedUnitPriceMinor !== undefined &&
        item.expectedUnitPriceMinor !== undefined &&
        current.expectedUnitPriceMinor !== item.expectedUnitPriceMinor
      ) {
        throw new BadRequestException(
          'The same meal has conflicting quoted unit prices',
        );
      }
      const quantity = (current?.quantity ?? 0) + item.quantity;
      if (!Number.isSafeInteger(quantity) || quantity > MAX_ORDER_QUANTITY) {
        throw new BadRequestException('A meal quantity exceeds the supported range');
      }
      quantities.set(mealId, {
        quantity,
        expectedUnitPriceMinor:
          item.expectedUnitPriceMinor ?? current?.expectedUnitPriceMinor,
      });
    }

    const canonicalItems = [...quantities.entries()]
      .map(([mealId, item]) => ({ mealId, ...item }))
      .sort((left, right) => left.mealId.localeCompare(right.mealId));
    const payloadFingerprint = checkoutFingerprint(
      deliveryAddress,
      notes,
      requestedArea,
      dto.expectedTotalMinor,
      canonicalItems,
    );
    const where = { userId_requestId: { userId, requestId } };
    const include = {
      orders: {
        include: {
          restaurant: { select: { id: true, name: true } },
          items: true,
        },
        orderBy: { createdAt: 'asc' as const },
      },
    };
    const readExisting = () =>
      this.prisma.checkoutBatch.findUnique({ where, include });
    const replay = (batch: NonNullable<Awaited<ReturnType<typeof readExisting>>>) => {
      if (batch.payloadFingerprint !== payloadFingerprint) {
        throw new ConflictException(
          'This checkout request ID was already used with different details',
        );
      }
      return {
        message: 'Checkout completed successfully',
        checkoutId: batch.id,
        requestId: batch.requestId,
        deliveryArea: batch.deliveryArea,
        subtotal: batch.subtotal,
        deliveryFee: batch.deliveryFee,
        total: batch.total,
        ordersCreated: batch.orders.length,
        orders: batch.orders,
        replayed: true,
      };
    };

    const existing = await readExisting();
    if (existing) return replay(existing);

    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          const retry = await tx.checkoutBatch.findUnique({ where, include });
          if (retry) {
            if (retry.payloadFingerprint !== payloadFingerprint) {
              throw new ConflictException(
                'This checkout request ID was already used with different details',
              );
            }
            return { batch: retry, orders: retry.orders, replayed: true };
          }

          const mealIds = canonicalItems.map(({ mealId }) => mealId);
          const meals = await tx.meal.findMany({
            where: {
              id: { in: mealIds },
              isAvailable: true,
              ...(requiredRestaurantId ? { restaurantId: requiredRestaurantId } : {}),
            },
            include: {
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  isOpen: true,
                  deliveryFee: true,
                  minimumSubtotal: true,
                  deliveryAreas: true,
                },
              },
            },
          });
          if (meals.length !== mealIds.length) {
            throw new BadRequestException(
              'One or more meals do not exist or are unavailable',
            );
          }

          type CheckoutMeal = (typeof meals)[number];
          const groups = new Map<
            string,
            { restaurant: CheckoutMeal['restaurant']; meals: CheckoutMeal[] }
          >();
          for (const meal of meals) {
            if (meal.restaurant.status !== 'ACTIVE' || !meal.restaurant.isOpen) {
              throw new BadRequestException(
                `Restaurant ${meal.restaurant.name} is not currently accepting orders`,
              );
            }
            const group = groups.get(meal.restaurantId) ?? {
              restaurant: meal.restaurant,
              meals: [],
            };
            group.meals.push(meal);
            groups.set(meal.restaurantId, group);
          }

          const grouped = [...groups.entries()].map(([restaurantId, group]) => {
            let subtotalCents = 0n;
            const items = group.meals.map((meal) => {
              const requestItem = quantities.get(meal.id)!;
              const unitPriceCents = decimalToCents(meal.price);
              if (
                requestItem.expectedUnitPriceMinor !== undefined &&
                unitPriceCents !== BigInt(requestItem.expectedUnitPriceMinor)
              ) {
                throw new ConflictException(
                  `The price for ${meal.name} changed; refresh your cart`,
                );
              }
              const lineTotalCents =
                unitPriceCents * BigInt(requestItem.quantity);
              subtotalCents += lineTotalCents;
              return {
                meal,
                quantity: requestItem.quantity,
                unitPriceCents,
                lineTotalCents,
              };
            });
            const feeCents = decimalToCents(group.restaurant.deliveryFee);
            const minimumCents = decimalToCents(
              group.restaurant.minimumSubtotal,
            );
            if (subtotalCents < minimumCents) {
              throw new BadRequestException(
                `${group.restaurant.name} requires a food subtotal of at least ${centsToDecimal(minimumCents)}`,
              );
            }
            if (subtotalCents + feeCents > MAX_DECIMAL_CENTS) {
              throw new BadRequestException('A restaurant total exceeds the supported amount range');
            }
            return {
              restaurantId,
              restaurant: group.restaurant,
              items,
              subtotalCents,
              feeCents,
              totalCents: subtotalCents + feeCents,
            };
          });

          const configuredGroups = grouped.filter(
            (group) => group.restaurant.deliveryAreas.length > 0,
          );
          let acceptedArea: string | null = requestedArea ?? null;
          if (configuredGroups.length > 0) {
            if (!requestedArea) {
              throw new BadRequestException(
                'Choose a delivery area served by every selected restaurant',
              );
            }
            const firstAreas = configuredGroups[0].restaurant.deliveryAreas;
            const canonicalArea = firstAreas.find((area) =>
              normalizeArea(area) === normalizeArea(requestedArea) &&
              configuredGroups.every((group) =>
                group.restaurant.deliveryAreas.some(
                  (candidate) => normalizeArea(candidate) === normalizeArea(area),
                ),
              ),
            );
            if (!canonicalArea) {
              throw new BadRequestException(
                'Choose a delivery area served by every selected restaurant',
              );
            }
            acceptedArea = normalizeText(canonicalArea);
          }

          const subtotalCents = grouped.reduce(
            (sum, group) => sum + group.subtotalCents,
            0n,
          );
          const deliveryFeeCents = grouped.reduce(
            (sum, group) => sum + group.feeCents,
            0n,
          );
          const totalCents = subtotalCents + deliveryFeeCents;
          if (totalCents > MAX_DECIMAL_CENTS) {
            throw new BadRequestException('The checkout total exceeds the supported amount range');
          }
          if (
            dto.expectedTotalMinor !== undefined &&
            totalCents !== BigInt(dto.expectedTotalMinor)
          ) {
            throw new ConflictException(
              'The checkout total changed; refresh your cart before placing the order',
            );
          }

          const batch = await tx.checkoutBatch.create({
            data: {
              userId,
              requestId,
              payloadFingerprint,
              deliveryArea: acceptedArea,
              subtotal: centsToDecimal(subtotalCents),
              deliveryFee: centsToDecimal(deliveryFeeCents),
              total: centsToDecimal(totalCents),
            },
          });
          const orders = [];
          for (const group of grouped) {
            const order = await tx.order.create({
              data: {
                userId,
                restaurantId: group.restaurantId,
                restaurantName: group.restaurant.name,
                deliveryArea: acceptedArea,
                checkoutBatchId: batch.id,
                deliveryAddress,
                notes,
                subtotal: centsToDecimal(group.subtotalCents),
                deliveryFee: centsToDecimal(group.feeCents),
                total: centsToDecimal(group.totalCents),
                items: {
                  create: group.items.map((item) => ({
                    mealId: item.meal.id,
                    mealName: item.meal.name,
                    unitPrice: centsToDecimal(item.unitPriceCents),
                    quantity: item.quantity,
                    subtotal: centsToDecimal(item.lineTotalCents),
                  })),
                },
              },
              include: {
                restaurant: { select: { id: true, name: true } },
                items: true,
              },
            });
            orders.push(order);
          }
          return { batch, orders, replayed: false };
        },
        { isolationLevel: 'Serializable' },
      );
      return {
        message: 'Checkout completed successfully',
        checkoutId: result.batch.id,
        requestId: result.batch.requestId,
        deliveryArea: result.batch.deliveryArea,
        subtotal: result.batch.subtotal,
        deliveryFee: result.batch.deliveryFee,
        total: result.batch.total,
        ordersCreated: result.orders.length,
        orders: result.orders,
        replayed: result.replayed,
      };
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2002') || isPrismaErrorCode(error, 'P2034')) {
        const concurrent = await readExisting();
        if (concurrent) return replay(concurrent);
        if (isPrismaErrorCode(error, 'P2034')) {
          throw new ConflictException(
            'The checkout conflicted with another database update; retry the same request ID',
          );
        }
      }
      throw error;
    }
  }

  async findCheckout(checkoutId: string, userId: string, userRole: string) {
    if (!UUID_PATTERN.test(checkoutId)) {
      throw new NotFoundException('Checkout not found');
    }
    const batch = await this.prisma.checkoutBatch.findUnique({
      where: { id: checkoutId.toLowerCase() },
      include: {
        orders: {
          include: {
            restaurant: { select: { id: true, name: true } },
            items: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!batch) throw new NotFoundException('Checkout not found');
    if (
      userRole !== 'ADMIN' &&
      (userRole !== 'CUSTOMER' || batch.userId !== userId)
    ) {
      throw new ForbiddenException('You cannot access this checkout');
    }
    return {
      checkoutId: batch.id,
      requestId: batch.requestId,
      deliveryArea: batch.deliveryArea,
      subtotal: batch.subtotal,
      deliveryFee: batch.deliveryFee,
      total: batch.total,
      createdAt: batch.createdAt,
      orders: batch.orders,
    };
  }
}
