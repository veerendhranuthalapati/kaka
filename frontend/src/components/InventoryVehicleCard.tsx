import type { Vehicle } from "../types";
import { formatPrice } from "../utils/format";
import { VehicleImage } from "./VehicleImage";

function stockClass(quantity: number): string {
  if (quantity === 0) return "stock-out";
  if (quantity <= 2) return "stock-low";
  return "stock-ok";
}

export function InventoryVehicleCard({
  vehicle,
  purchasing,
  canManage,
  onPurchase,
  onDetails,
  onEdit,
  onRestock,
  onDelete,
}: {
  vehicle: Vehicle;
  purchasing: boolean;
  canManage: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onDetails: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
}) {
  const outOfStock = vehicle.quantity === 0;
  const title = `${vehicle.make} ${vehicle.model}`;

  return (
    <article className="surface-hover overflow-hidden">
      <button
        type="button"
        className="block w-full min-w-0 text-left"
        onClick={() => onDetails(vehicle)}
      >
        <VehicleImage
          src={vehicle.imageUrl}
          category={vehicle.category}
          alt={title}
          className="rounded-none"
        />
      </button>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-card-title tracking-tight text-ink">
              {title}
            </h3>
            <p className="font-sans text-body text-muted">{vehicle.category}</p>
          </div>
          <span className="badge-category shrink-0">{vehicle.category}</span>
        </div>
        <p className="text-price">{formatPrice(vehicle.price)}</p>
        <p className={stockClass(vehicle.quantity)}>
          {outOfStock ? "Out of stock" : `${vehicle.quantity} in stock`}
        </p>
        <button
          type="button"
          className="btn-primary w-full"
          disabled={outOfStock || purchasing}
          aria-busy={purchasing}
          onClick={() => onPurchase(vehicle)}
        >
          {purchasing ? "Purchasing..." : outOfStock ? "Out of stock" : "Purchase"}
        </button>
        {canManage && (
          <div className="flex flex-wrap gap-2 border-t border-line pt-3">
            <button type="button" className="btn-ghost text-label normal-case" onClick={() => onEdit?.(vehicle)}>
              Edit
            </button>
            <button type="button" className="btn-ghost text-label normal-case" onClick={() => onRestock?.(vehicle)}>
              Restock
            </button>
            <button type="button" className="btn-danger text-label normal-case" onClick={() => onDelete?.(vehicle)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function InventorySkeletonCard() {
  return (
    <div className="surface animate-pulse overflow-hidden motion-reduce:animate-none">
      <div className="aspect-[16/9] bg-raised" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-2/3 rounded bg-raised" />
        <div className="h-4 w-1/3 rounded bg-raised" />
        <div className="h-8 w-1/2 rounded bg-raised" />
      </div>
    </div>
  );
}
