import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { BatchSyncDto } from './dto/batchSync.dto';
import { CreateAccessLogDto } from './dto/createAccessLog.dto';
import { UpdateAccessLogDto } from './dto/updateAccessLog.dto';
import type { MtlsOrJwtRequest } from '../common/middleware/mtlsOrJwt.middleware';

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
            id: 'fc3638ec-a79f-40a8-a4c8-af27945c89d4',
            user_id: 'fed9b851-0cac-4031-9136-e49ed8a3d20f',
            timestamp: '2026-05-17T07:23:12+00:00',
            success: true,
            direction: 'in',
            device_id: '268de211-2e35-41d3-a297-1bc61ce92da6',
            updated_at: null,
            updated_by: null,
            created_at: '2026-05-22T17:10:43.505865+00:00',
            name: 'Karel',
            surname: 'Novak',
            username: 'karel.novak',
        },
    })
    @Post()
    logAttendance(@Body() dto: CreateAccessLogDto) {
        return this.attendanceService.logAttendance(dto);
    }

    @ApiOperation({ summary: 'Batch sync offline attendance events' })
    @ApiBody({ type: BatchSyncDto })
    @ApiResponse({
        status: 201,
        example: {
            status: 'OK',
            processed: 1,
            failed: 1,
            errors: [{ index: 1, cardUid: 'BAD_UID', reason: 'insert or validation error message' }],
        },
    })
    @Post('batch')
    batchSync(@Body() dto: BatchSyncDto, @Req() req: MtlsOrJwtRequest) {
        return this.attendanceService.batchSync(dto, req.deviceId);
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
