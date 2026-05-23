import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const startTime = Date.now();

        this.logger.log(`${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`);

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;

            this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
        });

        next();
    }
}
