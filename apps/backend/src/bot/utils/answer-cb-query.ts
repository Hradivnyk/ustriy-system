import type { BotContext } from '../bot.context';

export async function answerCbQuery(
  ctx: BotContext,
  text?: string,
): Promise<void> {
  try {
    await ctx.answerCbQuery(text);
  } catch {
    // Telegram rejects answerCallbackQuery when the query is older than 10s
    // or when the bot restarts and processes stale updates
  }
}
