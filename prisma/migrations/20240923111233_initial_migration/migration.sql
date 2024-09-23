-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MANAGE_LISTINGS', 'READ_MEMBERS', 'MANAGE_BILLING', 'VIEW_REPORTS', 'EDIT_SETTINGS', 'MANAGE_DOMAINS', 'MANAGE_ORGANIZATION', 'DELETE_ORGANIZATION', 'MANAGE_MEMBERS', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_PERMISSIONS');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'HOST', 'COHOST', 'GUEST');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'CAD');

-- CreateEnum
CREATE TYPE "BookingRequestStatus" AS ENUM ('PENDING', 'EXPIRED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" SERIAL NOT NULL,
    "permission" "Permission" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailAddress" (
    "id" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verification" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalAccount" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ExternalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadThingImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "customId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" INTEGER NOT NULL,

    CONSTRAINT "UploadThingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "propertyType" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timeZone" VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
    "checkInTime" VARCHAR(6) NOT NULL DEFAULT '14:00',
    "checkOutTime" VARCHAR(6) NOT NULL DEFAULT '11:00',
    "amenities" TEXT[],
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "minimumStay" INTEGER NOT NULL DEFAULT 1,
    "maximumGuests" INTEGER NOT NULL DEFAULT 5,
    "houseRules" TEXT NOT NULL,
    "allowPets" BOOLEAN NOT NULL DEFAULT false,
    "petPolicy" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "showExactLocation" BOOLEAN NOT NULL DEFAULT true,
    "locationRadius" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingInventory" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
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
    "bookingRequestId" INTEGER,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "status" "BookingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "pets" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permission_key" ON "UserPermission"("userId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAddress_emailAddress_key" ON "EmailAddress"("emailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalAccount_provider_externalId_key" ON "ExternalAccount"("provider", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "UploadThingImage_key_key" ON "UploadThingImage"("key");

-- CreateIndex
CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");

-- CreateIndex
CREATE INDEX "Listing_pricePerNight_idx" ON "Listing"("pricePerNight");

-- CreateIndex
CREATE INDEX "ListingInventory_date_idx" ON "ListingInventory"("date");

-- CreateIndex
CREATE INDEX "ListingInventory_bookingId_idx" ON "ListingInventory"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingInventory_listingId_date_key" ON "ListingInventory"("listingId", "date");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_bookingRequestId_idx" ON "Booking"("bookingRequestId");

-- CreateIndex
CREATE INDEX "BookingRequest_listingId_idx" ON "BookingRequest"("listingId");

-- CreateIndex
CREATE INDEX "BookingRequest_userId_idx" ON "BookingRequest"("userId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAddress" ADD CONSTRAINT "EmailAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAccount" ADD CONSTRAINT "ExternalAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadThingImage" ADD CONSTRAINT "UploadThingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInventory" ADD CONSTRAINT "ListingInventory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInventory" ADD CONSTRAINT "ListingInventory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
