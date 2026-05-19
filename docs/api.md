# Специфікація REST API

Опис HTTP API системи **Ustriy**. Усі клієнти (адмін-панель, Telegram-бот, обробники email) звертаються до **одного** backend на NestJS.

> **Статус:** ендпоінти описані як цільовий контракт; реалізація в `apps/backend` ще не розпочата.  
> Актуальна інтерактивна документація після імплементації: **Swagger** — `/api/docs` (`SWAGGER_ENABLED=true`).

---

## Загальні правила

| Параметр | Значення |
|----------|----------|
| Базова URL (локально) | `http://localhost:3000` |
| Префікс API | `/api` (рекомендований глобальний префікс у NestJS) |
| Формат тіла | `application/json` |
| Кодування | UTF-8 |
| Час | ISO 8601 (`timestamptz`) |
| Ідентифікатори | `uuid` v4 |

### Аутентифікація

| Клієнт | Механізм |
|--------|----------|
| Адмін-панель (`specialist`, `dispatcher`) | Google OAuth 2.0 → JWT |
| Telegram-бот (`resident`) | Прив'язка `telegramId` + верифікація email → JWT |
| Сервісні виклики (внутрішні) | `Authorization: Bearer <access_token>` |

| Токен | TTL (env) |
|-------|-----------|
| Access | `JWT_ACCESS_EXPIRES_IN` — 15 хв |
| Refresh | `JWT_REFRESH_EXPIRES_IN` — 7 днів |

Заголовок для захищених маршрутів:

```http
Authorization: Bearer <access_token>
```

### Формат успішної відповіді

```json
{
  "data": { },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

- `data` — об'єкт або масив
- `meta` — опційно, для пагінації

### Формат помилки

```json
{
  "statusCode": 400,
  "message": "Помилка валідації",
  "error": "Некоректний запит",
  "details": [
    { "field": "email", "message": "email має бути коректною адресою" }
  ]
}
```

| Код | Коли |
|-----|------|
| `400` | Невалідні дані (class-validator) |
| `401` | Немає або прострочений токен |
| `403` | Недостатньо прав для ролі |
| `404` | Ресурс не знайдено |
| `409` | Конфлікт (дубль email, повторна оцінка) |
| `429` | Перевищено ліміт запитів (`@nestjs/throttler`) |
| `500` | Внутрішня помилка сервера |

### Пагінація та фільтри (списки)

Query-параметри для `GET` з колекціями:

| Параметр | Тип | За замовч. | Опис |
|----------|-----|------------|------|
| `page` | `number` | `1` | Номер сторінки |
| `limit` | `number` | `20` | Розмір сторінки (макс. 100) |
| `sort` | `string` | `-createdAt` | Поле; `-` — DESC |
| `status` | `string` | — | Фільтр (де застосовно) |
| `q` | `string` | — | Пошук по тексту |

---

## Ролі та доступ

| Ресурс / дія | `resident` | `specialist` | `dispatcher` |
|--------------|:----------:|:------------:|:------------:|
| Власні заявки (обмежений CRUD) | ✅ | — | — |
| Призначені заявки | — | ✅ | ✅ |
| Усі заявки | — | — | ✅ |
| Призначити фахівця | — | — | ✅ |
| Керування гуртожитками | — | — | ✅ |
| Користувачі / верифікація орендарів | — | — | ✅ |
| Аналітика | — | — | ✅ |
| Вхід через Google OAuth | — | ✅ | ✅ |
| Адмін-панель (фронтенд) | ❌ | ✅ | ✅ |

---

## Автентифікація

### `GET /api/auth/google`

Початок OAuth для персоналу. Перенаправлення на Google.

**Доступ:** публічний  
**Відповідь:** `302` → Google

---

### `GET /api/auth/google/callback`

Зворотний виклик після Google. Створює JWT-сесію, якщо користувач існує з роллю `specialist` | `dispatcher` і `isActive = true`.

**Доступ:** публічний (callback)  
**Відповідь:** `302` → `FRONTEND_URL` з токенами в cookie або query-параметрах (за реалізацією)

**Помилки:** `403` — email не зареєстрований або роль `resident`

---

### `POST /api/auth/refresh`

Оновлення access-токена.

**Тіло:**

```json
{
  "refreshToken": "<refresh_token>"
}
```

**Відповідь `200`:**

```json
{
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

---

### `POST /api/auth/logout`

Відкликання refresh-токена.

**Доступ:** авторизований  
**Тіло:** `{ "refreshToken": "..." }`  
**Відповідь:** `204` (без тіла)

---

### `GET /api/auth/me`

Поточний користувач.

**Доступ:** авторизований  

**Відповідь `200`:**

```json
{
  "data": {
    "id": "uuid",
    "email": "user@univ.edu.ua",
    "fullName": "Іван Петренко",
    "role": "dispatcher",
    "verificationStatus": "verified"
  }
}
```

---

## Telegram-бот / аутентифікація мешканця

Ендпоінти для Telegram-бота (`nestjs-telegraf`). Бот викликає API від імені backend (сервісний токен або внутрішній guard).

### `POST /api/bot/auth/link`

Прив'язка Telegram до облікового запису.

**Тіло:**

```json
{
  "telegramId": 123456789,
  "telegramUsername": "ivan_p",
  "languageCode": "uk"
}
```

**Відповідь `200`:** `{ "data": { "linkToken": "..." } }` — токен для підтвердження email

---

### `POST /api/bot/auth/verify-email`

Верифікація email мешканця.

**Тіло:**

```json
{
  "linkToken": "...",
  "email": "student@univ.edu.ua",
  "fullName": "Іван Петренко",
  "residentType": "student"
}
```

**Логіка:**

- `student` + домен у білому списку → `verificationStatus: verified`
- `tenant` → `verificationStatus: pending` (очікує диспетчера)

**Відповідь `200`:**

```json
{
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": "...", "role": "resident", "verificationStatus": "verified" }
  }
}
```

---

### `POST /api/bot/webhook`

Telegram webhook (продакшн). Локально — long polling через Telegraf.

**Доступ:** секретний шлях / заголовок від Telegram  
**Тіло:** оновлення Telegram Update  
**Відповідь:** `200`

---

## Користувачі

### `GET /api/users`

Список користувачів.

**Доступ:** `dispatcher`  
**Query:** `role`, `verificationStatus`, `q`, `page`, `limit`

**Відповідь `200`:** масив користувачів + `meta.total`

---

### `GET /api/users/:id`

Картка користувача.

**Доступ:** `dispatcher` або власний профіль (`/auth/me`)

---

### `POST /api/users`

Попередня реєстрація персоналу (до першого входу через Google).

**Доступ:** `dispatcher`  

**Тіло:**

```json
{
  "email": "specialist@univ.edu.ua",
  "fullName": "Олег Коваленко",
  "role": "specialist",
  "position": "Сантехнік"
}
```

**Відповідь `201`:** створений `User` + `StaffProfile`

---

### `PATCH /api/users/:id`

Оновлення користувача (роль, `isActive`, верифікація орендаря).

**Доступ:** `dispatcher`  

**Тіло (приклад — підтвердження орендаря):**

```json
{
  "verificationStatus": "verified"
}
```

---

### `GET /api/users/pending-tenants`

Черга орендарів на підтвердження.

**Доступ:** `dispatcher`  
**Query:** `page`, `limit`

---

## Гуртожитки

Керування структурою кампусу. **Лише `dispatcher`.**

### `GET /api/dormitories`

Список гуртожитків.

**Query:** `campusId`, `isActive`, `q`

---

### `POST /api/dormitories`

**Тіло:**

```json
{
  "name": "Гуртожиток №3",
  "address": "вул. Студентська, 1",
  "floorsCount": 9,
  "campusId": "uuid"
}
```

---

### `PATCH /api/dormitories/:id`

Часткове оновлення гуртожитку.

---

### `GET /api/dormitories/:id/rooms`

Кімнати гуртожитку.

---

### `POST /api/dormitories/:id/rooms`

**Тіло:**

```json
{
  "number": "412",
  "floor": 4
}
```

---

### `PATCH /api/rooms/:id`

Оновлення / деактивація кімнати.

---

## Заявки

### `GET /api/tickets`

Список заявок.

| Роль | Фільтр за замовчуванням |
|------|-------------------------|
| `resident` | `authorId = me` |
| `specialist` | `assignedSpecialistId = me` (або `status=pending` — за політикою) |
| `dispatcher` | без обмежень |

**Query:** `status`, `category`, `priority`, `dormitoryId`, `assignedSpecialistId`, `dateFrom`, `dateTo`, `q`, `page`, `limit`, `sort`

**Відповідь `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "publicNumber": "UST-2026-0042",
      "title": "Не працює кран",
      "description": "...",
      "status": "pending",
      "category": "plumbing",
      "priority": "normal",
      "room": { "id": "...", "number": "412", "dormitory": { "id": "...", "name": "Гуртожиток №3" } },
      "author": { "id": "...", "fullName": "..." },
      "assignedSpecialist": null,
      "createdAt": "2026-05-19T10:00:00.000Z",
      "updatedAt": "2026-05-19T10:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 20 }
}
```

---

### `GET /api/tickets/:id`

Деталі заявки + останні коментарі / історія (опційно `?include=comments,history`).

**Доступ:** автор, призначений фахівець, диспетчер

---

### `POST /api/tickets`

Створення заявки.

**Доступ:** `resident` з `verificationStatus = verified` (через бот або API)

**Тіло:**

```json
{
  "roomId": "uuid",
  "category": "plumbing",
  "title": "Не працює кран",
  "description": "Кран на кухні постійно капає",
  "priority": "normal"
}
```

**Відповідь `201`:** заявка з `status: pending`  
**Побічні ефекти:** запис у `TicketStatusHistory`, Telegram-сповіщення диспетчеру

---

### `PATCH /api/tickets/:id`

Оновлення заявки.

**Приклади тіл:**

Призначити фахівця (`dispatcher`):

```json
{
  "assignedSpecialistId": "uuid"
}
```

Змінити статус (`specialist` | `dispatcher`):

```json
{
  "status": "in_progress",
  "comment": "Виїхав на об'єкт"
}
```

Відхилити:

```json
{
  "status": "rejected",
  "rejectionReason": "Не стосується служби експлуатації"
}
```

**Правила переходів:** див. [entities.md](./entities.md#ticket)

---

### `GET /api/tickets/:id/comments`

Коментарі до заявки.

**Доступ:** учасники заявки; `resident` бачить лише `visibility: public`

---

### `POST /api/tickets/:id/comments`

**Тіло:**

```json
{
  "body": "Замовлено запчастину",
  "visibility": "internal"
}
```

**Доступ:** `specialist`, `dispatcher` (`internal`); `resident` — лише `public` (через бот)

---

### `GET /api/tickets/:id/history`

Історія змін статусу.

**Доступ:** учасники заявки + `dispatcher`

---

### `POST /api/tickets/:id/rate`

Оцінка після виконання.

**Доступ:** `resident` (автор), лише якщо `status = resolved` і оцінки ще немає

**Тіло:**

```json
{
  "score": 5,
  "comment": "Швидко та якісно"
}
```

**Відповідь `201`:** `TicketRating`

---

### `POST /api/tickets/:id/reopen`

Повторне відкриття заявки після `resolved`.

**Доступ:** `resident` (автор)

**Тіло (опційно):**

```json
{
  "comment": "Проблема повторилась"
}
```

**Відповідь `200`:** `status: pending`, новий запис у `TicketStatusHistory`

---

## Аналітика

### `GET /api/analytics/summary`

Зведена статистика для диспетчера.

**Доступ:** `dispatcher`  
**Query:** `dateFrom`, `dateTo`, `dormitoryId`

**Відповідь `200`:**

```json
{
  "data": {
    "ticketsTotal": 120,
    "byStatus": {
      "pending": 15,
      "in_progress": 8,
      "resolved": 90,
      "rejected": 7
    },
    "avgResolutionHours": 36.5,
    "avgRating": 4.2,
    "topCategories": [
      { "category": "plumbing", "count": 45 }
    ]
  }
}
```

---

## Сповіщення (внутрішня логіка)

Не публічні REST-ендпоінти; реалізується в сервісах:

| Подія | Канал |
|-------|-------|
| Нова заявка | Telegram → диспетчер / черга |
| Зміна статусу | Telegram → мешканець |
| Публічний коментар | Telegram → мешканець |
| Призначення фахівця | Telegram → фахівець (опційно) |
| Критичні події | Email (Nodemailer) |

---

## Змінні середовища (релевантні API)

| Змінна | Призначення |
|--------|-------------|
| `APP_URL` | Публічна URL backend |
| `FRONTEND_URL` | URL адмін-панелі (перенаправлення після OAuth) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Ключі OAuth |
| `GOOGLE_CALLBACK_URL` | URL зворотного виклику (напр. `http://localhost:3000/api/auth/google/callback`) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Підпис токенів |
| `TELEGRAM_BOT_TOKEN` | Бот |
| `CORS_ORIGINS` | Дозволені origins |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | Обмеження частоти запитів |
| `SWAGGER_*` | Документація |

---

## Пріоритет імплементації

1. `User`, `Dormitory`, `Room`, `Ticket` + міграції  
2. Аутентифікація: Google OAuth + JWT (`specialist`, `dispatcher`)  
3. CRUD заявок + статуси + історія  
4. Бот: аутентифікація мешканця + створення / перегляд заявок  
5. Коментарі, рейтинг, повторне відкриття  
6. Аналітика, email-сповіщення  

Детальна модель полів — у [entities.md](./entities.md).
