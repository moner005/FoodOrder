import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRestaurantDto } from './dto/create-restaurant.dto.js';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto.js';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all active restaurants
  async findAll() {
    return this.prisma.restaurant.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get one restaurant
  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: true,
        meals: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  // Create restaurant and assign creator as owner
  async create(userId: string, dto: CreateRestaurantDto) {
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: { slug: dto.slug },
    });

    if (existingRestaurant) {
      throw new ConflictException('This restaurant slug is already taken');
    }

    return this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          ...dto,
          status: 'PENDING',
        },
      });

      await tx.restaurantMember.create({
        data: {
          userId,
          restaurantId: restaurant.id,
          role: 'RESTAURANT_OWNER',
        },
      });

      return restaurant;
    });
  }

  // Check whether user is admin or restaurant owner
  private async checkOwnerAccess(
    userId: string,
    restaurantId: string,
    userRole: string,
  ) {
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

    if (!membership || membership.role !== 'RESTAURANT_OWNER') {
      throw new ForbiddenException(
        'You are not allowed to manage this restaurant',
      );
    }
  }

  // Update restaurant
  async update(
    id: string,
    userId: string,
    userRole: string,
    dto: UpdateRestaurantDto,
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    await this.checkOwnerAccess(userId, id, userRole);

    if (dto.slug && dto.slug !== restaurant.slug) {
      const existingSlug = await this.prisma.restaurant.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new ConflictException('This restaurant slug is already taken');
      }
    }

    return this.prisma.restaurant.update({
      where: { id },
      data: dto,
    });
  }

  // Deactivate restaurant instead of permanently deleting it
  async remove(id: string, userId: string, userRole: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    await this.checkOwnerAccess(userId, id, userRole);

    return this.prisma.restaurant.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    });
  }
  // Get pending restaurants (Admin only)
  async findPending() {
    return this.prisma.restaurant.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Approve restaurant (Admin only)
  async approve(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.status !== 'PENDING') {
      throw new ConflictException('Only pending restaurants can be approved');
    }

    return this.prisma.restaurant.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    });
  }
  // Get restaurants owned by the logged-in user
  async findMyRestaurants(userId: string) {
    return this.prisma.restaurant.findMany({
      where: {
        members: {
          some: {
            userId,
            role: 'RESTAURANT_OWNER',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
