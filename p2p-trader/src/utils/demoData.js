import { generateId } from './calculations';

export const DEMO_CARDS = [
  { id: 'c1', bankName: 'Сбербанк', lastFour: '4821', balance: 250000, color: 'green' },
  { id: 'c2', bankName: 'Тинькофф', lastFour: '7734', balance: 185000, color: 'yellow' },
  { id: 'c3', bankName: 'Альфа-Банк', lastFour: '2291', balance: 320000, color: 'red' },
];

const now = Date.now();

export const DEMO_ROUTES = [
  {
    id: 'RT' + generateId().slice(0, 6),
    createdAt: now - 12 * 60 * 1000,
    status: 'active',
    amount: '50000',
    rate: '91.20',
    reward: '-1.5',
    sellerBank: 'Тинькофф',
    sellerCard: '5536 9134 0022 3312',
    topUpCardId: 'c1',
    inputs: [
      {
        id: 'IN' + generateId().slice(0, 5),
        amount: '27000',
        rate: '92.50',
        reward: '1',
        buyerName: 'Иванов И.И.',
        receipt: { status: 'demo', fileName: 'check_27000.pdf' },
      },
      {
        id: 'IN' + generateId().slice(0, 5),
        amount: '21000',
        rate: '92.30',
        reward: '0.5',
        buyerName: 'Петров А.С.',
        receipt: null,
      },
    ],
  },
  {
    id: 'RT' + generateId().slice(0, 6),
    createdAt: now - 5 * 60 * 1000,
    status: 'active',
    amount: '120000',
    rate: '90.10',
    reward: '0',
    sellerBank: 'Сбербанк',
    sellerCard: '4276 1111 2222 1144',
    topUpCardId: '',
    inputs: [
      {
        id: 'IN' + generateId().slice(0, 5),
        amount: '120000',
        rate: '91.80',
        reward: '-1.5',
        buyerName: 'Козлов Д.М.',
        receipt: null,
      },
    ],
  },
];
