import {
  Body,
  Controller,
  Get,
  Header,
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

  @Get('pay')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Referrer-Policy', 'no-referrer')
  @ApiOperation({ summary: 'Anonymized payment relay page that strips merchant origin and redirects to Stripe Checkout' })
  handlePay(@Query('s') encodedUrl: string) {
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

    return `<!DOCTYPE html>
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
</html>`;
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
