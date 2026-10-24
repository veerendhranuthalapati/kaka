import type { Vehicle } from "../types";
import { formatPrice } from "../utils/format";
import { VehicleImage } from "./VehicleImage";

function stockTone(quantity: number): string {
  if (quantity === 0) return "text-danger";
  if (quantity <= 2) return "text-amber-600";
  return "text-emerald-600";
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
    <article className="surface overflow-hidden">
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onDetails(vehicle)}
      >
        <VehicleImage src={vehicle.imageUrl} alt={title} className="rounded-none" />
      </button>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-sm text-muted">{vehicle.category}</p>
          </div>
          <span className="badge">{vehicle.category}</span>
        </div>
        <p className="text-2xl font-bold">{formatPrice(vehicle.price)}</p>
        <p className={`text-sm font-semibold ${stockTone(vehicle.quantity)}`}>
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
            <button type="button" className="btn-secondary text-xs" onClick={() => onEdit?.(vehicle)}>
              Edit
            </button>
            <button type="button" className="btn-secondary text-xs" onClick={() => onRestock?.(vehicle)}>
              Restock
            </button>
            <button type="button" className="btn-danger text-xs" onClick={() => onDelete?.(vehicle)}>
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
