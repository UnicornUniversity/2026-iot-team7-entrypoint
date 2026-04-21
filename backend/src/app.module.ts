import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    DevicesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    UsersModule,
    AttendanceModule,
  ],
  controllers: [AppController, AttendanceController],
  providers: [AppService, UsersService, AttendanceService],
})
export class AppModule {}
