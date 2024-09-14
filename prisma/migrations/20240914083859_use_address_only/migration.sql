/*
  Warnings:

  - You are about to drop the column `city` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Listing` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Listing_city_state_idx";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "city",
DROP COLUMN "state",
DROP COLUMN "zipCode",
ADD COLUMN     "locationRadius" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "showExactLocation" BOOLEAN NOT NULL DEFAULT true;
