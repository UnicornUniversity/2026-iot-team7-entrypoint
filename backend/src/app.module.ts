import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CardsModule } from './cards/cards.module';
import { MtlsOrJwtMiddleware } from './common/middleware/mtlsOrJwt.middleware';
import { AuthModule } from './auth/auth.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
    imports: [
        DevicesModule,
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({}),
        SupabaseModule,
        UsersModule,
        AttendanceModule,
        CardsModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggingMiddleware)
            .exclude(
                { path: 'api/v1/auth/login', method: RequestMethod.POST },
                { path: 'api/v1/auth/refresh', method: RequestMethod.POST },
                { path: 'api/v1/auth/logout', method: RequestMethod.POST }
            )
            .forRoutes('*');
        
        consumer
            .apply(MtlsOrJwtMiddleware)
            .exclude(
                { path: 'api/v1/auth/register', method: RequestMethod.POST },
                { path: 'api/v1/auth/login', method: RequestMethod.POST },
                { path: 'api/v1/auth/refresh', method: RequestMethod.POST },
                { path: 'api/v1/auth/logout', method: RequestMethod.POST },
                { path: 'api/v1/health', method: RequestMethod.GET },
                { path: 'api/docs', method: RequestMethod.GET }
            )
            .forRoutes('*');
    }
}
