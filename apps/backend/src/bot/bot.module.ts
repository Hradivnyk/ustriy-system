import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

import type { AppEnv } from '../config/env.schema';
import { DormitoriesModule } from '../dormitories/dormitory.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { ResidentsModule } from '../residents/residents.module';
import { AccountRecoveryWizard } from './account-recovery/account-recovery.wizard';
import { BotUpdate } from './bot.update';
import { MainMenuWizard } from './main-menu/main-menu.wizard';
import { OnboardingWizard } from './onboarding/onboarding.wizard';
import { RegistrationService } from './registration/registration.service';
import { RegistrationWizard } from './registration/registration.wizard';
import { VerifyEmailWizard } from './verify-email/verify-email.wizard';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        token: config.get('TELEGRAM_BOT_TOKEN', { infer: true }) ?? '',
        middlewares: [session()],
      }),
    }),
    ResidentsModule,
    DormitoriesModule,
    EmailVerificationModule,
  ],
  providers: [
    BotUpdate,
    MainMenuWizard,
    OnboardingWizard,
    AccountRecoveryWizard,
    RegistrationWizard,
    RegistrationService,
    VerifyEmailWizard,
  ],
})
export class BotModule {}
