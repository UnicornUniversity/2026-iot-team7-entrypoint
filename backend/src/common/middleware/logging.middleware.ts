import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const SENSITIVE_PATHS = ['/api/v1/auth/login', '/api/v1/auth/refresh', '/api/v1/auth/register'];

const SENSITIVE_KEYS = new Set(['password', 'token', 'secret', 'authorization', 'accessToken', 'refreshToken']);

function redact(obj: unknown, depth = 0): unknown {
    if (depth > 5 || obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) return obj.map((item) => redact(item, depth + 1));

    return Object.fromEntries(
        Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
            k,
            SENSITIVE_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : redact(v, depth + 1),
        ])
    );
}

function safeStringify(value: unknown): string {
    try {
        return JSON.stringify(value);
    } catch {
        return '[unserializable]';
    }
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const requestId = req.headers['fly-request-id'] ?? crypto.randomUUID();
        const startTime = Date.now();

        const isSensitivePath = SENSITIVE_PATHS.some((p) => originalUrl.startsWith(p));
        const reqBody =
            !isSensitivePath && req.body && Object.keys(req.body).length > 0
                ? safeStringify(redact(req.body))
                : undefined;

        this.logger.log(
            `→ ${method} ${originalUrl} | id=${requestId} ip=${ip} ua="${userAgent}"${reqBody ? ` body=${reqBody}` : ''}`
        );

        const chunks: Buffer[] = [];
        const originalWrite = res.write.bind(res);
        const originalEnd = res.end.bind(res);

        res.write = (chunk: unknown, ...args: unknown[]) => {
            if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
            return (originalWrite as (...a: unknown[]) => boolean)(chunk, ...args);
        };

        res.end = (chunk: unknown, ...args: unknown[]) => {
            if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
            return (originalEnd as (...a: unknown[]) => Response)(chunk, ...args);
        };

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;
            const contentType = res.getHeader('content-type')?.toString() ?? '';

            let resBody: string | undefined;
            if (contentType.includes('application/json') && chunks.length > 0) {
                try {
                    const raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                    resBody = safeStringify(redact(raw));
                } catch {
                    // non-parseable — skip body
                }
            }

            const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
            this.logger[level](
                `← ${method} ${originalUrl} ${statusCode} | id=${requestId} ${duration}ms${resBody ? ` body=${resBody}` : ''}`
            );
        });

        next();
    }
}
