import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';

import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type JwtPayload = {
    sub: string;
    jti?: string;
};

@Injectable()
export class AuthService {
    private readonly accessSecret: string;
    private readonly refreshSecret: string;
    private readonly accessExpiresIn: JwtSignOptions['expiresIn'];
    private readonly refreshExpiresIn: JwtSignOptions['expiresIn'];

    constructor(
        private readonly supabase: SupabaseService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService
    ) {
        this.accessSecret = this.requireConfig('JWT_ACCESS_SECRET');
        this.refreshSecret = this.requireConfig('JWT_REFRESH_SECRET');
        this.accessExpiresIn = this.getTokenDuration('JWT_ACCESS_EXPIRES_IN', '15m');
        this.refreshExpiresIn = this.getTokenDuration('JWT_REFRESH_EXPIRES_IN', '30d');
    }

    async register(registerDto: RegisterDto) {
        await this.ensureUserDoesNotExist(registerDto.email, registerDto.username);
        const user = await this.createUser(registerDto);

        const passwordHash = await bcrypt.hash(registerDto.password, 12);
        const { error } = await this.supabase.getClient().from('auth_credentials').insert({
            user_id: user.id,
            password_hash: passwordHash,
        });

        if (error) {
            await this.deleteUser(user.id);
            throw new BadRequestException(error.message);
        }

        return this.issueTokenPair(user.id);
    }

    async login(loginDto: LoginDto) {
        const user = await this.getActiveUserByEmail(loginDto.email);

        const { data, error } = await this.supabase
            .getClient()
            .from('auth_credentials')
            .select('password_hash')
            .eq('user_id', user.id)
            .single();

        if (error || !data) throw new UnauthorizedException('Invalid credentials');

        const passwordMatches = await bcrypt.compare(loginDto.password, data.password_hash);

        if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

        return this.issueTokenPair(user.id);
    }

    async refresh(refreshToken: string) {
        const payload = await this.verifyRefreshToken(refreshToken);
        if (!payload.jti) throw new UnauthorizedException('Invalid refresh token');

        const tokenHash = this.hashToken(refreshToken);
        const { data, error } = await this.supabase
            .getClient()
            .from('refresh_tokens')
            .select('id,user_id,expires_at,revoked_at')
            .eq('id', payload.jti)
            .eq('token_hash', tokenHash)
            .single();

        if (error || !data) throw new UnauthorizedException('Invalid refresh token');
        if (data.user_id !== payload.sub) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        if (data.revoked_at) throw new UnauthorizedException('Refresh token revoked');
        if (new Date(data.expires_at).getTime() <= Date.now()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        await this.revokeRefreshToken(payload.jti);
        return this.issueTokenPair(payload.sub);
    }

    async logout(refreshToken: string) {
        const payload = await this.verifyRefreshToken(refreshToken);
        if (payload.jti) await this.revokeRefreshToken(payload.jti);

        return { success: true };
    }

    private async issueTokenPair(userId: string) {
        const refreshTokenId = randomUUID();
        const accessToken = await this.jwtService.signAsync({ sub: userId } satisfies JwtPayload, {
            secret: this.accessSecret,
            expiresIn: this.accessExpiresIn,
        });
        const refreshToken = await this.jwtService.signAsync(
            { sub: userId, jti: refreshTokenId } satisfies JwtPayload,
            {
                secret: this.refreshSecret,
                expiresIn: this.refreshExpiresIn,
            }
        );

        const refreshExpiresAt = new Date(
            Date.now() + this.durationToMilliseconds(String(this.refreshExpiresIn))
        ).toISOString();

        const { error } = await this.supabase
            .getClient()
            .from('refresh_tokens')
            .insert({
                id: refreshTokenId,
                user_id: userId,
                token_hash: this.hashToken(refreshToken),
                expires_at: refreshExpiresAt,
            });

        if (error) throw new InternalServerErrorException(error.message);

        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: Math.floor(this.durationToMilliseconds(String(this.accessExpiresIn)) / 1000),
        };
    }

    private async getActiveUserByEmail(email: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('users')
            .select('id,is_active')
            .eq('email', email)
            .single();

        if (error || !data) throw new UnauthorizedException('Invalid credentials');
        if (data.is_active === false) throw new UnauthorizedException('User is inactive');

        return data;
    }

    private async ensureUserDoesNotExist(email: string, username: string) {
        const { data: userWithEmail, error: emailError } = await this.supabase
            .getClient()
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (emailError) throw new BadRequestException(emailError.message);
        if (userWithEmail) throw new ConflictException('User with this email already exists');

        const { data: userWithUsername, error: usernameError } = await this.supabase
            .getClient()
            .from('users')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (usernameError) throw new BadRequestException(usernameError.message);
        if (userWithUsername) throw new ConflictException('User with this username already exists');
    }

    private async createUser(registerDto: RegisterDto) {
        const { data, error } = await this.supabase
            .getClient()
            .from('users')
            .insert({
                name: registerDto.name,
                surname: registerDto.surname,
                username: registerDto.username,
                role_id: registerDto.roleId,
                email: registerDto.email,
                is_active: true,
            })
            .select('id,is_active')
            .single();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new InternalServerErrorException('User was not created');

        return data;
    }

    private async deleteUser(userId: string) {
        await this.supabase.getClient().from('users').delete().eq('id', userId);
    }

    private async verifyRefreshToken(refreshToken: string) {
        try {
            return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
                secret: this.refreshSecret,
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private async revokeRefreshToken(tokenId: string) {
        const { error } = await this.supabase
            .getClient()
            .from('refresh_tokens')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', tokenId)
            .is('revoked_at', null);

        if (error) throw new BadRequestException(error.message);
    }

    private hashToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }

    private requireConfig(key: string) {
        const value = this.config.get<string>(key);
        if (!value) throw new Error(`Missing ${key} in environment`);
        return value;
    }

    private getTokenDuration(key: string, fallback: string): JwtSignOptions['expiresIn'] {
        return (this.config.get<string>(key) ?? fallback) as JwtSignOptions['expiresIn'];
    }

    private durationToMilliseconds(duration: string) {
        const match = /^(\d+)([smhd])$/.exec(duration);
        if (!match) throw new Error(`Unsupported duration format: ${duration}`);

        const value = Number(match[1]);
        const unit = match[2];
        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        return value * multipliers[unit];
    }
}
