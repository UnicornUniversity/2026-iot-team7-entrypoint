import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({ example: 'Jane' })
    name: string;

    @ApiProperty({ example: 'Doe' })
    surname: string;

    @ApiProperty({ example: 'jane.doe' })
    username: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020' })
    roleId: string;

    @ApiProperty({ example: 'jane.doe@example.com' })
    email: string;

    @ApiProperty({ example: true })
    isActive: boolean;
}
