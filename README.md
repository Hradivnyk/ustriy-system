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
**Infra** — Docker Compose, Nginx, Let's Encrypt, GitLab CI/CD

---

## Структура репозиторію

```
ustriy-system/
├── apps/
│   ├── backend/               # NestJS API
│   └── frontend/              # Next.js адмін-панель
├── nginx/
│   └── nginx.conf             # Nginx конфіг (SSL, proxy, rate limiting)
├── scripts/
│   └── init-letsencrypt.sh    # Скрипт першого отримання SSL-сертифіката
├── docker-compose.yml                  # Prod-конфігурація
├── docker-compose.override.yml         # Локальний override (не в git)
├── docker-compose.override.example.yml # Шаблон для локального override
└── .env.example
```

---

## Запуск локально (Docker)

Локальний запуск використовує multi-stage Dockerfile з `dev`-таргетом, який монтує вихідний код і запускає додатки з hot-reload.

### 1. Змінні середовища

```bash
cp .env.example .env
```

Відредагуй `.env`: задай паролі для БД та Redis, додай Google OAuth ключі тощо.

### 2. Docker Compose override

Для локальної розробки потрібен файл `docker-compose.override.yml`, який перемикає сервіси на `dev`-таргет, відкриває порти назовні та вимикає Nginx і Certbot.

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
```

> `docker-compose.override.yml` не комітиться до репозиторію — при запуску `docker compose` Docker автоматично мерджить його з `docker-compose.yml`.

### 3. Запуск

```bash
docker compose up --build
```

Після старту доступно:

| Сервіс   | URL                          |
|----------|------------------------------|
| Backend  | http://localhost:3000        |
| Swagger  | http://localhost:3000/api/docs |
| Frontend | http://localhost:3001        |
| PostgreSQL | `localhost:5432`           |
| Redis    | `localhost:6379`             |

> Nginx і Certbot у локальному режимі вимкнені через `profiles: production-only`.

### Зупинка

```bash
docker compose down          # зупинити контейнери
docker compose down -v       # також видалити volumes (БД, Redis)
```

---

## Запуск production-версії

Production-збірка використовує оптимізовані Docker-образи (`production`-таргет) без монтування вихідного коду. Nginx проксує трафік і завершує SSL.

### 1. Підготовка сервера

Потрібен Linux-сервер з встановленими `docker` та `docker compose`.

### 2. Змінні середовища

```bash
cp .env.example .env
```

Обов'язково задай в `.env`:

- `DB_PASSWORD`, `REDIS_PASSWORD` — надійні паролі
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — випадкові рядки (мінімум 32 символи)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — ключі Google OAuth
- `APP_URL` — `https://yourdomain.com`
- `FRONTEND_URL` — `https://yourdomain.com`
- `GOOGLE_CALLBACK_URL` — `https://yourdomain.com/api/auth/google/callback`
- `TELEGRAM_WEBHOOK_URL` — `https://yourdomain.com/telegram/webhook`

### 3. Налаштування домену

У `nginx/nginx.conf` заміни `YOUR_DOMAIN` на свій домен:

```bash
sed -i 's/YOUR_DOMAIN/yourdomain.com/g' nginx/nginx.conf
```

### 4. Отримання SSL-сертифіката (перший запуск)

Скрипт автоматично вирішує проблему запуску Nginx без сертифіката:

```bash
DOMAIN=yourdomain.com EMAIL=your@email.com ./scripts/init-letsencrypt.sh
```

Скрипт:
1. Створює тимчасовий self-signed сертифікат для старту Nginx
2. Отримує справжній сертифікат від Let's Encrypt через ACME-challenge
3. Перезавантажує Nginx з реальним сертифікатом

> Certbot-контейнер автоматично оновлює сертифікат кожні 12 годин.

### 5. Запуск

```bash
docker compose up -d --build
```

> У production `docker-compose.override.yml` НЕ повинен бути присутній на сервері, або потрібно явно вказати лише основний файл:
> ```bash
> docker compose -f docker-compose.yml up -d --build
> ```

### Оновлення додатку

```bash
git pull
docker compose -f docker-compose.yml up -d --build
```

---

## Ліцензія

MIT
