
import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn([
    'CONFIRMED',
    'PREPARING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ])
  status:
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED';
}
