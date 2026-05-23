import { Injectable } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { ACTIVE_TICKETS_SCENE_ID } from '../active-tickets/active-tickets.wizard';
import type { BotContext } from '../bot.context';
import { SUBMIT_TICKET_SCENE_ID } from '../submit-ticket/submit-ticket.wizard';
import { answerCbQuery } from '../utils/answer-cb-query';
import { editMessageText } from '../utils/edit-message-text';

export const MAIN_MENU_SCENE_ID = 'main-menu';

const MENU_TEXT = '📋 Головне меню — оберіть дію:';
const MENU_KEYBOARD = Markup.inlineKeyboard([
  [Markup.button.callback('📝 Подати заявку', 'menu:submit-ticket')],
  [Markup.button.callback('🔧 Активні заявки', 'menu:active-tickets')],
  [Markup.button.callback('🗂 Історія заявок', 'menu:ticket-history')],
  [Markup.button.callback('👤 Мій профіль', 'menu:profile')],
]);

const STUB_RESPONSES: Record<string, string> = {
  'menu:ticket-history': '🗂 Функція перегляду історії заявок поки недоступна.',
  'menu:profile': '👤 Функція редагування профілю поки недоступна.',
};

@Wizard(MAIN_MENU_SCENE_ID)
@Injectable()
export class MainMenuWizard {
  @WizardStep(1)
  async onMenu(@Ctx() ctx: BotContext): Promise<void> {
    const action =
      ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? (ctx.callbackQuery.data as string)
        : null;

    if (!action?.startsWith('menu:')) {
      await ctx.reply(MENU_TEXT, MENU_KEYBOARD);
      return;
    }

    await answerCbQuery(ctx);
    try {
      await ctx.editMessageReplyMarkup(undefined);
    } catch {
      // message markup already removed or unchanged — safe to ignore
    }

    if (action === 'menu:submit-ticket') {
      await ctx.scene.leave();
      await ctx.scene.enter(SUBMIT_TICKET_SCENE_ID);
      return;
    }

    if (action === 'menu:active-tickets') {
      await ctx.scene.leave();
      await ctx.scene.enter(ACTIVE_TICKETS_SCENE_ID);
      return;
    }

    const stubMessage = STUB_RESPONSES[action];
    if (stubMessage) {
      await editMessageText(
        ctx,
        `${stubMessage}\n\n${MENU_TEXT}`,
        MENU_KEYBOARD,
      );
      return;
    }

    await ctx.scene.leave();
    await ctx.scene.enter(MAIN_MENU_SCENE_ID);
  }
}
