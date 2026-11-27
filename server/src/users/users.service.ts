import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Prisma, UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAdminAccountDto } from './dto/create-admin-account.dto.js';
import { UpdateAdminAccountDto } from './dto/update-admin-account.dto.js';

const MANAGED_ROLES: UserRole[] = ['CUSTOMER', 'RESTAURANT_OWNER'];
const isUniqueError = (error: unknown) => typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
const isTransactionConflict = (error: unknown) => typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertAdmin(db: Prisma.TransactionClient | PrismaService, adminId: string) {
    const admin = await db.user.findUnique({ where: { id: adminId }, select: { role: true, isSuspended: true } });
    if (!admin || admin.role !== 'ADMIN' || admin.isSuspended) throw new ForbiddenException('Administrator access required');
  }

  async listAccounts(adminId: string) {
    await this.assertAdmin(this.prisma, adminId);
    return this.prisma.user.findMany({
      where: { role: { in: MANAGED_ROLES } },
      select: {
        id: true, name: true, email: true, role: true, isSuspended: true, createdAt: true, updatedAt: true,
        memberships: { where: { role: 'RESTAURANT_OWNER' }, select: { restaurant: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  async createAccount(adminId: string, dto: CreateAdminAccountDto) {
    await this.assertAdmin(this.prisma, adminId);
    if (dto.role === 'CUSTOMER' && (dto.restaurantIds?.length ?? 0) > 0) throw new BadRequestException('Customer accounts cannot have owner restaurant assignments');
    const email = dto.email.trim().toLocaleLowerCase();
    const name = dto.name.trim().replace(/\s+/g, ' ');
    if (name.length < 2) throw new BadRequestException('Account name must contain at least two non-space characters');
    if (Buffer.byteLength(dto.initialPassword, 'utf8') > 72) throw new BadRequestException('Initial password must be 72 UTF-8 bytes or fewer');
    const password = await bcrypt.hash(dto.initialPassword, 10);
    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.assertAdmin(tx, adminId);
        const restaurantIds = dto.restaurantIds ?? [];
        await this.validateRestaurants(tx, restaurantIds);
        const user = await tx.user.create({ data: { name, email, password, role: dto.role }, select: { id: true, name: true, email: true, role: true, isSuspended: true, createdAt: true, updatedAt: true } });
        if (dto.role === 'RESTAURANT_OWNER') {
          for (const restaurantId of restaurantIds) await tx.restaurantMember.create({ data: { userId: user.id, restaurantId, role: 'RESTAURANT_OWNER' } });
        }
        return this.getAccount(tx, user.id);
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (isUniqueError(error)) throw new ConflictException('An account with this email already exists');
      if (isTransactionConflict(error)) throw new ConflictException('Account data changed; reload and try again');
      throw error;
    }
  }

  async updateAccount(adminId: string, targetId: string, dto: UpdateAdminAccountDto) {
    const expectedUpdatedAt = new Date(dto.expectedUpdatedAt);
    if (Number.isNaN(expectedUpdatedAt.getTime())) throw new BadRequestException('A valid account revision is required');
    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.assertAdmin(tx, adminId);
        const current = await tx.user.findUnique({ where: { id: targetId }, select: { id: true, role: true, updatedAt: true } });
        if (!current) throw new NotFoundException('Account not found');
        if (!MANAGED_ROLES.includes(current.role)) throw new ForbiddenException('Administrator accounts cannot be changed here');
        if (dto.name !== undefined && dto.name.trim().replace(/\s+/g, ' ').length < 2) throw new BadRequestException('Account name must contain at least two non-space characters');
        if (dto.restaurantIds !== undefined && current.role !== 'RESTAURANT_OWNER' && dto.restaurantIds.length > 0) throw new BadRequestException('Customer accounts cannot have owner restaurant assignments');
        if (dto.restaurantIds !== undefined) await this.validateRestaurants(tx, dto.restaurantIds);
        const revision = new Date(Math.max(Date.now(), current.updatedAt.getTime() + 1));
        const changed = await tx.user.updateMany({
          where: { id: targetId, role: { in: MANAGED_ROLES }, updatedAt: expectedUpdatedAt },
          data: { ...(dto.name === undefined ? {} : { name: dto.name.trim().replace(/\s+/g, ' ') }), ...(dto.isSuspended === undefined ? {} : { isSuspended: dto.isSuspended }), updatedAt: revision },
        });
        if (changed.count !== 1) throw new ConflictException('This account changed. Reload its latest details before saving.');
        if (dto.restaurantIds !== undefined && current.role === 'RESTAURANT_OWNER') await this.setOwnerAssignments(tx, targetId, dto.restaurantIds);
        return this.getAccount(tx, targetId);
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (isTransactionConflict(error)) throw new ConflictException('Account data changed; reload and try again');
      throw error;
    }
  }

  private async validateRestaurants(tx: Prisma.TransactionClient, restaurantIds: string[]) {
    const unique = [...new Set(restaurantIds)];
    if (unique.length !== restaurantIds.length) throw new BadRequestException('Restaurant assignments must be unique');
    if (unique.length === 0) return;
    const found = await tx.restaurant.count({ where: { id: { in: unique } } });
    if (found !== unique.length) throw new BadRequestException('Select existing restaurants for owner assignments');
  }

  private async setOwnerAssignments(tx: Prisma.TransactionClient, userId: string, restaurantIds: string[]) {
    const selected = new Set(restaurantIds);
    const memberships = await tx.restaurantMember.findMany({ where: { userId }, select: { restaurantId: true, role: true } });
    const staffConflict = memberships.find((membership) => selected.has(membership.restaurantId) && membership.role !== 'RESTAURANT_OWNER');
    if (staffConflict) throw new ConflictException('An existing staff membership cannot be replaced by an owner assignment');
    await tx.restaurantMember.deleteMany({ where: { userId, role: 'RESTAURANT_OWNER', ...(restaurantIds.length ? { restaurantId: { notIn: restaurantIds } } : {}) } });
    const currentOwners = new Set(memberships.filter((membership) => membership.role === 'RESTAURANT_OWNER').map((membership) => membership.restaurantId));
    for (const restaurantId of restaurantIds) if (!currentOwners.has(restaurantId)) await tx.restaurantMember.create({ data: { userId, restaurantId, role: 'RESTAURANT_OWNER' } });
  }

  private getAccount(tx: Prisma.TransactionClient, id: string) {
    return tx.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isSuspended: true, createdAt: true, updatedAt: true, memberships: { where: { role: 'RESTAURANT_OWNER' }, select: { restaurant: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } } },
    });
  }
}
