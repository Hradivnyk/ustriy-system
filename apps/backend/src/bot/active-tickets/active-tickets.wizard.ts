import { Injectable } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { ResidentsService } from '../../residents/residents.service';
import { TicketsService } from '../../tickets/tickets.service';
import type { BotContext } from '../bot.context';
import { MAIN_MENU_SCENE_ID } from '../main-menu/main-menu.wizard';
import { answerCbQuery } from '../utils/answer-cb-query';
import { editMessageText } from '../utils/edit-message-text';

export const ACTIVE_TICKETS_SCENE_ID = 'active-tickets';

const BACK_CB = 'back:main-menu';
const BACK_KEYBOARD = Markup.inlineKeyboard([
  [Markup.button.callback('↩ До меню', BACK_CB)],
]);

function formatDate(date: Date): string {
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

@Wizard(ACTIVE_TICKETS_SCENE_ID)
@Injectable()
export class ActiveTicketsWizard {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly residentsService: ResidentsService,
  ) {}

  @WizardStep(1)
  async onEnter(@Ctx() ctx: BotContext): Promise<void> {
    if (
      ctx.callbackQuery &&
      'data' in ctx.callbackQuery &&
      ctx.callbackQuery.data === BACK_CB
    ) {
      await answerCbQuery(ctx);
      await ctx.scene.leave();
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    const telegramId = String(ctx.from!.id);
    const residentData =
      await this.residentsService.findByTelegramIdWithProfile(telegramId);

    if (!residentData) {
      await editMessageText(ctx, 'У вас немає активних заявок.', BACK_KEYBOARD);
      return;
    }

    const tickets = await this.ticketsService.findActiveByResident(
      residentData.resident.id,
    );

    if (tickets.length === 0) {
      await editMessageText(ctx, 'У вас немає активних заявок.', BACK_KEYBOARD);
      return;
    }

    const lines = tickets.map(
      (t) =>
        `📋 <b>Заявка #${t.ticketNumber}</b>\n` +
        `📅 ${formatDate(t.createdAt)}\n` +
        `👨‍🔧 ${t.specialist?.name ?? '—'}\n` +
        `📝 ${truncate(t.description, 200)}\n` +
        `🔄 ${t.status?.name ?? '—'}`,
    );

    await editMessageText(
      ctx,
      `🔧 <b>Активні заявки (${tickets.length}):</b>\n\n${lines.join('\n\n———\n\n')}`,
      { parse_mode: 'HTML', ...BACK_KEYBOARD },
    );
  }
}
