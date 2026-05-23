import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import type { AppEnv } from '../../config/env.schema';
import { DormitoriesService } from '../../dormitories/dormitory.service';
import type { BotContext, RegistrationState } from '../bot.context';
import { RegistrationService } from './registration.service';
import { answerCbQuery } from '../utils/answer-cb-query';

export const REGISTRATION_SCENE_ID = 'registration';

@Wizard(REGISTRATION_SCENE_ID)
@Injectable()
export class RegistrationWizard {
  constructor(
    private readonly dormitoriesService: DormitoriesService,
    private readonly registrationService: RegistrationService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  @WizardStep(1)
  async onEnter(@Ctx() ctx: BotContext): Promise<void> {
    await ctx.reply(
      'Вітаємо! Ви студент чи орендар?',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🎓 Студент', 'student'),
          Markup.button.callback('🏠 Орендар', 'tenant'),
        ],
      ]),
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  async onResidentType(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply('Будь ласка, оберіть варіант з кнопок вище.');
      return;
    }

    const type = ctx.callbackQuery.data;
    if (type !== 'student' && type !== 'tenant') {
      await answerCbQuery(ctx);
      return;
    }

    const state = ctx.wizard.state as RegistrationState;
    state.residentType = type;
    await answerCbQuery(ctx);
    const typeLabel = type === 'student' ? '🎓 Студент' : '🏠 Орендар';
    await ctx.editMessageText(`Тип мешканця: ${typeLabel}`);
    await ctx.reply("Введіть ваше повне ім'я:");
    ctx.wizard.next();
  }

  @WizardStep(3)
  async onName(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.message || !('text' in ctx.message) || !ctx.message.text.trim()) {
      await ctx.reply("Будь ласка, введіть ваше ім'я.");
      return;
    }

    const state = ctx.wizard.state as RegistrationState;
    state.name = ctx.message.text.trim();

    const dormitories = await this.dormitoriesService.findAll();
    const rows: ReturnType<typeof Markup.button.callback>[][] = [];
    for (let i = 0; i < dormitories.length; i += 3) {
      rows.push(
        dormitories
          .slice(i, i + 3)
          .map((d) => Markup.button.callback(String(d.number), `dorm:${d.id}`)),
      );
    }

    await ctx.reply(
      'Оберіть номер вашого гуртожитку:',
      Markup.inlineKeyboard(rows),
    );
    ctx.wizard.next();
  }

  @WizardStep(4)
  async onDormitory(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply('Будь ласка, оберіть гуртожиток з кнопок вище.');
      return;
    }

    const data = ctx.callbackQuery.data;
    if (!data.startsWith('dorm:')) {
      await answerCbQuery(ctx);
      return;
    }

    const dormId = parseInt(data.replace('dorm:', ''), 10);
    const dormitory = await this.dormitoriesService.findById(dormId);

    if (!dormitory) {
      await answerCbQuery(ctx, 'Гуртожиток не знайдено, спробуйте ще раз.');
      return;
    }

    const state = ctx.wizard.state as RegistrationState;
    state.dormitoryId = dormitory.id;
    await answerCbQuery(ctx);
    await ctx.editMessageText(`Гуртожиток: №${dormitory.number}`);
    await ctx.reply('Введіть номер вашої кімнати:');
    ctx.wizard.next();
  }

  @WizardStep(5)
  async onRoomNumber(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.message || !('text' in ctx.message) || !ctx.message.text.trim()) {
      await ctx.reply('Будь ласка, введіть номер кімнати.');
      return;
    }

    const room = ctx.message.text.trim();
    if (room.length > 20) {
      await ctx.reply('Номер кімнати занадто довгий. Спробуйте ще раз.');
      return;
    }

    const state = ctx.wizard.state as RegistrationState;
    state.roomNumber = room;

    if (state.residentType === 'tenant') {
      await this.registrationService.initiateTenantRegistration({
        telegramId: String(ctx.from!.id),
        name: state.name!,
        dormitoryId: state.dormitoryId!,
        roomNumber: state.roomNumber,
      });
      await ctx.reply(
        '✅ Ваш запит подано. Диспетчер підтвердить вашу реєстрацію вручну. Ви отримаєте повідомлення після підтвердження.',
      );
      await ctx.scene.leave();
      return;
    }

    await ctx.reply('Введіть вашу університетську пошту:');
    ctx.wizard.next();
  }

  @WizardStep(6)
  async onEmail(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.message || !('text' in ctx.message) || !ctx.message.text.trim()) {
      await ctx.reply('Будь ласка, введіть email.');
      return;
    }

    const email = ctx.message.text.trim().toLowerCase();

    const domain = this.config.get('UNIVERSITY_EMAIL_DOMAIN', { infer: true });

    if (!this.isValidEmailFormat(email)) {
      await ctx.reply(
        `❌ Невірний формат пошти. Введіть коректну адресу (наприклад: student${domain}):`,
      );
      return;
    }

    if (!email.endsWith(domain)) {
      await ctx.reply(
        `❌ Пошта має належати університетському домену (${domain}).\nНаприклад: student${domain}\n\nСпробуйте ще раз:`,
      );
      return;
    }

    const state = ctx.wizard.state as RegistrationState;
    state.email = email;

    try {
      const userId = await this.registrationService.initiateStudentRegistration(
        {
          telegramId: String(ctx.from!.id),
          name: state.name!,
          dormitoryId: state.dormitoryId!,
          roomNumber: state.roomNumber!,
          email,
        },
      );
      state.userId = userId;
      await ctx.reply(
        `📧 Код верифікації надіслано на ${email}.\nВведіть 6-значний код:`,
      );
      ctx.wizard.next();
    } catch {
      await ctx.reply(
        'Виникла помилка при відправці листа. Спробуйте ввести пошту ще раз:',
      );
    }
  }

  @WizardStep(7)
  async onVerificationCode(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.message || !('text' in ctx.message) || !ctx.message.text.trim()) {
      await ctx.reply('Будь ласка, введіть код з листа.');
      return;
    }

    const state = ctx.wizard.state as RegistrationState;
    const result = await this.registrationService.confirmStudentEmail(
      state.userId!,
      ctx.message.text.trim(),
    );

    if (result === 'ok') {
      await ctx.reply(
        '✅ Реєстрацію завершено! Ласкаво просимо до системи Ustriy.',
      );
      await ctx.scene.leave();
      return;
    }

    if (result === 'expired') {
      await ctx.reply(
        '⏰ Код прострочений. Введіть /start щоб почати реєстрацію знову.',
      );
      await ctx.scene.leave();
      return;
    }

    await ctx.reply('❌ Невірний код. Спробуйте ще раз:');
  }

  private isValidEmailFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }
}
