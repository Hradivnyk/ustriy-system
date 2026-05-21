import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import type { AppEnv } from '../../config/env.schema';
import { EmailVerificationService } from '../../email-verification/email-verification.service';
import { ResidentType } from '../../residents/entities/resident-profile.entity';
import { ResidentsService } from '../../residents/residents.service';
import type { AccountRecoveryState, BotContext } from '../bot.context';
import { ONBOARDING_SCENE_ID } from '../onboarding/onboarding.wizard';

export const ACCOUNT_RECOVERY_SCENE_ID = 'account-recovery';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const BACK_BUTTON_TEXT = '⬅️ На початок';
const BACK_KEYBOARD = Markup.keyboard([[BACK_BUTTON_TEXT]]).resize();

@Wizard(ACCOUNT_RECOVERY_SCENE_ID)
@Injectable()
export class AccountRecoveryWizard {
  constructor(
    private readonly residentsService: ResidentsService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  @WizardStep(1)
  async onEnter(@Ctx() ctx: BotContext): Promise<void> {
    await ctx.reply('Введіть email, з яким ви реєструвалися:', BACK_KEYBOARD);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async onEmail(@Ctx() ctx: BotContext): Promise<void> {
    if (await this.handleBackButton(ctx)) return;

    if (!ctx.message || !('text' in ctx.message) || !ctx.message.text.trim()) {
      await ctx.reply('Будь ласка, введіть email.');
      return;
    }

    const email = ctx.message.text.trim().toLowerCase();
    const domain = this.config.get('UNIVERSITY_EMAIL_DOMAIN', { infer: true });

    if (!EMAIL_REGEX.test(email)) {
      await ctx.reply(
        `❌ Невірний формат пошти.\nПриймається лише університетська пошта домену ${domain}\nНаприклад: student${domain}`,
      );
      return;
    }

    const resident = await this.residentsService.findByEmail(email);

    if (!resident) {
      await ctx.reply(
        '❌ Email не знайдено в системі. Перевірте адресу або поверніться на початок.',
      );
      return;
    }

    const state = ctx.wizard.state as AccountRecoveryState;
    state.userId = resident.id;

    await this.emailVerificationService.createAndSend(resident.id, email);
    await ctx.reply(
      `📧 Код підтвердження надіслано на ${email}.\nВведіть 6-значний код:`,
    );
    ctx.wizard.next();
  }

  @WizardStep(3)
  async onCode(@Ctx() ctx: BotContext): Promise<void> {
    if (await this.handleBackButton(ctx)) return;

    if (!ctx.message || !('text' in ctx.message) || !ctx.message.text.trim()) {
      await ctx.reply('Будь ласка, введіть код з листа.');
      return;
    }

    const state = ctx.wizard.state as AccountRecoveryState;
    const result = await this.emailVerificationService.verify(
      state.userId!,
      ctx.message.text.trim(),
    );

    if (result === 'ok') {
      await this.residentsService.updateTelegramId(
        state.userId!,
        String(ctx.from!.id),
      );

      const linked = await this.residentsService.findByTelegramIdWithProfile(
        String(ctx.from!.id),
      );
      if (linked?.profile?.residentType === ResidentType.STUDENT) {
        await this.residentsService.markResidentVerified(state.userId!);
      }

      await ctx.reply(
        "✅ Акаунт успішно прив'язано до цього Telegram! Ласкаво просимо.",
        Markup.removeKeyboard(),
      );
      await ctx.scene.leave();
      return;
    }

    if (result === 'expired') {
      await ctx.reply(
        '⏰ Код прострочено. Спробуйте ще раз або поверніться на початок.',
      );
      await ctx.scene.leave();
      return;
    }

    await ctx.reply('❌ Невірний код. Спробуйте ще раз:');
  }

  private async handleBackButton(ctx: BotContext): Promise<boolean> {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    if (text !== BACK_BUTTON_TEXT) return false;

    await ctx.reply('Повертаємось до початку...', Markup.removeKeyboard());
    await ctx.scene.leave();
    await ctx.scene.enter(ONBOARDING_SCENE_ID);
    return true;
  }
}
