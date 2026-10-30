// Implements: Phase 2 - PGXSports Shared Wallet Integration
import { Module } from '@nestjs/common';
import { GlobalUserLinkService } from './global-user-link.service';

@Module({
  providers: [GlobalUserLinkService],
  exports: [GlobalUserLinkService],
})
export class GlobalUserLinkModule {}
