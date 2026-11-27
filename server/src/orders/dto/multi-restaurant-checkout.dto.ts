
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  Max,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { Type } from 'class-transformer';

class CheckoutItemDto {
  @IsUUID()
  mealId: string;

  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  quantity: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  expectedUnitPriceMinor?: number;
}

export class MultiRestaurantCheckoutDto {
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(120)
  notes?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  deliveryArea?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsUUID()
  requestId?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsUUID()
  expectedCustomerId?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  expectedTotalMinor?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
}
