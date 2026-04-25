import { Controller, Get } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('api/v1/devices')
export class DevicesController {
    constructor(private deviceService: DevicesService) {}
    @Get()
    getAllDevices() {
        return this.deviceService.getAllDevices();
    }
}
