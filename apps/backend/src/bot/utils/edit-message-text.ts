import type { BotContext } from '../bot.context';

type EditExtra = Parameters<BotContext['editMessageText']>[1];

export async function editMessageText(
  ctx: BotContext,
  text: string,
  extra?: EditExtra,
): Promise<void> {
  try {
    await ctx.editMessageText(text, extra);
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes('message is not modified')
    ) {
      return;
    }
    throw err;
  }
}
