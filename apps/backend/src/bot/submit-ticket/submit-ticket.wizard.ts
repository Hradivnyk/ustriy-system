import { Injectable } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { ResidentsService } from '../../residents/residents.service';
import { TicketsService } from '../../tickets/tickets.service';
import type { BotContext, SubmitTicketState } from '../bot.context';
import { MAIN_MENU_SCENE_ID } from '../main-menu/main-menu.wizard';

export const SUBMIT_TICKET_SCENE_ID = 'submit-ticket';

const CANCEL_BTN = '❌ Скасувати';
const CANCEL_KEYBOARD = Markup.keyboard([[CANCEL_BTN]]).resize();

@Wizard(SUBMIT_TICKET_SCENE_ID)
@Injectable()
export class SubmitTicketWizard {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly residentsService: ResidentsService,
  ) {}

  @WizardStep(1)
  async onEnter(@Ctx() ctx: BotContext): Promise<void> {
    const specialists = await this.ticketsService.findAllSpecialists();

    await ctx.reply(
      '📝 Подача заявки — крок 1/2\nОберіть фахівця:',
      CANCEL_KEYBOARD,
    );

    const rows = specialists.map((s) => [
      Markup.button.callback(s.name, `spec:${s.id}`),
    ]);
    await ctx.reply('👷 Фахівці:', Markup.inlineKeyboard(rows));

    ctx.wizard.next();
  }

  @WizardStep(2)
  async onSpecialist(@Ctx() ctx: BotContext): Promise<void> {
    if (
      ctx.message &&
      'text' in ctx.message &&
      ctx.message.text === CANCEL_BTN
    ) {
      await this.cancel(ctx);
      return;
    }

    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply(
        'Будь ласка, оберіть фахівця з кнопок вище або скасуйте.',
      );
      return;
    }

    const data = ctx.callbackQuery.data;
    if (!data.startsWith('spec:')) {
      await ctx.answerCbQuery();
      return;
    }

    await ctx.answerCbQuery();
    const specialistId = parseInt(data.replace('spec:', ''), 10);
    const specialist =
      await this.ticketsService.findSpecialistById(specialistId);

    if (!specialist) {
      await ctx.reply('Фахівця не знайдено. Спробуйте ще раз.');
      return;
    }

    const state = ctx.wizard.state as SubmitTicketState;
    state.specialistId = specialist.id;
    state.specialistName = specialist.name;

    await ctx.reply(
      `✅ Фахівець: ${specialist.name}\n\n📝 Крок 2/2\nОпишіть проблему (до 1000 символів):`,
      CANCEL_KEYBOARD,
    );

    ctx.wizard.next();
  }

  @WizardStep(3)
  async onDescription(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Будь ласка, введіть опис текстом.');
      return;
    }

    const text = ctx.message.text.trim();

    if (text === CANCEL_BTN) {
      await this.cancel(ctx);
      return;
    }

    if (!text) {
      await ctx.reply('Будь ласка, введіть опис проблеми.');
      return;
    }

    if (text.length > 1000) {
      await ctx.reply(
        'Опис занадто довгий. Максимум 1000 символів. Спробуйте ще раз:',
      );
      return;
    }

    const state = ctx.wizard.state as SubmitTicketState;
    state.description = text;

    await ctx.reply('📋 Перевірте вашу заявку:', Markup.removeKeyboard());

    const summary =
      `👷 Фахівець: <b>${state.specialistName}</b>\n` +
      `📝 Опис: ${state.description}`;

    await ctx.reply(summary, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Подати заявку', 'confirm:submit'),
          Markup.button.callback('↩ До меню', 'confirm:cancel'),
        ],
      ]),
    });

    ctx.wizard.next();
  }

  @WizardStep(4)
  async onConfirm(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      return;
    }

    await ctx.answerCbQuery();
    const data = ctx.callbackQuery.data;

    if (data === 'confirm:cancel') {
      await ctx.scene.leave();
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    if (data !== 'confirm:submit') {
      return;
    }

    const telegramId = String(ctx.from!.id);
    const residentData =
      await this.residentsService.findByTelegramIdWithProfile(telegramId);

    if (!residentData || !residentData.profile) {
      await ctx.reply(
        '❌ Не вдалося знайти ваш профіль. Зверніться до диспетчера.',
      );
      await ctx.scene.leave();
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    const state = ctx.wizard.state as SubmitTicketState;

    const ticket = await this.ticketsService.create({
      residentId: residentData.resident.id,
      specialistId: state.specialistId!,
      dormitoryId: residentData.profile.dormitoryId,
      description: state.description!,
    });

    await ctx.reply(`✅ Заявку подано!\nНомер: <code>${ticket.id}</code>`, {
      parse_mode: 'HTML',
    });

    await ctx.scene.leave();
    await ctx.scene.enter(MAIN_MENU_SCENE_ID);
  }

  private async cancel(ctx: BotContext): Promise<void> {
    await ctx.reply('Подачу заявки скасовано.', Markup.removeKeyboard());
    await ctx.scene.leave();
    await ctx.scene.enter(MAIN_MENU_SCENE_ID);
  }
}
