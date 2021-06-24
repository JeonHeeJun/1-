/*
  Warnings:

  - The migration will change the primary key for the `recomand` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `recomand` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "recomand_userId_unique";

-- AlterTable
ALTER TABLE "recomand" DROP CONSTRAINT "recomand_pkey",
DROP COLUMN "id",
ADD PRIMARY KEY ("userId");
