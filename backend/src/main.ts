import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import path from "path";
import * as fs from "fs";
import * as https from "node:https";

async function bootstrap() {
    const certsDir = path.join(process.cwd(), 'certs');
    const httpsOptions = {
        cert: fs.readFileSync(path.join(certsDir, 'server-cert.pem')),
        key: fs.readFileSync(path.join(certsDir, 'server-key.pem')),
        ca: fs.readFileSync(path.join(certsDir, 'ca-cert.pem')),
        requestCert: true,
        rejectUnauthorized: true,
    };

    const app = await NestFactory.create(AppModule, { httpsOptions });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    // Middleware / Guard for mTLS check
    app.use((req: any, res: any, next: () => void) => {
       if (req.url.startsWith('/api/v1/cards') || req.url.startsWith('api/v1/attendance')) {
           if (!req.client?.authorized) {
               return res.status(401).json({
                   message: 'Not working or missing client certificate (mTLS)'
               });
           }

           const cert = req.socket.getPeerCertificate();
           console.log(`Gateway authenticated: ${cert.subject?.CN || 'unknown'}`);
       }
       next();
    });

    await app.listen(process.env.PORT || 3000);
}
bootstrap();
