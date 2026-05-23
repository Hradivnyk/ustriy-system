import { Injectable } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { ACCOUNT_RECOVERY_SCENE_ID } from '../account-recovery/account-recovery.wizard';
import type { BotContext } from '../bot.context';
import { REGISTRATION_SCENE_ID } from '../registration/registration.wizard';
import { answerCbQuery } from '../utils/answer-cb-query';
import { editMessageText } from '../utils/edit-message-text';

export const ONBOARDING_SCENE_ID = 'onboarding';

const WELCOME_MESSAGE =
  'Вітаємо в системі Ustriy! 👋\n\nВи вже маєте акаунт у системі?';
const WELCOME_KEYBOARD = Markup.inlineKeyboard([
  [
    Markup.button.callback('✅ Так, маю акаунт', 'has-account'),
    Markup.button.callback('🆕 Ні, перший раз', 'new-account'),
  ],
]);

@Wizard(ONBOARDING_SCENE_ID)
@Injectable()
export class OnboardingWizard {
  @WizardStep(1)
  async onChoice(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply(WELCOME_MESSAGE, WELCOME_KEYBOARD);
      return;
    }

    await answerCbQuery(ctx);

    if (ctx.callbackQuery.data === 'has-account') {
      await editMessageText(ctx, '✅ Відновлення акаунту');
      await ctx.scene.leave();
      await ctx.scene.enter(ACCOUNT_RECOVERY_SCENE_ID);
      return;
    }

    await editMessageText(ctx, '🆕 Реєстрація нового акаунту');
    await ctx.scene.leave();
    await ctx.scene.enter(REGISTRATION_SCENE_ID);
  }
}
