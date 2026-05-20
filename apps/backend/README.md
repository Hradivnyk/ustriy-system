# Backend — API Ustriy

REST API на NestJS 11 для системи обліку заявок на ремонт у студентському містечку. Порт **3000**.

## Стек

- NestJS 11
- PostgreSQL 16 + TypeORM
- Redis 7
- JWT (access 15 хв / refresh 7 днів) + Google OAuth 2.0
- Telegraf / nestjs-telegraf (Telegram-бот)
- Nodemailer (email-сповіщення)
- Jest (unit + e2e тести)

## Запуск

```bash
npm run start:dev   # режим watch
npm run build
npm run test        # unit-тести
npm run test:e2e
npm run test:cov
```

З кореня монорепозиторію: `npm run dev:backend`, `npm test`.

## Структура

```
src/
├── main.ts
├── app.module.ts
├── auth/       # JWT, Google OAuth, верифікація домену університету
├── users/      # мешканці, фахівці, диспетчери
├── tickets/    # заявки, статуси, оцінки фахівців
└── bot/        # Telegram-бот (прийом заявок, сповіщення)
test/
├── app.e2e-spec.ts
└── jest-e2e.json
```

## Ролі

| Роль         | Опис                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| `resident`   | Мешканець — подає заявки через Telegram-бот, бачить лише власні заявки              |
| `specialist` | Фахівець — керує призначеними заявками через адмін-панель                           |
| `dispatcher` | Диспетчер — повний доступ: призначення фахівців, підтвердження орендарів, аналітика |

## Верифікація мешканців

- **Студенти** — автоматична верифікація через корпоративну пошту університету (домен)
- **Орендарі** — ручне підтвердження диспетчером в адмін-панелі

## Статуси заявок

`pending` → `in_progress` → `resolved` | `rejected`

Після `resolved` мешканець може поставити оцінку фахівцю або відправити заявку на доопрацювання.

## Документація API

- Swagger: `/api/docs` при `SWAGGER_ENABLED=true`
- [docs/api.md](../../docs/api.md) — специфікація REST API
- [docs/entities.md](../../docs/entities.md) — модель даних
- [CLAUDE.md](./CLAUDE.md) — правила для AI-асистентів
