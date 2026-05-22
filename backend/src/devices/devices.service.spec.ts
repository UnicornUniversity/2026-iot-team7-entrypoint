import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { DevicesService } from './devices.service';

describe('DevicesService', () => {
    let service: DevicesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DevicesService, { provide: SupabaseService, useValue: {} }],
        }).compile();

        service = module.get<DevicesService>(DevicesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
