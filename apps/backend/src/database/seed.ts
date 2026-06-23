/* eslint-disable no-console */
import 'reflect-metadata';
import { randomUUID } from 'crypto';
import * as path from 'path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '5432'),
  database: process.env.DB_NAME ?? 'ustriy',
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// ─── Seed constants ────────────────────────────────────────────────────────────

const STAFF = [
  // Диспетчери
  {
    name: 'Оксана Павлюк',
    email: 'o.pavliuk@ustriy.ua',
    role: 'dispatcher',
    specialist: null,
  },
  {
    name: 'Роман Дяченко',
    email: 'r.diachenko@ustriy.ua',
    role: 'dispatcher',
    specialist: null,
  },
  // Електрики
  {
    name: 'Василь Гриценко',
    email: 'v.hrytsenko@ustriy.ua',
    role: 'specialist',
    specialist: 'Електрик',
  },
  {
    name: 'Ігор Мартиненко',
    email: 'i.martynenko@ustriy.ua',
    role: 'specialist',
    specialist: 'Електрик',
  },
  {
    name: 'Петро Коломієць',
    email: 'p.kolomiiets@ustriy.ua',
    role: 'specialist',
    specialist: 'Електрик',
  },
  // Сантехніки
  {
    name: 'Микола Руденко',
    email: 'm.rudenko@ustriy.ua',
    role: 'specialist',
    specialist: 'Сантехник',
  },
  {
    name: 'Степан Харченко',
    email: 's.kharchenko@ustriy.ua',
    role: 'specialist',
    specialist: 'Сантехник',
  },
  // Столяри
  {
    name: 'Анатолій Кравець',
    email: 'a.kravets@ustriy.ua',
    role: 'specialist',
    specialist: 'Столяр',
  },
  {
    name: 'Борис Ткач',
    email: 'b.tkach@ustriy.ua',
    role: 'specialist',
    specialist: 'Столяр',
  },
];

const RESIDENTS = [
  {
    telegramId: '301571',
    name: 'Олена Коваленко',
    email: 'o.kovalenko@kpi.ua',
  },
  { telegramId: '302782', name: 'Андрій Мельник', email: null },
  {
    telegramId: '303915',
    name: 'Марія Іванченко',
    email: 'm.ivanchenko@kpi.ua',
  },
  { telegramId: '304238', name: 'Дмитро Петренко', email: null },
  {
    telegramId: '305441',
    name: 'Юлія Бондаренко',
    email: 'y.bondarenko@kpi.ua',
  },
  { telegramId: '306654', name: 'Сергій Лисенко', email: null },
  {
    telegramId: '307827',
    name: 'Тетяна Гончаренко',
    email: 't.goncharenko@kpi.ua',
  },
  { telegramId: '308093', name: 'Олег Шевченко', email: null },
  {
    telegramId: '309156',
    name: 'Наталія Кравченко',
    email: 'n.kravchenko@kpi.ua',
  },
  { telegramId: '310472', name: 'Максим Ткаченко', email: null },
];

const DESCRIPTIONS = [
  'Не працює розетка в кімнаті, підозрюю проблему з проводкою.',
  'Протікає труба під раковиною у ванній кімнаті.',
  'Зламана дверна ручка, двері не зачиняються нормально.',
  'Не горить світло в коридорі, можливо перегорів автомат.',
  'Протікає кран у душовій кімнаті, постійний підтік.',
  'Засмічена каналізація в загальному санвузлі.',
  'Тріснуло скло у вікні кімнати, протяг і холод.',
  'Не закривається вікно, заїдає замок рами.',
  'Несправна вентиляція у санвузлі, погано тягне.',
  'Пошкоджена плитка в душовій, гострі краї небезпечні.',
  'Не вмикається вимикач у коридорі першого поверху.',
  'Зламано замок на вхідних дверях корпусу.',
  'Скрипить підлога при ходьбі, розбиті планки паркету.',
  'Не працює водонагрівач, немає гарячої води вже два дні.',
  'Відклеїлися шпалери в куті біля вікна, велика площа.',
  'Зламано ліжко в кімнаті, зламалась поперечна балка.',
  'Несправний радіатор опалення, кімната не прогрівається.',
  'Протікає стеля над верхнім поверхом під час дощу.',
  'Зламано вимикач у кімнаті, не фіксується у положенні.',
  'Несправний замок у санвузлі, не закривається зсередини.',
];

// Status distribution per month — matches dashboard STAT_CARDS:
// Виконано:176 | Відхилено:13 | Новий:35 | в Обробці:23 | Total:247
// Matches CHART_DATA: Dec(35) Jan(38) Feb(41) Mar(45) Apr(48) May(40)
const MONTHLY: { year: number; month: number; statuses: string[] }[] = [
  {
    year: 2025,
    month: 12,
    statuses: [...Array(32).fill('Виконано'), ...Array(3).fill('Відхилено')], // 35
  },
  {
    year: 2026,
    month: 1,
    statuses: [...Array(36).fill('Виконано'), ...Array(2).fill('Відхилено')], // 38
  },
  {
    year: 2026,
    month: 2,
    statuses: [...Array(38).fill('Виконано'), ...Array(3).fill('Відхилено')], // 41
  },
  {
    year: 2026,
    month: 3,
    statuses: [...Array(41).fill('Виконано'), ...Array(4).fill('Відхилено')], // 45
  },
  {
    year: 2026,
    month: 4,
    statuses: [
      ...Array(29).fill('Виконано'),
      'Відхилено',
      ...Array(18).fill('в Обробці'),
    ], // 48
  },
  {
    year: 2026,
    month: 5,
    statuses: [...Array(35).fill('Новий'), ...Array(5).fill('в Обробці')], // 40
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length] as T;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDateInMonth(year: number, month: number): Date {
  const maxDay =
    year === 2026 && month === 5 ? 26 : new Date(year, month, 0).getDate();
  return new Date(
    year,
    month - 1,
    randInt(1, maxDay),
    randInt(7, 20),
    randInt(0, 59),
  );
}

// ─── Seed ──────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  await ds.initialize();
  console.log('Connected to database');

  try {
    // ── Довідники (ідемпотентно, завжди) ──────────────────────────────────────

    await ds.query(`
      INSERT INTO ticket_statuses (name)
      VALUES ('Новий'), ('в Обробці'), ('Відхилено'), ('На паузі'), ('Виконано')
      ON CONFLICT (name) DO NOTHING
    `);

    await ds.query(`
      INSERT INTO specialists (name, "isActive")
      VALUES ('Електрик', true), ('Сантехник', true), ('Столяр', true)
      ON CONFLICT (name) DO NOTHING
    `);

    await ds.query(`
      INSERT INTO dormitories (number, "isActive")
      VALUES (3,true),(4,true),(5,true),(6,true),(7,true),(8,true),
             (9,true),(10,true),(11,true),(12,true),(13,true)
      ON CONFLICT (number) DO NOTHING
    `);

    // ── Персонал ──────────────────────────────────────────────────────────────

    for (let i = 0; i < STAFF.length; i++) {
      const s = STAFF[i]!;
      const specialistId = s.specialist
        ? ((
            (await ds.query(
              `SELECT id FROM specialists WHERE name = $1 LIMIT 1`,
              [s.specialist],
            )) as [{ id: number }]
          )[0]?.id ?? null)
        : null;

      await ds.query(
        `INSERT INTO staff ("googleId", name, email, role, "isActive", "specialistId")
         VALUES ($1, $2, $3, $4, true, $5)
         ON CONFLICT (email) DO UPDATE SET "specialistId" = EXCLUDED."specialistId"`,
        [`seed_googleid_${i + 1}`, s.name, s.email, s.role, specialistId],
      );
    }

    console.log(`Staff: seeded/updated ${STAFF.length} members.`);

    // ── Заявки (лише якщо ще немає) ───────────────────────────────────────────

    const [{ count }] = (await ds.query(
      `SELECT COUNT(*)::int AS count FROM tickets`,
    )) as [{ count: number }];

    if (count > 0) {
      console.log(`Tickets already seeded (${count} found). Skipping tickets.`);
      return;
    }

    // Residents
    for (const r of RESIDENTS) {
      await ds.query(
        `INSERT INTO residents ("telegramId", name, email, "isActive")
         VALUES ($1, $2, $3, true)
         ON CONFLICT ("telegramId") DO NOTHING`,
        [r.telegramId, r.name, r.email],
      );
    }

    // Query lookup IDs
    const statuses = (await ds.query(
      `SELECT id, name FROM ticket_statuses`,
    )) as { id: number; name: string }[];

    const specialists = (await ds.query(
      `SELECT id FROM specialists ORDER BY id`,
    )) as { id: number }[];

    const dormitories = (await ds.query(
      `SELECT id FROM dormitories ORDER BY id`,
    )) as { id: number }[];

    const residents = (await ds.query(
      `SELECT id FROM residents ORDER BY "telegramId"`,
    )) as { id: string }[];

    const statusMap = Object.fromEntries(
      statuses.map((s) => [s.name, s.id]),
    ) as Record<string, number>;

    // Insert tickets
    let n = 0;
    for (const { year, month, statuses: monthStatuses } of MONTHLY) {
      for (const statusName of monthStatuses) {
        const createdAt = randDateInMonth(year, month);
        const isClosed =
          statusName === 'Виконано' || statusName === 'Відхилено';
        const updatedAt = isClosed
          ? new Date(createdAt.getTime() + randInt(2, 7) * 24 * 60 * 60 * 1000)
          : createdAt;

        await ds.query(
          `INSERT INTO tickets
             (id, "residentId", "specialistId", "statusId", "dormitoryId", description, "createdAt", "updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            randomUUID(),
            pick(residents, n).id,
            pick(specialists, n).id,
            statusMap[statusName],
            pick(dormitories, n).id,
            pick(DESCRIPTIONS, n),
            createdAt,
            updatedAt,
          ],
        );
        n++;
      }
    }

    const [{ max }] = (await ds.query(
      `SELECT MAX("ticketNumber") AS max FROM tickets`,
    )) as [{ max: number }];
    await ds.query(
      `SELECT setval(pg_get_serial_sequence('tickets', 'ticketNumber'), $1)`,
      [max],
    );

    console.log(`Done — seeded ${n} tickets.`);
  } finally {
    await ds.destroy();
  }
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
