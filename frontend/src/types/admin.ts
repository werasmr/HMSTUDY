export type Role = 'ADMIN' | 'TRADER' | 'MERCHANT';

export type WalletNetwork = 'TRC20' | 'ERC20' | 'BEP20';

export interface Wallet {
  id: string;
  traderId: string;
  assignedBy: string;
  address: string;
  network: WalletNetwork;
  label?: string;
  isActive: boolean;
  createdAt: string;
  trader?: { id: string; email: string };
  assigner?: { id: string; email: string };
}

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  balance: number;
  frozenBalance: number;
  insuranceDeposit: number;
  isOnline: boolean;
  isActive: boolean;
  apiKey?: string;
  createdAt: string;
  _count?: { wallets: number; requisites: number };
}
