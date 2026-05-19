import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: 'List users' })
    @ApiResponse({
        status: 200,
        example: [{ id: '550e8400-e29b-41d4-a716-446655440001', name: 'Jane', surname: 'Doe', is_active: true }],
    })
    @Get()
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @ApiOperation({ summary: 'Create a user' })
    @ApiBody({ type: CreateUserDto })
    @Post()
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    @ApiOperation({ summary: 'Get active user by card UID' })
    @ApiParam({ name: 'cardUid', example: '04A1B2C3D4' })
    @Get('card/:cardUid')
    getUserByCardId(@Param('cardUid') cardUid: string) {
        return this.usersService.getUserByCardUid(cardUid);
    }

    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440001' })
    @Get(':id')
    getUserById(@Param('id') id: string) {
        return this.usersService.getUserById(id);
    }

    @ApiOperation({ summary: 'Update user by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440001' })
    @ApiBody({ type: UpdateUserDto })
    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(id, dto);
    }

    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440001' })
    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
