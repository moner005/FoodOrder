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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { MealsService } from './meals.service.js';
import { CreateMealDto } from './dto/create-meal.dto.js';
import { UpdateMealDto } from './dto/update-meal.dto.js';

@ApiTags('Meals')
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  // عرض وجبات مطعم
  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.mealsService.findByRestaurant(restaurantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('manage/restaurant/:restaurantId')
  findManageByRestaurant(@Param('restaurantId') restaurantId: string, @Request() req: { user: { id: string; role: string } }) {
    return this.mealsService.findManageByRestaurant(restaurantId, req.user.id, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('manage/:id')
  findManageOne(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.mealsService.findManageOne(id, req.user.id, req.user.role);
  }
  @Get()
  findAll() {
    return this.mealsService.findAll();
  }
  // عرض وجبة واحدة
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mealsService.findOne(id);
  }

  // إنشاء وجبة
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  create(
    @Body() dto: CreateMealDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.mealsService.create(dto, req.user.id, req.user.role);
  }

  // تعديل وجبة
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.mealsService.update(id, dto, req.user.id, req.user.role);
  }

  // حذف وجبة
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.mealsService.remove(id, req.user.id, req.user.role);
  }
}
