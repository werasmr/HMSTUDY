export function getAllowedOrigins(): string | string[] {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  const origins = raw.split(',').map((o) => o.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
}
