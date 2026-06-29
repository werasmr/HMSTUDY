export function formatAmount(amount: number, currency: 'RUB' | 'USDT' = 'RUB'): string {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: currency === 'USDT' ? 2 : 0,
    maximumFractionDigits: currency === 'USDT' ? 2 : 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function formatCardNumber(num?: string): string {
  if (!num) return '—';
  const clean = num.replace(/\s/g, '');
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatPhone(phone?: string): string {
  if (!phone) return '—';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `+7 (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7, 9)}-${clean.slice(9)}`;
  }
  return phone;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return '00:00';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
