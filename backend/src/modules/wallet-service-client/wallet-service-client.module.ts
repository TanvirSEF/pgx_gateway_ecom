// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { Module } from '@nestjs/common';
import { WalletServiceClientService } from './wallet-service-client.service';

@Module({
  providers: [WalletServiceClientService],
  exports: [WalletServiceClientService],
})
export class WalletServiceClientModule {}
