-- AlterTable
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateEnum
CREATE TYPE "WalletNetwork" AS ENUM ('TRC20', 'ERC20', 'BEP20');

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "network" "WalletNetwork" NOT NULL DEFAULT 'TRC20',
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_traderId_address_key" ON "Wallet"("traderId", "address");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
