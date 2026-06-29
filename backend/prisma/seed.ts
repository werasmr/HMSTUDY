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
      balance: 10000,
    },
  });

  const trader = await prisma.user.upsert({
    where: { email: 'trader@prismapay.com' },
    update: {},
    create: {
      email: 'trader@prismapay.com',
      password,
      role: 'TRADER',
      balance: 5000,
      insuranceDeposit: 500,
      isOnline: true,
    },
  });

  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@prismapay.com' },
    update: {},
    create: {
      email: 'merchant@prismapay.com',
      password,
      role: 'MERCHANT',
      apiKey: uuidv4(),
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

  console.log('Seed completed:');
  console.log('  Admin:', admin.email, '/ password123');
  console.log('  Trader:', trader.email, '/ password123');
  console.log('  Merchant:', merchant.email, '/ password123');
  console.log('  Merchant API Key:', merchant.apiKey);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
