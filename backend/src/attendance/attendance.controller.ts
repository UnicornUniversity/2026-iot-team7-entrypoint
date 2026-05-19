import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAccessLogDto } from './dto/createAccessLog.dto';
import { UpdateAccessLogDto } from './dto/updateAccessLog.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('api/v1/attendance')
export class AttendanceController {
    constructor(private attendanceService: AttendanceService) {}

    @ApiOperation({ summary: 'List attendance logs' })
    @ApiResponse({
        status: 200,
        example: [
            {
                id: '550e8400-e29b-41d4-a716-446655440040',
                user_id: '550e8400-e29b-41d4-a716-446655440001',
                device_id: '550e8400-e29b-41d4-a716-446655440010',
                direction: 'in',
                success: true,
            },
        ],
    })
    @Get()
    getAllAttendances() {
        return this.attendanceService.getAllAttendances();
    }

    @ApiOperation({ summary: 'Get attendance log by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440040' })
    @Get('logs/:id')
    getAttendanceById(@Param('id') id: string) {
        return this.attendanceService.getAttendanceById(id);
    }

    @ApiOperation({ summary: 'Get attendance logs by user ID' })
    @ApiParam({ name: 'userId', example: '550e8400-e29b-41d4-a716-446655440001' })
    @Get('user/:userId')
    getUserAttendanceByUserRoute(@Param('userId') userId: string) {
        return this.attendanceService.getUserAttendance(userId);
    }

    @ApiOperation({ summary: 'Get attendance logs by user ID' })
    @ApiParam({ name: 'userId', example: '550e8400-e29b-41d4-a716-446655440001' })
    @Get(':userId')
    getUserAttendance(@Param('userId') userId: string) {
        return this.attendanceService.getUserAttendance(userId);
    }

    @ApiOperation({ summary: 'Log card access' })
    @ApiBody({ type: CreateAccessLogDto })
    @ApiResponse({
        status: 201,
        example: {
            id: '550e8400-e29b-41d4-a716-446655440040',
            user_id: '550e8400-e29b-41d4-a716-446655440001',
            device_id: '550e8400-e29b-41d4-a716-446655440010',
            direction: 'in',
            success: true,
        },
    })
    @Post()
    logAttendance(@Body() dto: CreateAccessLogDto) {
        return this.attendanceService.logAttendance(dto);
    }

    @ApiOperation({ summary: 'Update attendance log by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440040' })
    @ApiBody({ type: UpdateAccessLogDto })
    @Patch(':id')
    updateAttendance(@Param('id') id: string, @Body() dto: UpdateAccessLogDto) {
        return this.attendanceService.updateAttendance(id, dto);
    }

    @ApiOperation({ summary: 'Delete attendance log by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440040' })
    @Delete(':id')
    deleteAttendance(@Param('id') id: string) {
        return this.attendanceService.deleteAttendance(id);
    }
}
