import { Injectable } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { ResidentsService } from '../../residents/residents.service';
import type { Ticket } from '../../tickets/entities/ticket.entity';
import { TicketsService } from '../../tickets/tickets.service';
import type { BotContext } from '../bot.context';
import { MAIN_MENU_SCENE_ID } from '../main-menu/main-menu.wizard';
import { answerCbQuery } from '../utils/answer-cb-query';
import { editMessageText } from '../utils/edit-message-text';

export const TICKET_HISTORY_SCENE_ID = 'ticket-history';

const BACK_CB = 'back:main-menu';
const PREV_CB = 'page:prev';
const NEXT_CB = 'page:next';

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

function buildNavKeyboard(index: number, total: number) {
  const navRow: ReturnType<typeof Markup.button.callback>[] = [];
  if (index > 0) navRow.push(Markup.button.callback('← Попередня', PREV_CB));
  if (index < total - 1)
    navRow.push(Markup.button.callback('Наступна →', NEXT_CB));

  const rows = [];
  if (navRow.length > 0) rows.push(navRow);
  rows.push([Markup.button.callback('↩ До меню', BACK_CB)]);

  return Markup.inlineKeyboard(rows);
}

function formatTicket(ticket: Ticket, index: number, total: number): string {
  return (
    `🗂 <b>Історія заявок — заявка ${index + 1} з ${total}</b>\n\n` +
    `📋 Номер заявки: #${ticket.ticketNumber}\n` +
    `📅 Дата створення: ${formatDate(ticket.createdAt)}\n` +
    `👨‍🔧 Фахівець: ${ticket.specialist?.name ?? '—'}\n` +
    `📝 Опис проблеми: ${truncate(ticket.description, 200)}\n` +
    `🔄 Статус: ${ticket.status?.name ?? '—'}`
  );
}

@Wizard(TICKET_HISTORY_SCENE_ID)
@Injectable()
export class TicketHistoryWizard {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly residentsService: ResidentsService,
  ) {}

  @WizardStep(1)
  async onEnter(@Ctx() ctx: BotContext): Promise<void> {
    const cbData =
      ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : null;

    if (cbData === BACK_CB) {
      await answerCbQuery(ctx);
      await ctx.scene.leave();
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    const state = ctx.wizard.state;

    if (cbData === PREV_CB) {
      await answerCbQuery(ctx);
      state.ticketIndex = (state.ticketIndex ?? 0) - 1;
    } else if (cbData === NEXT_CB) {
      await answerCbQuery(ctx);
      state.ticketIndex = (state.ticketIndex ?? 0) + 1;
    } else {
      state.ticketIndex = 0;
    }

    const telegramId = String(ctx.from!.id);
    const residentData =
      await this.residentsService.findByTelegramIdWithProfile(telegramId);

    const backOnly = Markup.inlineKeyboard([
      [Markup.button.callback('↩ До меню', BACK_CB)],
    ]);

    if (!residentData) {
      await editMessageText(ctx, 'У вас ще немає жодної заявки.', backOnly);
      return;
    }

    const tickets = await this.ticketsService.findAllByResident(
      residentData.resident.id,
    );

    if (tickets.length === 0) {
      await editMessageText(ctx, 'У вас ще немає жодної заявки.', backOnly);
      return;
    }

    const index = Math.max(0, Math.min(state.ticketIndex!, tickets.length - 1));
    state.ticketIndex = index;

    await editMessageText(
      ctx,
      formatTicket(tickets[index], index, tickets.length),
      { parse_mode: 'HTML', ...buildNavKeyboard(index, tickets.length) },
    );
  }
}
