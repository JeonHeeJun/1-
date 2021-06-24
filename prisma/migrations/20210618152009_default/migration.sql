/*
  Warnings:

  - Added the required column `sid` to the `Saying` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Saying" ADD COLUMN     "sid" INTEGER NOT NULL,
ADD COLUMN     "alarm" TEXT NOT NULL DEFAULT E'default';
