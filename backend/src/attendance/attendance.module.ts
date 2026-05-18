import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './attendance.entity';
import { UsersModule } from '../users/users.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    UsersModule,
    DevicesModule,
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
