import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CouponsModule } from '../coupons/coupons.module';
import { MailModule } from '../mail/mail.module';
import { SettingsModule } from '../settings/settings.module';
import { WalletModule } from '../wallet/wallet.module';
import { AdminOrdersController, OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [MailModule, CouponsModule, WalletModule, SettingsModule, ConfigModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

