# Специфікація REST API

Опис HTTP API системи **Ustriy**. Усі клієнти (адмін-панель, Telegram-бот, обробники email) звертаються до **одного** backend на NestJS.

> **Статус реалізації:**  
> ✅ — реалізовано | 🔲 — заплановано  
> Інтерактивна документація (Swagger): `/api/docs` при `SWAGGER_ENABLED=true`

---

## Загальні правила

| Параметр | Значення |
|----------|----------|
| Базова URL (локально) | `http://localhost:3000` |
| Глобальний префікс | `/api` (`app.setGlobalPrefix('api')`) |
| Формат тіла | `application/json` |
| Кодування | UTF-8 |
| Час | ISO 8601 (`timestamptz`) |
| Ідентифікатори | `uuid` v4 (tickets, residents, staff) або `integer` (dormitories, specialists, statuses) |

### Аутентифікація

| Клієнт | Механізм |
|--------|----------|
| Адмін-панель (`specialist`, `dispatcher`) | Google OAuth 2.0 → JWT у **httpOnly cookies** |
| Telegram-бот (`resident`) | Прив'язка `telegramId` + верифікація email (внутрішній flow бота) |

Токени зберігаються у httpOnly cookies (встановлюються після OAuth callback):

| Cookie | TTL |
|--------|-----|
| `access_token` | `JWT_ACCESS_EXPIRES_IN` — 15 хв |
| `refresh_token` | `JWT_REFRESH_EXPIRES_IN` — 7 днів, path `/api/auth/refresh` |

> **Важливо:** Bearer-header (`Authorization: Bearer ...`) **не використовується** на поточному етапі. JwtStrategy читає токен з cookie `access_token`.

### Формат помилки

```json
{
  "statusCode": 400,
  "message": "Помилка валідації",
  "error": "Bad Request"
}
```

| Код | Коли |
|-----|------|
| `400` | Невалідні дані (class-validator) |
| `401` | Немає або прострочений токен |
| `403` | Недостатньо прав |
| `404` | Ресурс не знайдено |
| `429` | Перевищено ліміт запитів (`@nestjs/throttler`) |
| `500` | Внутрішня помилка сервера |

---

## Сервісний endpoint

### ✅ `GET /api/health`

Перевірка стану сервісу (DB ping + heap memory).

**Доступ:** публічний (throttle пропускається)

**Відповідь `200`:**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  }
}
```

---

## Аутентифікація

### ✅ `GET /api/auth/google`

Початок Google OAuth для персоналу — перенаправлення на Google.

**Доступ:** публічний  
**Відповідь:** `302` → Google consent screen

---

### ✅ `GET /api/auth/google/callback`

Зворотний виклик після Google. Перевіряє, що `staff` існує з `isActive = true` та роллю `specialist` | `dispatcher`. Встановлює `access_token` і `refresh_token` у httpOnly cookies.

**Доступ:** публічний (OAuth callback)  
**Відповідь при успіху:** `302` → `{FRONTEND_URL}/dashboard`  
**Відповідь при помилці:** `302` → `{FRONTEND_URL}/auth/login?error=oauth_failed`

---

### ✅ `POST /api/auth/refresh`

Оновлення access-токена. Читає `refresh_token` з cookie, встановлює нові cookies.

**Доступ:** захищений `RefreshTokenGuard` (cookie `refresh_token`)  
**Тіло:** відсутнє  
**Відповідь `200`:** порожнє тіло; нові cookies встановлені

---

### ✅ `POST /api/auth/logout`

Очищення auth cookies.

**Доступ:** публічний (cookies очищаються незалежно від стану)  
**Відповідь `200`:** порожнє тіло

---

### ✅ `GET /api/auth/me`

Поточний авторизований staff-член.

**Доступ:** `JwtAuthGuard` (cookie `access_token`)

**Відповідь `200`:**

```json
{
  "id": "uuid",
  "name": "Іван Петренко",
  "email": "staff@univ.edu.ua",
  "role": "dispatcher"
}
```

Поле `role`: `specialist` | `dispatcher`

---

## Заявки

Усі ендпоінти захищені `JwtAuthGuard` — доступні лише для авторизованого персоналу (адмін-панель). Мешканці створюють заявки через Telegram-бот напряму (сервісний виклик без HTTP).

### ✅ `GET /api/tickets`

Список заявок з опціональною фільтрацією.

**Доступ:** авторизований персонал  
**Query-параметри:**

| Параметр | Тип | Опис |
|----------|-----|------|
| `dormitoryId` | `integer` | Фільтр по гуртожитку |
| `specialistId` | `integer` | Фільтр по фахівцю |

**Відповідь `200`:** масив заявок, відсортованих `createdAt DESC`

```json
[
  {
    "id": "uuid",
    "residentId": "uuid",
    "specialistId": 1,
    "statusId": 1,
    "dormitoryId": 3,
    "description": "Не працює кран у кімнаті",
    "createdAt": "2026-05-23T10:00:00.000Z",
    "updatedAt": "2026-05-23T10:00:00.000Z",
    "specialist": { "id": 1, "name": "Сантехник", "isActive": true },
    "status": { "id": 1, "name": "Новий" },
    "dormitory": { "id": 3, "number": 3, "isActive": true }
  }
]
```

---

### ✅ `GET /api/tickets/:id`

Одна заявка з усіма зв'язками.

**Доступ:** авторизований персонал  
**Params:** `id` — UUID заявки  
**Відповідь `200`:** об'єкт заявки (аналогічно `GET /api/tickets`)  
**Відповідь `404`:** заявку не знайдено  
**Відповідь `400`:** некоректний UUID

---

### ✅ `PATCH /api/tickets/:id/status`

Зміна статусу заявки.

**Доступ:** авторизований персонал  
**Params:** `id` — UUID заявки

**Тіло:**

```json
{
  "statusId": 2
}
```

**Відповідь `200`:** оновлений об'єкт заявки  
**Відповідь `404`:** заявку або статус не знайдено

---

## Довідкові дані (сідування при старті)

### Статуси заявок (`ticket_statuses`)

Ініціалізуються автоматично при запуску застосунку:

| id | name |
|----|------|
| 1 | Новий |
| 2 | в Обробці |
| 3 | Відхилено |
| 4 | На паузі |
| 5 | Виконано |

### Фахівці (`specialists`)

Ініціалізуються автоматично при запуску застосунку:

| id | name |
|----|------|
| 1 | Електрик |
| 2 | Сантехник |
| 3 | Столяр |

### Гуртожитки (`dormitories`)

Ініціалізуються автоматично: номери 3–13.

---

## Telegram-бот (внутрішній flow)

Бот **не** звертається до REST API — сервіси викликаються напряму через DI (NestJS modules). Wizard-сцени:

| Сцена | Опис |
|-------|------|
| `onboarding` | Вибір між реєстрацією та відновленням акаунту |
| `registration` | Реєстрація мешканця (тип → ім'я → гуртожиток → кімната → email) |
| `account-recovery` | Відновлення по email (код верифікації) |
| `verify-email` | Введення 6-значного коду |
| `main-menu` | Головне меню з кнопками дій |
| `submit-ticket` | Подача заявки (фахівець → опис → підтвердження) |

### Flow подачі заявки (`submit-ticket`)

```
Крок 1 → Inline-кнопки: список фахівців  + reply-кнопка «❌ Скасувати»
Крок 2 → Отримати вибір фахівця (або скасування)
          → «📝 Опишіть проблему:» + reply-кнопка «❌ Скасувати»
Крок 3 → Отримати опис (або скасування)
          → Підсумок + inline-кнопки «✅ Подати заявку» / «↩ До меню»
Крок 4 → Підтвердження: створити заявку в БД / повернутися без збереження
```

Заявка записується в БД **лише після підтвердження** на кроці 4. Статус встановлюється автоматично: «Новий».

---

## Заплановано (не реалізовано)

### 🔲 Управління персоналом

- `POST /api/staff` — попередня реєстрація (dispatcher)
- `GET /api/staff` — список персоналу
- `PATCH /api/staff/:id` — оновлення ролі / деактивація

### 🔲 Мешканці

- `GET /api/residents` — список (dispatcher)
- `GET /api/residents/pending` — черга орендарів на підтвердження
- `PATCH /api/residents/:id/verify` — підтвердити орендаря

### 🔲 Гуртожитки (розширення)

- `POST /api/dormitories` — створення
- `PATCH /api/dormitories/:id` — оновлення

### 🔲 Коментарі до заявок

- `GET /api/tickets/:id/comments`
- `POST /api/tickets/:id/comments`

### 🔲 Аналітика

- `GET /api/analytics/summary` — зведена статистика (dispatcher)

---

## Змінні середовища (релевантні API)

| Змінна | Призначення |
|--------|-------------|
| `APP_PORT` | Порт backend (за замовч. 3000) |
| `FRONTEND_URL` | URL адмін-панелі (CORS + OAuth redirect) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Ключі Google OAuth |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3000/api/auth/google/callback` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Підпис токенів |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | TTL токенів |
| `TELEGRAM_BOT_TOKEN` | Telegram-бот |
| `UNIVERSITY_EMAIL_DOMAIN` | Домен для автоверифікації студентів |
| `SWAGGER_ENABLED` | Увімкнути Swagger UI |
| `SWAGGER_PATH` | Шлях до Swagger (напр. `api/docs`) |
