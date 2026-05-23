import { Injectable } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import type { BotContext } from '../bot.context';

export const MAIN_MENU_SCENE_ID = 'main-menu';

const MENU_TEXT = '📋 Головне меню — оберіть дію:';
const MENU_KEYBOARD = Markup.inlineKeyboard([
  [Markup.button.callback('📝 Подати заявку', 'menu:submit-ticket')],
  [Markup.button.callback('🔧 Активні заявки', 'menu:active-tickets')],
  [Markup.button.callback('🗂 Історія заявок', 'menu:ticket-history')],
  [Markup.button.callback('👤 Мій профіль', 'menu:profile')],
]);

const STUB_RESPONSES: Record<string, string> = {
  'menu:submit-ticket': '📝 Функція подачі заявки поки недоступна.',
  'menu:active-tickets':
    '🔧 Функція перегляду активних заявок поки недоступна.',
  'menu:ticket-history': '🗂 Функція перегляду історії заявок поки недоступна.',
  'menu:profile': '👤 Функція редагування профілю поки недоступна.',
};

@Wizard(MAIN_MENU_SCENE_ID)
@Injectable()
export class MainMenuWizard {
  @WizardStep(1)
  async onMenu(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply(MENU_TEXT, MENU_KEYBOARD);
      return;
    }

    await ctx.answerCbQuery();

    const action = ctx.callbackQuery.data as string;
    const stubMessage = STUB_RESPONSES[action];

    if (stubMessage) {
      await ctx.reply(stubMessage);
    }

    await ctx.scene.leave();
    await ctx.scene.enter(MAIN_MENU_SCENE_ID);
  }
}
