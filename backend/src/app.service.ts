import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UserRole } from './users/user.entity';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const adminUsername = this.configService.get<string>('INITIAL_ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('INITIAL_ADMIN_PASSWORD');

    if (adminUsername && adminPassword) {
      const admin = await this.usersService.findByUsername(adminUsername);
      if (!admin) {
        await this.usersService.create({
          username: adminUsername,
          hashedPassword: adminPassword,
          firstName: 'System',
          lastName: 'Admin',
          role: UserRole.ADMIN,
        });
        console.log(`ADMIN USER CREATED: ${adminUsername}`);
      }
    }
  }

  getHello(): string {
    return 'Attendance System API';
  }
}
