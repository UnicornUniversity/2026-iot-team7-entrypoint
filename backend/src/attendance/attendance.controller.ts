import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceDto, BatchAttendanceDto } from './dto/gateway-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { GatewayGuard } from '../common/guards/gateway.guard';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Gateway Endpoints
  @Post('api/v1/attendance')
  @HttpCode(200)
  @UseGuards(GatewayGuard)
  recordScan(@Body() recordAttendanceDto: RecordAttendanceDto) {
    return this.attendanceService.recordScan(recordAttendanceDto);
  }

  @Post('api/v1/attendance/batch')
  @HttpCode(200)
  @UseGuards(GatewayGuard)
  batchSync(@Body() batchAttendanceDto: BatchAttendanceDto) {
    return this.attendanceService.batchSync(batchAttendanceDto.events);
  }

  // Admin CRUD
  @Get('attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.attendanceService.findAll();
  }

  @Post('attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() body: any) {
    return this.attendanceService.create(body);
  }

  @Get('attendance/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch('attendance/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.attendanceService.update(id, body);
  }

  @Delete('attendance/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }

  // User Self-Service
  @Get('my-attendance')
  @UseGuards(JwtAuthGuard)
  findMyAttendance(@Request() req: any) {
    return this.attendanceService.findByUser(req.user.id);
  }
}
