import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // Register
  // =========================
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        password: hashedPassword,
        phone: dto.phone?.trim() || null,
        address: dto.address?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'User registered successfully',
      accessToken,
      user,
    };
  }

  // =========================
  // Login
  // =========================
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordIsValid = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    };
  }

  // =========================
  // Update Profile
  // =========================
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const data: {
      name?: string;
      email?: string;
      phone?: string | null;
      address?: string | null;
    } = {};

    // Update name
    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (!name) {
        throw new BadRequestException('Name cannot be empty');
      }

      data.name = name;
    }

    // Update email
    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();

      if (email !== currentUser.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (existingUser && existingUser.id !== userId) {
          throw new ConflictException('Email is already in use');
        }
      }

      data.email = email;
    }

    // Update phone
    if (dto.phone !== undefined) {
      data.phone = dto.phone.trim() || null;
    }

    // Update address
    if (dto.address !== undefined) {
      data.address = dto.address.trim() || null;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
}