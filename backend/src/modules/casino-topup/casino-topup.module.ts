// Implements: Phase 2/3 - PGX Casino + PGXSports shared-wallet Stripe top-up
import { Module } from '@nestjs/common';
import { WalletServiceClientModule } from '../wallet-service-client/wallet-service-client.module';
import { WalletTopupModule } from '../wallet-topup/wallet-topup.module';
import { CasinoTopupStripeConfig } from './casino-topup-stripe.config';
import { CasinoTopupService } from './casino-topup.service';
import { CasinoTopupWebhookService } from './casino-topup-webhook.service';
import { CasinoTopupWebhookController } from './casino-topup-webhook.controller';
import { CasinoTopupRecoveryService } from './casino-topup-recovery.service';
import { CasinoTopupStatusController } from './casino-topup-status.controller';
import { CasinoTopupStatusService } from './casino-topup-status.service';

@Module({
  imports: [WalletServiceClientModule, WalletTopupModule],
  controllers: [CasinoTopupWebhookController, CasinoTopupStatusController],
  providers: [
    CasinoTopupStripeConfig,
    CasinoTopupService,
    CasinoTopupWebhookService,
    CasinoTopupRecoveryService,
    CasinoTopupStatusService,
  ],
  exports: [CasinoTopupStripeConfig, CasinoTopupService, CasinoTopupWebhookService, CasinoTopupRecoveryService],
})
export class CasinoTopupModule {}
