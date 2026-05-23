import { ApiProperty } from '@nestjs/swagger';
import { Direction } from '../enums/direction.enum';
import {IsOptional} from "class-validator";

export class CreateAccessLogDto {
    @ApiProperty({ example: '04A1B2C3D4' })
    cardUid: string;

    @ApiProperty({
        example: '268de211-2e35-41d3-a297-1bc61ce92da6',
        description: 'UUID of device from database',
        required: false
    })
    @IsOptional()
    deviceId?: string;

    @ApiProperty({
        example: 'SN3221409A',
        description: 'Unique id of device - serial number of the device',
        required: false
    })
    @IsOptional()
    deviceUid?: string;

    @ApiProperty({ enum: Direction, example: Direction.IN })
    direction: Direction;

    @ApiProperty({ example: '2026-05-20T10:30:00.000Z' })
    timestamp: string;
}
