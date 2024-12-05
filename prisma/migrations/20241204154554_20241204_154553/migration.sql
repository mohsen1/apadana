/*
  Warnings:

  - You are about to drop the `UploadThingImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UploadThingImage" DROP CONSTRAINT "UploadThingImage_listingId_fkey";

-- DropTable
DROP TABLE "UploadThingImage";

-- CreateTable
CREATE TABLE "UploadedPhoto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "listingId" INTEGER,

    CONSTRAINT "UploadedPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadedPhoto_key_key" ON "UploadedPhoto"("key");

-- AddForeignKey
ALTER TABLE "UploadedPhoto" ADD CONSTRAINT "UploadedPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
