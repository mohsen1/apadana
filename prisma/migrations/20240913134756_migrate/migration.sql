/*
  Warnings:

  - You are about to drop the column `bookingId` on the `BookingRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BookingRequest" DROP CONSTRAINT "BookingRequest_bookingId_fkey";

-- DropIndex
DROP INDEX "BookingRequest_bookingId_idx";

-- AlterTable
ALTER TABLE "BookingRequest" DROP COLUMN "bookingId";

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "BookingRequest_listingId_idx" ON "BookingRequest"("listingId");

-- CreateIndex
CREATE INDEX "BookingRequest_userId_idx" ON "BookingRequest"("userId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
