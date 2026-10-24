import { useEffect, useState } from "react";
import { fallbackImageForCategory } from "../utils/fallbackImageForCategory";
import { isSvgVehicleImageUrl } from "../utils/vehicleImageDisplay";

const PLACEHOLDER_SRC = "/cars/placeholder.svg";

export type VehicleImageProps = {
  src?: string | null;
  category?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fixedAspect?: boolean;
};

type DisplayMode = "cover" | "illustration";

function resolveDisplay(
  src: string | null | undefined,
  category: string,
  primaryFailed: boolean,
  categoryFailed: boolean,
): { url: string; mode: DisplayMode; level: "primary" | "category" | "placeholder" } {
  const trimmed = src?.trim() ?? "";
  const categoryUrl = fallbackImageForCategory(category);

  if (trimmed && !primaryFailed) {
    return {
      url: trimmed,
      mode: isSvgVehicleImageUrl(trimmed) ? "illustration" : "cover",
      level: "primary",
    };
  }

  if (!categoryFailed) {
    return { url: categoryUrl, mode: "illustration", level: "category" };
  }

  return { url: PLACEHOLDER_SRC, mode: "illustration", level: "placeholder" };
}

export function VehicleImage({
  src,
  category = "",
  alt,
  className = "",
  loading = "lazy",
  fixedAspect = true,
}: VehicleImageProps) {
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [categoryFailed, setCategoryFailed] = useState(false);

  useEffect(() => {
    setPrimaryFailed(false);
    setCategoryFailed(false);
  }, [src, category]);

  const display = resolveDisplay(src, category, primaryFailed, categoryFailed);

  function handleError() {
    if (display.level === "primary") {
      setPrimaryFailed(true);
      return;
    }
    if (display.level === "category") {
      setCategoryFailed(true);
    }
  }

  const frameClass =
    display.mode === "illustration"
      ? "bg-gradient-to-br from-slate-100 to-slate-200/80"
      : "bg-raised";

  const imageClass =
    display.mode === "illustration"
      ? "h-full w-full object-contain p-6 sm:p-8"
      : "h-full w-full object-cover";

  const aspectClass = fixedAspect ? "aspect-[16/9]" : "h-full min-h-0";

  return (
    <div
      className={`relative w-full overflow-hidden ${aspectClass} ${frameClass} ${className}`}
    >
      <img
        src={display.url}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={loading === "eager" ? "high" : undefined}
        referrerPolicy="no-referrer"
        className={imageClass}
        onError={handleError}
      />
    </div>
  );
}
