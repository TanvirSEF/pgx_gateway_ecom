import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { GatewayBridgeController } from './gateway-bridge.controller';
import { GatewayBridgeGuard } from './gateway-bridge.guard';
import { GatewayBridgeService } from './gateway-bridge.service';

@Module({
  imports: [SettingsModule],
  controllers: [GatewayBridgeController],
  providers: [GatewayBridgeService, GatewayBridgeGuard],
  exports: [GatewayBridgeService],
})
export class GatewayBridgeModule {}
