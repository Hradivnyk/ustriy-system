# Сутності (модель даних)

Документ описує доменну модель **Ustriy** — системи обліку заявок на ремонт у студентському містечку.  
Усі сутності плануються як сутності TypeORM у `apps/backend/src/**/entities/`.

> **Статус:** модель узгоджена на рівні дизайну; реалізація в коді ще не почата.

---

## Огляд зв'язків

```
Campus
  └── Dormitory (гуртожиток)
        └── Room (кімната)

User (resident | specialist | dispatcher)
  ├── TelegramAccount (1:1, лише resident)
  └── StaffProfile (1:1, specialist | dispatcher)

Ticket
  ├── TicketStatusHistory (1:N)
  ├── TicketComment (1:N)
  └── TicketRating (0:1, після статусу `resolved`)

RefreshToken (N:1 → User)
```

---

## Перелік сутностей

| Сутність | Призначення |
|----------|-------------|
| `User` | Усі учасники системи (мешканці та персонал) |
| `TelegramAccount` | Прив'язка мешканця до Telegram |
| `StaffProfile` | Додаткові дані фахівця / диспетчера |
| `Campus` | Кампус / містечко (опційно, якщо кілька об'єктів) |
| `Dormitory` | Гуртожиток |
| `Room` | Кімната / приміщення |
| `Ticket` | Заявка на ремонт |
| `TicketStatusHistory` | Історія змін статусу |
| `TicketComment` | Коментарі до заявки |
| `TicketRating` | Оцінка фахівця після виконання |
| `RefreshToken` | Refresh JWT (зберігання в БД або Redis) |

---

## User

Базова таблиця користувачів. Один запис — одна людина в системі.

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `email` | `varchar(255)` | так* | Унікальний email (*для персоналу — Google; для студента — університетський) |
| `fullName` | `varchar(255)` | так | ПІБ |
| `role` | `enum` | так | `resident` \| `specialist` \| `dispatcher` |
| `residentType` | `enum` | ні | `student` \| `tenant` — лише для `resident` |
| `verificationStatus` | `enum` | так | `pending` \| `verified` \| `rejected` |
| `googleId` | `varchar(255)` | ні | Google sub — лише для `specialist` / `dispatcher` |
| `phone` | `varchar(32)` | ні | Контактний телефон |
| `isActive` | `boolean` | так | `false` — заблокований користувач |
| `createdAt` | `timestamptz` | так | |
| `updatedAt` | `timestamptz` | так | |

### Ролі

| Роль | Канал | Аутентифікація |
|------|-------|----------------|
| `resident` | Telegram-бот | Без Google OAuth |
| `specialist` | Адмін-панель | Google OAuth + попередня реєстрація |
| `dispatcher` | Адмін-панель | Google OAuth + попередня реєстрація |

### Верифікація мешканців (`resident`)

| `residentType` | Логіка `verificationStatus` |
|----------------|------------------------------|
| `student` | Автоматично `verified`, якщо email належить дозволеному домену університету (напр. `@univ.edu.ua`) |
| `tenant` | Початково `pending`; диспетчер підтверджує (`verified`) або відхиляє (`rejected`) в адмін-панелі |

Мешканець з `verificationStatus !== verified` **не може** створювати заявки.

### Обмеження

- `googleId` — обов'язкове для `specialist` і `dispatcher`
- `residentType` — обов'язкове для `resident`
- `email` — унікальне
- `googleId` — унікальне (де задано)

---

## TelegramAccount

Зв'язок мешканця з Telegram. Бот ідентифікує користувача за `telegramId`.

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `userId` | `uuid` | так | зовнішній ключ → `User.id` (унікальний) |
| `telegramId` | `bigint` | так | ідентифікатор користувача Telegram (унікальний) |
| `telegramUsername` | `varchar(64)` | ні | @username |
| `languageCode` | `varchar(8)` | ні | Мова інтерфейсу бота |
| `linkedAt` | `timestamptz` | так | Час прив'язки |
| `updatedAt` | `timestamptz` | так | |

**Зв'язки:** `User` 1 — 1 `TelegramAccount` (тільки для `role = resident`).

---

## StaffProfile

Розширення для персоналу (не для мешканців).

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `userId` | `uuid` | так | зовнішній ключ → `User.id` (унікальний) |
| `position` | `varchar(128)` | ні | Посада (напр. «Сантехнік») |
| `department` | `varchar(128)` | ні | Підрозділ |
| `createdAt` | `timestamptz` | так | |
| `updatedAt` | `timestamptz` | так | |

**Зв'язки:** `User` 1 — 0..1 `StaffProfile` (для `specialist` | `dispatcher`).

---

## Campus

Опційний рівень, якщо система обслуговує кілька кампусів.

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `name` | `varchar(255)` | так | Назва |
| `address` | `varchar(512)` | ні | Адреса |
| `isActive` | `boolean` | так | |
| `createdAt` | `timestamptz` | так | |
| `updatedAt` | `timestamptz` | так | |

---

## Dormitory

Гуртожиток у межах кампусу.

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `campusId` | `uuid` | ні | зовнішній ключ → `Campus.id` |
| `name` | `varchar(255)` | так | Назва (напр. «Гуртожиток №3») |
| `address` | `varchar(512)` | ні | |
| `floorsCount` | `smallint` | ні | Кількість поверхів |
| `isActive` | `boolean` | так | |
| `createdAt` | `timestamptz` | так | |
| `updatedAt` | `timestamptz` | так | |

**Зв'язки:** `Campus` 1 — N `Dormitory`; `Dormitory` 1 — N `Room`.

Керування структурою — лише `dispatcher`.

---

## Room

Кімната або приміщення (місце поломки).

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `dormitoryId` | `uuid` | так | зовнішній ключ → `Dormitory.id` |
| `number` | `varchar(32)` | так | Номер кімнати (напр. `412`) |
| `floor` | `smallint` | ні | Поверх |
| `isActive` | `boolean` | так | |
| `createdAt` | `timestamptz` | так | |
| `updatedAt` | `timestamptz` | так | |

**Унікальність:** пара `(dormitoryId, number)` — унікальна в межах гуртожитку.

---

## Ticket

Заявка на ремонт — центральна сутність системи.

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | PK, публічний номер для бота (можна дублювати в `publicNumber`) |
| `publicNumber` | `varchar(16)` | так | Людиночитний номер (напр. `UST-2026-0042`), унікальний |
| `authorId` | `uuid` | так | зовнішній ключ → `User.id` (мешканець) |
| `assignedSpecialistId` | `uuid` | ні | зовнішній ключ → `User.id` (`specialist`) |
| `assignedById` | `uuid` | ні | зовнішній ключ → `User.id` (`dispatcher`, хто призначив) |
| `roomId` | `uuid` | так | зовнішній ключ → `Room.id` |
| `category` | `enum` | так | Категорія робіт (див. нижче) |
| `title` | `varchar(255)` | так | Короткий заголовок |
| `description` | `text` | так | Детальний опис |
| `status` | `enum` | так | Статус (див. нижче) |
| `priority` | `enum` | ні | `low` \| `normal` \| `high` \| `urgent` (за замовч. `normal`) |
| `resolvedAt` | `timestamptz` | ні | Час переходу в `resolved` |
| `rejectedAt` | `timestamptz` | ні | Час відхилення |
| `rejectionReason` | `text` | ні | Причина відхилення |
| `createdAt` | `timestamptz` | так | |
| `updatedAt` | `timestamptz` | так | |

### Категорії (`category`)

| Значення | Опис |
|----------|------|
| `plumbing` | Сантехніка |
| `electrical` | Електрика |
| `furniture` | Меблі |
| `hvac` | Опалення / вентиляція |
| `other` | Інше |

Список можна розширити без зміни логіки статусів.

### Статуси (`status`)

```
pending → in_progress → resolved
                      ↘ rejected
```

| Статус | Хто встановлює | Опис |
|--------|----------------|------|
| `pending` | Система при створенні | Нова заявка, очікує призначення |
| `in_progress` | `dispatcher` або `specialist` | Фахівець працює над заявкою |
| `resolved` | `specialist` | Роботи виконано |
| `rejected` | `dispatcher` або `specialist` | Заявку відхилено (з причиною) |

### Після `resolved`

Мешканець через бот може:

1. **Оцінити** фахівця → створюється `TicketRating`
2. **Відкрити повторно** → статус повертається в `pending`, `assignedSpecialistId` може скидатися (за політикою продукту)

### Права доступу до записів

| Роль | Бачить |
|------|--------|
| `resident` | Лише власні заявки |
| `specialist` | Призначені йому + можливо неназначені в черзі (за політикою) |
| `dispatcher` | Усі заявки |

---

## TicketStatusHistory

Аудит змін статусу (для аналітики та прозорості).

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `ticketId` | `uuid` | так | зовнішній ключ → `Ticket.id` |
| `fromStatus` | `enum` | ні | Попередній статус (`null` при створенні) |
| `toStatus` | `enum` | так | Новий статус |
| `changedById` | `uuid` | так | зовнішній ключ → `User.id` |
| `comment` | `text` | ні | Пояснення зміни |
| `createdAt` | `timestamptz` | так | |

---

## TicketComment

Коментарі до заявки (внутрішні для персоналу або видимі мешканцю — за полем `visibility`).

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `ticketId` | `uuid` | так | зовнішній ключ → `Ticket.id` |
| `authorId` | `uuid` | так | зовнішній ключ → `User.id` |
| `body` | `text` | так | Текст коментаря |
| `visibility` | `enum` | так | `internal` \| `public` |
| `createdAt` | `timestamptz` | так | |
| `updatedAt` | `timestamptz` | так | |

- `internal` — лише `specialist` / `dispatcher`
- `public` — також надсилається мешканцю в Telegram

---

## TicketRating

Оцінка якості роботи після `resolved`. Один рейтинг на одну заявку.

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `ticketId` | `uuid` | так | зовнішній ключ → `Ticket.id` (унікальний) |
| `specialistId` | `uuid` | так | зовнішній ключ → `User.id` (оцінений фахівець) |
| `ratedById` | `uuid` | так | зовнішній ключ → `User.id` (мешканець) |
| `score` | `smallint` | так | 1–5 |
| `comment` | `text` | ні | Відгук текстом |
| `createdAt` | `timestamptz` | так | |

**Обмеження:** `score` від 1 до 5; створення лише якщо `Ticket.status = resolved`.

---

## RefreshToken

Зберігання refresh-токенів (БД або Redis — на вибір реалізації).

| Поле | Тип | Обов'язкове | Опис |
|------|-----|-------------|------|
| `id` | `uuid` | так | первинний ключ |
| `userId` | `uuid` | так | зовнішній ключ → `User.id` |
| `tokenHash` | `varchar(255)` | так | Хеш токена (не у відкритому вигляді) |
| `expiresAt` | `timestamptz` | так | Термін дії (7 днів) |
| `revokedAt` | `timestamptz` | ні | Час відкликання |
| `createdAt` | `timestamptz` | так | |

---

## Перелічення (enum) — зведення

```typescript
type UserRole = 'resident' | 'specialist' | 'dispatcher';
type ResidentType = 'student' | 'tenant';
type VerificationStatus = 'pending' | 'verified' | 'rejected';

type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
type TicketCategory = 'plumbing' | 'electrical' | 'furniture' | 'hvac' | 'other';
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

type CommentVisibility = 'internal' | 'public';
```

---

## Індекси (рекомендовані)

| Таблиця | Індекс | Призначення |
|---------|--------|-------------|
| `User` | `email`, `googleId`, `(role, verificationStatus)` | Пошук, верифікація |
| `TelegramAccount` | `telegramId` | Авторизація в боті |
| `Ticket` | `(status, createdAt)`, `authorId`, `assignedSpecialistId` | Списки, фільтри |
| `Room` | `(dormitoryId, number)` | Унікальність кімнати |
| `TicketStatusHistory` | `ticketId` | Історія заявки |

---

## Синхронізація з фронтендом

Типи в `apps/frontend/src/types/index.ts` **застарілі** (`student` / `admin`). Після реалізації backend їх потрібно оновити відповідно до цієї моделі (`resident` / `specialist` / `dispatcher`, поля верифікації, рейтинг тощо).
