-- AlterEnum
ALTER TYPE "BookingRequestStatus" ADD VALUE 'ALTERED';

-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "alterationOf" INTEGER;

-- CreateIndex
CREATE INDEX "BookingRequest_alterationOf_idx" ON "BookingRequest"("alterationOf");

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_alterationOf_fkey" FOREIGN KEY ("alterationOf") REFERENCES "BookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
