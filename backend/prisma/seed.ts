import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@prismapay.com' },
    update: {},
    create: {
      email: 'admin@prismapay.com',
      password,
      role: 'ADMIN',
      balance: 0,
      isActive: true,
    },
  });

  const trader = await prisma.user.upsert({
    where: { email: 'trader@prismapay.com' },
    update: {
      balance: 5000,
      insuranceDeposit: 500,
      isActive: true,
    },
    create: {
      email: 'trader@prismapay.com',
      password,
      role: 'TRADER',
      balance: 5000,
      insuranceDeposit: 500,
      isOnline: true,
      isActive: true,
    },
  });

  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@prismapay.com' },
    update: { isActive: true },
    create: {
      email: 'merchant@prismapay.com',
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
    update: {},
    create: {
      id: 'seed-requisite-1',
      traderId: trader.id,
      name: 'Основная карта',
      ownerName: 'Иванов Иван Иванович',
      bank: 'Тинькофф',
      currency: 'RUB',
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
    where: { traderId_address: { traderId: trader.id, address: 'TXseedWalletAddress123456789' } },
    update: {},
    create: {
      traderId: trader.id,
      assignedBy: admin.id,
      address: 'TXseedWalletAddress123456789',
      network: 'TRC20',
      label: 'Основной USDT',
    },
  });

  console.log('Seed completed:');
  console.log('  Admin:', admin.email, '/ password123');
  console.log('  Trader:', trader.email, '/ password123');
  console.log('  Merchant:', merchant.email, '/ password123');
  console.log('  Merchant API Key:', merchant.apiKey);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
