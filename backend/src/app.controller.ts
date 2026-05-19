import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiOperation({ summary: 'Health check heartbeat' })
    @ApiResponse({
        status: 200,
        example: {
            status: 'ok',
            uptime: 42.5,
            timestamp: '2026-05-20T10:30:00.000Z',
        },
    })
    @Get('api/v1/health')
    getHealth() {
        return this.appService.getHealth();
    }
}
