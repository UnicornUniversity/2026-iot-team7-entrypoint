import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceType } from './attendance.entity';
import { UsersService } from '../users/users.service';
import { RecordAttendanceDto, BatchEventDto } from './dto/gateway-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private usersService: UsersService,
  ) {}

  async recordScan(data: RecordAttendanceDto) {
    const user = await this.usersService.findByCardID(data.uid);
    if (!user) {
      return { status: 'DENIED', message: 'User not found' };
    }

    let determinedType: AttendanceType;
    if (data.event.toLowerCase() === 'auto') {
      const lastScan = await this.attendanceRepository.findOne({
        where: { user: { id: user.id } },
        order: { timestamp: 'DESC' },
      });
      determinedType = lastScan?.type === AttendanceType.ARRIVAL 
        ? AttendanceType.DEPARTURE 
        : AttendanceType.ARRIVAL;
    } else {
      determinedType = data.event.toLowerCase() === 'arrival' 
        ? AttendanceType.ARRIVAL 
        : AttendanceType.DEPARTURE;
    }

    const attendance = this.attendanceRepository.create({
      user,
      type: determinedType,
      timestamp: new Date(data.timestamp),
      offline: false,
    });

    await this.attendanceRepository.save(attendance);

    return {
      status: 'OK',
      event: determinedType,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async batchSync(events: BatchEventDto[]) {
    let processed = 0;
    for (const event of events) {
      const user = await this.usersService.findByCardID(event.uid);
      if (user) {
        const attendance = this.attendanceRepository.create({
          user,
          type: event.event.toLowerCase() === 'arrival' ? AttendanceType.ARRIVAL : AttendanceType.DEPARTURE,
          timestamp: new Date(event.timestamp),
          offline: true,
        });
        await this.attendanceRepository.save(attendance);
        processed++;
      }
    }
    return { status: 'OK', processed };
  }

  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find({ relations: ['user'] });
  }

  async findByUser(userId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
    });
  }

  async create(attendanceData: Partial<Attendance>): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(attendanceData);
    return this.attendanceRepository.save(attendance);
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({ where: { id }, relations: ['user'] });
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return attendance;
  }

  async update(id: string, updateData: Partial<Attendance>): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateData);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }
}
