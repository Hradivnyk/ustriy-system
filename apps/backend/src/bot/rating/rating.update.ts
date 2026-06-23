import { Action, Composer, Ctx } from 'nestjs-telegraf';

import { TicketsService } from '../../tickets/tickets.service';
import type { BotContext } from '../bot.context';
import { MAIN_MENU_SCENE_ID } from '../main-menu/main-menu.wizard';
import { answerCbQuery } from '../utils/answer-cb-query';
import { editMessageText } from '../utils/edit-message-text';

// Handles the rating buttons sent by BotNotificationsService.notifyCompleted.
// callback_data format: `rate:<ticketId>:<1|2|3|none>`
// @Composer runs inside the Stage (before scene handlers), so rating works
// regardless of whether the user is currently in a wizard scene.
@Composer()
export class RatingUpdate {
  constructor(private readonly ticketsService: TicketsService) {}

  @Action(/^rate:[0-9a-fA-F-]+:(?:1|2|3|none)$/)
  async onRate(@Ctx() ctx: BotContext): Promise<void> {
    await answerCbQuery(ctx);

    const data =
      ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : null;
    if (!data) return;

    const rest = data.slice('rate:'.length);
    const sepIndex = rest.lastIndexOf(':');
    const ticketId = rest.slice(0, sepIndex);
    const value = rest.slice(sepIndex + 1);

    if (value === 'none') {
      await this.ticketsService.reopenTicket(ticketId);
      await editMessageText(
        ctx,
        '🔄 Дякуємо за відгук! Заявку повторно відкрито — фахівець опрацює її ще раз.',
      );
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    const rating = Number(value);
    await this.ticketsService.setRating(ticketId, rating);
    await editMessageText(ctx, `Дякуємо за оцінку! ${'⭐'.repeat(rating)}`);
    await ctx.scene.enter(MAIN_MENU_SCENE_ID);
  }
}
