/*
  Warnings:

  - Added the required column `sid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sid" INTEGER NOT NULL,
ADD COLUMN     "alarm" TEXT NOT NULL DEFAULT E'1 * * * * *';
