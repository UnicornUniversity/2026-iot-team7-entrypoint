import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TLSSocket } from 'tls';

export interface MtlsRequest extends Request {
    deviceId?: string;
}

@Injectable()
export class MtlsMiddleware implements NestMiddleware {
    private readonly logger = new Logger(MtlsMiddleware.name);

    use(req: MtlsRequest, res: Response, next: NextFunction) {
        try {
            this.logger.debug(`Request from IP: ${req.ip}, Path: ${req.path}`);
            const clientCertHeader =
                req.headers['x-client-cert'] ||
                req.headers['ssl-client-cert'];
            const socket = req.socket as TLSSocket;

            if (!clientCertHeader) {
                console.log('mTLS bypassed for testing on Fly.io');
                return next();
            }

            if (!socket.authorized) {
                throw new UnauthorizedException(socket.authorizationError || 'Invalid client certificate');
            }

            const cert = socket.getPeerCertificate();

            if (!cert?.subject?.CN) {
                throw new UnauthorizedException('No client certificate provided');
            }

            next();
        } catch (error) {
            this.logger.error('mTLS Middleware error', error);
            throw new UnauthorizedException('mTLS validation failed');
        }
    }
}
