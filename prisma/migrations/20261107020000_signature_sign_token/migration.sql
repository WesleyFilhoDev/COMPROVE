-- AlterTable
ALTER TABLE "Signature" ADD COLUMN "signToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Signature_signToken_key" ON "Signature"("signToken");
