
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
  MaxLength,
  ValidateIf,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsUUID()
  mealId: string;

  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(120)
  notes?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(120)
  deliveryArea?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
