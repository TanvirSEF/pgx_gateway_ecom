import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { InitiateGatewayCheckoutDto } from './dto/initiate-gateway-checkout.dto';
import { GatewayBridgeGuard } from './gateway-bridge.guard';
import { GatewayBridgeService } from './gateway-bridge.service';
import { openRedirectUrl } from './redirect-token.helper';

@ApiTags('Gateway Bridge')
@Controller('gateway-bridge')
export class GatewayBridgeController {
  constructor(
    private readonly gatewayBridgeService: GatewayBridgeService,
    private readonly configService: ConfigService,
  ) {}

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

  @Get('session-status/:sessionId')
  @UseGuards(GatewayBridgeGuard)
  @ApiOperation({ summary: 'Retrieve live Stripe status and decline details for a Checkout session' })
  @ApiHeader({ name: 'x-gateway-bridge-secret', description: 'Shared gateway bridge secret' })
  async getSessionStatus(@Param('sessionId') sessionId: string): Promise<Record<string, any>> {
    return this.gatewayBridgeService.getStripeSessionStatus(sessionId);
  }

  @Get('pay')
  @ApiOperation({ summary: 'Anonymized payment relay page that strips merchant origin and redirects to Stripe Checkout' })
  handlePay(@Query('s') encodedUrl: string, @Res() res: Response) {
    let targetStripeUrl = 'https://pgxmarketplace.shop';
    if (encodedUrl) {
      try {
        const decoded = Buffer.from(encodedUrl, 'base64url').toString('utf-8');
        if (decoded.startsWith('https://checkout.stripe.com/')) {
          targetStripeUrl = decoded;
        }
      } catch {
        // Fallback
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Referrer-Policy', 'no-referrer');
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <title>PGX MarketPlace — Secure Checkout</title>
  <style>
    body {
      background-color: #0c0728;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3.5px solid rgba(255,255,255,0.12);
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
    .brand span { color: #8b5cf6; }
    p { font-size: 13px; color: #94a3b8; margin: 0; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div class="brand">PGX <span>MARKETPLACE</span></div>
  <p>Connecting to 256-bit encrypted checkout...</p>
  <script>
    var target = ${JSON.stringify(targetStripeUrl)};
    if (window.top !== window.self) {
      window.top.location.replace(target);
    } else {
      window.location.replace(target);
    }
  </script>
</body>
</html>`);
  }

  @Get('return')
  @ApiOperation({ summary: 'Cloaked redirect return handler forwarding buyer back to merchant store' })
  handleReturn(
    @Query('status') _status: string,
    @Query('session_id') sessionId: string,
    @Query('redir') sealedRedir: string,
    @Res() res: Response,
  ) {
    const defaultDestination = 'https://pgxmarketplace.shop';
    const redirectSecret =
      this.configService.get<string>('GATEWAY_REDIRECT_SECRET') ||
      this.configService.get<string>('GATEWAY_BRIDGE_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      '';

    let targetUrl = openRedirectUrl(sealedRedir, redirectSecret) || defaultDestination;

    if (targetUrl !== defaultDestination) {
      if (sessionId && targetUrl.includes('{CHECKOUT_SESSION_ID}')) {
        targetUrl = targetUrl.replace('{CHECKOUT_SESSION_ID}', encodeURIComponent(sessionId));
      } else if (sessionId && !targetUrl.includes('session_id=')) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        targetUrl = `${targetUrl}${separator}session_id=${encodeURIComponent(sessionId)}`;
      }
    }

    res.setHeader('Referrer-Policy', 'no-referrer');
    return res.redirect(302, targetUrl);
  }
}
