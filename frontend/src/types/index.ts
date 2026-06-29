export type Role = 'ADMIN' | 'TRADER' | 'MERCHANT';

export type OrderStatus =
  | 'PENDING'
  | 'WAITING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'DISPUTED';

export type OrderType = 'PAY_IN' | 'PAY_OUT';

export interface User {
  id: string;
  email: string;
  role: Role;
  balance: number;
  frozenBalance: number;
  insuranceDeposit: number;
  isOnline: boolean;
  currencyCode: string;
  apiKey?: string;
  createdAt?: string;
}

export interface Device {
  id: string;
  traderId: string;
  name: string;
  token: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Requisite {
  id: string;
  traderId: string;
  name: string;
  ownerName: string;
  bank: string;
  currencyCode: string;
  cardNumber?: string;
  accountNumber?: string;
  phone?: string;
  acceptCard: boolean;
  acceptAccount: boolean;
  acceptSbp: boolean;
  dailyLimit: number;
  totalLimit: number;
  dailyUsed: number;
  totalUsed: number;
  minOrder: number;
  maxOrder: number;
  maxPaymentsPerDay: number;
  paymentsToday: number;
  maxParallelDeals: number;
  delayBetweenOrders: number;
  deviceId?: string;
  device?: Device;
  useUniqueAmounts: boolean;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  merchantOrderId?: string;
  type: OrderType;
  status: OrderStatus;
  amount: number;
  currencyCode: string;
  amountUsdt: number;
  rate: number;
  feeRate?: number;
  feeAmount?: number;
  requisiteId?: string;
  requisite?: Requisite;
  traderId?: string;
  merchantId?: string;
  clientName?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  disputes?: Dispute[];
}

export interface Transaction {
  id: string;
  orderId?: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'FEE' | 'FREEZE' | 'UNFREEZE';
  amount: number;
  currencyCode: string;
  createdAt: string;
  order?: { id: string; type: OrderType; status: OrderStatus };
}

export interface Dispute {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  resolvedAt?: string;
  order?: Order;
  user?: { id: string; email: string };
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  text: string;
  fileUrl?: string;
  createdAt: string;
  sender?: { id: string; email: string; role: Role };
}

export interface DashboardStats {
  turnover: { day: number; week: number; month: number };
  deals: { day: number; week: number; month: number };
  activeRequisites: number;
  conversion: number;
  usdtRate: number;
}

export const BANKS = [
  'Тинькофф',
  'Сбербанк',
  'ВТБ',
  'Газпромбанк',
  'Озон банк',
  'Альфа-Банк',
  'Райффайзен',
  'СБП',
  'Россельхозбанк',
  'ПСБ',
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ожидает',
  WAITING_PAYMENT: 'Ожидает оплаты',
  PAID: 'Оплачено',
  CONFIRMED: 'Завершено',
  EXPIRED: 'Истекло',
  CANCELLED: 'Отменено',
  DISPUTED: 'Спор',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'text-warning',
  WAITING_PAYMENT: 'text-warning',
  PAID: 'text-accent',
  CONFIRMED: 'text-success',
  EXPIRED: 'text-muted',
  CANCELLED: 'text-danger',
  DISPUTED: 'text-danger',
};

export const STATUS_BG: Record<OrderStatus, string> = {
  PENDING: 'bg-warning/10 border-warning/30',
  WAITING_PAYMENT: 'bg-warning/10 border-warning/30',
  PAID: 'bg-accent/10 border-accent/30',
  CONFIRMED: 'bg-success/10 border-success/30',
  EXPIRED: 'bg-muted/10 border-muted/30',
  CANCELLED: 'bg-danger/10 border-danger/30',
  DISPUTED: 'bg-danger/10 border-danger/30',
};
