import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'Jane' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    surname: string;

    @ApiProperty({ example: 'jane.doe' })
    @IsString()
    username: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020' })
    @IsString()
    roleId: string;

    @ApiProperty({ example: 'jane.doe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPass123' })
    @IsString()
    @MinLength(8)
    password: string;
}
