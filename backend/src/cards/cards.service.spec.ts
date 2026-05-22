import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { CardsService } from './cards.service';

describe('CardsService', () => {
    let service: CardsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CardsService, { provide: SupabaseService, useValue: {} }],
        }).compile();

        service = module.get<CardsService>(CardsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
