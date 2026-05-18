import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  async create(deviceData: Partial<Device>): Promise<Device> {
    const existing = await this.devicesRepository.findOne({ where: { key: deviceData.key } });
    if (existing) {
      throw new ConflictException('Device key already exists');
    }
    const device = this.devicesRepository.create(deviceData);
    return this.devicesRepository.save(device);
  }

  async findAll(): Promise<Device[]> {
    return this.devicesRepository.find();
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.devicesRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async findByKey(key: string): Promise<Device | null> {
    return this.devicesRepository.findOne({ where: { key } });
  }

  async update(id: string, updateData: Partial<Device>): Promise<Device> {
    const device = await this.findOne(id);
    Object.assign(device, updateData);
    return this.devicesRepository.save(device);
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.devicesRepository.remove(device);
  }
}
