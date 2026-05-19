import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { UpdateDeviceDto } from './dto/updateDevice.dto';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('api/v1/devices')
export class DevicesController {
    constructor(private deviceService: DevicesService) {}

    @ApiOperation({ summary: 'List devices' })
    @ApiResponse({
        status: 200,
        example: [
            {
                id: '550e8400-e29b-41d4-a716-446655440010',
                name: 'Main entrance reader',
                status: 'offline',
                device_uid: 'reader-main-entrance-01',
            },
        ],
    })
    @Get()
    getAllDevices() {
        return this.deviceService.getAllDevices();
    }

    @ApiOperation({ summary: 'Create a device' })
    @ApiBody({ type: CreateDeviceDto })
    @Post()
    createDevice(@Body() dto: CreateDeviceDto) {
        return this.deviceService.createDevice(dto);
    }

    @ApiOperation({ summary: 'Get device by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440010' })
    @Get(':id')
    getDeviceById(@Param('id') id: string) {
        return this.deviceService.getDeviceById(id);
    }

    @ApiOperation({ summary: 'Update device by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440010' })
    @ApiBody({ type: UpdateDeviceDto })
    @Patch(':id')
    updateDevice(@Param('id') id: string, @Body() dto: UpdateDeviceDto) {
        return this.deviceService.updateDevice(id, dto);
    }

    @ApiOperation({ summary: 'Delete device by ID' })
    @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440010' })
    @Delete(':id')
    deleteDevice(@Param('id') id: string) {
        return this.deviceService.deleteDevice(id);
    }
}
