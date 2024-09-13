-- DropIndex
DROP INDEX "Booking_checkIn_checkOut_idx";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingRequestId" INTEGER;

-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "bookingId" INTEGER;

-- CreateIndex
CREATE INDEX "Booking_bookingRequestId_idx" ON "Booking"("bookingRequestId");

-- CreateIndex
CREATE INDEX "BookingRequest_bookingId_idx" ON "BookingRequest"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
