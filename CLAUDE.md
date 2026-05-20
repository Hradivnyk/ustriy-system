# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Ustriy System — монорепозиторій

Платформа обліку заявок на ремонт у студентському містечку: мешканці подають заявки через Telegram-бот, персонал керує ними через адмін-панель (REST API + Next.js frontend).

## Потік даних

```
Мешканець → Telegram-бот → Backend API (3000) → БД
Персонал  → Frontend (3001) → Backend API (3000) → БД
```

## Архітектура

| Шар      | Шлях              | Порт | Документація            |
|----------|-------------------|------|-------------------------|
| Backend  | `apps/backend/`   | 3000 | [CLAUDE.md](apps/backend/CLAUDE.md) |
| Frontend | `apps/frontend/`  | 3001 | [CLAUDE.md](apps/frontend/CLAUDE.md) |

**Інфраструктура (root-рівень):** PostgreSQL 16, Redis 7, Nginx + Certbot, Docker Compose.

## Команди (з кореня)

```bash
npm run dev:backend        # NestJS watch-режим
npm run dev:frontend       # Next.js на :3001
npm run type-check         # перевірка типів обох застосунків
npm run lint               # ESLint по всьому apps/
npm run lint:fix           # ESLint з автовиправленням
npm run format             # Prettier по всьому apps/
npm run format:check       # перевірка форматування без змін
npm test                   # unit-тести backend

# Docker
npm run docker:up          # підняти всі сервіси (збирає образи)
npm run docker:down        # зупинити всі сервіси
npm run docker:prod        # продакшн-стек (docker-compose.prod.yml)
```

Запустити один тест backend:
```bash
cd apps/backend && npx jest src/path/to/file.spec.ts
```

## Локальна розробка

Для локального середовища використовується `docker-compose.override.yml` — скопіюй з `docker-compose.override.example.yml` і налаштуй (наприклад, додай порти для postgres/redis). Він **не комітиться** (у `.gitignore`).

## Робота в репозиторії

- **Backend:** читай `apps/backend/CLAUDE.md` і дотримуйся `apps/backend/.claudeignore`
- **Frontend:** читай `apps/frontend/CLAUDE.md` і дотримуйся `apps/frontend/.claudeignore`
- Спільні типи frontend (`src/types/index.ts`) **мають бути узгоджені** з DTO backend; ролі: `resident` | `specialist` | `dispatcher`

## Заборонено (на рівні всього репо)

- Не змінюй конфіги Docker/Nginx без явного запиту
- Не змінюй `.env.example` без узгодження
- Не додавай нові npm-скрипти в корінь без узгодження
- Не використовуй `any` у TypeScript
