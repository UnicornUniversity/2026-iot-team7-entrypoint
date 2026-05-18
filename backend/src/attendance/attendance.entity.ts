import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum AttendanceType {
  ARRIVAL = 'arrival',
  DEPARTURE = 'departure',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.attendances)
  user: User;

  @Column({
    type: 'enum',
    enum: AttendanceType,
  })
  type: AttendanceType;

  @Column({ default: false })
  offline: boolean;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => User, { nullable: true })
  updatedBy: User;

  @CreateDateColumn()
  updatedAt: Date;
}
