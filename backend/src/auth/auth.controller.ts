import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Register a new user and issue tokens' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: 201,
        example: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-example',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-example',
            tokenType: 'Bearer',
            expiresIn: 900,
        },
    })
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 201,
        example: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-example',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-example',
            tokenType: 'Bearer',
            expiresIn: 900,
        },
    })
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ summary: 'Rotate a refresh token and issue a new token pair' })
    @ApiBody({ type: RefreshDto })
    @ApiResponse({
        status: 201,
        example: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-access-token-example',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-refresh-token-example',
            tokenType: 'Bearer',
            expiresIn: 900,
        },
    })
    @Post('refresh')
    refresh(@Body() refreshDto: RefreshDto) {
        return this.authService.refresh(refreshDto.refreshToken);
    }

    @ApiOperation({ summary: 'Revoke a refresh token' })
    @ApiBody({ type: RefreshDto })
    @ApiResponse({ status: 201, example: { success: true } })
    @Post('logout')
    logout(@Body() refreshDto: RefreshDto) {
        return this.authService.logout(refreshDto.refreshToken);
    }
}
