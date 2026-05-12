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
        const cert = socket.getPeerCertificate();

        if (!cert || !cert.subject) {
            throw new UnauthorizedException('No client certificate provided');
        }

        req.deviceId = Array.isArray(cert.subject.CN) ?
            cert.subject.CN[0]
            : cert.subject.CN; // "gateway-01"
        next();
    }
}
