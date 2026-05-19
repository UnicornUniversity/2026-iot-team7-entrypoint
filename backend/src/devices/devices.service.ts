import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { UpdateDeviceDto } from './dto/updateDevice.dto';

@Injectable()
export class DevicesService {
    constructor(private supabase: SupabaseService) {}

    async getAllDevices() {
        const { data, error } = await this.supabase.getClient().from('devices').select('*');
        if (error) throw error;
        return data;
    }

    async createDevice(dto: CreateDeviceDto) {
        const device = {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.location !== undefined ? { location: dto.location } : {}),
            ...(dto.status !== undefined ? { status: dto.status } : {}),
            ...(dto.lastSeen !== undefined ? { last_seen: dto.lastSeen } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            device_uid: dto.deviceUid,
        };

        const { data, error } = await this.supabase.getClient().from('devices').insert(device).select().single();

        if (error) throw new BadRequestException(error.message);

        return data;
    }

    async getDeviceById(id: string) {
        const { data, error } = await this.supabase.getClient().from('devices').select('*').eq('id', id).single();

        if (error) throw new NotFoundException(`Device with ID: ${id} was not found`);
        if (!data) throw new NotFoundException(`Device with ID: ${id} was not found`);

        return data;
    }

    async updateDevice(id: string, dto: UpdateDeviceDto) {
        const update = {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.location !== undefined ? { location: dto.location } : {}),
            ...(dto.status !== undefined ? { status: dto.status } : {}),
            ...(dto.lastSeen !== undefined ? { last_seen: dto.lastSeen } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.deviceUid !== undefined ? { device_uid: dto.deviceUid } : {}),
        };

        const { data, error } = await this.supabase
            .getClient()
            .from('devices')
            .update(update)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new NotFoundException(`Device with ID: ${id} was not found`);
        return data;
    }

    async deleteDevice(id: string) {
        const { data, error } = await this.supabase.getClient().from('devices').delete().eq('id', id).select().single();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new NotFoundException(`Device with ID: ${id} was not found`);
        return data;
    }
}
