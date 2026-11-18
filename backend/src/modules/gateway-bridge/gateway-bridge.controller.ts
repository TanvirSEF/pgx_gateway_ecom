import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
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

  @Get('return')
  @Redirect('https://pgxmarketplace.shop', 302)
  @ApiOperation({ summary: 'Cloaked redirect return handler forwarding buyer back to merchant store' })
  handleReturn(
    @Query('status') _status: string,
    @Query('session_id') sessionId: string,
    @Query('redir') encodedRedir: string,
  ) {
    let targetUrl = 'https://pgxmarketplace.shop';
    if (encodedRedir) {
      try {
        const decoded = Buffer.from(encodedRedir, 'base64url').toString('utf-8');
        if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
          targetUrl = decoded;
          if (sessionId && targetUrl.includes('{CHECKOUT_SESSION_ID}')) {
            targetUrl = targetUrl.replace('{CHECKOUT_SESSION_ID}', encodeURIComponent(sessionId));
          } else if (sessionId && !targetUrl.includes('session_id=')) {
            const separator = targetUrl.includes('?') ? '&' : '?';
            targetUrl = `${targetUrl}${separator}session_id=${encodeURIComponent(sessionId)}`;
          }
        }
      } catch {
        // Fallback to pgxdigital.shop
      }
    }
    return { url: targetUrl };
  }
}
