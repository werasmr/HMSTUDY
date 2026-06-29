# PrismaPay — P2P процессинговая платформа

Полноценная P2P платформа для обработки платежей с ролями Admin, Trader и Merchant.

## Стек

- **Frontend:** React + TypeScript + Tailwind CSS (тёмная тема)
- **Backend:** Node.js + Express + TypeScript
- **База данных:** PostgreSQL + Prisma ORM
- **Аутентификация:** JWT
- **Realtime:** Socket.io

## Быстрый старт (Docker)

```bash
docker compose up --build
```

После запуска:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

## Локальная разработка

### Требования

- Node.js 20+
- PostgreSQL 16+

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Тестовые аккаунты

| Роль     | Email                    | Пароль      |
|----------|--------------------------|-------------|
| Admin    | admin@prismapay.com      | password123 |
| Trader   | trader@prismapay.com     | password123 |
| Merchant | merchant@prismapay.com   | password123 |

API Key мерчанта выводится при выполнении seed-скрипта.

## Merchant API

### Создать платёж (Pay In)

```bash
curl -X POST http://localhost:3001/api/v1/merchant/payment \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: {merchantApiKey}" \
  -d '{
    "amount": 5000,
    "currency": "RUB",
    "orderId": "your_order_id",
    "callbackUrl": "https://yoursite.com/callback",
    "successUrl": "https://yoursite.com/success"
  }'
```

**Response:**

```json
{
  "orderId": "uuid",
  "requisite": {
    "type": "СБП",
    "number": "79991234567",
    "bank": "Тинькофф",
    "ownerName": "Иванов И.И."
  },
  "amount": 5000,
  "expiresAt": "2024-06-01T12:00:00.000Z"
}
```

### Проверить статус

```bash
curl http://localhost:3001/api/v1/merchant/payment/{orderId} \
  -H "X-API-KEY: {merchantApiKey}"
```

### Webhook callback

Система отправляет POST на `callbackUrl`:

```json
{
  "orderId": "uuid",
  "merchantOrderId": "your_order_id",
  "status": "CONFIRMED",
  "amount": 5000,
  "amountUsdt": 61.5,
  "rate": 81.3
}
```

## Алгоритм матчинга

1. Поиск активных реквизитов онлайн-трейдеров
2. Проверка лимитов (дневной, общий, min/max ордер)
3. Проверка параллельных сделок
4. Проверка задержки между ордерами
5. Уникальные суммы (если включено)
6. Выбор реквизита (least-loaded)
7. Создание Order и заморозка USDT трейдера

## Структура проекта

```
├── backend/
│   ├── prisma/          # Схема и миграции
│   ├── src/
│   │   ├── routes/      # API маршруты
│   │   ├── services/    # Бизнес-логика (матчинг)
│   │   ├── middleware/  # JWT auth
│   │   └── lib/         # Prisma, Socket.io
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/       # Страницы дашборда
│   │   ├── components/  # UI компоненты
│   │   └── context/     # Auth, Socket
│   └── Dockerfile
└── docker-compose.yml
```

## Переменные окружения

### Backend (.env)

| Переменная            | Описание                    | По умолчанию    |
|-----------------------|-----------------------------|-----------------|
| DATABASE_URL          | PostgreSQL connection       | —               |
| JWT_SECRET            | Секрет для JWT              | —               |
| PORT                  | Порт сервера                | 3001            |
| FRONTEND_URL          | URL фронтенда для CORS      | localhost:5173  |
| USDT_RUB_RATE         | Курс USDT/RUB               | 81.3            |
| ORDER_EXPIRY_MINUTES  | Время жизни сделки (мин)    | 15              |

## Роли

- **Admin** — полный доступ, управление системой
- **Trader** — добавляет карты, подтверждает платежи
- **Merchant** — делает API-запросы, получает реквизиты

## Лицензия

MIT
