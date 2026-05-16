import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {CertificatesService} from "./certificates/certificates.service";

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(AppModule);
    await appContext.close();

    const app = await NestFactory.create(AppModule);

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
