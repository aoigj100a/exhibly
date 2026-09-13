-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('SUBJECT', 'MOOD');

-- AlterTable
ALTER TABLE "Tag"
  ALTER COLUMN "category" TYPE "TagCategory"
  USING ("category"::"TagCategory");