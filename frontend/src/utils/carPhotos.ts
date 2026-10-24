import manifestData from "../data/car-photos.json";
import { fallbackImageForCategory } from "./fallbackImageForCategory";
import { isSvgVehicleImageUrl } from "./vehicleImageDisplay";

export type CarPhotoEntry = {
  file: string;
  variants?: {
    w500?: string;
    w960?: string;
  };
  category: string;
  make?: string | null;
  model?: string | null;
  width: number;
  height: number;
  title: string;
  author: string;
  licenseShortName: string;
  licenseUrl: string;
  descriptionUrl: string;
  sourceUrl: string;
  resized: boolean;
  notes?: string;
};

export type CarPhotoManifest = {
  photos: CarPhotoEntry[];
};

export const carPhotoManifest = manifestData as CarPhotoManifest;

export function normalizeCategoryKey(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, " ");
}

export function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function photosForCategory(category: string): CarPhotoEntry[] {
  const key = normalizeCategoryKey(category);
  return carPhotoManifest.photos.filter(
    (photo) => normalizeCategoryKey(photo.category) === key,
  );
}

export function pickCategoryPhoto(
  category: string,
  vehicleId: string,
): string | null {
  const matches = photosForCategory(category);
  if (matches.length === 0) return null;
  const index = stableHash(vehicleId) % matches.length;
  const chosen = matches[index];
  return chosen ? `/cars/${chosen.file}` : null;
}

export function responsiveSrcSetForEntry(
  entry: CarPhotoEntry | null | undefined,
): string | undefined {
  if (!entry) return undefined;
  const parts: string[] = [];
  if (entry.variants?.w500) {
    parts.push(`/cars/${entry.variants.w500} 500w`);
  }
  if (entry.variants?.w960) {
    parts.push(`/cars/${entry.variants.w960} 960w`);
  }
  parts.push(`/cars/${entry.file} ${entry.width}w`);
  return parts.length > 1 ? parts.join(", ") : undefined;
}

export function imageSizesForLayout(layout: "card" | "detail" | "hero"): string {
  if (layout === "card") {
    return "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px";
  }
  if (layout === "hero") {
    return "(max-width: 1024px) 100vw, 960px";
  }
  return "(max-width: 768px) 100vw, 720px";
}

export function findManifestEntryByPublicPath(
  publicPath: string | null | undefined,
): CarPhotoEntry | null {
  if (!publicPath) return null;
  const file = publicPath.replace(/^\/cars\//, "");
  return carPhotoManifest.photos.find((photo) => photo.file === file) ?? null;
}

export function vehiclePhotoFilename(make: string, model: string): string {
  const slug = `${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}.jpg`;
}

export function vehicleOwnPhotoPath(make: string, model: string): string | null {
  const file = vehiclePhotoFilename(make, model);
  const entry = carPhotoManifest.photos.find(
    (photo) => photo.file === file && photo.make && photo.model,
  );
  return entry ? `/cars/${entry.file}` : null;
}

export type VehicleImageChainLevel =
  | "primary"
  | "category-photo"
  | "category-svg"
  | "placeholder";

export function resolveVehicleImageChain(input: {
  imageUrl?: string | null;
  category: string;
  vehicleId: string;
  primaryFailed: boolean;
  categoryPhotoFailed: boolean;
  categorySvgFailed: boolean;
}): { url: string; level: VehicleImageChainLevel; isPhoto: boolean } {
  const trimmed = input.imageUrl?.trim() ?? "";
  if (trimmed && !input.primaryFailed) {
    return {
      url: trimmed,
      level: "primary",
      isPhoto: !isSvgVehicleImageUrl(trimmed),
    };
  }

  if (!input.categoryPhotoFailed) {
    const categoryPhoto = pickCategoryPhoto(input.category, input.vehicleId);
    if (categoryPhoto) {
      return { url: categoryPhoto, level: "category-photo", isPhoto: true };
    }
  }

  if (!input.categorySvgFailed) {
    return {
      url: fallbackImageForCategory(input.category),
      level: "category-svg",
      isPhoto: false,
    };
  }

  return { url: "/cars/placeholder.svg", level: "placeholder", isPhoto: false };
}

export function isCategoryPhotoForVehicle(
  vehicle: { make: string; model: string; imageUrl?: string | null },
  displayedPath: string,
): boolean {
  const own = vehicleOwnPhotoPath(vehicle.make, vehicle.model);
  if (own && vehicle.imageUrl?.trim() === own) return false;
  if (vehicle.imageUrl?.trim() && vehicle.imageUrl.trim() === displayedPath) {
    return false;
  }
  const entry = findManifestEntryByPublicPath(displayedPath);
  if (!entry) return false;
  return !entry.make || !entry.model;
}
