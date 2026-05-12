import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CardsModule } from './cards/cards.module';
import {MtlsMiddleware} from "./mtls.middleware";

@Module({
    imports: [
        DevicesModule,
        ConfigModule.forRoot({ isGlobal: true }),
        SupabaseModule,
        UsersModule,
        AttendanceModule,
        CardsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(MtlsMiddleware).forRoutes('*');
    }
}
