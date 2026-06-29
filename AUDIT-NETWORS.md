# NETWORS — отчёт проверки системы

## Ребрендинг
- PrismaPay → **NETWORS** (UI, README, seed emails @networs.io)

## Деньги (проверено и исправлено)
| Операция | Статус |
|----------|--------|
| Заморозка при Pay In | ✅ Атомарная транзакция |
| Подтверждение + комиссия | ✅ FEE по ставке admin |
| Отмена / истечение | ✅ Без двойной разморозки |
| Admin пополнение | ✅ DEPOSIT с проверкой баланса |
| Депозит через кошелёк | ✅ Заявка → admin approve |

## Безопасность
- ✅ Регистрация только TRADER
- ✅ JWT + проверка isActive в БД
- ✅ Whitelist полей реквизитов
- ✅ Доступ к заказам/чату по роли
- ✅ API Key только для MERCHANT

## Валюты (52)
CIS: RUB, KZT, UZS, BYN, GEL, AZN, AMD, KGS, TJS, MDL, UAH  
EUROPE: EUR, GBP, PLN, CZK, RON, HUF, SEK, NOK, CHF, TRY  
MENA: AED, SAR, QAR, KWD, BHD, OMR, EGP, ILS, JOD  
ASIA: CNY, INR, THB, VND, IDR, PHP, KRW, JPY, MYR, SGD, HKD, PKR, BDT  
LATAM: BRL, MXN, ARS, COP, PEN, CLP, UYU  
GLOBAL: USD, USDT, CAD, AUD, NZD, ZAR, NGN  

## Admin
- **Ставки** — Pay In / Pay Out % (глобальные и per trader/merchant)
- **Валюты** — курс к USDT
- **Кошельки** — назначение + валюта кошелька
- **Пополнения** — approve/reject депозитов

## Обновления на Render
Push в `main` → автоматический redeploy + `prisma migrate deploy`
