import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { CURRENCIES } from '../src/data/currencies';

const prisma = new PrismaClient();

async function main() {
  for (const c of CURRENCIES) {
    await prisma.currencyConfig.upsert({
      where: { code: c.code },
      update: { rateToUsdt: c.rateToUsdt, name: c.name, region: c.region, symbol: c.symbol, decimals: c.decimals },
      create: { ...c, updatedAt: new Date() },
    });
  }

  await prisma.commissionRate.upsert({
    where: { id: 'global-commission' },
    update: {},
    create: {
      id: 'global-commission',
      name: 'Глобальная ставка NETWORS',
      targetType: 'GLOBAL',
      payInRate: 1.5,
      payOutRate: 1.0,
      isActive: true,
    },
  });

  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@networs.io' },
    update: { isActive: true },
    create: {
      email: 'admin@networs.io',
      password,
      role: 'ADMIN',
      balance: 0,
      isActive: true,
    },
  });

  const trader = await prisma.user.upsert({
    where: { email: 'trader@networs.io' },
    update: { balance: 5000, insuranceDeposit: 500, isActive: true },
    create: {
      email: 'trader@networs.io',
      password,
      role: 'TRADER',
      balance: 5000,
      insuranceDeposit: 500,
      isOnline: true,
      isActive: true,
    },
  });

  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@networs.io' },
    update: { isActive: true },
    create: {
      email: 'merchant@networs.io',
      password,
      role: 'MERCHANT',
      apiKey: uuidv4(),
      isActive: true,
    },
  });

  const device = await prisma.device.upsert({
    where: { token: 'seed-device-token' },
    update: {},
    create: {
      traderId: trader.id,
      name: 'iPhone 15 Pro',
      token: 'seed-device-token',
      isOnline: true,
      lastSeen: new Date(),
    },
  });

  await prisma.requisite.upsert({
    where: { id: 'seed-requisite-1' },
    update: { currencyCode: 'RUB' },
    create: {
      id: 'seed-requisite-1',
      traderId: trader.id,
      name: 'Основная карта RUB',
      ownerName: 'Иванов Иван Иванович',
      bank: 'Тинькофф',
      currencyCode: 'RUB',
      cardNumber: '5536914123456789',
      phone: '+79991234567',
      acceptCard: true,
      acceptSbp: true,
      dailyLimit: 500000,
      totalLimit: 5000000,
      minOrder: 1000,
      maxOrder: 100000,
      maxPaymentsPerDay: 20,
      maxParallelDeals: 5,
      deviceId: device.id,
      isActive: true,
    },
  });

  await prisma.wallet.upsert({
    where: { traderId_address: { traderId: trader.id, address: 'TXnetworsWallet123456789' } },
    update: {},
    create: {
      traderId: trader.id,
      assignedBy: admin.id,
      address: 'TXnetworsWallet123456789',
      network: 'TRC20',
      currencyCode: 'USDT',
      label: 'Основной USDT',
    },
  });

  console.log('NETWORS seed completed:');
  console.log('  Currencies:', CURRENCIES.length);
  console.log('  Admin:', admin.email, '/ password123');
  console.log('  Trader:', trader.email, '/ password123');
  console.log('  Merchant:', merchant.email, '/ password123');
  console.log('  Merchant API Key:', merchant.apiKey);
}

main().catch(console.error).finally(() => prisma.$disconnect());
