import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import path from 'path';
import * as fs from 'fs';

async function bootstrap() {
    const certsDir = path.join(__dirname, '..', 'certs');

    const app = await NestFactory.create(AppModule, {
        httpsOptions: {
            cert: fs.readFileSync(path.join(certsDir, 'server-cert.pem')),
            key: fs.readFileSync(path.join(certsDir, 'server-key.pem')),
            ca: fs.readFileSync(path.join(certsDir, 'ca-cert.pem')),
            requestCert: true,
            rejectUnauthorized: false,
        },
    });
    app.useGlobalPipes(new ValidationPipe());

    const swaggerConfig = new DocumentBuilder()
        .setTitle('IoT Attendance API')
        .setDescription('API for users, cards, devices, attendance logs, and authentication.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
