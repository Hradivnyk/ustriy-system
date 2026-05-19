# Backend — API Ustriy

REST API на NestJS 11 для обліку заявок на ремонт. Порт **3000**. Уся взаємодія (Telegram-бот і адмін-панель) йде через цей API.

## Стек

- NestJS 11
- PostgreSQL 16 + TypeORM (заплановано)
- Redis 7 (заплановано)
- JWT + Google OAuth (заплановано)
- Telegraf / nestjs-telegraf для Telegram-бота (заплановано)
- Jest (unit та e2e тести)

## Структура

```
src/
├── main.ts
├── app.module.ts
├── auth/           # JWT, Google OAuth
├── users/
├── tickets/
└── bot/            # сповіщення Telegram
test/
├── app.e2e-spec.ts
└── jest-e2e.json
```

У кожному feature-модулі бажана структура NestJS:

- `*.module.ts`, `*.controller.ts`, `*.service.ts`
- `entities/` — сутності TypeORM
- `dto/` — DTO запитів/відповідей з class-validator

## Поточний стан

Інфраструктурний каркас готовий. Усі чотири модулі (`Auth`, `Users`, `Tickets`, `Bot`) **порожні** — немає сутностей, контролерів і ендпоінтів.

**Порядок пріоритетів:** сутності → міграції → auth → tickets → bot → email

## Ключові конвенції

- DTO: декоратори `class-validator` на кожному DTO
- Помилки: лише підкласи NestJS `HttpException` (без `throw new Error()` у контролерах)
- Міграції TypeORM: лише генерація, не пиши вручну (`npm run migration:generate`, коли буде доступно)
- Unit-тести: `*.spec.ts` поруч із кодом (`jest`, `rootDir: src`)
- E2E: `test/*.e2e-spec.ts` через `npm run test:e2e`
- Swagger: документуй ендпоінти після додавання контролерів (`/api/docs`)

## Аутентифікація (заплановано)

**Адмін-панель (`specialist`, `dispatcher`):** лише Google OAuth — без пароля. Персонал має увійти через Google і бути заздалегідь зареєстрованим у системі.

**Telegram-бот (`resident`):** без Google OAuth. Мешканці проходять аутентифікацію в боті:

- **Студенти** — автоматична верифікація за доменом університетської пошти
- **Орендарі** — ручне підтвердження диспетчером

Після успішної аутентифікації в обох потоках видається JWT (access 15 хв / refresh 7 днів). Реалізація: `passport-google-oauth20`.

## Ролі та заявки

- **resident:** подає та переглядає власні заявки через Telegram-бот; до адмін-панелі доступу немає
- **specialist:** керує призначеними заявками в адмін-панелі (статуси, коментарі)
- **dispatcher:** повний доступ — призначення фахівців, підтвердження орендарів, структура гуртожитків, аналітика
- **Статуси:** `pending` → `in_progress` → `resolved` | `rejected`
- Після `resolved`: мешканець може оцінити фахівця або повторно відкрити заявку

## Команди

```bash
npm run start:dev    # режим watch
npm run build
npm run test         # unit-тести
npm run test:e2e     # e2e (онови шаблонний e2e перед використанням)
npm run test:cov
```

Монорепо: `npm run dev:backend`, у корені `npm test` запускає лише unit-тести backend.

## Заборонено

- Не змінюй Docker, Nginx або `docker-compose*.yml`
- Не змінюй кореневий `.env.example` без узгодження
- Не додавай npm-скрипти без узгодження
- Не використовуй `any` у TypeScript
- Не пиши міграції TypeORM вручну
