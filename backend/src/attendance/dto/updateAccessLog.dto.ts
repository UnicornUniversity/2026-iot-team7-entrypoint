import { ApiProperty } from '@nestjs/swagger';
import { Direction } from '../enums/direction.enum';

export class UpdateAccessLogDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', nullable: true })
    userId: string | null;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010', nullable: true })
    deviceId: string | null;

    @ApiProperty({ enum: Direction, example: Direction.OUT })
    direction: Direction;

    @ApiProperty({ example: '2026-05-20T18:00:00.000Z' })
    timestamp: string;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: '2026-05-20T18:05:00.000Z', nullable: true })
    updatedAt: string | null;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', nullable: true })
    updatedBy: string | null;
}
