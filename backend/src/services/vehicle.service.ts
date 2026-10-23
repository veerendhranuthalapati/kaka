import type { Vehicle } from "@prisma/client";
import { ApiError } from "../errors/ApiError.js";
import {
  PrismaVehicleRepository,
  type CreateVehicleInput,
  type VehicleRepository,
  type VehicleSearchFilters,
} from "../repositories/vehicle.repository.js";

export type VehicleDto = {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
};

export function toVehicleDto(vehicle: Vehicle): VehicleDto {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    price: Number(vehicle.price),
    quantity: vehicle.quantity,
  };
}

export class VehicleService {
  constructor(
    private readonly vehicles: VehicleRepository = new PrismaVehicleRepository(),
  ) {}

  async create(input: CreateVehicleInput): Promise<VehicleDto> {
    const vehicle = await this.vehicles.create(input);
    return toVehicleDto(vehicle);
  }

  async list(): Promise<VehicleDto[]> {
    const vehicles = await this.vehicles.findAll();
    return vehicles.map(toVehicleDto);
  }

  async search(filters: VehicleSearchFilters): Promise<VehicleDto[]> {
    const vehicles = await this.vehicles.search(filters);
    return vehicles.map(toVehicleDto);
  }

  async update(
    id: string,
    data: Partial<Pick<VehicleDto, "make" | "model" | "category" | "price">>,
  ): Promise<VehicleDto> {
    const existing = await this.vehicles.findById(id);
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Vehicle not found");
    }
    const vehicle = await this.vehicles.update(id, data as never);
    return toVehicleDto(vehicle);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.vehicles.findById(id);
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Vehicle not found");
    }
    await this.vehicles.delete(id);
  }

  async purchase(id: string): Promise<VehicleDto> {
    const existing = await this.vehicles.findById(id);
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Vehicle not found");
    }
    if (existing.quantity <= 0) {
      throw new ApiError(409, "OUT_OF_STOCK", "Vehicle is out of stock");
    }

    const result = await this.vehicles.purchase(id);
    if (result.count === 0) {
      throw new ApiError(409, "OUT_OF_STOCK", "Vehicle is out of stock");
    }

    const updated = await this.vehicles.findById(id);
    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "Vehicle not found");
    }
    return toVehicleDto(updated);
  }
}
