import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export class CreateAccessLogDto {
    card_uid: string;
    device_id: string;
    direction: 'in' | 'out';
    timestamp: string;
}

@Injectable()
export class AttendanceService {
    constructor(private supabase: SupabaseService) {}
    async getAllAttendances() {
        const { data, error } = await this.supabase
            .getClient()
            .from('access_logs')
            .select('*');
        if (error) throw error;
        return data;
    }

    async getUserAttendance(userId: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('access_logs')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    }

    async logAttendance(dto: CreateAccessLogDto) {
        const { data: card, error: cardError } = await this.supabase
            .getClient()
            .from('cards')
            .select('*, users(*)')
            .eq('card_uid', dto.card_uid)
            .eq('is_active', true)
            .single();

        if (cardError || !card) {
            await this.supabase
                .getClient()
                .from('access_logs')
                .insert([
                    {
                        user_id: null,
                        device_id: dto.device_id,
                        timestamp: dto.timestamp,
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
                    device_id: dto.device_id,
                    timestamp: dto.timestamp,
                    direction: dto.direction,
                    success: true,
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
