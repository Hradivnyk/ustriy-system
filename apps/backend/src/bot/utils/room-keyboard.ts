import { Markup } from 'telegraf';

export const ROOM_FLOOR_PREFIX = 'room:floor:';
export const ROOM_NUM_PREFIX = 'room:num:';
export const ROOM_TYPE_PREFIX = 'room:type:';

export function buildFloorKeyboard() {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 1; i <= 9; i += 3) {
    rows.push(
      [i, i + 1, i + 2].map((n) =>
        Markup.button.callback(String(n), `${ROOM_FLOOR_PREFIX}${n}`),
      ),
    );
  }
  return Markup.inlineKeyboard(rows);
}

export function buildRoomNumKeyboard() {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 1; i <= 18; i += 6) {
    rows.push(
      [i, i + 1, i + 2, i + 3, i + 4, i + 5].map((n) =>
        Markup.button.callback(String(n), `${ROOM_NUM_PREFIX}${n}`),
      ),
    );
  }
  return Markup.inlineKeyboard(rows);
}

export function buildRoomTypeKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('А', `${ROOM_TYPE_PREFIX}А`),
      Markup.button.callback('Б', `${ROOM_TYPE_PREFIX}Б`),
    ],
  ]);
}

export function composeRoomNumber(
  floor: number,
  num: number,
  type: string,
): string {
  return `${floor}${String(num).padStart(2, '0')}${type}`;
}
