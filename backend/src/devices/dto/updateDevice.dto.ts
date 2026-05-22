import { ApiProperty } from '@nestjs/swagger';
import { DeviceStatus } from '../enums/deviceStatus.enum';

export class UpdateDeviceDto {
    @ApiProperty({ example: 'Main entrance reader' })
    name: string;

    @ApiProperty({ example: 'Main entrance', nullable: true })
    location: string | null;

    @ApiProperty({ enum: DeviceStatus, example: DeviceStatus.ONLINE })
    status: DeviceStatus;

    @ApiProperty({ example: '2026-05-20T10:30:00.000Z', nullable: true })
    lastSeen: string | null;

    @ApiProperty({ example: 'RFID reader mounted at the main entrance', nullable: true })
    description: string | null;

    @ApiProperty({ example: 'reader-main-entrance-01' })
    deviceUid: string;
}
