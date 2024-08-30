/*
  Warnings:

  - The primary key for the `EmailAddress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `verificationStatus` on the `EmailAddress` table. All the data in the column will be lost.
  - The primary key for the `ExternalAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clerkId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MANAGE_LISTINGS', 'READ_MEMBERS', 'MANAGE_BILLING', 'VIEW_REPORTS', 'EDIT_SETTINGS', 'MANAGE_DOMAINS', 'MANAGE_ORGANIZATION', 'DELETE_ORGANIZATION', 'MANAGE_MEMBERS', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_PERMISSIONS');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'HOST', 'COHOST', 'GUEST');

-- DropForeignKey
ALTER TABLE "EmailAddress" DROP CONSTRAINT "EmailAddress_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAccount" DROP CONSTRAINT "ExternalAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_ownerId_fkey";

-- DropIndex
DROP INDEX "User_clerkId_key";

-- AlterTable
ALTER TABLE "EmailAddress" DROP CONSTRAINT "EmailAddress_pkey",
DROP COLUMN "verificationStatus",
ADD COLUMN     "verification" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "EmailAddress_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EmailAddress_id_seq";

-- AlterTable
ALTER TABLE "ExternalAccount" DROP CONSTRAINT "ExternalAccount_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExternalAccount_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ExternalAccount_id_seq";

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "ownerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "clerkId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

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

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permission_key" ON "UserPermission"("userId", "permission");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAddress" ADD CONSTRAINT "EmailAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAccount" ADD CONSTRAINT "ExternalAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
