/*
  Warnings:

  - You are about to drop the column `time` on the `PersistentQuery` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,queryHash]` on the table `PersistentQuery` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `queryHash` to the `PersistentQuery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PersistentQuery` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `query` on the `PersistentQuery` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PersistentQuery" DROP COLUMN "time",
ADD COLUMN     "queryHash" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "query",
ADD COLUMN     "query" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PersistentQuery_userId_queryHash_key" ON "PersistentQuery"("userId", "queryHash");
