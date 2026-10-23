import type {
  Vehicle,
  VehicleInput,
  VehicleSearchParams,
  VehicleUpdateInput,
} from "../types";
import { apiRequest } from "./client";

function searchQuery(params: VehicleSearchParams): string {
  const query = new URLSearchParams();

  if (params.make) query.set("make", params.make);
  if (params.model) query.set("model", params.model);
  if (params.category) query.set("category", params.category);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function listVehicles(): Promise<Vehicle[]> {
  return apiRequest<Vehicle[]>("/api/vehicles");
}

export function searchVehicles(params: VehicleSearchParams): Promise<Vehicle[]> {
  return apiRequest<Vehicle[]>(`/api/vehicles/search${searchQuery(params)}`);
}

export function createVehicle(input: VehicleInput): Promise<Vehicle> {
  return apiRequest<Vehicle>("/api/vehicles", { method: "POST", body: input });
}

export function updateVehicle(
  id: string,
  input: VehicleUpdateInput,
): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/api/vehicles/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteVehicle(id: string): Promise<void> {
  return apiRequest<void>(`/api/vehicles/${id}`, { method: "DELETE" });
}

export function purchaseVehicle(id: string): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/api/vehicles/${id}/purchase`, {
    method: "POST",
  });
}

export function restockVehicle(id: string, amount: number): Promise<Vehicle> {
  return apiRequest<Vehicle>(`/api/vehicles/${id}/restock`, {
    method: "POST",
    body: { amount },
  });
}
