-- CreateEnum
CREATE TYPE "passwordTypes" AS ENUM ('bcrypt');

-- CreateEnum
CREATE TYPE "displayNameTypes" AS ENUM ('username', 'realName', 'email');

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" STRING NOT NULL,
    "email" STRING NOT NULL,
    "password" STRING,
    "passwordType" "passwordTypes" NOT NULL DEFAULT 'bcrypt',
    "realName" STRING,
    "useAsDisplayName" "displayNameTypes" NOT NULL DEFAULT 'username',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
