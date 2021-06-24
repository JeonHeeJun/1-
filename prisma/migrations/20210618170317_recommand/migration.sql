/*
  Warnings:

  - You are about to drop the column `sid` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "sid";

-- CreateTable
CREATE TABLE "recomand" (
    "id" SERIAL NOT NULL,
    "sayingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recomand_userId_unique" ON "recomand"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "recomand_sayingId_unique" ON "recomand"("sayingId");

-- AddForeignKey
ALTER TABLE "recomand" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomand" ADD FOREIGN KEY ("sayingId") REFERENCES "Saying"("id") ON DELETE CASCADE ON UPDATE CASCADE;
