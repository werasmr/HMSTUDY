import { generateId } from './calculations';

export const DEMO_CARDS = [
  {
    id: 'card-1',
    bankName: 'Сбербанк',
    lastFour: '4821',
    balance: 250000,
    color: 'green',
  },
  {
    id: 'card-2',
    bankName: 'Тинькофф',
    lastFour: '7734',
    balance: 185000,
    color: 'yellow',
  },
  {
    id: 'card-3',
    bankName: 'Альфа-Банк',
    lastFour: '2291',
    balance: 320000,
    color: 'red',
  },
];

const now = Date.now();

export const DEMO_DEALS = [
  {
    id: 'DM' + generateId().slice(0, 6),
    createdAt: now - 4 * 60 * 1000,
    timerMinutes: 10,
    expiresAt: now + 6 * 60 * 1000,
    expired: false,
    status: 'active',
    stage1: {
      buyAmount: '52000',
      buyRate: '92.50',
      buyReward: '8',
      buyerRequisites: 'Иванов И.И. | Сбер | 4276 **** **** 8821',
      receiptName: 'receipt_buyer_001.pdf',
      receiptUrl: null,
    },
    stage2: {
      cardId: 'card-1',
      sendAmount: '50800',
    },
    stage3: {
      sellAmount: '50000',
      sellRate: '91.20',
      sellReward: '-1.5',
      sellerRequisites: 'ООО Крипто Трейд | Тинькофф | 5536 **** **** 3312',
      receiptName: null,
      receiptUrl: null,
    },
  },
  {
    id: 'DM' + generateId().slice(0, 6),
    createdAt: now - 2 * 60 * 1000,
    timerMinutes: 15,
    expiresAt: now + 13 * 60 * 1000,
    expired: false,
    status: 'active',
    stage1: {
      buyAmount: '120000',
      buyRate: '91.80',
      buyReward: '-1.5',
      buyerRequisites: 'Петров А.С. | Альфа | 4154 **** **** 6690',
      receiptName: 'receipt_buyer_002.pdf',
      receiptUrl: null,
    },
    stage2: {
      cardId: 'card-2',
      sendAmount: '118200',
    },
    stage3: {
      sellAmount: '117500',
      sellRate: '90.10',
      sellReward: '0',
      sellerRequisites: 'Сидоров В.П. | ВТБ | 4272 **** **** 1144',
      receiptName: 'receipt_seller_002.pdf',
      receiptUrl: null,
    },
  },
  {
    id: 'DM' + generateId().slice(0, 6),
    createdAt: now - 8 * 60 * 1000,
    timerMinutes: 5,
    expiresAt: now + 1 * 60 * 1000,
    expired: false,
    status: 'active',
    stage1: {
      buyAmount: '75000',
      buyRate: '93.10',
      buyReward: '5',
      buyerRequisites: 'Козлов Д.М. | Тинькофф | 5375 **** **** 7721',
      receiptName: 'receipt_buyer_003.pdf',
      receiptUrl: null,
    },
    stage2: {
      cardId: 'card-3',
      sendAmount: '74000',
    },
    stage3: {
      sellAmount: '73500',
      sellRate: '92.00',
      sellReward: '-2',
      sellerRequisites: 'Новиков К.А. | Сбер | 4276 **** **** 5542',
      receiptName: null,
      receiptUrl: null,
    },
  },
];
