import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAccessLogDto } from './dto/createAccessLog.dto';
import { UpdateAccessLogDto } from './dto/updateAccessLog.dto';

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
        const { data: card, error: cardError } = await this.supabase
            .getClient()
            .from('cards')
            .select('*, users(*)')
            .eq('card_uid', dto.cardUid)
            .eq('is_active', true)
            .single();

        if (cardError || !card) {
            await this.supabase
                .getClient()
                .from('access_logs')
                .insert([
                    {
                        user_id: null,
                        device_id: dto.deviceId,
                        ...(dto.timestamp !== undefined ? { timestamp: dto.timestamp } : {}),
                        direction: dto.direction,
                        success: false,
                    },
                ]);

            throw new NotFoundException('Card was not found or is not active');
        }

        const { data, error } = await this.supabase
            .getClient()
            .from('access_logs')
            .insert([
                {
                    user_id: card.user_id,
                    device_id: dto.deviceId,
                    ...(dto.timestamp !== undefined ? { timestamp: dto.timestamp } : {}),
                    direction: dto.direction,
                    success: true,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return data;
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
}
