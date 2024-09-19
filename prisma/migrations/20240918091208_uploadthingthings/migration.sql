/*
  Warnings:

  - Made the column `name` on table `UploadThingImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UploadThingImage" ADD COLUMN     "customId" TEXT,
ADD COLUMN     "size" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" VARCHAR(100) NOT NULL DEFAULT '',
ALTER COLUMN "name" SET NOT NULL;
