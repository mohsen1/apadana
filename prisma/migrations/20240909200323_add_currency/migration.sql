-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'CAD');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';
