/*
  Warnings:

  - You are about to drop the column `recId` on the `Saying` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Saying" DROP CONSTRAINT "Saying_recId_fkey";

-- AlterTable
ALTER TABLE "Saying" DROP COLUMN "recId";

-- AlterTable
ALTER TABLE "recomand" ADD COLUMN     "sayingId" INTEGER;

-- AddForeignKey
ALTER TABLE "recomand" ADD FOREIGN KEY ("sayingId") REFERENCES "Saying"("id") ON DELETE SET NULL ON UPDATE CASCADE;
