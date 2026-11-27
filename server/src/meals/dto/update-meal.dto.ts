import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  MaxLength,
  IsUUID,
} from 'class-validator';
export class UpdateMealDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
