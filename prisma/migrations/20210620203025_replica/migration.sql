/*
  Warnings:

  - You are about to drop the column `sayingId` on the `recomand` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "recomand" DROP CONSTRAINT "recomand_sayingId_fkey";

-- DropIndex
DROP INDEX "recomand_sayingId_unique";

-- AlterTable
ALTER TABLE "Saying" ADD COLUMN     "recId" INTEGER;

-- AlterTable
ALTER TABLE "recomand" DROP COLUMN "sayingId";

-- AddForeignKey
ALTER TABLE "Saying" ADD FOREIGN KEY ("recId") REFERENCES "recomand"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
