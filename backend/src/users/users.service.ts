import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { username: userData.username } });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.hashedPassword!, 10);
    const user = this.usersRepository.create({
      ...userData,
      hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      select: ['id', 'username', 'hashedPassword', 'role'], // Include hashedPassword for auth
    });
  }

  async findByCardID(cardID: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { cardID } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (updateData.hashedPassword) {
      updateData.hashedPassword = await bcrypt.hash(updateData.hashedPassword, 10);
    }
    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }
}
