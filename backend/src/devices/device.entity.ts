import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  key: string;
}
