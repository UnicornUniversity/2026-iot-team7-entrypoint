import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import path from "path";
import * as fs from "fs";

async function bootstrap() {
    const certsDir = path.join(process.cwd(), 'certs');
    const httpsOptions = {
        cert: fs.readFileSync(path.join(certsDir, 'server-cert.pem')),
        key: fs.readFileSync(path.join(certsDir, 'server-key.pem')),
        ca: fs.readFileSync(path.join(certsDir, 'ca-cert.pem')),
        requestCert: true,
        rejectUnauthorized: false,
    };

    const app = await NestFactory.create(AppModule, { httpsOptions });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    await app.listen(process.env.PORT || 8080);
}
bootstrap();
