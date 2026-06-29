-- NETWORS multi-currency migration

CREATE TYPE "CommissionTarget" AS ENUM ('GLOBAL', 'TRADER', 'MERCHANT', 'ROLE');

CREATE TABLE "CurrencyConfig" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "symbol" TEXT NOT NULL DEFAULT '',
    "rateToUsdt" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CurrencyConfig_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "CommissionRate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetType" "CommissionTarget" NOT NULL DEFAULT 'GLOBAL',
    "targetId" TEXT,
    "role" "Role",
    "payInRate" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "payOutRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "CommissionRate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WalletDeposit" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'USDT',
    "txHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    CONSTRAINT "WalletDeposit_pkey" PRIMARY KEY ("id")
);

-- User: currency -> currencyCode
ALTER TABLE "User" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'USDT';
UPDATE "User" SET "currencyCode" = "currency"::text;
ALTER TABLE "User" DROP COLUMN "currency";

-- Requisite
ALTER TABLE "Requisite" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'RUB';
UPDATE "Requisite" SET "currencyCode" = "currency"::text;
ALTER TABLE "Requisite" DROP COLUMN "currency";

-- Order
ALTER TABLE "Order" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'RUB';
ALTER TABLE "Order" ADD COLUMN "feeRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "feeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Transaction
ALTER TABLE "Transaction" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'USDT';
UPDATE "Transaction" SET "currencyCode" = "currency"::text;
ALTER TABLE "Transaction" DROP COLUMN "currency";

-- Wallet
ALTER TABLE "Wallet" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'USDT';

-- Drop old enum
DROP TYPE IF EXISTS "Currency";

-- FK
ALTER TABLE "WalletDeposit" ADD CONSTRAINT "WalletDeposit_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletDeposit" ADD CONSTRAINT "WalletDeposit_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
