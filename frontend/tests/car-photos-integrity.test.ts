import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO_VEHICLE_CATALOG } from "../../backend/scripts/seed-demo.lib.js";
import {
  isJpegBuffer,
  isLicenseAllowed,
  isPhotoByteSizeValid,
  isCategoryFillerPhoto,
  MAX_TOTAL_PHOTO_BYTES,
  photoAcceptableForDemoVehicle,
  sha256Hex,
} from "../../backend/scripts/car-photos.lib.js";
import manifestData from "../src/data/car-photos.json";
import { normalizeCategoryKey, vehiclePhotoFilename } from "../src/utils/carPhotos";

const DEMO_MAKES = [...new Set(DEMO_VEHICLE_CATALOG.map((entry) => entry.make))];
const carsDir = resolve(import.meta.dirname, "../public/cars");

describe("car photos integrity", () => {
  const manifest = manifestData.photos;

  it("has manifest files on disk as valid JPEGs within size limits", () => {
    const hashes = new Set<string>();
    let total = 0;
    for (const photo of manifest) {
      const filePath = resolve(carsDir, photo.file);
      const buffer = readFileSync(filePath);
      expect(isJpegBuffer(buffer)).toBe(true);
      expect(isPhotoByteSizeValid(buffer.length)).toBe(true);
      expect(photo.author.length).toBeGreaterThan(0);
      expect(isLicenseAllowed(photo.licenseShortName)).toBe(true);
      total += buffer.length;
      const hash = sha256Hex(buffer);
      expect(hashes.has(hash)).toBe(false);
      hashes.add(hash);
    }
    expect(total).toBeLessThanOrEqual(MAX_TOTAL_PHOTO_BYTES);
  });

  it("has 2-3 photos per seeded category", () => {
    const categories = [...new Set(DEMO_VEHICLE_CATALOG.map((entry) => entry.category))];
    const counts = new Map<string, number>();
    for (const photo of manifest) {
      if (!isCategoryFillerPhoto(photo)) continue;
      const key = normalizeCategoryKey(photo.category);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const category of categories) {
      const count = counts.get(normalizeCategoryKey(category)) ?? 0;
      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThanOrEqual(3);
    }
  });

  it("every demo vehicle has an on-disk photo that matches make and model", () => {
    for (const entry of DEMO_VEHICLE_CATALOG) {
      const ownFile = vehiclePhotoFilename(entry.make, entry.model);
      const photo = manifest.find((item) => item.file === ownFile);
      expect(photo, `missing manifest for ${entry.make} ${entry.model}`).toBeDefined();
      const filePath = resolve(carsDir, ownFile);
      expect(readFileSync(filePath).length).toBeGreaterThan(0);
      const categories =
        (photo as { commonsCategories?: string[] }).commonsCategories ?? [];
      expect(
        photoAcceptableForDemoVehicle({
          title: photo!.title,
          categories,
          make: entry.make,
          model: entry.model,
          vehicleCategory: entry.category,
          demoMakes: DEMO_MAKES,
        }),
      ).toBe(true);
    }
  });
});
