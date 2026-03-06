/*
  Warnings:

  - A unique constraint covering the columns `[providerId,marketId]` on the table `Runner` will be added. If there are existing duplicate values, this will fail.
  - Made the column `handicap` on table `Runner` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sortPriority` on table `Runner` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Runner_providerId_key";

-- AlterTable
ALTER TABLE "Runner" ALTER COLUMN "handicap" SET NOT NULL,
ALTER COLUMN "sortPriority" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Runner_providerId_marketId_key" ON "Runner"("providerId", "marketId");
