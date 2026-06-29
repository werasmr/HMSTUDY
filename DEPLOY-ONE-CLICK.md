# 🟢 Деплой одной кнопкой (3 минуты)

> **Честно:** сайт, куда просто кидаешь папку — работает только для frontend.
> Backend + база так не деплоятся. Ниже — самый простой вариант: **одна кнопка**, вставил строку из Neon — готово.

---

## Шаг 1. Открой ссылку

👉 **https://render.com/deploy?repo=https://github.com/werasmr/HMSTUDY**

(если свой форк — замени URL репозитория в ссылке)

---

## Шаг 2. Войди через GitHub

Render спросит доступ к репозиторию — разреши.

---

## Шаг 3. Вставь DATABASE_URL

Render покажет форму. Единственное поле, которое нужно заполнить вручную:

| Поле | Значение |
|------|----------|
| **DATABASE_URL** | твоя строка из Neon |

Пример формата:
```
postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

Остальное Render создаст сам (backend + frontend).

---

## Шаг 4. Нажми **Apply**

Подожди 5–10 минут. Render поднимет:
- `prismapay-api` — backend
- `prismapay-web` — сайт

---

## Шаг 5. Открой сайт

Render Dashboard → сервис **prismapay-web** → URL сверху.

Вход:
- **Email:** `trader@prismapay.com`
- **Пароль:** `password123`

---

## Если репозиторий другой

1. Залей код на GitHub (или используй werasmr/HMSTUDY)
2. В Render: **New → Blueprint** → выбери репо
3. Render найдёт `render.yaml` автоматически
4. Вставь `DATABASE_URL` → Apply

---

## Альтернатива: только сайт (без backend)

Если backend уже где-то крутится:

```bash
cd frontend
npm install
npm run build
```

Папку `frontend/dist` перетащи на 👉 **https://app.netlify.com/drop**

⚠️ Логин работать не будет, пока нет backend.

---

## Альтернатива: всё на своём компе

Скачай папку проекта → установи Docker Desktop → в терминале:

```bash
docker compose up --build
```

Открой http://localhost:5173 — ничего заливать не нужно.

---

## Проблемы?

| Что случилось | Что делать |
|---------------|------------|
| Build failed | Render → Logs → скинь ошибку |
| Сайт белый экран | Проверь, что `prismapay-api` задеплоился (зелёный) |
| Network Error | Подожди 2 мин, backend на free tier просыпается |
| CORS | Пересобери backend после деплоя frontend |
