import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  hashedPassword: string; // This will be hashed in the service

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

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
