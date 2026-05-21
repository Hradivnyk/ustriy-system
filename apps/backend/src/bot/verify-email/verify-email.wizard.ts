import { Injectable } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';

import { EmailVerificationService } from '../../email-verification/email-verification.service';
import { ResidentsService } from '../../residents/residents.service';
import type { BotContext, BotSession } from '../bot.context';

export const VERIFY_EMAIL_SCENE_ID = 'verify-email';

@Wizard(VERIFY_EMAIL_SCENE_ID)
@Injectable()
export class VerifyEmailWizard {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly residentsService: ResidentsService,
  ) {}

  // Step 1 fires on scene enter — message was already sent by BotUpdate, just advance cursor
  @WizardStep(1)
  onEnter(@Ctx() ctx: BotContext): void {
    ctx.wizard.next();
  }

  @WizardStep(2)
  async onCode(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.message || !('text' in ctx.message) || !ctx.message.text.trim()) {
      await ctx.reply('Будь ласка, введіть код з листа.');
      return;
    }

    const session = ctx.session as BotSession;
    const residentId = session.pendingUserId;

    if (!residentId) {
      await ctx.reply('Сесія застаріла. Надішліть /start щоб розпочати знову.');
      await ctx.scene.leave();
      return;
    }

    const result = await this.emailVerificationService.verify(
      residentId,
      ctx.message.text.trim(),
    );

    if (result === 'ok') {
      await this.residentsService.markResidentVerified(residentId);
      delete session.pendingUserId;
      await ctx.reply(
        '✅ Email підтверджено! Ласкаво просимо до системи Ustriy.',
      );
      await ctx.scene.leave();
      return;
    }

    if (result === 'expired') {
      await ctx.reply(
        '⏰ Код прострочено. Надішліть /start щоб отримати новий код.',
      );
      await ctx.scene.leave();
      return;
    }

    await ctx.reply('❌ Невірний код. Спробуйте ще раз:');
  }
}
