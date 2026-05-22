import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
    constructor(private supabase: SupabaseService) {}

    async getAllUsers() {
        const { data, error } = await this.supabase.getClient().from('users').select('*');

        if (error) throw error;

        return data;
    }

    async createUser(dto: CreateUserDto) {
        const { data, error } = await this.supabase
            .getClient()
            .from('users')
            .insert({
                name: dto.name,
                surname: dto.surname,
                username: dto.username,
                role_id: dto.roleId,
                email: dto.email,
                is_active: dto.isActive ?? true,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        return data;
    }

    async getUserById(id: string) {
        const { data, error } = await this.supabase.getClient().from('users').select('*').eq('id', id).single();

        if (error) throw error;
        if (!data) throw new NotFoundException(`User with ID: ${id} was not found`);

        return data;
    }

    async getUserByCardUid(cardUid: string) {
        const { data, error } = await this.supabase
            .getClient()
            .from('cards')
            .select(` *,users (*)`)
            .eq('card_uid', cardUid)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        if (!data) throw new NotFoundException(`Card ${cardUid} was not found`);

        return data.users;
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        const update = {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.surname !== undefined ? { surname: dto.surname } : {}),
            ...(dto.username !== undefined ? { username: dto.username } : {}),
            ...(dto.roleId !== undefined ? { role_id: dto.roleId } : {}),
            ...(dto.email !== undefined ? { email: dto.email } : {}),
            ...(dto.isActive !== undefined ? { is_active: dto.isActive } : {}),
        };

        const { data, error } = await this.supabase
            .getClient()
            .from('users')
            .update(update)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new NotFoundException(`User with ID: ${id} was not found`);

        return data;
    }

    async deleteUser(id: string) {
        const { data, error } = await this.supabase.getClient().from('users').delete().eq('id', id).select().single();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new NotFoundException(`User with ID: ${id} was not found`);

        return data;
    }
}
