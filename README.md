# Proto — Business OS для малого и среднего бизнеса

> Не ещё одна CRM, а AI-операционный директор, который подключается к данным бизнеса и помогает владельцу принимать решения.

Монолит на **Next.js 15 + Supabase** (Auth, Postgres, Storage).

## Стек

- **Frontend/Backend:** Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **БД + Auth:** Supabase (PostgreSQL, RLS, хранение чатов и отчётов)
- **AI:** OpenAI GPT-4o-mini (AI CEO / CFO / HR / CMO, ежедневные отчёты); Anthropic Claude как fallback
- **UI:** shadcn/ui + Tailwind CSS v4
- **Деплой:** Vercel (`vercel.json`) / Render (`render.yaml`)

## Ключевые страницы MVP

| Страница | Что делает |
|----------|------------|
| `/login` | Вход (Supabase Auth) |
| `/dashboard` | Выручка, прибыль, сотрудники, проблемы бизнеса (AI-анализ) |
| `/chat` | AI CEO — чат с ролями CEO / CFO / HR / CMO на данных компании |
| `/reports` | Ежедневные управленческие отчёты от AI CEO |

## Адаптация под нишу

При онбординге выбирается тип бизнеса (ресторан, стоматология, салон красоты,
агентство, e-commerce, недвижимость) — AI получает свой набор KPI и фокус
рекомендаций для каждой ниши (`src/lib/business-types.ts`).

## Быстрый старт

### 1. Supabase

```bash
# Установить CLI (уже в devDependencies)
npx supabase login
npx supabase link --project-ref <your-ref>

# Применить миграцию
npx supabase db push
```

Или скопировать SQL из `supabase/migrations/20250708190000_initial_schema.sql` в Supabase SQL Editor.

### 2. Переменные окружения

```bash
cp .env.example .env.local
```

Заполните `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## Auth flow

1. `/register` — регистрация (Supabase Auth + auto profile trigger)
2. `/onboarding` — создание компании (пользователь становится `owner`)
3. `/dashboard` — защищённая зона
4. `/settings` — профиль и настройки компании (пороги сегментации)

### Ручной доступ / тариф

Без Stripe/ЮKassa. Поля в `companies`:

- `plan` — `free` | `starter` | `pro`
- `is_active` — `true` / `false`

Администратор меняет в Supabase Table Editor или SQL:

```sql
UPDATE companies SET plan = 'pro', is_active = true WHERE slug = 'my-company';
```

## Структура

```
src/
  app/
    (auth)/          # login, register
    (app)/           # dashboard, settings (protected)
    onboarding/      # company setup
    actions/         # server actions
  components/
    auth/            # auth forms
    layout/          # sidebar, user nav
    ui/              # shadcn components
  lib/
    supabase/        # client, server, middleware helpers
supabase/
  migrations/        # full DB schema (all modules)
```

## Модули (статус)

| Модуль | Статус |
|--------|--------|
| Схема БД | ✅ Миграция готова |
| Auth + компания | ✅ MVP |
| AI CEO (роли CEO/CFO/HR/CMO, GPT-4o-mini) | ✅ MVP |
| Ежедневные отчёты AI | ✅ MVP |
| Тип бизнеса + KPI под нишу | ✅ MVP |
| CRUD-конструктор | ✅ EntityCrud + configs |
| CRM (клиенты, сделки, задачи) | ✅ MVP |
| Финансы (выписки, транзакции, P&L) | ✅ MVP |
| Продукты (каталог, описание Claude) | ✅ MVP |
| Сотрудники (KPI, эффективность) | ✅ MVP |
| Конкуренты (цены, сравнение) | ✅ MVP |
| Ценообразование (калькулятор, Claude) | ✅ MVP |
| Аналитика (сводка CRM + финансы + команда) | ✅ MVP |
| AI-ассистент (чат + действия с подтверждением) | ✅ MVP |
| Инбокс (сообщения, каналы) | ✅ MVP (ручной ввод; Telegram-бот позже) |
| SMM (посты, аккаунты) | ✅ MVP (ручная публикация; автопостинг позже) |

## Локальный Supabase (опционально)

```bash
npx supabase start
npx supabase db reset
```

Studio: http://localhost:54323

## Legacy

Старый проект NETWORS перенесён в `_legacy/`.
