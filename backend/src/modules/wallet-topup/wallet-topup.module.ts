// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { Module } from '@nestjs/common';
import { WalletTopupService } from './topup.service';

@Module({
  providers: [WalletTopupService],
  exports: [WalletTopupService],
})
export class WalletTopupModule {}
