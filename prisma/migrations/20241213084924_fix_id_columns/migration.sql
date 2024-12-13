/*
  Warnings:

  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BookingRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Listing` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_bookingRequestId_fkey";

-- DropForeignKey
ALTER TABLE "BookingRequest" DROP CONSTRAINT "BookingRequest_alterationOf_fkey";

-- DropForeignKey
ALTER TABLE "BookingRequest" DROP CONSTRAINT "BookingRequest_listingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingInventory" DROP CONSTRAINT "ListingInventory_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingInventory" DROP CONSTRAINT "ListingInventory_listingId_fkey";

-- DropForeignKey
ALTER TABLE "UploadedPhoto" DROP CONSTRAINT "UploadedPhoto_listingId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_pkey",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "bookingRequestId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Booking_id_seq";

-- AlterTable
ALTER TABLE "BookingRequest" DROP CONSTRAINT "BookingRequest_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "listingId" SET DATA TYPE TEXT,
ALTER COLUMN "alterationOf" SET DATA TYPE TEXT,
ADD CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BookingRequest_id_seq";

-- AlterTable
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Listing_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Listing_id_seq";

-- AlterTable
ALTER TABLE "ListingInventory" ALTER COLUMN "listingId" SET DATA TYPE TEXT,
ALTER COLUMN "bookingId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UploadedPhoto" ALTER COLUMN "listingId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "UploadedPhoto" ADD CONSTRAINT "UploadedPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInventory" ADD CONSTRAINT "ListingInventory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInventory" ADD CONSTRAINT "ListingInventory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_alterationOf_fkey" FOREIGN KEY ("alterationOf") REFERENCES "BookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
