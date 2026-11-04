// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
//
// A DEDICATED route, separate from /webhook/stripe (webhook.controller.ts,
// the existing e-commerce path) - see casino-topup-webhook.service.ts's
// header for why. `rawBody: true` is already set globally in main.ts, so
// req.rawBody is available here with no extra plumbing.
import { Controller, Headers, HttpCode, HttpStatus, Logger, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CasinoTopupWebhookService } from './casino-topup-webhook.service';

@ApiTags('Casino Wallet Top-up')
@Controller('webhook')
export class CasinoTopupWebhookController {
  // Diagnostic only - the signature itself and the raw body are never
  // logged here; CasinoTopupWebhookService already logs the verified
  // event id/type and the credit outcome once the signature checks out.
  private readonly logger = new Logger(CasinoTopupWebhookController.name);

  constructor(private readonly webhookService: CasinoTopupWebhookService) {}

  @Post('casino-stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook for the PGX Casino shared-wallet top-up flow' })
  @ApiResponse({ status: 200, description: 'Webhook received and processed' })
  @ApiResponse({ status: 400, description: 'Invalid signature, payload, or not configured' })
  async handle(@Headers('stripe-signature') signature: string, @Req() req: RawBodyRequest<Request>) {
    this.logger.log(`POST /webhook/casino-stripe received (signature present: ${Boolean(signature)})`);
    const rawBody = req.rawBody || Buffer.from('');
    return this.webhookService.handleWebhook(signature, rawBody);
  }
}
