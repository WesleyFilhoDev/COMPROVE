-- AlterTable
ALTER TABLE "Signature" ADD COLUMN     "signatureImage" TEXT;

-- AlterTable
ALTER TABLE "Training" ADD COLUMN     "contentMinistrado" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "traineePhone" TEXT;
