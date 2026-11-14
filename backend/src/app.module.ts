import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { BannersModule } from './modules/banners/banners.module';
import { BlogModule } from './modules/blog/blog.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ContactModule } from './modules/contact/contact.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { MailModule } from './modules/mail/mail.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { WalletBridgeModule } from './modules/wallet-bridge/wallet-bridge.module';
import { GatewayBridgeModule } from './modules/gateway-bridge/gateway-bridge.module';
import { WalletTopupModule } from './modules/wallet-topup/wallet-topup.module';
import { CasinoTopupModule } from './modules/casino-topup/casino-topup.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }), // 100 requests per minute from the same IP
    PrismaModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    ContactModule,
    OrdersModule,
    CouponsModule,
    ShippingModule,
    BlogModule,
    UploadModule,
    MailModule,
    BannersModule,
    AnalyticsModule,
    SettingsModule,
    WalletModule,
    WalletBridgeModule,
    GatewayBridgeModule,
    WalletTopupModule,
    CasinoTopupModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
