import { ArrayUnique, IsArray, IsBoolean, IsISO8601, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class UpdateAdminAccountDto {
  @IsISO8601()
  expectedUpdatedAt!: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString() @MinLength(2) @MaxLength(100)
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isSuspended?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray() @ArrayUnique() @IsString({ each: true })
  restaurantIds?: string[];
}
