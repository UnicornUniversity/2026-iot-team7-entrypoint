import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
    constructor(private supabase: SupabaseService) {}
    async getAllUsers() {
        const { data, error } = await this.supabase
            .getClient()
            .from('users')
            .select('*');
        if (error) throw error;
        return data;
    }

    async getUserById(id: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data)
            throw new NotFoundException(`User with ID: ${id} was not found`);
        return data;
    }

    async getUserByCardUid(cardUid: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .select(
                `
        *,
        users (*)`,
            )
            .eq('card_uid', cardUid)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        if (!data) throw new NotFoundException(`Card ${cardUid} was not found`);
        return data.users;
    }
}
