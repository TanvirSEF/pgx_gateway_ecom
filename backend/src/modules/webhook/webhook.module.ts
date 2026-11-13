import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { SettingsModule } from '../settings/settings.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [SettingsModule, MailModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
