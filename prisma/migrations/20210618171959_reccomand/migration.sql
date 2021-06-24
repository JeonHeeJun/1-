/*
  Warnings:

  - You are about to drop the column `alarm` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "alarm";

-- AlterTable
ALTER TABLE "recomand" ADD COLUMN     "alarm" TEXT NOT NULL DEFAULT E'default';
