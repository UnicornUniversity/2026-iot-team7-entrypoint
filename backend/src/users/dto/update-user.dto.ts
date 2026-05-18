import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  hashedPassword?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  cardID?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
