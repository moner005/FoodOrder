import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('RestaurantsService operational settings', () => {
  let service: RestaurantsService;
  let findUnique: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let memberFindUnique: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findUnique = vi.fn().mockResolvedValue({ id: 'restaurant-1', slug: 'kitchen' });
    update = vi.fn().mockResolvedValue({ id: 'restaurant-1' });
    memberFindUnique = vi.fn().mockResolvedValue({ role: 'RESTAURANT_OWNER' });
    const prisma = {
      restaurant: { findUnique, update },
      restaurantMember: { findUnique: memberFindUnique },
    };
    service = new RestaurantsService(prisma as unknown as PrismaService);
  });

  it('allows admins to save normalized operational fields', async () => {
    await service.update('restaurant-1', 'admin-1', 'ADMIN', {
      cuisine: '  Wood   fired  ',
      isOpen: false,
      deliveryFee: 2.5,
      minimumSubtotal: 12,
      deliveryAreas: [' Willow   Quarter ', 'Old Market'],
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'restaurant-1' },
      data: {
        cuisine: 'Wood fired',
        isOpen: false,
        deliveryFee: 2.5,
        minimumSubtotal: 12,
        deliveryAreas: ['Willow Quarter', 'Old Market'],
      },
    });
  });

  it('keeps operational settings admin-only while preserving owner access checks', async () => {
    await expect(
      service.update('restaurant-1', 'owner-1', 'RESTAURANT_OWNER', {
        deliveryFee: 1,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(memberFindUnique).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects delivery areas that collide after trim, whitespace folding, and case folding', async () => {
    await expect(
      service.update('restaurant-1', 'admin-1', 'ADMIN', {
        deliveryAreas: ['Willow Quarter', ' willow   quarter '],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });
});
