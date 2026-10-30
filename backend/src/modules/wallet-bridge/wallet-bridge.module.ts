// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GlobalUserLinkModule } from '../global-user-link/global-user-link.module';
import { CasinoTopupModule } from '../casino-topup/casino-topup.module';
import { HandoffService } from './handoff.service';
import { WalletBridgeController } from './wallet-bridge.controller';

@Module({
  // AuthModule exports a configured JwtService - reused here ONLY for its
  // sign/verify machinery. HandoffService always passes an EXPLICIT
  // `secret: CASINO_HANDOFF_SECRET` on every verify() call, so AuthModule's
  // own JWT_SECRET default is never actually used for a handoff token -
  // see handoff.service.ts's header comment on why that separation matters.
  imports: [AuthModule, GlobalUserLinkModule, CasinoTopupModule],
  controllers: [WalletBridgeController],
  providers: [HandoffService],
  exports: [HandoffService],
})
export class WalletBridgeModule {}
