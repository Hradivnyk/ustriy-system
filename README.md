# Ustriy — Система обліку заявок на ремонт

Платформа для подачі та обробки заявок на ремонт у студентських кампусах.  
Студенти подають заявки через вебінтерфейс, адміністратори керують ними через адмін-панель, а сповіщення надходять через Telegram-бот.

---

## Можливості

- Подача заявок на ремонт студентами
- Адмін-панель для перегляду, фільтрації та оновлення статусів заявок
- Telegram-бот для отримання нових заявок у реальному часі
- Email-сповіщення учасникам процесу
- Автентифікація через Google OAuth та JWT
- REST API з документацією Swagger

---

## Стек

**Backend** — NestJS, TypeORM, PostgreSQL, Redis  
**Frontend** — Next.js, Ant Design  
**Auth** — Google OAuth 2.0, JWT  
**Bot** — Telegraf (nestjs-telegraf)  
**Infra** — Docker Compose, GitLab CI/CD

---

## Запуск проекту

> 📋 Детальна інструкція буде додана пізніше.

```bash
# 1. Скопіюй змінні середовища
cp .env.example .env

# 2. Запусти інфраструктуру
docker compose up -d

# 3. Запусти backend
cd backend && npm install && npm run start:dev

# 4. Запусти frontend
cd frontend && npm install && npm run dev
```

---

## Структура репозиторію

```
ustriy-system/
├── backend/       # NestJS API
├── frontend/      # Next.js адмін-панель
├── docker-compose.yml
└── .env.example
```

---

## Ліцензія

MIT
