import { ArrayUnique, IsArray, IsEmail, IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class CreateAdminAccountDto {
  @IsString() @MinLength(2) @MaxLength(100)
  name!: string;

  @IsEmail() @MaxLength(254)
  email!: string;

  @IsString() @MinLength(8) @MaxLength(72)
  initialPassword!: string;

  @IsIn(['CUSTOMER', 'RESTAURANT_OWNER'])
  role!: 'CUSTOMER' | 'RESTAURANT_OWNER';

  @ValidateIf((_, value) => value !== undefined)
  @IsArray() @ArrayUnique() @IsString({ each: true })
  restaurantIds?: string[];
}
