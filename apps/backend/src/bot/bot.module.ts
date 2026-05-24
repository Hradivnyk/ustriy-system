import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

import type { AppEnv } from '../config/env.schema';
import { DormitoriesModule } from '../dormitories/dormitory.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { ResidentsModule } from '../residents/residents.module';
import { TicketsModule } from '../tickets/tickets.module';
import { AccountRecoveryWizard } from './account-recovery/account-recovery.wizard';
import { ActiveTicketsWizard } from './active-tickets/active-tickets.wizard';
import { BotUpdate } from './bot.update';
import { MainMenuWizard } from './main-menu/main-menu.wizard';
import { OnboardingWizard } from './onboarding/onboarding.wizard';
import { ProfileWizard } from './profile/profile.wizard';
import { RegistrationService } from './registration/registration.service';
import { RegistrationWizard } from './registration/registration.wizard';
import { SubmitTicketWizard } from './submit-ticket/submit-ticket.wizard';
import { TicketHistoryWizard } from './ticket-history/ticket-history.wizard';
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
    TicketsModule,
  ],
  providers: [
    BotUpdate,
    ActiveTicketsWizard,
    MainMenuWizard,
    OnboardingWizard,
    AccountRecoveryWizard,
    ProfileWizard,
    RegistrationWizard,
    RegistrationService,
    VerifyEmailWizard,
    SubmitTicketWizard,
    TicketHistoryWizard,
  ],
})
export class BotModule {}
