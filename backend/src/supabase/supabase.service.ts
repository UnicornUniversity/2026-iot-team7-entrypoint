import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private client: SupabaseClient;
    constructor(private config: ConfigService) {
        const supabaseUrl = this.config.get<string>('SUPABASE_URL');
        const supabaseKey = this.config.get<string>('SUPABASE_KEY');

        if (!supabaseUrl || !supabaseKey)
            throw new Error(
                'Missing SUPABASE_URL or SUPABASE_KEY in .env file',
            );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.client = createClient(supabaseUrl, supabaseKey);
    }
    getClient(): SupabaseClient {
        return this.client;
    }
}
