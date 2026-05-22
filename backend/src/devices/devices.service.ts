import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { UpdateDeviceDto } from './dto/updateDevice.dto';
import { DeviceStatus } from './enums/deviceStatus.enum';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DevicesService {
    constructor(
        private supabase: SupabaseService,
        private configService: ConfigService
    ) {}

    private getHeartbeatThresholdMs(): number {
        return this.configService.get<number>('DEVICE_HEARTBEAT_THRESHOLD_MS') || 5 * 60 * 1000;
    }

    getDeviceStatus(device: any): DeviceStatus.ONLINE | DeviceStatus.OFFLINE {
        if (!device?.last_seen) return DeviceStatus.OFFLINE;

        const lastSeenTime = new Date(device.last_seen).getTime();
        const now = Date.now();
        const thresholdMs = this.getHeartbeatThresholdMs();

        return now - lastSeenTime < thresholdMs ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;
    }

    getDeviceStatusWithDetails(device: any) {
        if (!device?.last_seen) {
            return {
                status: DeviceStatus.OFFLINE,
                lastSeen: null,
                offlineForMinutes: null,
                isOffline: true,
            };
        }

        const lastSeenTime = new Date(device.last_seen).getTime();
        const now = Date.now();
        const diffMs = now - lastSeenTime;
        const diffMinutes = Math.floor(diffMs / 60000);

        const isOnline = diffMs < this.getHeartbeatThresholdMs();

        return {
            status: isOnline ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE,
            lastSeen: device.last_seen,
            offlineForMinutes: isOnline ? 0 : diffMinutes,
            isOffline: !isOnline,
        };
    }

    async getAllDevices() {
        const { data, error } = await this.supabase.getClient().from('devices').select('*');
        if (error) throw error;
        return data.map((device) => ({
            ...device,
            computedStatus: this.getDeviceStatusWithDetails(device),
        }));
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

        return {
            ...data,
            computedStatus: this.getDeviceStatusWithDetails(data),
        };
    }

    async getDeviceByUid(uid: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('devices')
            .select('*')
            .eq('device_uid', uid)
            .single();

        if (error) throw new NotFoundException(`Device with UID: ${uid} was not found`);
        if (!data) throw new NotFoundException(`Device with UID: ${uid} was not found`);

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

    async updateLastSeen(deviceId: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('devices')
            .update({
                last_seen: new Date().toISOString(),
                status: DeviceStatus.ONLINE,
            })
            .eq('id', deviceId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async heartbeat(deviceUid: string) {
        const device = await this.getDeviceByUid(deviceUid);

        if (!device) {
            throw new NotFoundException('Device not registered');
        }

        await this.updateLastSeen(device.id);

        return {
            statusCode: 200,
            status: 'ok',
            message: 'Heartbeat received',
            serverTime: new Date().toISOString(),
        };
    }

    async deleteDevice(id: string) {
        const { data, error } = await this.supabase.getClient().from('devices').delete().eq('id', id).select().single();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new NotFoundException(`Device with ID: ${id} was not found`);
        return data;
    }
}
