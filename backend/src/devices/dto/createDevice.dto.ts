import { ApiProperty } from '@nestjs/swagger';
import { DeviceStatus } from '../enums/deviceStatus.enum';

export class CreateDeviceDto {
    @ApiProperty({ example: 'Main entrance reader' })
    name: string;

    @ApiProperty({ example: 'Main entrance', nullable: true })
    location: string | null;

    @ApiProperty({ enum: DeviceStatus, example: DeviceStatus.OFFLINE })
    status: DeviceStatus;

    @ApiProperty({ example: null, nullable: true })
    lastSeen: string | null;

    @ApiProperty({ example: 'RFID reader mounted at the main entrance', nullable: true })
    description: string | null;

    @ApiProperty({ example: 'reader-main-entrance-01' })
    deviceUid: string;
}
