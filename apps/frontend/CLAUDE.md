<!-- BEGIN:nextjs-agent-rules -->

# Це НЕ той Next.js, який ти знаєш

У цій версії є breaking changes — API, конвенції та структура файлів можуть відрізнятися від даних у тренувальних наборах. Перед написанням коду прочитай відповідний посібник у `node_modules/next/dist/docs/`. Звертай увагу на повідомлення про застарілі API.

<!-- END:nextjs-agent-rules -->

# Frontend — адмін-панель Ustriy

Адмін-інтерфейс Next.js 16 для керування заявками на ремонт у студентському містечку. Порт **3001**.

## Стек

- Next.js 16 (App Router)
- React 19
- Ant Design 6 + `@ant-design/nextjs-registry`
- TypeScript 5

## Структура

```
src/
├── app/                    # сторінки та layouts App Router
│   ├── (dashboard)/        # захищені маршрути адмін-панелі
│   └── layout.tsx          # кореневий layout (AntdProvider)
├── components/
│   ├── layout/             # Header, Sidebar
│   └── providers/          # AntdProvider
├── lib/api/index.ts        # HTTP-клієнт — усі виклики API лише через нього
├── types/index.ts          # спільні типи фронтенду
└── styles/globals.css
```

## Ключові конвенції

- Усі виклики API — через `src/lib/api/index.ts`; не використовуй `fetch` напряму в інших місцях
- Спільні типи — у `src/types/index.ts`; тримай їх узгодженими з DTO backend
- UI: лише Ant Design; застосунок обгорнуто в `AntdProvider` (у кореневому layout)
- Сторінки адмін-панелі — під `app/(dashboard)/`
- За замовчуванням — server components; `'use client'` лише за потреби (хуки, події, браузерні API)

## Змінні середовища

- `NEXT_PUBLIC_API_URL` — базова URL backend (у коді за замовчуванням `http://localhost:3001`; у продакшні — `https://yourdomain.com/api` або origin backend залежно від деплою)

## Контроль доступу

**Адмін-панель лише для персоналу (`specialist`, `dispatcher`).** Мешканці (`resident`) доступу не мають — вони працюють виключно через Telegram-бот.

Аутентифікація **лише через Google OAuth** — без входу за паролем. Користувач має увійти через Google і бути заздалегідь зареєстрованим диспетчером у системі.

## Доменні типи

- **Ролі:** `resident` | `specialist` | `dispatcher`
  - `resident` — подає заявки через Telegram-бот; до цієї панелі доступу немає
  - `specialist` — керує призначеними заявками (оновлення статусів)
  - `dispatcher` — повний доступ: призначення фахівців, підтвердження орендарів, аналітика
- **Статуси заявок:** `pending` → `in_progress` → `resolved` | `rejected`
- Після `resolved`: мешканець може оцінити фахівця або повторно відкрити заявку
- Див. `src/types/index.ts` — `User`, `RepairRequest`, `RequestStatus`

## Next.js 16 — важливо

Це не той Next.js із тренувальних даних. API, конвенції та структура можуть відрізнятися. Перед кодом читай посібник у `node_modules/next/dist/docs/`. Дотримуйся повідомлень про застарілі API.

## Тести

Тестовий раннер ще не налаштований. Не додавай Jest/Vitest/Playwright без узгодження.

## Команди

```bash
npm run dev      # dev-сервер на :3001
npm run build
npm run start
npm run lint
```

З кореня монорепо: `npm run dev:frontend`, `npm run type-check`, `npm run lint`.

## Заборонено

- Не викликай API поза `lib/api/index.ts`
- Не змінюй backend, Docker, Nginx або кореневий `.env.example` з цього застосунку
- Не додавай npm-скрипти без узгодження
- Не використовуй `any` у TypeScript
- Не додавай інші UI-бібліотеки поруч із Ant Design
