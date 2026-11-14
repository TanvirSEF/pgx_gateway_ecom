import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InitiateGatewayCheckoutDto } from './dto/initiate-gateway-checkout.dto';
import { GatewayBridgeGuard } from './gateway-bridge.guard';
import { GatewayBridgeService } from './gateway-bridge.service';

@ApiTags('Gateway Bridge')
@Controller('gateway-bridge')
export class GatewayBridgeController {
  constructor(private readonly gatewayBridgeService: GatewayBridgeService) {}

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GatewayBridgeGuard)
  @ApiOperation({ summary: 'Initiate a Stripe Checkout session on behalf of PGX Gateway merchant' })
  @ApiHeader({ name: 'x-gateway-bridge-secret', description: 'Shared gateway bridge secret' })
  @ApiResponse({ status: 200, description: 'Stripe Checkout session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload or Stripe initialization failure' })
  @ApiResponse({ status: 401, description: 'Unauthorized / invalid bridge secret' })
  async initiateCheckout(@Body() dto: InitiateGatewayCheckoutDto) {
    return this.gatewayBridgeService.initiateCheckout(dto);
  }
}
