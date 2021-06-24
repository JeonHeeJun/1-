/*
  Warnings:

  - You are about to drop the column `sid` on the `Saying` table. All the data in the column will be lost.
  - You are about to drop the column `alarm` on the `Saying` table. All the data in the column will be lost.
  - Added the required column `sid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Saying" DROP COLUMN "sid",
DROP COLUMN "alarm";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sid" INTEGER NOT NULL,
ADD COLUMN     "alarm" TEXT NOT NULL DEFAULT E'default';
