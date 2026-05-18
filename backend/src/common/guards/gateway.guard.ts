import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { DevicesService } from '../../devices/devices.service';

@Injectable()
export class GatewayGuard implements CanActivate {
  constructor(private devicesService: DevicesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const gatewayKey = request.body.gateway_key;

    if (!gatewayKey) {
      throw new UnauthorizedException('Gateway key is missing');
    }

    const device = await this.devicesService.findByKey(gatewayKey);
    if (!device) {
      throw new UnauthorizedException('Unauthorized Gateway');
    }

    request.gateway = device;
    return true;
  }
}
