import { Injectable } from '@nestjs/common';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { DormitoriesService } from '../../dormitories/dormitory.service';
import { ResidentType } from '../../residents/entities/resident-profile.entity';
import { ResidentsService } from '../../residents/residents.service';
import type { BotContext } from '../bot.context';
import { MAIN_MENU_SCENE_ID } from '../main-menu/main-menu.wizard';
import { answerCbQuery } from '../utils/answer-cb-query';
import { editMessageText } from '../utils/edit-message-text';

export const PROFILE_SCENE_ID = 'profile';

const BACK_CB = 'back:main-menu';
const EDIT_NAME_CB = 'edit:name';
const EDIT_DORM_CB = 'edit:dormitory';
const EDIT_ROOM_CB = 'edit:room';

const PROFILE_KEYBOARD = Markup.inlineKeyboard([
  [
    Markup.button.callback("✏️ Змінити ім'я", EDIT_NAME_CB),
    Markup.button.callback('🏠 Змінити гуртожиток', EDIT_DORM_CB),
  ],
  [Markup.button.callback('🚪 Змінити кімнату', EDIT_ROOM_CB)],
  [Markup.button.callback('↩ До меню', BACK_CB)],
]);

@Wizard(PROFILE_SCENE_ID)
@Injectable()
export class ProfileWizard {
  constructor(
    private readonly residentsService: ResidentsService,
    private readonly dormitoriesService: DormitoriesService,
  ) {}

  @WizardStep(1)
  async onEnter(@Ctx() ctx: BotContext): Promise<void> {
    const telegramId = String(ctx.from!.id);
    const data =
      await this.residentsService.findByTelegramIdWithProfile(telegramId);

    if (!data || !data.profile) {
      await ctx.reply('Не вдалося завантажити профіль.');
      await ctx.scene.leave();
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    const { resident, profile } = data;
    const dormitory = await this.dormitoriesService.findById(
      profile.dormitoryId,
    );
    const typeLabel =
      profile.residentType === ResidentType.STUDENT
        ? '🎓 Студент'
        : '🏠 Орендар';

    const lines = [
      '👤 <b>Мій профіль</b>\n',
      `👤 Ім'я: ${resident.name}`,
      `🏷 Тип: ${typeLabel}`,
    ];

    if (profile.residentType === ResidentType.STUDENT && resident.email) {
      lines.push(`📧 Пошта: ${resident.email}`);
    }

    lines.push(`🏢 Гуртожиток: №${dormitory?.number ?? '—'}`);
    lines.push(`🚪 Кімната: ${profile.roomNumber}`);

    const text = lines.join('\n');

    const cbData =
      ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : null;

    if (cbData) {
      await answerCbQuery(ctx);
      await editMessageText(ctx, text, {
        parse_mode: 'HTML',
        ...PROFILE_KEYBOARD,
      });
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', ...PROFILE_KEYBOARD });
    }

    ctx.wizard.next();
  }

  @WizardStep(2)
  async onAction(@Ctx() ctx: BotContext): Promise<void> {
    const cbData =
      ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : null;

    if (!cbData) {
      await ctx.reply('Будь ласка, скористайтесь кнопками вище.');
      return;
    }

    await answerCbQuery(ctx);

    if (cbData === BACK_CB) {
      try {
        await ctx.editMessageReplyMarkup(undefined);
      } catch {
        // already removed or message inaccessible — safe to ignore
      }
      await ctx.scene.leave();
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    const state = ctx.wizard.state;

    if (cbData === EDIT_NAME_CB) {
      state.editField = 'name';
      await editMessageText(ctx, "Введіть нове ім'я:");
      ctx.wizard.next();
      return;
    }

    if (cbData === EDIT_ROOM_CB) {
      state.editField = 'room';
      await editMessageText(ctx, 'Введіть новий номер кімнати:');
      ctx.wizard.next();
      return;
    }

    if (cbData === EDIT_DORM_CB) {
      state.editField = 'dormitory';
      const dormitories = await this.dormitoriesService.findAll();
      const rows: ReturnType<typeof Markup.button.callback>[][] = [];
      for (let i = 0; i < dormitories.length; i += 3) {
        rows.push(
          dormitories
            .slice(i, i + 3)
            .map((d) =>
              Markup.button.callback(String(d.number), `dorm:${d.id}`),
            ),
        );
      }
      await editMessageText(
        ctx,
        'Оберіть новий гуртожиток:',
        Markup.inlineKeyboard(rows),
      );
      ctx.wizard.next();
      return;
    }

    await ctx.scene.leave();
    await ctx.scene.enter(PROFILE_SCENE_ID);
  }

  @WizardStep(3)
  async onEditInput(@Ctx() ctx: BotContext): Promise<void> {
    const state = ctx.wizard.state;
    const telegramId = String(ctx.from!.id);

    const data =
      await this.residentsService.findByTelegramIdWithProfile(telegramId);
    if (!data) {
      await ctx.scene.leave();
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    const residentId = data.resident.id;

    if (state.editField === 'dormitory') {
      const cbData =
        ctx.callbackQuery && 'data' in ctx.callbackQuery
          ? ctx.callbackQuery.data
          : null;

      if (!cbData?.startsWith('dorm:')) {
        await ctx.reply('Будь ласка, оберіть гуртожиток з кнопок вище.');
        return;
      }

      await answerCbQuery(ctx);
      const dormId = parseInt(cbData.replace('dorm:', ''), 10);
      const dormitory = await this.dormitoriesService.findById(dormId);

      if (!dormitory) {
        await answerCbQuery(ctx, 'Гуртожиток не знайдено, спробуйте ще раз.');
        return;
      }

      await this.residentsService.updateDormitory(residentId, dormitory.id);
      await editMessageText(
        ctx,
        `✅ Гуртожиток змінено на №${dormitory.number}`,
      );
      await ctx.scene.leave();
      await ctx.scene.enter(PROFILE_SCENE_ID);
      return;
    }

    if (!ctx.message || !('text' in ctx.message) || !ctx.message.text.trim()) {
      await ctx.reply('Будь ласка, введіть текстове значення.');
      return;
    }

    const value = ctx.message.text.trim();

    if (state.editField === 'name') {
      if (value.length > 100) {
        await ctx.reply("Ім'я занадто довге. Спробуйте ще раз:");
        return;
      }
      await this.residentsService.updateName(residentId, value);
      await ctx.reply("✅ Ім'я успішно змінено.");
      await ctx.scene.leave();
      await ctx.scene.enter(PROFILE_SCENE_ID);
      return;
    }

    if (state.editField === 'room') {
      if (value.length > 20) {
        await ctx.reply('Номер кімнати занадто довгий. Спробуйте ще раз:');
        return;
      }
      await this.residentsService.updateRoomNumber(residentId, value);
      await ctx.reply('✅ Номер кімнати успішно змінено.');
      await ctx.scene.leave();
      await ctx.scene.enter(PROFILE_SCENE_ID);
      return;
    }

    await ctx.scene.leave();
    await ctx.scene.enter(PROFILE_SCENE_ID);
  }
}
