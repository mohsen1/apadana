/*
  Warnings:

  - You are about to drop the column `isBooked` on the `ListingInventory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "checkInTime" VARCHAR(6) NOT NULL DEFAULT '14:00',
ADD COLUMN     "checkOutTime" VARCHAR(6) NOT NULL DEFAULT '11:00';

-- AlterTable
ALTER TABLE "ListingInventory" DROP COLUMN "isBooked",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;
