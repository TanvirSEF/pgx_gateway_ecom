// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { GlobalUserLinkModule } from '../global-user-link/global-user-link.module';
import { SettingsModule } from '../settings/settings.module';
import { WalletServiceClientModule } from '../wallet-service-client/wallet-service-client.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [AuthModule, SettingsModule, GlobalUserLinkModule, WalletServiceClientModule],
  controllers: [WalletController],
  providers: [WalletService, SupabaseAuthGuard],
  exports: [WalletService],
})
export class WalletModule {}
