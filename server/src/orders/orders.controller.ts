import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MultiRestaurantCheckoutDto } from './dto/multi-restaurant-checkout.dto.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Get restaurant orders
  @Get('restaurant/:restaurantId')
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.ordersService.findByRestaurant(
      restaurantId,
      req.user.id,
      req.user.role,
    );
  }

  // Update order status
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.ordersService.updateStatus(
      id,
      dto.status,
      req.user.id,
      req.user.role,
    );
  }
  // One checkout can create orders for multiple restaurants
  @Post('checkout')
  checkout(
    @Request() req: { user: { id: string } },
    @Body() dto: MultiRestaurantCheckoutDto,
  ) {
    return this.ordersService.checkout(req.user.id, dto);
  }
  // Create order
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user.id, dto);
  }

  // Get logged-in user's orders
  @Get('my-orders')
  findMyOrders(@Request() req: { user: { id: string } }) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  // Get order details
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.ordersService.findOne(id, req.user.id, req.user.role);
  }

  // Cancel order
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.ordersService.cancel(id, req.user.id);
  }
}
