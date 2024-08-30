/*
  Warnings:

  - You are about to drop the column `content` on the `Listing` table. All the data in the column will be lost.
  - Added the required column `address` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `houseRules` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maximumGuests` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimumStay` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerNight` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyType` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "content",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "houseRules" TEXT NOT NULL,
ADD COLUMN     "maximumGuests" INTEGER NOT NULL,
ADD COLUMN     "minimumStay" INTEGER NOT NULL,
ADD COLUMN     "pricePerNight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "propertyType" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;
