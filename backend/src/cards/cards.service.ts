import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCardDto } from './dto/createCard.dto';
import { UpdateCardDto } from './dto/updateCard.dto';

@Injectable()
export class CardsService {
    constructor(private supabase: SupabaseService) {}

    async getAllCards() {
        const { data, error } = await this.supabase.getClient().from('cards').select('*');

        if (error) throw error;

        return data;
    }

    async createCard(dto: CreateCardDto) {
        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .insert({
                user_id: dto.userId,
                card_uid: dto.cardUid,
                is_active: dto.isActive,
            })
            .select()
            .single();

        if (error) {
            throw new HttpException(error.message, 400);
        }

        return data;
    }

    async getCardByUid(cardUid: string) {
        const { data, error } = await this.supabase.getClient().from('cards').select('*').eq('card_uid', cardUid);

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

    async updateCard(cardUid: string, dto: UpdateCardDto) {
        const update = {
            ...(dto.cardUid !== undefined ? { card_uid: dto.cardUid } : {}),
            ...(dto.userId !== undefined ? { user_id: dto.userId } : {}),
            ...(dto.isActive !== undefined ? { is_active: dto.isActive } : {}),
        };

        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .update(update)
            .eq('card_uid', cardUid)
            .select()
            .single();

        if (error) throw new HttpException(error.message, 400);
        if (!data) throw new NotFoundException(`Card ${cardUid} was not found`);

        return data;
    }

    async deleteCard(cardUid: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .delete()
            .eq('card_uid', cardUid)
            .select()
            .single();

        if (error) throw new HttpException(error.message, 400);
        if (!data) throw new NotFoundException(`Card ${cardUid} was not found`);

        return data;
    }
}
