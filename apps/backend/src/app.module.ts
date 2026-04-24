import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { BotModule } from './bot/bot.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, TicketsModule, BotModule],
})
export class AppModule {}
