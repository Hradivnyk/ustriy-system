# Ustriy — Система обліку заявок на ремонт

Платформа для подачі та обробки заявок на ремонт у студентських кампусах.  
Мешканці подають заявки через Telegram-бот, співробітники керують ними через веб-адмін-панель.

---

## Можливості

- Подача заявок на ремонт мешканцями через Telegram-бот
- Миттєві Telegram-сповіщення мешканцю на кожному етапі зміни статусу
- Система оцінки якості роботи фахівця після завершення заявки
- Адмін-панель для диспетчерів і фахівців: перегляд, фільтрація, призначення та оновлення статусів
- Email-сповіщення учасникам процесу
- Автентифікація через Google OAuth та JWT; автоматична верифікація студентів за доменом університету
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
├── docs/
│   ├── api.md                 # специфікація REST API
│   └── entities.md            # модель даних (сутності)
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

## Документація

| Файл | Зміст |
|------|--------|
| [docs/entities.md](docs/entities.md) | Модель даних (сутності, зв'язки, enum) |
| [docs/api.md](docs/api.md) | Специфікація REST API |
| [apps/backend/CLAUDE.md](apps/backend/CLAUDE.md) | Правила для AI при роботі з backend |
| [apps/frontend/CLAUDE.md](apps/frontend/CLAUDE.md) | Правила для AI при роботі з frontend |

---

## Запуск локально (Docker)

Локальний запуск використовує багатоетапний Dockerfile з ціллю `dev`, який монтує вихідний код і запускає застосунки з гарячим перезавантаженням.

### 1. Змінні середовища

```bash
cp .env.example .env
```

Відредагуй `.env`: задай паролі для БД та Redis, додай Google OAuth ключі тощо.

### 2. Docker Compose override

Для локальної розробки потрібен файл `docker-compose.override.yml`, який перемикає сервіси на ціль `dev`, відкриває порти назовні та вимикає Nginx і Certbot.

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

> Nginx і Certbot у локальному режимі вимкнені через профіль `production-only`.

### Зупинка

```bash
docker compose down          # зупинити контейнери
docker compose down -v       # також видалити томи (БД, Redis)
```

---

## Запуск production-версії

Продакшн-збірка використовує оптимізовані Docker-образи (ціль `production`) без монтування вихідного коду. Nginx проксує трафік і завершує SSL.

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
2. Отримує справжній сертифікат від Let's Encrypt через ACME-перевірку
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

## CI/CD (GitLab)

Пайплайн описаний у `.gitlab-ci.yml` і складається з чотирьох стейджів. Усі джоби lint/test/build використовують GitLab DAG (`needs: []`) — вони запускаються **паралельно**, не чекаючи один одного.

### Схема пайплайну

```
┌─────────────────────────────────────────────────────┐
│ lint (stage: lint, паралельно)                      │
│  • lint             — ESLint + Prettier по всьому   │
│  • typecheck:backend  — tsc для backend             │
│  • typecheck:frontend — tsc для frontend            │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ test (stage: test, паралельно з lint)               │
│  • test:backend — Jest unit-тести                   │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ build (stage: build, паралельно з усіма вище)       │
│  • build:backend  → артефакт apps/backend/dist/     │
│  • build:frontend → артефакт apps/frontend/.next/   │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ deploy (тільки при push до main)                    │
│  • Чекає на всі 6 джобів вище                       │
│  • SSH на VPS → git pull → docker compose up        │
│  • Виконує міграції БД                              │
└─────────────────────────────────────────────────────┘
```

**Тригери:**
- Будь-який push до будь-якої гілки — запускає lint / test / build.
- Push до `main` — додатково запускає `deploy`.
- При відкритому MR — запускається пайплайн типу `merge_request_event`; дублюючий branch-пайплайн пригнічується.

### GitLab CI/CD Variables

Налаштовуються в **Settings → CI/CD → Variables**. Усі змінні повинні бути **Protected** + **Masked**.

| Змінна | Опис | Як отримати |
|--------|------|-------------|
| `SSH_PRIVATE_KEY` | Ed25519 приватний ключ для deploy-користувача на VPS | `ssh-keygen -t ed25519 -C "gitlab-ci"` |
| `SSH_KNOWN_HOSTS` | Відбиток хосту VPS | `ssh-keyscan -H $SSH_HOST` |
| `SSH_HOST` | IP-адреса або домен VPS | — |
| `SSH_USER` | Deploy-користувач на VPS (не root) | — |
| `DEPLOY_PATH` | Абсолютний шлях до клону репозиторію на VPS | напр. `/opt/ustriy-system` |
| `DEPLOY_DOMAIN` | Домен для GitLab Environments (необов'язково) | напр. `yourdomain.com` |

#### Налаштування SSH-доступу на VPS

```bash
# 1. Згенерувати ключову пару (локально або в CI)
ssh-keygen -t ed25519 -C "gitlab-ci" -f ~/.ssh/gitlab_deploy

# 2. Додати публічний ключ до authorized_keys на VPS
ssh-copy-id -i ~/.ssh/gitlab_deploy.pub $SSH_USER@$SSH_HOST

# 3. Отримати SSH_KNOWN_HOSTS
ssh-keyscan -H $SSH_HOST

# 4. Вміст gitlab_deploy (приватний ключ) → змінна SSH_PRIVATE_KEY в GitLab
```

---

## Ліцензія

MIT
