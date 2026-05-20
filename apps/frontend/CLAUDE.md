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

## Design System

### Colors

- Accent primary (blue): `#1677ff`
- Accent secondary (black): `#141414`
- Success: `#52c41a`
- Warning: `#faad14`
- Error: `#ff4d4f`
- Text primary: `#141414`
- Text secondary: `rgba(0,0,0,0.45)`
- Background: `#f5f5f5`
- Surface (cards): `#ffffff`
- Border: `#d9d9d9`

### Typography

- Font family: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`
- Base size: `14px`
- Heading scale: h1=38px, h2=30px, h3=24px, h4=20px, h5=16px
- Line height: `1.5714`

### Spacing (використовуй тільки ці значення)

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Layout

- Sidebar width: 256px (collapsed: 80px)
- Header height: 64px
- Content padding: 24px
- Card border-radius: 8px
- Max content width: 1200px

### Ant Design Theme Override

Тема налаштована в `src/theme/index.ts`:

- `borderRadius`: 6
- `colorPrimary`: `#1677ff` (blue accent)
- `colorTextBase`: `#141414` (black accent)
- Не змінюй token значення напряму в компонентах

## Component Rules

### Tables

- Завжди використовуй AntD `Table` з `pagination`
- `pageSize` за замовчуванням: `20`
- Порожній стан: завжди додавай `empty` prop з текстом
- Дії в рядку: максимум 3, решта — у `Dropdown`

### Forms

- Layout: `vertical` для модалок, `horizontal` для фільтрів
- `labelCol` для horizontal: `{ span: 6 }`
- Кнопка submit завжди праворуч
- Обов'язкові поля позначати `required`, не asterisk вручну

### Buttons

- Головна дія на сторінці: `type="primary"`
- Небезпечна дія: `danger`
- Скасування/закриття: `default` (без `type`)
- Ніколи не використовуй `ghost` всередині white surface

### Modals

- Ширина: `520px` (стандарт), `720px` (форми з багатьма полями)
- Footer: Cancel зліва, Submit справа
- Деструктивні дії — через `Modal.confirm`, не через модалку з формою

### Notifications

- Успіх операції: `message.success` (не `notification`)
- Помилка з деталями: `notification.error`
- Валідація форми: Form вбудована валідація, не зовнішні повідомлення

## Page Structure

**Сторінка-список:**

1. `PageHeader` з title + primary action кнопкою
2. Filters row (`Space` з `Select`/`Input`/`DatePicker`)
3. `Table` з pagination
4. `Modal` для create/edit

**Сторінка-деталь:**

1. `PageHeader` з breadcrumb + back button
2. `Descriptions` або `Form` залежно від режиму (view/edit)
3. Пов'язані таблиці нижче у `Tabs` або `Card`

## Anti-patterns (не використовувати)

- Не використовуй inline styles — тільки CSS modules або CSS vars
- Не мішай AntD компоненти з MUI або іншими бібліотеками
- Не створюй кастомні компоненти якщо є AntD аналог
- Не використовуй `px` напряму в JSX — тільки через токени або CSS vars
- Не дублюй логіку запитів — використовуй існуючі хуки з `/hooks`

## Заборонено

- Не викликай API поза `lib/api/index.ts`
- Не змінюй backend, Docker, Nginx або кореневий `.env.example` з цього застосунку
- Не додавай npm-скрипти без узгодження
- Не використовуй `any` у TypeScript
- Не додавай інші UI-бібліотеки поруч із Ant Design
