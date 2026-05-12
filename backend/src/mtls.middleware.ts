import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TLSSocket } from 'tls';

export interface MtlsRequest extends Request {
    deviceId?: string;
}

@Injectable()
export class MtlsMiddleware implements NestMiddleware {
    use(req: MtlsRequest, res: Response, next: NextFunction) {
        const socket = req.socket as TLSSocket;

        if (!socket.authorized) {
            throw new UnauthorizedException(socket.authorizationError || 'Invalid client certificate');
        }

        const cert = socket.getPeerCertificate();

        if (!cert?.subject?.CN) {
            throw new UnauthorizedException('No client certificate provided');
        }

        next();
    }
}
