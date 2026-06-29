# 🚀 Как задеплоить PrismaPay (инструкция для чайников)

> **Netlify один — не хватит.** Нужны 3 бесплатных сервиса:
> 1. **Neon** — база данных PostgreSQL
> 2. **Railway** — backend (API + Socket.io)
> 3. **Netlify** — frontend (сайт)

Всё бесплатно на старте. Нужен только аккаунт GitHub.

---

## Шаг 0. Код уже на GitHub?

Репозиторий: `https://github.com/werasmr/HMSTUDY`

Если ты форкнул или клонировал — убедись, что код залит в **свой** GitHub-репозиторий. Netlify и Railway подключаются к GitHub.

---

## Шаг 1. База данных — Neon (5 минут)

1. Открой **https://neon.tech**
2. Нажми **Sign up** → войди через **GitHub**
3. **Create a project** → имя любое (например `prismapay`)
4. Скопируй **Connection string** — строка вида:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. **Сохрани её** — это твой `DATABASE_URL`

---

## Шаг 2. Backend — Railway (10 минут)

1. Открой **https://railway.app**
2. **Login with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. Выбери репозиторий **HMSTUDY**
5. Railway создаст сервис — зайди в него → **Settings**:
   - **Root Directory** → `backend`
   - **Save**
6. Вкладка **Variables** → добавь переменные:

   | Переменная | Значение |
   |------------|----------|
   | `DATABASE_URL` | строка из Neon (шаг 1) |
   | `JWT_SECRET` | любая длинная случайная строка, напр. `my-super-secret-key-12345` |
   | `FRONTEND_URL` | пока оставь `http://localhost:5173` — обновим после Netlify |
   | `USDT_RUB_RATE` | `81.3` |
   | `ORDER_EXPIRY_MINUTES` | `15` |

7. **Settings** → **Networking** → **Generate Domain**
8. Скопируй URL backend, например:
   ```
   https://prismapay-production.up.railway.app
   ```
9. Проверь в браузере: `https://ТВОЙ-URL.railway.app/health`  
   Должно показать: `{"status":"ok",...}`

---

## Шаг 3. Frontend — Netlify (5 минут)

1. Открой **https://netlify.com**
2. **Sign up** → через **GitHub**
3. **Add new site** → **Import an existing project**
4. **GitHub** → выбери репозиторий **HMSTUDY**
5. Настройки сборки (Netlify подхватит `netlify.toml` сам, но проверь):

   | Поле | Значение |
   |------|----------|
   | Base directory | `frontend` |
   | Build command | `npm run build` |
   | Publish directory | `dist` |

6. **Environment variables** → добавь:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | URL backend из Railway, напр. `https://prismapay-production.up.railway.app` |

   ⚠️ **Без** слэша в конце!

7. **Deploy site**
8. Netlify даст URL, например:
   ```
   https://prismapay.netlify.app
   ```

---

## Шаг 4. Связать frontend и backend

1. Вернись в **Railway** → Variables
2. Обнови `FRONTEND_URL`:
   ```
   https://prismapay.netlify.app
   ```
   (подставь свой Netlify-URL)
3. Railway перезапустит backend автоматически

---

## Шаг 5. Проверка

1. Открой свой Netlify-сайт
2. Войди:
   - Email: `trader@prismapay.com`
   - Пароль: `password123`
3. Должен открыться дашборд

Если не работает — см. раздел «Проблемы» ниже.

---

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Трейдер | trader@prismapay.com | password123 |
| Мерчант | merchant@prismapay.com | password123 |
| Админ | admin@prismapay.com | password123 |

API Key мерчанта — в профиле после входа как merchant, или в логах Railway при первом деплое (seed).

---

## Merchant API (пример)

```bash
curl -X POST https://ТВОЙ-BACKEND.railway.app/api/v1/merchant/payment \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: твой-api-key" \
  -d '{"amount": 5000, "orderId": "test_1"}'
```

---

## Частые проблемы

### «Network Error» / сайт не грузит данные
- Проверь `VITE_API_URL` в Netlify — должен быть URL Railway **без** `/` в конце
- Пересобери сайт: Netlify → **Deploys** → **Trigger deploy**

### CORS error в консоли браузера (F12)
- В Railway `FRONTEND_URL` должен **точно** совпадать с Netlify-URL (с `https://`)

### Backend не стартует на Railway
- Открой **Deployments** → **View Logs**
- Частая причина: неверный `DATABASE_URL` — проверь строку из Neon

### /health не открывается
- Подожди 1–2 минуты после деплоя
- Проверь логи Railway

### Логин не работает
- Убедись, что seed прошёл (в логах Railway должно быть `Seed completed`)
- Если нет — в Railway → **Settings** → redeploy

---

## Схема (что куда)

```
Пользователь
    ↓
Netlify (React сайт)  ←  VITE_API_URL указывает на Railway
    ↓
Railway (Node.js API + Socket.io)
    ↓
Neon (PostgreSQL база)
```

---

## Альтернатива: всё на одном VPS

Если есть VPS (Timeweb, Hetzner от ~300₽/мес):

```bash
git clone https://github.com/werasmr/HMSTUDY.git
cd HMSTUDY
docker compose up -d --build
```

Сайт будет на `http://IP-СЕРВЕРА:5173`

---

## Нужна помощь?

Напиши:
1. URL Netlify-сайта
2. URL Railway backend
3. Скриншот ошибки из браузера (F12 → Console)
