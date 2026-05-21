import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { BotModule } from './bot/bot.module';
import { AppConfigModule } from './config/config.module';
import { createDatabaseConfig } from './config/database.config';
import type { AppEnv } from './config/env.schema';
import { DormitoriesModule } from './dormitories/dormitory.module';
import { EmailModule } from './email/email.module';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { HealthModule } from './modules/health/health.module';
import { ResidentsModule } from './residents/residents.module';
import { StaffModule } from './staff/staff.module';
import { TicketsModule } from './tickets/tickets.module';

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
    ResidentsModule,
    StaffModule,
    DormitoriesModule,
    EmailModule,
    EmailVerificationModule,
    TicketsModule,
    BotModule,
  ],
})
export class AppModule {}
