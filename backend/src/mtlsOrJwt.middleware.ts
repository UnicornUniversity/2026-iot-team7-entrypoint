import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { TLSSocket } from 'tls';

type AccessTokenPayload = {
    sub: string;
};

export interface MtlsOrJwtRequest extends Request {
    authType?: 'mtls' | 'jwt';
    deviceId?: string;
    userId?: string;
}

@Injectable()
export class MtlsOrJwtMiddleware implements NestMiddleware {
    private readonly accessSecret: string;

    constructor(
        private readonly config: ConfigService,
        private readonly jwtService: JwtService
    ) {
        const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
        if (!accessSecret) throw new Error('Missing JWT_ACCESS_SECRET in environment');

        this.accessSecret = accessSecret;
    }

    async use(req: MtlsOrJwtRequest, res: Response, next: NextFunction) {
        if (req.path.startsWith('/api/docs') || req.path === '/api/docs-json') {
            next();
            return;
        }

        if (this.authenticateWithMtls(req)) {
            next();
            return;
        }

        await this.authenticateWithJwt(req);
        next();
    }

    private authenticateWithMtls(req: MtlsOrJwtRequest) {
        const socket = req.socket as TLSSocket;
        const cert = socket.getPeerCertificate();

        if (!socket.authorized || !cert || !cert.subject) return false;

        req.authType = 'mtls';
        req.deviceId = Array.isArray(cert.subject.CN) ? cert.subject.CN[0] : cert.subject.CN;

        return true;
    }

    private async authenticateWithJwt(req: MtlsOrJwtRequest) {
        const token = this.getBearerToken(req);
        if (!token) throw new UnauthorizedException('Client certificate or bearer token required');

        try {
            const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
                secret: this.accessSecret,
            });

            req.authType = 'jwt';
            req.userId = payload.sub;
        } catch {
            throw new UnauthorizedException('Invalid bearer token');
        }
    }

    private getBearerToken(req: Request) {
        const authorization = req.headers.authorization;
        if (!authorization) return null;

        const [type, token] = authorization.split(' ');
        if (type !== 'Bearer' || !token) return null;

        return token;
    }
}
