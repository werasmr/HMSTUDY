/** All supported fiat currencies for NETWORS */
export const CURRENCIES = [
  // CIS
  { code: 'RUB', name: 'Российский рубль', region: 'CIS', symbol: '₽', rateToUsdt: 81.3, decimals: 0 },
  { code: 'KZT', name: 'Казахстанский тенге', region: 'CIS', symbol: '₸', rateToUsdt: 450.0, decimals: 0 },
  { code: 'UZS', name: 'Узбекский сум', region: 'CIS', symbol: 'сум', rateToUsdt: 12500.0, decimals: 0 },
  { code: 'BYN', name: 'Белорусский рубль', region: 'CIS', symbol: 'Br', rateToUsdt: 3.2, decimals: 2 },
  { code: 'GEL', name: 'Грузинский лари', region: 'CIS', symbol: '₾', rateToUsdt: 2.7, decimals: 2 },
  { code: 'AZN', name: 'Азербайджанский манат', region: 'CIS', symbol: '₼', rateToUsdt: 1.7, decimals: 2 },
  { code: 'AMD', name: 'Армянский драм', region: 'CIS', symbol: '֏', rateToUsdt: 385.0, decimals: 0 },
  { code: 'KGS', name: 'Киргизский сом', region: 'CIS', symbol: 'с', rateToUsdt: 87.0, decimals: 0 },
  { code: 'TJS', name: 'Таджикский сомони', region: 'CIS', symbol: 'SM', rateToUsdt: 10.9, decimals: 2 },
  { code: 'MDL', name: 'Молдавский лей', region: 'CIS', symbol: 'L', rateToUsdt: 17.5, decimals: 2 },
  { code: 'UAH', name: 'Украинская гривна', region: 'CIS', symbol: '₴', rateToUsdt: 41.0, decimals: 0 },
  // Europe
  { code: 'EUR', name: 'Евро', region: 'EUROPE', symbol: '€', rateToUsdt: 0.92, decimals: 2 },
  { code: 'GBP', name: 'Фунт стерлингов', region: 'EUROPE', symbol: '£', rateToUsdt: 0.79, decimals: 2 },
  { code: 'PLN', name: 'Польский злотый', region: 'EUROPE', symbol: 'zł', rateToUsdt: 4.0, decimals: 2 },
  { code: 'CZK', name: 'Чешская крона', region: 'EUROPE', symbol: 'Kč', rateToUsdt: 23.0, decimals: 0 },
  { code: 'RON', name: 'Румынский лей', region: 'EUROPE', symbol: 'lei', rateToUsdt: 4.6, decimals: 2 },
  { code: 'HUF', name: 'Венгерский форинт', region: 'EUROPE', symbol: 'Ft', rateToUsdt: 360.0, decimals: 0 },
  { code: 'SEK', name: 'Шведская крона', region: 'EUROPE', symbol: 'kr', rateToUsdt: 10.5, decimals: 2 },
  { code: 'NOK', name: 'Норвежская крона', region: 'EUROPE', symbol: 'kr', rateToUsdt: 10.8, decimals: 2 },
  { code: 'CHF', name: 'Швейцарский франк', region: 'EUROPE', symbol: 'Fr', rateToUsdt: 0.88, decimals: 2 },
  { code: 'TRY', name: 'Турецкая лира', region: 'EUROPE', symbol: '₺', rateToUsdt: 32.0, decimals: 2 },
  // MENA
  { code: 'AED', name: 'Дирham ОАЭ', region: 'MENA', symbol: 'د.إ', rateToUsdt: 3.67, decimals: 2 },
  { code: 'SAR', name: 'Сaudi riyal', region: 'MENA', symbol: '﷼', rateToUsdt: 3.75, decimals: 2 },
  { code: 'QAR', name: 'Катарский риал', region: 'MENA', symbol: 'QR', rateToUsdt: 3.64, decimals: 2 },
  { code: 'KWD', name: 'Кувейтский динар', region: 'MENA', symbol: 'KD', rateToUsdt: 0.31, decimals: 3 },
  { code: 'BHD', name: 'Бахрейнский динар', region: 'MENA', symbol: 'BD', rateToUsdt: 0.38, decimals: 3 },
  { code: 'OMR', name: 'Оманский rial', region: 'MENA', symbol: 'OMR', rateToUsdt: 0.38, decimals: 3 },
  { code: 'EGP', name: 'Египетский фунт', region: 'MENA', symbol: 'E£', rateToUsdt: 48.0, decimals: 2 },
  { code: 'ILS', name: 'Израильский шекель', region: 'MENA', symbol: '₪', rateToUsdt: 3.7, decimals: 2 },
  { code: 'JOD', name: 'Иordanian dinar', region: 'MENA', symbol: 'JD', rateToUsdt: 0.71, decimals: 3 },
  // Asia
  { code: 'CNY', name: 'Китайский юань', region: 'ASIA', symbol: '¥', rateToUsdt: 7.2, decimals: 2 },
  { code: 'INR', name: 'Индийская рупия', region: 'ASIA', symbol: '₹', rateToUsdt: 83.0, decimals: 0 },
  { code: 'THB', name: 'Тайский бат', region: 'ASIA', symbol: '฿', rateToUsdt: 35.0, decimals: 0 },
  { code: 'VND', name: 'Вьетнамский dong', region: 'ASIA', symbol: '₫', rateToUsdt: 24500.0, decimals: 0 },
  { code: 'IDR', name: 'Индонезийская rupiah', region: 'ASIA', symbol: 'Rp', rateToUsdt: 15800.0, decimals: 0 },
  { code: 'PHP', name: 'Филиппинское peso', region: 'ASIA', symbol: '₱', rateToUsdt: 56.0, decimals: 0 },
  { code: 'KRW', name: 'Южнokorean won', region: 'ASIA', symbol: '₩', rateToUsdt: 1350.0, decimals: 0 },
  { code: 'JPY', name: 'Японская yen', region: 'ASIA', symbol: '¥', rateToUsdt: 150.0, decimals: 0 },
  { code: 'MYR', name: 'Мalaysian ringgit', region: 'ASIA', symbol: 'RM', rateToUsdt: 4.7, decimals: 2 },
  { code: 'SGD', name: 'Сингapur dollar', region: 'ASIA', symbol: 'S$', rateToUsdt: 1.34, decimals: 2 },
  { code: 'HKD', name: 'Гонkong dollar', region: 'ASIA', symbol: 'HK$', rateToUsdt: 7.8, decimals: 2 },
  { code: 'PKR', name: 'Пakistani rupee', region: 'ASIA', symbol: 'Rs', rateToUsdt: 278.0, decimals: 0 },
  { code: 'BDT', name: 'Бangladeshi taka', region: 'ASIA', symbol: '৳', rateToUsdt: 110.0, decimals: 0 },
  // LATAM
  { code: 'BRL', name: 'Бrazilian real', region: 'LATAM', symbol: 'R$', rateToUsdt: 5.0, decimals: 2 },
  { code: 'MXN', name: 'Мexican peso', region: 'LATAM', symbol: '$', rateToUsdt: 17.0, decimals: 2 },
  { code: 'ARS', name: 'Аrgentine peso', region: 'LATAM', symbol: '$', rateToUsdt: 900.0, decimals: 0 },
  { code: 'COP', name: 'Кolombian peso', region: 'LATAM', symbol: '$', rateToUsdt: 4000.0, decimals: 0 },
  { code: 'PEN', name: 'Пeruvian sol', region: 'LATAM', symbol: 'S/', rateToUsdt: 3.7, decimals: 2 },
  { code: 'CLP', name: 'Чilean peso', region: 'LATAM', symbol: '$', rateToUsdt: 950.0, decimals: 0 },
  { code: 'UYU', name: 'Уruguayan peso', region: 'LATAM', symbol: '$U', rateToUsdt: 39.0, decimals: 0 },
  // Global
  { code: 'USD', name: 'US Dollar', region: 'GLOBAL', symbol: '$', rateToUsdt: 1.0, decimals: 2 },
  { code: 'USDT', name: 'Tether USDT', region: 'GLOBAL', symbol: '₮', rateToUsdt: 1.0, decimals: 2 },
  { code: 'CAD', name: 'Canadian dollar', region: 'GLOBAL', symbol: 'C$', rateToUsdt: 1.36, decimals: 2 },
  { code: 'AUD', name: 'Australian dollar', region: 'GLOBAL', symbol: 'A$', rateToUsdt: 1.52, decimals: 2 },
  { code: 'NZD', name: 'New Zealand dollar', region: 'GLOBAL', symbol: 'NZ$', rateToUsdt: 1.65, decimals: 2 },
  { code: 'ZAR', name: 'South African rand', region: 'GLOBAL', symbol: 'R', rateToUsdt: 18.5, decimals: 2 },
  { code: 'NGN', name: 'Nigerian naira', region: 'GLOBAL', symbol: '₦', rateToUsdt: 1550.0, decimals: 0 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const REGIONS = ['CIS', 'EUROPE', 'MENA', 'ASIA', 'LATAM', 'GLOBAL'] as const;

export const REGION_LABELS: Record<string, string> = {
  CIS: 'СНГ',
  EUROPE: 'Европа',
  MENA: 'Ближний Восток',
  ASIA: 'Азия',
  LATAM: 'Латинская Америка',
  GLOBAL: 'Мир',
};
