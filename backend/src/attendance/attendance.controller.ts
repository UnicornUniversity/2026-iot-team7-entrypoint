import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AttendanceService, CreateAccessLogDto } from './attendance.service';
import {MtlsMiddleware} from "../mtls.middleware";

@Controller('api/v1/attendance')
export class AttendanceController {
    constructor(private attendanceService: AttendanceService) {}
    @Get()
    getAllAttendances() {
        return this.attendanceService.getAllAttendances();
    }

    @Get(':userId')
    getUserAttendance(@Param('userId') userId: string) {
        return this.attendanceService.getUserAttendance(userId);
    }

    @Post()
    logAttendance(@Body() dto: CreateAccessLogDto) {
        return this.attendanceService.logAttendance(dto);
    }
}
