import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { BatchEventDto, BatchSyncDto } from './dto/batchSync.dto';
import { CreateAccessLogDto } from './dto/createAccessLog.dto';
import { UpdateAccessLogDto } from './dto/updateAccessLog.dto';
import { Direction } from './enums/direction.enum';

@Injectable()
export class AttendanceService {
    constructor(private supabase: SupabaseService) {}

    async getAllAttendances() {
        const { data, error } = await this.supabase.getClient().from('access_logs').select('*');

        if (error) throw error;

        return data;
    }

    async getAttendanceById(id: string) {
        const { data, error } = await this.supabase.getClient().from('access_logs').select('*').eq('id', id).single();

        if (error) throw new NotFoundException(`Attendance log with ID: ${id} was not found`);
        if (!data) throw new NotFoundException(`Attendance log with ID: ${id} was not found`);

        return data;
    }

    async getUserAttendance(userId: string) {
        const { data, error } = await this.supabase.getClient().from('access_logs').select('*').eq('user_id', userId);

        if (error) throw error;

        return data;
    }

    async logAttendance(dto: CreateAccessLogDto) {
        const device = await this.getDevice(
            { deviceId: dto.deviceId, deviceUid: dto.deviceUid },
            { requireOnline: true }
        );
        const card = await this.getActiveCardWithUser(dto.cardUid, { includeUserProfile: true });

        if (!card) {
            await this.insertAccessLog(this.createAccessLogInsert(device.id, null, dto.direction, dto.timestamp));
            throw new NotFoundException('Card was not found or is not active');
        }

        const data = await this.insertAccessLog(
            this.createAccessLogInsert(device.id, card.user_id, dto.direction, dto.timestamp),
            { returnCreated: true }
        );
        const user = this.getCardUser(card);

        return {
            ...data,
            name: user?.name,
            surname: user?.surname,
            username: user?.username,
        };
    }

    async batchSync(dto: BatchSyncDto, mtlsDeviceUid?: string) {
        if (!Array.isArray(dto.events)) throw new BadRequestException('events must be an array');

        const device = await this.getDevice({ deviceUid: dto.deviceUid ?? mtlsDeviceUid });
        let processed = 0;
        const failed: { index: number; cardUid?: string; reason: string }[] = [];

        for (const [index, event] of dto.events.entries()) {
            try {
                const card = await this.getActiveCardWithUser(event.cardUid);
                const user = this.getCardUser(card);

                if (user?.is_active === false) {
                    failed.push({ index, cardUid: event.cardUid, reason: 'Owner of card is not active' });
                    continue;
                }

                await this.insertAccessLog(
                    this.createAccessLogInsert(
                        device.id,
                        card?.user_id ?? null,
                        this.mapBatchEventDirection(event),
                        event.timestamp
                    )
                );
                processed++;
            } catch (error) {
                failed.push({ index, cardUid: event?.cardUid, reason: this.getBatchFailureReason(error) });
            }
        }

        return { status: 'OK', processed, failed: failed.length, errors: failed };
    }

    async updateAttendance(id: string, dto: UpdateAccessLogDto) {
        const update = {
            ...(dto.userId !== undefined ? { user_id: dto.userId } : {}),
            ...(dto.deviceId !== undefined ? { device_id: dto.deviceId } : {}),
            ...(dto.direction !== undefined ? { direction: dto.direction } : {}),
            ...(dto.timestamp !== undefined ? { timestamp: dto.timestamp } : {}),
            ...(dto.success !== undefined ? { success: dto.success } : {}),
            ...(dto.updatedAt !== undefined ? { updated_at: dto.updatedAt } : {}),
            ...(dto.updatedBy !== undefined ? { updated_by: dto.updatedBy } : {}),
        };

        const { data, error } = await this.supabase
            .getClient()
            .from('access_logs')
            .update(update)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new NotFoundException(`Attendance log with ID: ${id} was not found`);

        return data;
    }

    async deleteAttendance(id: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('access_logs')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new NotFoundException(`Attendance log with ID: ${id} was not found`);

        return data;
    }

    private async getDevice(lookup: DeviceLookup, options: { requireOnline?: boolean } = {}) {
        if (!lookup.deviceUid && !lookup.deviceId) {
            throw new BadRequestException('Request must contain deviceUid, deviceId, or use mTLS authentication');
        }

        const { data, error } = await this.supabase
            .getClient()
            .from('devices')
            .select('*')
            .eq(lookup.deviceUid ? 'device_uid' : 'id', lookup.deviceUid ?? lookup.deviceId)
            .single();

        if (error || !data) {
            if (error?.code === 'PGRST116')
                throw new NotFoundException('Gateway was not found or was not registered yet');
            throw error;
        }

        if (options.requireOnline && data.status !== 'online')
            throw new ServiceUnavailableException('Device is not online');

        return data;
    }

    private async getActiveCardWithUser(cardUid: string, options: { includeUserProfile?: boolean } = {}) {
        const userFields = options.includeUserProfile ? 'id,is_active,name,surname,username' : 'id,is_active';
        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .select(`user_id, users(${userFields})`)
            .eq('card_uid', cardUid)
            .eq('is_active', true)
            .maybeSingle();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    private async insertAccessLog(accessLog: AccessLogInsert, options?: { returnCreated?: false }): Promise<void>;
    private async insertAccessLog(accessLog: AccessLogInsert, options: { returnCreated: true }): Promise<any>;
    private async insertAccessLog(accessLog: AccessLogInsert, options: { returnCreated?: boolean } = {}) {
        let query = this.supabase.getClient().from('access_logs').insert([accessLog]);

        if (options.returnCreated) {
            const { data, error } = await query.select().single();
            if (error) throw new BadRequestException(error.message);
            return data;
        }

        const { error } = await query;
        if (error) throw new BadRequestException(error.message);
    }

    private createAccessLogInsert(
        deviceId: string,
        userId: string | null,
        direction: Direction,
        timestamp?: string
    ): AccessLogInsert {
        return {
            user_id: userId,
            device_id: deviceId,
            ...(timestamp !== undefined ? { timestamp } : {}),
            direction,
            success: Boolean(userId),
        };
    }

    private getCardUser(card: any) {
        if (!card?.users) return null;
        return Array.isArray(card.users) ? card.users[0] : card.users;
    }

    private mapBatchEventDirection(event: BatchEventDto) {
        return event.event.toLowerCase() === Direction.IN ? Direction.IN : Direction.OUT;
    }

    private getBatchFailureReason(error: unknown) {
        if (error instanceof Error) return error.message;
        return 'Unknown batch event error';
    }
}

type DeviceLookup = {
    deviceId?: string;
    deviceUid?: string;
};

type AccessLogInsert = {
    user_id: string | null;
    device_id: string;
    timestamp?: string;
    direction: Direction;
    success: boolean;
};