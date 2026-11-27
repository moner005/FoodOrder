import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  // Public: Get categories of a restaurant
  @Get('restaurant/:restaurantId')
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.categoriesService.findByRestaurant(restaurantId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('manage/restaurant/:restaurantId')
  findManageByRestaurant(@Param('restaurantId') restaurantId: string, @Request() req: { user: { id: string; role: string } }) {
    return this.categoriesService.findManageByRestaurant(restaurantId, req.user.id, req.user.role);
  }

  // Protected: Create category
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Request() req: { user: { id: string; role: string } },
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(
      req.user.id,
      req.user.role,
      dto,
    );
  }

  // Protected: Update category
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      id,
      req.user.id,
      req.user.role,
      dto,
    );
  }

  // Protected: Delete category
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.categoriesService.remove(
      id,
      req.user.id,
      req.user.role,
    );
  }
}
