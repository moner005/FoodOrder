import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkRestaurantAccess(
    userId: string,
    restaurantId: string,
    userRole: string,
  ) {
    if (userRole === 'ADMIN') return;

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
        'You cannot manage categories for this restaurant',
      );
    }
  }

  async findByRestaurant(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.category.findMany({
      where: { restaurantId },
      include: {
        _count: {
          select: { meals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    userId: string,
    userRole: string,
    dto: CreateCategoryDto,
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.status !== 'ACTIVE' && userRole !== 'ADMIN') {
      throw new BadRequestException('Restaurant is not active yet');
    }

    await this.checkRestaurantAccess(
      userId,
      dto.restaurantId,
      userRole,
    );

    const existing = await this.prisma.category.findUnique({
      where: {
        restaurantId_name: {
          restaurantId: dto.restaurantId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'This category already exists in this restaurant',
      );
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        description: dto.description,
        image: dto.image,
        restaurantId: dto.restaurantId,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    dto: UpdateCategoryDto,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.checkRestaurantAccess(
      userId,
      category.restaurantId,
      userRole,
    );

    if (dto.name) {
      const duplicate = await this.prisma.category.findUnique({
        where: {
          restaurantId_name: {
            restaurantId: category.restaurantId,
            name: dto.name,
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Category name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(
    id: string,
    userId: string,
    userRole: string,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.checkRestaurantAccess(
      userId,
      category.restaurantId,
      userRole,
    );

    if (
      await this.prisma.meal.count({
        where: { categoryId: id },
      })
    ) {
      throw new BadRequestException(
        'Cannot delete a category that contains meals',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}