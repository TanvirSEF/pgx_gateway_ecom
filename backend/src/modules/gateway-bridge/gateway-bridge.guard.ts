import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GatewayBridgeGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const configuredSecret = this.configService.get<string>('GATEWAY_BRIDGE_SECRET');

    // If no secret configured in environment, disallow access to prevent unauthorized checkout creation
    if (!configuredSecret || configuredSecret.trim().length === 0) {
      throw new UnauthorizedException('Gateway bridge authentication is not configured on this server.');
    }

    const headerSecret =
      request.headers['x-gateway-bridge-secret'] ||
      (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')
        ? request.headers.authorization.slice(7)
        : null);

    if (!headerSecret || headerSecret.trim() !== configuredSecret.trim()) {
      throw new UnauthorizedException('Invalid or missing gateway bridge secret.');
    }

    return true;
  }
}
