/*
  Warnings:

  - You are about to drop the `ListingView` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ListingView" DROP CONSTRAINT "ListingView_listingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingView" DROP CONSTRAINT "ListingView_userId_fkey";

-- DropTable
DROP TABLE "ListingView";
