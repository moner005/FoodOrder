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
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantsService } from './restaurants.service.js';
import { CreateRestaurantDto } from './dto/create-restaurant.dto.js';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto.js';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // Public: Get active restaurants
  @Get()
  findAll() {
    return this.restaurantsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('admin/all')
  findAllForAdmin(@Request() req: { user: { id: string } }) {
    return this.restaurantsService.findAllForAdmin(req.user.id);
  }
  // Get restaurants owned by the logged-in user
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('my-restaurants')
  findMyRestaurants(@Request() req: { user: { id: string } }) {
    return this.restaurantsService.findMyRestaurants(req.user.id);
  }
  // Public: Get restaurant details
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }
  // Admin: Get pending restaurants
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('admin/pending')
  findPending(@Request() req: { user: { role: string } }) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.restaurantsService.findPending();
  }

  // Admin: Approve restaurant
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('admin/:id/approve')
  approve(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.restaurantsService.approve(id);
  }

  // Authenticated: Create restaurant
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Request() req: { user: { id: string; role: string } },
    @Body() dto: CreateRestaurantDto,
  ) {
    return this.restaurantsService.create(req.user.id, dto);
  }

  // Authenticated: Update restaurant
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, req.user.id, req.user.role, dto);
  }

  // Authenticated: Deactivate restaurant
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.restaurantsService.remove(id, req.user.id, req.user.role);
  }
}
