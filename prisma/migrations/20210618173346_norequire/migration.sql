/*
  Warnings:

  - You are about to drop the column `alarm` on the `recomand` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alarm" TEXT NOT NULL DEFAULT E'default';

-- AlterTable
ALTER TABLE "recomand" DROP COLUMN "alarm",
ALTER COLUMN "sayingId" DROP NOT NULL;
