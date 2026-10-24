-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "year" INTEGER,
ADD COLUMN     "odometerKm" INTEGER,
ADD COLUMN     "engineCc" INTEGER,
ADD COLUMN     "powerBhp" INTEGER,
ADD COLUMN     "torqueNm" INTEGER,
ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "transmission" TEXT,
ADD COLUMN     "drivetrain" TEXT,
ADD COLUMN     "fuelEconomyKmpl" DECIMAL(5,2),
ADD COLUMN     "color" VARCHAR(32),
ADD COLUMN     "owners" INTEGER,
ADD COLUMN     "vin" VARCHAR(17);

-- CreateIndex
CREATE INDEX "Vehicle_fuelType_idx" ON "Vehicle"("fuelType");

-- CreateIndex
CREATE INDEX "Vehicle_year_idx" ON "Vehicle"("year");
