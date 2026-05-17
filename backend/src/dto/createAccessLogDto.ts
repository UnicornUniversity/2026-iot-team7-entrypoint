import { IsString, IsNotEmpty, IsIn, IsISO8601 } from 'class-validator';

export class CreateAccessLogDto {
    @IsString()
    @IsNotEmpty({ message: 'card_uid is required' })
    card_uid: string;

    @IsString()
    @IsNotEmpty({ message: 'device_id is required' })
    device_id: string;

    @IsIn(['in', 'out'], { message: 'direction must be either "in" or "out"' })
    direction: 'in' | 'out';

    // @ts-ignore
    @IsISO8601({ message: 'timestamp must be valid ISO 8601 date' })
    timestamp: string;
}