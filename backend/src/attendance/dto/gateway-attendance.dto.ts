import { IsString, IsNotEmpty, IsEnum, IsISO8601, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceType } from '../attendance.entity';

export class RecordAttendanceDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  gateway_key: string;

  @IsString()
  @IsNotEmpty()
  uid: string; // cardID

  @IsString()
  @IsNotEmpty()
  event: string; // arrival | departure | auto

  @IsISO8601()
  timestamp: string;
}

export class BatchEventDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  @IsISO8601()
  timestamp: string;
}

export class BatchAttendanceDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  gateway_key: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchEventDto)
  events: BatchEventDto[];
}
