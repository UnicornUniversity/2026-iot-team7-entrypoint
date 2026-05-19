import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceDto, BatchAttendanceDto } from './dto/gateway-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { GatewayGuard } from '../common/guards/gateway.guard';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // --- GATEWAY ENDPOINTS (for Hardware) ---
  @Post('attendance')
  @HttpCode(200)
  @UseGuards(GatewayGuard)
  recordScan(@Body() recordAttendanceDto: RecordAttendanceDto, @Req() req: any) {
    return this.attendanceService.recordScan(recordAttendanceDto, req.gateway);
  }

  @Post('attendance/batch')
  @HttpCode(200)
  @UseGuards(GatewayGuard)
  batchSync(@Body() batchAttendanceDto: BatchAttendanceDto, @Req() req: any) {
    return this.attendanceService.batchSync(batchAttendanceDto.events, req.gateway);
  }

  // --- RECORD ENDPOINTS (for Frontend/Users) ---
  @Get('records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query);
  }

  @Post('records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() body: any) {
    return this.attendanceService.create(body);
  }

  @Get('records/my')
  @UseGuards(JwtAuthGuard)
  findMyAttendance(@Req() req: any, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.findByUser(req.user.id, query);
  }

  @Get('records/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch('records/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.attendanceService.update(id, body, req.user.id);
  }

  @Delete('records/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.attendanceService.remove(id, req.user.id);
  }
}
