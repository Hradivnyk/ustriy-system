# Фронтенд — адмін-панель Ustriy

Адмін-панель на Next.js 16 для керування заявками на ремонт у студентському містечку. Порт **3001**.

## Стек

- Next.js 16 (App Router)
- React 19
- Ant Design 6
- TypeScript 5

## Запуск

```bash
npm run dev     # dev-сервер на :3001
npm run build
npm run start
npm run lint
```

З кореня монорепозиторію: `npm run dev:frontend`, `npm run type-check`, `npm run lint`.

## Структура

```
src/
├── app/
│   ├── (dashboard)/    # захищені маршрути адмін-панелі
│   └── layout.tsx      # кореневий layout (AntdProvider)
├── components/
│   ├── layout/         # Header, Sidebar
│   └── providers/      # AntdProvider
├── lib/api/index.ts    # HTTP-клієнт — усі API-виклики лише через нього
├── types/index.ts      # спільні типи (User, RepairRequest, RequestStatus)
└── styles/globals.css
```

## Ролі та доступ

Панель призначена для персоналу. Мешканці (`resident`) працюють через Telegram-бот і доступу до панелі не мають.

| Роль         | Можливості в панелі                                                     |
| ------------ | ----------------------------------------------------------------------- |
| `specialist` | Перегляд та оновлення статусів призначених заявок                       |
| `dispatcher` | Повний доступ: призначення фахівців, підтвердження орендарів, аналітика |

## Змінні середовища

- `NEXT_PUBLIC_API_URL` — базова URL backend (за замовчуванням `http://localhost:3000`; у продакшні — `https://yourdomain.com/api`)

## Документація

- [CLAUDE.md](./CLAUDE.md) — правила для AI-асистентів
- [docs/api.md](../../docs/api.md) — специфікація REST API
- [docs/entities.md](../../docs/entities.md) — модель даних
