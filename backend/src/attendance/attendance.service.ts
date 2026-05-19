import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Attendance, AttendanceType, AttendanceState } from './attendance.entity';
import { UsersService } from '../users/users.service';
import { RecordAttendanceDto, BatchEventDto } from './dto/gateway-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { Device } from '../devices/device.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private usersService: UsersService,
  ) {}

  async recordScan(data: RecordAttendanceDto, device: Device) {
    const user = await this.usersService.findByCardID(data.uid);
    
    let determinedType: AttendanceType;
    if (data.event.toLowerCase() === 'auto') {
      const lastScan = user ? await this.attendanceRepository.findOne({
        where: { user: { id: user.id } },
        order: { timestamp: 'DESC' },
      }) : null;
      determinedType = lastScan?.type === AttendanceType.ARRIVAL 
        ? AttendanceType.DEPARTURE 
        : AttendanceType.ARRIVAL;
    } else {
      determinedType = data.event.toLowerCase() === 'arrival' 
        ? AttendanceType.ARRIVAL 
        : AttendanceType.DEPARTURE;
    }

    const attendance = this.attendanceRepository.create({
      user: user || null,
      cardID: data.uid,
      device: device,
      type: determinedType,
      state: AttendanceState.ONLINE,
      timestamp: new Date(data.timestamp),
    });

    await this.attendanceRepository.save(attendance);

    if (!user) {
      return { status: 'DENIED', message: 'User not found' };
    }

    if (!user.isActive) {
      return { status: 'DENIED', message: 'User is inactive' };
    }

    return {
      status: 'OK',
      event: determinedType,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async batchSync(events: BatchEventDto[], device: Device) {
    let processed = 0;
    for (const event of events) {
      const user = await this.usersService.findByCardID(event.uid);
      if (user && !user.isActive) continue; // Skip inactive users in batch sync
      
      const attendance = this.attendanceRepository.create({
        user: user || null,
        cardID: event.uid,
        device: device,
        type: event.event.toLowerCase() === 'arrival' ? AttendanceType.ARRIVAL : AttendanceType.DEPARTURE,
        state: AttendanceState.OFFLINE,
        timestamp: new Date(event.timestamp),
      });
      await this.attendanceRepository.save(attendance);
      processed++;
    }
    return { status: 'OK', processed };
  }

  async findAll(query: AttendanceQueryDto): Promise<{ data: Attendance[]; total: number }> {
    const { limit = 10, offset = 0, userId, dateFrom, dateTo, type } = query;
    
    const where: any = {};
    if (userId) where.user = { id: userId };
    if (type) where.type = type;

    if (dateFrom && dateTo) {
      where.timestamp = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      where.timestamp = MoreThanOrEqual(new Date(dateFrom));
    } else if (dateTo) {
      where.timestamp = LessThanOrEqual(new Date(dateTo));
    }

    const [data, total] = await this.attendanceRepository.findAndCount({
      where,
      relations: ['user', 'device'],
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }

  async findByUser(userId: string, query: AttendanceQueryDto = {}): Promise<{ data: Attendance[]; total: number }> {
    return this.findAll({ ...query, userId });
  }

  async create(attendanceData: Partial<Attendance>): Promise<Attendance> {
    const attendance = this.attendanceRepository.create({
        ...attendanceData,
        state: AttendanceState.MANUAL
    });
    return this.attendanceRepository.save(attendance);
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({ 
        where: { id }, 
        relations: ['user', 'device'] 
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return attendance;
  }

  async update(id: string, updateData: Partial<Attendance>, updaterId: string): Promise<Attendance> {
    const attendance = await this.findOne(id);
    const updater = await this.usersService.findOne(updaterId);
    
    // Explicitly update only allowed fields
    if (updateData.type) attendance.type = updateData.type;
    if (updateData.timestamp) attendance.timestamp = new Date(updateData.timestamp);
    if (updateData.cardID) attendance.cardID = updateData.cardID;
    
    // Always set these on manual update
    attendance.updatedBy = updater;
    attendance.state = AttendanceState.MANUAL;
    
    // Use save() on the entity instance to trigger lifecycle hooks and proper update
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string, deleterId: string): Promise<void> {
    const attendance = await this.findOne(id);
    const deleter = await this.usersService.findOne(deleterId);
    attendance.updatedBy = deleter;
    // Note: maybe also mark as manual on delete? but softRemove handles deletedAt
    await this.attendanceRepository.save(attendance);
    await this.attendanceRepository.softRemove(attendance);
  }
}
