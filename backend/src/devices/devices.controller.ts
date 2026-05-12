import { Controller, Get, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { MtlsMiddleware, MtlsRequest } from "../mtls.middleware";

@UseGuards(MtlsMiddleware)
@Controller('api/v1/devices')
export class DevicesController {
    constructor(private deviceService: DevicesService) {}

    @Get()
    getAllDevices() {
        return this.deviceService.getAllDevices();
    }
}
