import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async findAll(query: { limit?: number; offset?: number } = {}): Promise<{ data: User[]; total: number }> {
    const { limit = 10, offset = 0 } = query;
    const [data, total] = await this.usersRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { lastName: 'ASC' },
    });
    return { data, total };
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
      select: ['id', 'username', 'hashedPassword', 'role', 'firstName', 'lastName', 'isActive'], // Include isActive for auth
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

  async verifyAndChangePassword(id: string, currentPass: string, newPass: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'hashedPassword'], // Need hash for comparison
    });
    
    if (!user || !(await bcrypt.compare(currentPass, user.hashedPassword))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await this.usersRepository.update(id, { hashedPassword: hashedNewPassword });
  }

  async remove(id: string, deleterId: string): Promise<void> {
    if (id === deleterId) {
      throw new ConflictException('You cannot delete your own account');
    }
    const user = await this.findOne(id);
    const deleter = await this.findOne(deleterId);
    user.updatedBy = deleter;
    await this.usersRepository.save(user);
    await this.usersRepository.softRemove(user);
  }
}
