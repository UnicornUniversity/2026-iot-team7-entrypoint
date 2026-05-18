import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { DevicesService } from './devices/devices.service';
import { UserRole } from './users/user.entity';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private usersService: UsersService,
    private devicesService: DevicesService,
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

    // Initial Test Users
    const testUsers = [
      { username: 'lukas', firstName: 'Lukáš', lastName: 'Skywalker', cardID: '032226C8' },
      { username: 'john', firstName: 'John', lastName: 'Doe', cardID: 'A620F05F' },
    ];

    for (const u of testUsers) {
      const existing = await this.usersService.findByUsername(u.username);
      if (!existing) {
        await this.usersService.create({
          ...u,
          hashedPassword: 'testpassword',
          role: UserRole.USER,
        });
        console.log(`TEST USER CREATED: ${u.username}`);
      }
    }

    const testDevice = await this.devicesService.findByKey('GWAY-99-SECRET-XYZ');
    if (!testDevice) {
      await this.devicesService.create({
        name: 'Main Entrance',
        location: 'Building A',
        key: 'GWAY-99-SECRET-XYZ',
      });
      console.log('TEST DEVICE CREATED: GWAY-99-SECRET-XYZ');
    }
  }

  getHello(): string {
    return 'Attendance System API';
  }
}
