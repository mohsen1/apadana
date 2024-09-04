/*
  Warnings:

  - You are about to alter the column `title` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `address` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `city` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `propertyType` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `state` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `zipCode` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(5)`.

*/
-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "address" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "maximumGuests" SET DEFAULT 5,
ALTER COLUMN "minimumStay" SET DEFAULT 1,
ALTER COLUMN "propertyType" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "state" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "zipCode" SET DATA TYPE CHAR(5);

-- CreateTable
CREATE TABLE "UploadThingImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" INTEGER NOT NULL,

    CONSTRAINT "UploadThingImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadThingImage_key_key" ON "UploadThingImage"("key");

-- CreateIndex
CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");

-- CreateIndex
CREATE INDEX "Listing_city_state_idx" ON "Listing"("city", "state");

-- CreateIndex
CREATE INDEX "Listing_pricePerNight_idx" ON "Listing"("pricePerNight");

-- AddForeignKey
ALTER TABLE "UploadThingImage" ADD CONSTRAINT "UploadThingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
