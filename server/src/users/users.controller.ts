import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CreateAdminAccountDto } from './dto/create-admin-account.dto.js';
import { UpdateAdminAccountDto } from './dto/update-admin-account.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Administration')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Req() request: Request & { user: { id: string } }) {
    return this.usersService.listAccounts(request.user.id);
  }

  @Post()
  create(@Req() request: Request & { user: { id: string } }, @Body() dto: CreateAdminAccountDto) {
    return this.usersService.createAccount(request.user.id, dto);
  }

  @Patch(':id')
  update(@Req() request: Request & { user: { id: string } }, @Param('id') id: string, @Body() dto: UpdateAdminAccountDto) {
    return this.usersService.updateAccount(request.user.id, id, dto);
  }
}
