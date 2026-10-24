import { memo } from "react";
import { Link } from "react-router-dom";
import type { Vehicle } from "../types";
import { cardSpecChips } from "../utils/cardSpecChips";
import { formatPrice } from "../utils/format";
import { VehicleImage } from "./VehicleImage";

function stockClass(quantity: number): string {
  if (quantity === 0) return "stock-out";
  if (quantity <= 2) return "stock-low";
  return "stock-ok";
}

export const InventoryVehicleCard = memo(function InventoryVehicleCard({
  vehicle,
  purchasing,
  canManage,
  stockHighlight,
  onPurchase,
  onEdit,
  onRestock,
  onDelete,
}: {
  vehicle: Vehicle;
  purchasing: boolean;
  canManage: boolean;
  stockHighlight?: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
}) {
  const outOfStock = vehicle.quantity === 0;
  const title = `${vehicle.make} ${vehicle.model}`;
  const yearLabel = vehicle.year != null ? String(vehicle.year) : null;
  const chips = cardSpecChips(vehicle, { omitYear: yearLabel != null });

  return (
    <article className="surface-hover flex h-full flex-col overflow-hidden">
      <VehicleImage
        src={vehicle.imageUrl}
        category={vehicle.category}
        alt={title}
        className="rounded-none"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-card-title tracking-tight text-ink">
              {title}
            </h3>
            {yearLabel && (
              <p className="font-sans text-body text-muted">{yearLabel}</p>
            )}
          </div>
          <span className="badge-category shrink-0">{vehicle.category}</span>
        </div>
        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Key specifications">
            {chips.map((chip) => (
              <li key={chip} className="spec-chip">
                {chip}
              </li>
            ))}
          </ul>
        )}
        <p className="text-price">{formatPrice(vehicle.price)}</p>
        <p
          className={`${stockClass(vehicle.quantity)} ${stockHighlight ? "stock-updated" : ""}`}
        >
          {outOfStock ? "Out of stock" : `${vehicle.quantity} in stock`}
        </p>
        <button
          type="button"
          className={`btn-primary w-full whitespace-nowrap ${purchasing ? "btn-skeleton" : ""}`}
          disabled={outOfStock || purchasing}
          aria-busy={purchasing}
          onClick={() => onPurchase(vehicle)}
        >
          {purchasing ? "Purchasing..." : outOfStock ? "Out of stock" : "Purchase"}
        </button>
        <Link
          className="link text-center text-body whitespace-nowrap"
          to={`/vehicles/${vehicle.id}`}
        >
          View details
        </Link>
        {canManage && (
          <div className="mt-auto flex flex-wrap gap-2 border-t border-line/80 pt-3">
            <button type="button" className="btn-ghost text-label normal-case whitespace-nowrap" onClick={() => onEdit?.(vehicle)}>
              Edit
            </button>
            <button type="button" className="btn-ghost text-label normal-case whitespace-nowrap" onClick={() => onRestock?.(vehicle)}>
              Restock
            </button>
            <button type="button" className="btn-danger text-label normal-case whitespace-nowrap" onClick={() => onDelete?.(vehicle)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
});

export function InventorySkeletonCard() {
  return (
    <div className="surface overflow-hidden">
      <div className="aspect-[16/9] skeleton" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-2/3 skeleton rounded-btn" />
        <div className="h-4 w-1/3 skeleton rounded-btn" />
        <div className="h-8 w-1/2 skeleton rounded-btn" />
        <div className="h-11 w-full skeleton rounded-btn" />
      </div>
    </div>
  );
}
