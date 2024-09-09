-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "timeZone" VARCHAR(100) NOT NULL DEFAULT 'America/New_York';

-- CreateTable
CREATE TABLE "ListingInventory" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL,
    "bookingId" INTEGER,

    CONSTRAINT "ListingInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingInventory_date_idx" ON "ListingInventory"("date");

-- CreateIndex
CREATE INDEX "ListingInventory_bookingId_idx" ON "ListingInventory"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingInventory_listingId_date_key" ON "ListingInventory"("listingId", "date");

-- CreateIndex
CREATE INDEX "Booking_checkIn_checkOut_idx" ON "Booking"("checkIn", "checkOut");

-- AddForeignKey
ALTER TABLE "ListingInventory" ADD CONSTRAINT "ListingInventory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInventory" ADD CONSTRAINT "ListingInventory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
