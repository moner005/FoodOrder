import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  MaxLength,
  IsUUID,
  IsISO8601,
  ValidateIf,
} from 'class-validator';
export class UpdateMealDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsISO8601()
  expectedUpdatedAt?: string;

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
