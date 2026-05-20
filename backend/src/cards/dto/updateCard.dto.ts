import { ApiProperty } from '@nestjs/swagger';

export class UpdateCardDto {
    @ApiProperty({ example: '04A1B2C3D4' })
    cardUid: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    userId: string;

    @ApiProperty({ example: true })
    isActive: boolean;
}
