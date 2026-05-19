import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { BotModule } from './bot/bot.module';
import { AppConfigModule } from './config/config.module';
import { createDatabaseConfig } from './config/database.config';
import type { AppEnv } from './config/env.schema';
import { HealthModule } from './modules/health/health.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) =>
        createDatabaseConfig(config),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => [
        {
          ttl: config.get('THROTTLE_TTL', { infer: true }) * 1000,
          limit: config.get('THROTTLE_LIMIT', { infer: true }),
        },
      ],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    BotModule,
  ],
})
export class AppModule {}
