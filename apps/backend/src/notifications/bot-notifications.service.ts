import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';

import type { BotContext } from '../bot/bot.context';

@Injectable()
export class BotNotificationsService {
  private readonly logger = new Logger(BotNotificationsService.name);

  constructor(@InjectBot() private readonly bot: Telegraf<BotContext>) {}

  async notifyStatusChanged(
    telegramId: string,
    ticketNumber: number,
    statusName: string,
    specialistName?: string,
    description?: string,
    dormitoryNumber?: number,
    createdAt?: Date,
  ): Promise<void> {
    const lines = [
      `📣 Статус заявки #<code>${ticketNumber}</code> змінено: <b>${statusName}</b>`,
      '',
    ];

    if (description) {
      lines.push(`📋 <b>Опис:</b> ${description}`);
    }
    if (dormitoryNumber !== undefined) {
      lines.push(`🏠 <b>Гуртожиток:</b> №${dormitoryNumber}`);
    }
    if (createdAt) {
      const date = createdAt.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      lines.push(`📅 <b>Подано:</b> ${date}`);
    }
    if (specialistName) {
      lines.push(`👷 <b>Призначений фахівець:</b> ${specialistName}`);
    }

    await this.send(telegramId, lines.join('\n'), { parse_mode: 'HTML' });
  }

  async notifyCompleted(
    telegramId: string,
    ticketId: string,
    ticketNumber: number,
  ): Promise<void> {
    const text =
      `✅ Заявку #<code>${ticketNumber}</code> виконано!\n\n` +
      'Оцініть, будь ласка, роботу фахівця:';

    await this.send(telegramId, text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('⭐', `rate:${ticketId}:1`),
          Markup.button.callback('⭐⭐', `rate:${ticketId}:2`),
          Markup.button.callback('⭐⭐⭐', `rate:${ticketId}:3`),
        ],
        [
          Markup.button.callback(
            '❌ Робота не виконана',
            `rate:${ticketId}:none`,
          ),
        ],
      ]),
    });
  }

  private async send(
    telegramId: string,
    text: string,
    extra: Parameters<Telegraf<BotContext>['telegram']['sendMessage']>[2],
  ): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(telegramId, text, extra);
    } catch (err) {
      // The resident may have blocked the bot or never opened a chat —
      // a failed notification must not break the admin-panel API request.
      this.logger.warn(
        `Не вдалося надіслати сповіщення мешканцю ${telegramId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
