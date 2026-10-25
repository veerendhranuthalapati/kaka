import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export type VehicleDetailsImageLinkProps = {
  vehicleId: string;
  title: string;
  children: ReactNode;
  className?: string;
  onPrefetch?: () => void;
};

export function VehicleDetailsImageLink({
  vehicleId,
  title,
  children,
  className = "",
  onPrefetch,
}: VehicleDetailsImageLinkProps) {
  return (
    <Link
      to={`/vehicles/${vehicleId}`}
      aria-label={`View details for ${title}`}
      tabIndex={-1}
      className={`vehicle-details-image-link block cursor-pointer overflow-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-safe:transition-transform motion-safe:duration-ui motion-safe:ease-gentle motion-safe:hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100 ${className}`}
      style={{ viewTransitionName: `vehicle-${vehicleId}` }}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      onTouchStart={onPrefetch}
    >
      {children}
    </Link>
  );
}
