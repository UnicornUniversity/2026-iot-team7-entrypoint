import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DevicesService {
  constructor(private supabase: SupabaseService) {}
  async getAllDevices() {
    const { data, error } = await this.supabase
      .getClient()
      .from('devices')
      .select('*');
    if (error) throw error;
    return data;
  }
}
