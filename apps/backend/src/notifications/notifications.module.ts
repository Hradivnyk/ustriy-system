import { Module } from '@nestjs/common';

import { BotNotificationsService } from './bot-notifications.service';

@Module({
  providers: [BotNotificationsService],
  exports: [BotNotificationsService],
})
export class NotificationsModule {}
