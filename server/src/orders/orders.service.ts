import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { MultiRestaurantCheckoutDto } from './dto/multi-restaurant-checkout.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new order
  async create(userId: string, dto: CreateOrderDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });

    if (!restaurant || restaurant.status !== 'ACTIVE') {
      throw new NotFoundException('Active restaurant not found');
    }

    const mealIds = [...new Set(dto.items.map((item) => item.mealId))];

    const meals = await this.prisma.meal.findMany({
      where: {
        id: { in: mealIds },
        restaurantId: dto.restaurantId,
        isAvailable: true,
      },
    });

    if (meals.length !== mealIds.length) {
      throw new BadRequestException(
        'One or more meals are unavailable or do not belong to this restaurant',
      );
    }

    const mealMap = new Map(meals.map((meal) => [meal.id, meal]));

    let subtotal = 0;

    const orderItems = dto.items.map((item) => {
      const meal = mealMap.get(item.mealId)!;
      const unitPrice = Number(meal.price);
      const itemSubtotal = unitPrice * item.quantity;

      subtotal += itemSubtotal;

      return {
        mealId: meal.id,
        mealName: meal.name,
        unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      };
    });

    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    return this.prisma.order.create({
      data: {
        userId,
        restaurantId: dto.restaurantId,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes,
        subtotal,
        deliveryFee,
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
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

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
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

    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async checkout(userId: string, dto: MultiRestaurantCheckoutDto) {
    const quantities = new Map<string, number>();

    for (const item of dto.items) {
      quantities.set(
        item.mealId,
        (quantities.get(item.mealId) ?? 0) + item.quantity,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const mealIds = [...quantities.keys()];

      const meals = await tx.meal.findMany({
        where: {
          id: { in: mealIds },
          isAvailable: true,
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      if (meals.length !== mealIds.length) {
        throw new BadRequestException(
          'One or more meals do not exist or are unavailable',
        );
      }

      const groups = new Map<string, typeof meals>();

      for (const meal of meals) {
        if (meal.restaurant.status !== 'ACTIVE') {
          throw new BadRequestException(
            `Restaurant ${meal.restaurant.name} is not active`,
          );
        }

        const group = groups.get(meal.restaurantId) ?? [];
        group.push(meal);
        groups.set(meal.restaurantId, group);
      }

      const createdOrders = [];

      for (const [restaurantId, restaurantMeals] of groups) {
        let subtotalCents = 0;

        const orderItems = restaurantMeals.map((meal) => {
          const quantity = quantities.get(meal.id)!;
          const unitPrice = Number(meal.price);
          const itemSubtotalCents = Math.round(unitPrice * 100) * quantity;

          subtotalCents += itemSubtotalCents;

          return {
            mealId: meal.id,
            mealName: meal.name,
            unitPrice,
            quantity,
            subtotal: itemSubtotalCents / 100,
          };
        });

        const subtotal = subtotalCents / 100;

        const order = await tx.order.create({
          data: {
            userId,
            restaurantId,
            deliveryAddress: dto.deliveryAddress,
            notes: dto.notes,
            subtotal,
            deliveryFee: 0,
            total: subtotal,
            items: {
              create: orderItems,
            },
          },
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
              },
            },
            items: true,
          },
        });

        createdOrders.push(order);
      }

      return {
        message: 'Checkout completed successfully',
        ordersCreated: createdOrders.length,
        orders: createdOrders,
      };
    });
  }
}
