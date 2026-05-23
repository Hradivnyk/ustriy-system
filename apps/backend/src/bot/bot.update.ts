import { Ctx, Next, Start, Update, Use } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import type { BotContext, BotSession } from './bot.context';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { ResidentType } from '../residents/entities/resident-profile.entity';
import { ResidentsService } from '../residents/residents.service';
import { MAIN_MENU_SCENE_ID } from './main-menu/main-menu.wizard';
import { ONBOARDING_SCENE_ID } from './onboarding/onboarding.wizard';
import { VERIFY_EMAIL_SCENE_ID } from './verify-email/verify-email.wizard';

@Update()
export class BotUpdate {
  constructor(
    private readonly residentsService: ResidentsService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Use()
  async registrationGuard(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>,
  ): Promise<void> {
    if (!ctx.from) return next();

    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';

    // /start always resets — clear any active scene so @Start() handles it cleanly
    if (text.startsWith('/start')) {
      ctx.session.__scenes = { cursor: 0 };
      return next();
    }

    // Already in a scene — let the scene handle the update
    if (ctx.session.__scenes?.current) return next();

    const resident = await this.residentsService.findByTelegramId(
      String(ctx.from.id),
    );
    if (!resident) {
      await ctx.scene.enter(ONBOARDING_SCENE_ID);
      return;
    }

    return next();
  }

  @Start()
  async onStart(@Ctx() ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    const result = await this.residentsService.findByTelegramIdWithProfile(
      String(ctx.from.id),
    );

    if (!result) {
      // Unregistered user mid-scene — restart onboarding
      await ctx.scene.leave();
      await ctx.scene.enter(ONBOARDING_SCENE_ID);
      return;
    }

    const { resident, profile } = result;

    if (resident.isActive) {
      await ctx.reply(`З поверненням, ${resident.name}! 👋`);
      await ctx.scene.enter(MAIN_MENU_SCENE_ID);
      return;
    }

    if (profile?.residentType === ResidentType.TENANT) {
      await ctx.reply(
        '⏳ Ваш акаунт очікує підтвердження диспетчером.\nВи отримаєте повідомлення після підтвердження.',
      );
      return;
    }

    // Student with unverified email
    if (resident.email) {
      await ctx.reply(
        `📧 Ваш email ще не підтверджено.\nНадіслати новий код верифікації на ${resident.email}?`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('✅ Так, надіслати', 'resend-verification'),
            Markup.button.callback('❌ Скасувати', 'cancel-verification'),
          ],
        ]),
      );
    }
  }

  @Use()
  async handleResendVerification(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>,
  ): Promise<void> {
    if (
      !ctx.callbackQuery ||
      !('data' in ctx.callbackQuery) ||
      ctx.callbackQuery.data !== 'resend-verification'
    ) {
      return next();
    }

    await ctx.answerCbQuery();

    if (!ctx.from) return;

    const result = await this.residentsService.findByTelegramIdWithProfile(
      String(ctx.from.id),
    );
    if (!result?.resident.email) {
      await ctx.reply(
        'Помилка: email не знайдено. Зверніться до адміністратора.',
      );
      return;
    }

    const { resident } = result;
    const session = ctx.session as BotSession;
    session.pendingUserId = resident.id;

    await this.emailVerificationService.createAndSend(
      resident.id,
      resident.email!,
    );
    await ctx.reply(
      `📧 Новий код верифікації надіслано на ${resident.email}.\nВведіть 6-значний код:`,
    );
    await ctx.scene.enter(VERIFY_EMAIL_SCENE_ID);
  }

  @Use()
  async handleCancelVerification(
    @Ctx() ctx: BotContext,
    @Next() next: () => Promise<void>,
  ): Promise<void> {
    if (
      !ctx.callbackQuery ||
      !('data' in ctx.callbackQuery) ||
      ctx.callbackQuery.data !== 'cancel-verification'
    ) {
      return next();
    }

    await ctx.answerCbQuery();
    await ctx.reply(
      'Гаразд. Надішліть /start коли будете готові підтвердити email.',
    );
  }
}
