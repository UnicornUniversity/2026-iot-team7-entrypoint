import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
    let service: AttendanceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AttendanceService, { provide: SupabaseService, useValue: {} }],
        }).compile();

        service = module.get<AttendanceService>(AttendanceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
