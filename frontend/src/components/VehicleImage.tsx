import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  findManifestEntryByPublicPath,
  imageSizesForLayout,
  resolveVehicleImageChain,
  responsiveSrcSetForEntry,
  type VehicleImageChainLevel,
} from "../utils/carPhotos";

const PLACEHOLDER_SRC = "/cars/placeholder.svg";

export type VehicleImageProps = {
  src?: string | null;
  category?: string;
  vehicleId?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fixedAspect?: boolean;
  layout?: "card" | "detail" | "hero";
  onDisplayChange?: (info: {
    path: string;
    level: VehicleImageChainLevel;
    manifestEntry: ReturnType<typeof findManifestEntryByPublicPath>;
  }) => void;
};

export function VehicleImage({
  src,
  category = "",
  vehicleId = "",
  alt,
  className = "",
  loading = "lazy",
  fixedAspect = true,
  layout = "detail",
  onDisplayChange,
}: VehicleImageProps) {
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [categoryPhotoFailed, setCategoryPhotoFailed] = useState(false);
  const [categorySvgFailed, setCategorySvgFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useLayoutEffect(() => {
    setPrimaryFailed(false);
    setCategoryPhotoFailed(false);
    setCategorySvgFailed(false);
    setLoaded(false);
  }, [src, category, vehicleId]);

  const display = resolveVehicleImageChain({
    imageUrl: src,
    category,
    vehicleId,
    primaryFailed,
    categoryPhotoFailed,
    categorySvgFailed,
  });

  useEffect(() => {
    onDisplayChange?.({
      path: display.url,
      level: display.level,
      manifestEntry: findManifestEntryByPublicPath(display.url),
    });
  }, [display.url, display.level, onDisplayChange]);

  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [display.url, primaryFailed, categoryPhotoFailed, categorySvgFailed]);

  function attachImageRef(node: HTMLImageElement | null) {
    imgRef.current = node;
    if (node?.complete && node.naturalWidth > 0) {
      setLoaded(true);
    }
  }

  function handleError() {
    setLoaded(false);
    if (display.level === "primary") {
      setPrimaryFailed(true);
      return;
    }
    if (display.level === "category-photo") {
      setCategoryPhotoFailed(true);
      return;
    }
    if (display.level === "category-svg") {
      setCategorySvgFailed(true);
    }
  }

  const manifestEntry = findManifestEntryByPublicPath(display.url);
  const width = manifestEntry?.width;
  const height = manifestEntry?.height;
  const srcSet = display.isPhoto ? responsiveSrcSetForEntry(manifestEntry) : undefined;
  const sizes = srcSet ? imageSizesForLayout(layout) : undefined;

  const frameClass =
    display.isPhoto ? "bg-raised" : "image-panel text-muted";

  const imageClass = display.isPhoto
    ? "h-full w-full object-cover"
    : "h-full w-full object-contain p-6 sm:p-10";

  const aspectClass = fixedAspect ? "aspect-[16/9]" : "h-full min-h-0";

  return (
    <div
      className={`relative w-full overflow-hidden ${aspectClass} ${frameClass} ${className}`}
    >
      {!loaded && (
        <div
          className="absolute inset-0 skeleton motion-reduce:hidden"
          aria-hidden="true"
        />
      )}
      <img
        ref={attachImageRef}
        src={display.url}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        fetchPriority={loading === "eager" ? "high" : undefined}
        referrerPolicy="no-referrer"
        className={`vehicle-img ${loaded ? "vehicle-img-ready" : "vehicle-img-loading"} ${imageClass}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}

export { PLACEHOLDER_SRC };
