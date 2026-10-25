-- Data conflict checks before CHECK constraints (report ids only)
DO $$
DECLARE
  bad_ids TEXT;
BEGIN
  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle" WHERE quantity < 0;
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_QUANTITY_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle" WHERE price < 0;
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_PRICE_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE year IS NOT NULL AND (year < 1980 OR year > EXTRACT(YEAR FROM CURRENT_DATE)::int + 1);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_YEAR_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE "odometerKm" IS NOT NULL AND ("odometerKm" < 0 OR "odometerKm" > 2000000);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_ODOMETER_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE "engineCc" IS NOT NULL AND ("engineCc" < 50 OR "engineCc" > 10000);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_ENGINE_CC_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE "powerBhp" IS NOT NULL AND ("powerBhp" < 1 OR "powerBhp" > 2000);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_POWER_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE "torqueNm" IS NOT NULL AND ("torqueNm" < 1 OR "torqueNm" > 3000);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_TORQUE_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE "fuelEconomyKmpl" IS NOT NULL AND ("fuelEconomyKmpl" < 0.1 OR "fuelEconomyKmpl" > 100);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_FUEL_ECONOMY_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE seats IS NOT NULL AND (seats < 1 OR seats > 9);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_SEATS_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE owners IS NOT NULL AND (owners < 1 OR owners > 10);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_OWNERS_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE "rangeKm" IS NOT NULL AND ("rangeKm" < 20 OR "rangeKm" > 1500);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_RANGE_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE "batteryKwh" IS NOT NULL AND ("batteryKwh" < 5 OR "batteryKwh" > 250);
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_BATTERY_CONFLICT ids=%', bad_ids;
  END IF;

  SELECT string_agg(id::text, ',') INTO bad_ids FROM "Vehicle"
  WHERE cardinality(features) > 12;
  IF bad_ids IS NOT NULL THEN
    RAISE EXCEPTION 'VEHICLE_FEATURES_CONFLICT ids=%', bad_ids;
  END IF;
END $$;

ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_quantity_nonnegative" CHECK (quantity >= 0);
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_price_nonnegative" CHECK (price >= 0);
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_year_range" CHECK (year IS NULL OR (year >= 1980 AND year <= EXTRACT(YEAR FROM CURRENT_DATE)::int + 1));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_odometer_range" CHECK ("odometerKm" IS NULL OR ("odometerKm" >= 0 AND "odometerKm" <= 2000000));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_engine_cc_range" CHECK ("engineCc" IS NULL OR ("engineCc" >= 50 AND "engineCc" <= 10000));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_power_bhp_range" CHECK ("powerBhp" IS NULL OR ("powerBhp" >= 1 AND "powerBhp" <= 2000));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_torque_nm_range" CHECK ("torqueNm" IS NULL OR ("torqueNm" >= 1 AND "torqueNm" <= 3000));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fuel_economy_range" CHECK ("fuelEconomyKmpl" IS NULL OR ("fuelEconomyKmpl" >= 0.1 AND "fuelEconomyKmpl" <= 100));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_seats_range" CHECK (seats IS NULL OR (seats >= 1 AND seats <= 9));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_owners_range" CHECK (owners IS NULL OR (owners >= 1 AND owners <= 10));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_range_km_range" CHECK ("rangeKm" IS NULL OR ("rangeKm" >= 20 AND "rangeKm" <= 1500));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_battery_kwh_range" CHECK ("batteryKwh" IS NULL OR ("batteryKwh" >= 5 AND "batteryKwh" <= 250));
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_features_max_length" CHECK (cardinality(features) <= 12);
