import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('card/:cardUid')
  getUserByCardId(@Param('cardUid') cardUid: string) {
    return this.usersService.getUserByCardUid(cardUid);
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}
