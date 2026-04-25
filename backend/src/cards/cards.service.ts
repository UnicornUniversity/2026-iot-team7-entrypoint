import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
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

    async getUserByCardUid(cardUid: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .select(` *,users (name,surname,is_active)`)
            .eq('card_uid', cardUid)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code == 'PGRST116') throw new NotFoundException(`Card ${cardUid} was not found or is inactive`);
            throw error;
        }
        if (!data) throw new NotFoundException(`Card ${cardUid} was not found`);
        if (!data.users.is_active) throw new NotFoundException(`Owner of card ${cardUid} is not active`);
        return { name: data.users.name, surname: data.users.surname };
    }
}
