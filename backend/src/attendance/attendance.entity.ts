import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Device } from '../devices/device.entity';

export enum AttendanceType {
  ARRIVAL = 'arrival',
  DEPARTURE = 'departure',
}

export enum AttendanceState {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MANUAL = 'manual',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.attendances, { nullable: true })
  user: User | null;

  @Column({ nullable: true })
  cardID: string;

  @ManyToOne(() => Device, { nullable: true })
  device: Device | null;

  @Column({
    type: 'enum',
    enum: AttendanceType,
  })
  type: AttendanceType;

  @Column({
    type: 'enum',
    enum: AttendanceState,
    default: AttendanceState.ONLINE,
  })
  state: AttendanceState;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => User, { nullable: true })
  updatedBy: User | null;

  @CreateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
