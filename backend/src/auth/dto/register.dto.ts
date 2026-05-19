import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    name: string;

    @IsString()
    surname: string;

    @IsString()
    username: string;

    @IsString()
    roleId: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}
