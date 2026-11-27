import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMealDto } from './dto/create-meal.dto.js';
import { UpdateMealDto } from './dto/update-meal.dto.js';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  // التحقق من صلاحية المستخدم للوصول إلى المطعم
  private async checkRestaurantAccess(
    userId: string,
    userRole: string,
    restaurantId: string,
  ) {
    // المدير لديه صلاحية على جميع المطاعم
    if (userRole === 'ADMIN') {
      return;
    }

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
      throw new ForbiddenException(
        'You do not have permission to manage meals in this restaurant',
      );
    }
  }
  async findAll() {
    return this.prisma.meal.findMany({
      where: {
        isAvailable: true,
        restaurant: {
          status: 'ACTIVE',
        },
      },
      include: {
        category: true,
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // عرض جميع وجبات مطعم محدد
  async findByRestaurant(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.meal.findMany({
      where: { restaurantId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // عرض وجبة واحدة
  async findOne(id: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
      include: {
        category: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    return meal;
  }

  // إنشاء وجبة
  async create(dto: CreateMealDto, userId: string, userRole: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.status !== 'ACTIVE' && userRole !== 'ADMIN') {
      throw new BadRequestException(
        'Cannot add meals to an inactive restaurant',
      );
    }

    await this.checkRestaurantAccess(userId, userRole, dto.restaurantId);

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.restaurantId !== dto.restaurantId) {
      throw new BadRequestException(
        'The category does not belong to this restaurant',
      );
    }

    return this.prisma.meal.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        image: dto.image,
        isAvailable: dto.isAvailable ?? true,
        restaurantId: dto.restaurantId,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  // تعديل وجبة
  async update(
    id: string,
    dto: UpdateMealDto,
    userId: string,
    userRole: string,
  ) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    await this.checkRestaurantAccess(userId, userRole, meal.restaurantId);
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.restaurantId !== meal.restaurantId) {
        throw new BadRequestException(
          'The category does not belong to this restaurant',
        );
      }
    }

    return this.prisma.meal.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        category: true,
      },
    });
  }

  // حذف وجبة
  async remove(id: string, userId: string, userRole: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    await this.checkRestaurantAccess(userId, userRole, meal.restaurantId);

    const existingOrderItems = await this.prisma.orderItem.count({
      where: { mealId: id },
    });

    if (existingOrderItems > 0) {
      throw new ConflictException(
        'This meal has previous orders. Set isAvailable to false instead of deleting it.',
      );
    }

    return this.prisma.meal.delete({
      where: { id },
    });
  }
}
