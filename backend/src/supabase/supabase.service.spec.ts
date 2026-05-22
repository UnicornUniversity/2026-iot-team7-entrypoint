import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
    let service: SupabaseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SupabaseService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) => (key === 'SUPABASE_URL' ? 'https://example.supabase.co' : 'test-key'),
                    },
                },
            ],
        }).compile();

        service = module.get<SupabaseService>(SupabaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
