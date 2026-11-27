import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { CreateRestaurantDto } from './dto/create-restaurant.dto.js';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto.js';

function normalizeDeliveryAreas(areas: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const raw of areas) {
    if (typeof raw !== 'string') {
      throw new BadRequestException('Delivery areas must be text values');
    }
    const area = raw.trim().replace(/\s+/g, ' ');
    const key = area.toLocaleLowerCase();
    if (!area || area.length > 120 || seen.has(key)) {
      throw new BadRequestException('Delivery areas must be non-empty and unique, ignoring case');
    }
    seen.add(key);
    result.push(area);
  }
  if (result.length > 50) {
    throw new BadRequestException('A restaurant can configure up to 50 delivery areas');
  }
  return result;
}

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

    if (!restaurant || restaurant.status !== 'ACTIVE') {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async findAllForAdmin(adminId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true, isSuspended: true } });
    if (!admin || admin.role !== 'ADMIN' || admin.isSuspended) throw new ForbiddenException('Administrator access required');
    return this.prisma.restaurant.findMany({ orderBy: [{ status: 'asc' }, { name: 'asc' }] });
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

    const includesOperationalSettings =
      dto.cuisine !== undefined ||
      dto.isOpen !== undefined ||
      dto.deliveryFee !== undefined ||
      dto.minimumSubtotal !== undefined ||
      dto.deliveryAreas !== undefined;
    if (includesOperationalSettings && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only an administrator can change restaurant operational settings',
      );
    }

    if (dto.slug && dto.slug !== restaurant.slug) {
      const existingSlug = await this.prisma.restaurant.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new ConflictException('This restaurant slug is already taken');
      }
    }

    const data: Prisma.RestaurantUpdateManyMutationInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.cuisine !== undefined) {
      data.cuisine = dto.cuisine.trim().replace(/\s+/g, ' ');
    }
    if (dto.isOpen !== undefined) data.isOpen = dto.isOpen;
    if (dto.deliveryFee !== undefined) {
      if (Number(dto.deliveryFee.toFixed(2)) !== dto.deliveryFee) {
        throw new BadRequestException('Delivery fee must have no more than two decimal places');
      }
      data.deliveryFee = dto.deliveryFee;
    }
    if (dto.minimumSubtotal !== undefined) {
      if (Number(dto.minimumSubtotal.toFixed(2)) !== dto.minimumSubtotal) {
        throw new BadRequestException('Minimum subtotal must have no more than two decimal places');
      }
      data.minimumSubtotal = dto.minimumSubtotal;
    }
    if (dto.deliveryAreas !== undefined) {
      data.deliveryAreas = normalizeDeliveryAreas(dto.deliveryAreas);
    }

    if (dto.expectedUpdatedAt !== undefined) {
      const expectedUpdatedAt = new Date(dto.expectedUpdatedAt);
      if (Number.isNaN(expectedUpdatedAt.getTime())) throw new BadRequestException('A valid restaurant revision is required');
      data.updatedAt = new Date(Math.max(Date.now(), expectedUpdatedAt.getTime() + 1));
      const changed = await this.prisma.restaurant.updateMany({ where: { id, updatedAt: expectedUpdatedAt }, data });
      if (changed.count !== 1) throw new ConflictException('Restaurant settings changed. Reload the latest settings before saving.');
      return this.prisma.restaurant.findUniqueOrThrow({ where: { id } });
    }
    return this.prisma.restaurant.update({ where: { id }, data });
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
