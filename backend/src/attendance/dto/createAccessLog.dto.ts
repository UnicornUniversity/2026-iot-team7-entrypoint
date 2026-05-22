import { ApiProperty } from '@nestjs/swagger';
import { Direction } from '../enums/direction.enum';

export class CreateAccessLogDto {
    @ApiProperty({ example: '04A1B2C3D4' })
    cardUid: string;

    @ApiProperty({ example: 'SN3221409A' })
    deviceUid: string;

    @ApiProperty({ enum: Direction, example: Direction.IN })
    direction: Direction;

    @ApiProperty({ example: '2026-05-20T10:30:00.000Z' })
    timestamp: string;
}
