
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsUUID()
  restaurantId: string;

  @IsUUID()
  categoryId: string;
}
