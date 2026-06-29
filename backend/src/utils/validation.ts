const TRADER_REQUISITE_FIELDS = [
  'name', 'ownerName', 'bank', 'currencyCode', 'cardNumber', 'accountNumber', 'phone',
  'acceptCard', 'acceptAccount', 'acceptSbp', 'dailyLimit', 'totalLimit',
  'minOrder', 'maxOrder', 'maxPaymentsPerDay', 'maxParallelDeals', 'delayBetweenOrders',
  'deviceId', 'useUniqueAmounts', 'isActive',
] as const;

export function pickRequisiteFields(body: Record<string, unknown>, admin = false) {
  const allowed = admin
    ? [...TRADER_REQUISITE_FIELDS, 'traderId', 'isArchived', 'currency']
    : TRADER_REQUISITE_FIELDS;

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.currency && !data.currencyCode) data.currencyCode = body.currency;
  return data;
}

export function parseNumber(value: unknown, fallback: number): number {
  const n = parseFloat(String(value));
  return Number.isFinite(n) ? n : fallback;
}

export function parseIntSafe(value: unknown, fallback: number): number {
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}
