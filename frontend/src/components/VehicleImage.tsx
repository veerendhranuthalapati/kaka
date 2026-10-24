import { useState } from "react";

const PLACEHOLDER_SRC = "/cars/placeholder.svg";

export type VehicleImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function VehicleImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: VehicleImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed || !src ? PLACEHOLDER_SRC : src;

  return (
    <img
      src={resolved}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={loading === "eager" ? "high" : undefined}
      referrerPolicy="no-referrer"
      className={`aspect-[16/9] w-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
