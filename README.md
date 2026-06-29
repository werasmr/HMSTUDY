# NETWORS — P2P процессинговая платформа

Платёжная система **NETWORS** для обработки Pay In / Pay Out с 50+ валютами.

## Стек

- **Frontend:** React + TypeScript + Tailwind (тёмная тема)
- **Backend:** Node.js + Express + TypeScript
- **БД:** PostgreSQL + Prisma
- **Auth:** JWT + API Key (мерчанты)
- **Realtime:** Socket.io

## Деплой одной кнопкой (Render)

👉 https://render.com/deploy?repo=https://github.com/werasmr/HMSTUDY

1. Вставь `DATABASE_URL` из Neon
2. Apply → жди 5–10 мин

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@networs.io | password123 |
| Trader | trader@networs.io | password123 |
| Merchant | merchant@networs.io | password123 |

## Валюты (50+)

СНГ · Европа · Азия · Латам · MENA · Global

Admin → **Валюты** — редактирование курсов к USDT.

## Admin-панель

- **Пользователи** — создание, баланс, блокировка
- **Кошельки** — назначение USDT-адресов трейдерам
- **Валюты** — курсы 50+ валют
- **Ставки** — комиссии Pay In / Pay Out (%)
- **Пополнения** — подтверждение депозитов на кошельки

## Merchant API

```bash
curl -X POST https://YOUR-API/api/v1/merchant/payment \
  -H "X-API-KEY: key" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "currency": "KZT", "orderId": "test_1"}'
```

Поддерживаемые валюты: `GET /api/currencies`

## Локальный запуск

```bash
docker compose up --build
```

Frontend: http://localhost:5173
