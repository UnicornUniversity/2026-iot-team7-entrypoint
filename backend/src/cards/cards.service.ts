import { HttpException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CardsService {
    constructor(private supabase: SupabaseService) {}

    async createCard(
        cardUid: string,
        userId: string,
        isActive: boolean
    ) {
        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .insert({
                user_id: userId,
                card_uid: cardUid,
                is_active: isActive,
            })
            .select()
            .single();

        if (error) {
            throw new HttpException(error.message, 400);
        }

        return data;
    }

    async getCardByUid(cardUid: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .select('*')
            .eq('card_uid', cardUid);

        if (error) throw error;

        return data;
    }
}
