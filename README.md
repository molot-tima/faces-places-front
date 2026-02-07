# Faces & Places — Telegram Mini App

Telegram Mini App для поиска и рекомендации культурных событий (театр, кино, концерты, квесты и т.д.).

## Быстрый старт

```bash
# Установить зависимости
npm install

# Запустить dev-сервер (с mock API)
npm run dev
```

Приложение будет доступно на `http://localhost:3000`.

## Конфигурация (.env)

```env
# Base URL для реального бэкенда (используется когда VITE_MOCK_API=false)
VITE_API_BASE_URL=https://your-api.example.com

# Включить mock API — MSW перехватывает fetch-запросы в браузере
# Установите "false" чтобы переключиться на реальный бэкенд
VITE_MOCK_API=true

# Фейковый Telegram-пользователь для разработки в браузере
VITE_DEV_FAKE_TELEGRAM_USER=true
```

## Mock-режим

При `VITE_MOCK_API=true` используется [MSW (Mock Service Worker)](https://mswjs.io/):

- Все `fetch`-запросы к `/api/v1/*` перехватываются в Service Worker
- Ответы соответствуют структуре OpenAPI (`places_and_faces_back-openapi.yaml`) и API-контрактам (`API_CONTRACTS.md`)
- Данные хранятся in-memory (избранное синхронизируется с `localStorage`)
- Искусственный delay 100-400мс для имитации сети

**Переключение на реальный бэкенд:**

```env
VITE_MOCK_API=false
VITE_API_BASE_URL=https://your-real-api.example.com
```

Код менять не нужно — API-клиент автоматически переключится на реальные запросы.

## Тестирование в Telegram

### 1. Создайте бота

Через [@BotFather](https://t.me/BotFather):
- `/newbot` — создайте бота
- `/setmenubutton` — установите кнопку Web App

### 2. Запустите tunnel

```bash
# Вариант A: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3000

# Вариант B: ngrok
ngrok http 3000
```

### 3. Настройте Web App URL

В BotFather: `/setmenubutton` → отправьте HTTPS URL от tunnel.

### 4. Тестируйте

Откройте бота в Telegram (iOS/Android/Desktop) и нажмите кнопку меню.

## Архитектура

```
src/
├── main.ts               # Точка входа: MSW → Telegram SDK → Router
├── router.ts             # Hash-based SPA router
├── telegram/
│   └── telegram.ts       # Обёртка над Telegram WebApp SDK
├── api/
│   ├── generated.ts      # Типы из OpenAPI + API_CONTRACTS.md
│   ├── http.ts           # Fetch-обёртка (базовый URL, таймауты, auth)
│   └── index.ts          # API-функции по операциям
├── mocks/
│   ├── browser.ts        # MSW setup
│   ├── handlers.ts       # Обработчики запросов (mock endpoints)
│   └── data.ts           # In-memory данные и favorites store
└── pages/
    ├── home.ts           # Главный экран
    ├── events.ts         # Список событий
    ├── event-detail.ts   # Детали события
    └── favorites.ts      # Избранное
```

## Роуты

| Hash          | Экран                |
|---------------|----------------------|
| `#/`          | Главная              |
| `#/events`    | Афиша событий        |
| `#/event/:id` | Детали события       |
| `#/favorites` | Избранное            |

## API Endpoints (MVP)

Все вызовы через единый клиент `src/api/index.ts`:

| Метод  | Путь                            | Описание              |
|--------|---------------------------------|-----------------------|
| POST   | `/api/v1/auth/social`           | Авторизация           |
| GET    | `/api/v1/events`                | Список событий        |
| GET    | `/api/v1/events/:id`            | Детали события        |
| GET    | `/api/v1/users/me/favorites`    | Избранное             |
| POST   | `/api/v1/users/me/favorites`    | Добавить в избранное  |
| DELETE | `/api/v1/users/me/favorites/:id`| Удалить из избранного |

## Скрипты

```bash
npm run dev        # Dev-сервер с HMR
npm run build      # Production build
npm run preview    # Preview production build
npm run gen:api    # Генерация типов из OpenAPI
```

## Авторизация (TODO для production)

Сейчас используется mock-токен и `initDataUnsafe.user` (только для отображения в UI).

**В production необходимо:**
1. При старте приложения отправить `Telegram.WebApp.initData` на бэкенд
2. Бэкенд проверяет подпись `initData` (HMAC-SHA-256 с bot token)
3. Бэкенд возвращает JWT access/refresh tokens
4. Фронт подставляет JWT в `Authorization: Bearer ...` заголовок

## Требования

- Node.js 18+
- HTTPS для production (Telegram WebApp требует HTTPS)
- На iOS/Android: корректный viewport (`viewport-fit=cover`)
