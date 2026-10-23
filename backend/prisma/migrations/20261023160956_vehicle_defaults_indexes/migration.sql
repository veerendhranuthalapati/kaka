-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "quantity" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Vehicle_price_idx" ON "Vehicle"("price");
