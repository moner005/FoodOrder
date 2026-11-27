import {
  IsOptional,
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  IsBoolean,
  IsArray,
  ArrayMaxSize,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class UpdateRestaurantDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  description?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  address?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cuisine?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isOpen?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsNumber()
  @Min(0)
  @Max(99_999_999.99)
  deliveryFee?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsNumber()
  @Min(0)
  @Max(99_999_999.99)
  minimumSubtotal?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  deliveryAreas?: string[];
}
