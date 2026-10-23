import type { Vehicle } from "../types";

export type VehicleCardProps = {
  vehicle: Vehicle;
  canManage?: boolean;
  purchasing?: boolean;
  onPurchase?: (vehicle: Vehicle) => void;
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <article>
      <h2>
        {vehicle.make} {vehicle.model}
      </h2>
      <p>{vehicle.category}</p>
      <p>{vehicle.price}</p>
      <button type="button">Purchase</button>
    </article>
  );
}
