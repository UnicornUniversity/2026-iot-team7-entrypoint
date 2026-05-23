import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchEventDto {
    @ApiProperty({
        example: '04A1B2C3D4',
        description: 'Unique card UID',
    })
    cardUid: string;

    @ApiProperty({ example: 'in', enum: ['in', 'out'] })
    event: string;

    @ApiProperty({ example: '2026-05-20T10:30:00.000Z' })
    timestamp: string;
}

export class BatchSyncDto {
    @ApiPropertyOptional({
        example: 'SN3221409A',
        description: 'Unique device UID - Serial Number.',
    })
    deviceUid: string;

    @ApiProperty({ type: [BatchEventDto] })
    events: BatchEventDto[];
}
