import type { Vehicle } from "@prisma/client";
import { ApiError } from "../errors/ApiError.js";
import {
  PrismaVehicleRepository,
  type CreateVehicleInput,
  type VehicleRepository,
  type VehicleSearchFilters,
  type UpdateVehicleInput,
} from "../repositories/vehicle.repository.js";

export type VehicleDto = {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  year: number | null;
  odometerKm: number | null;
  engineCc: number | null;
  powerBhp: number | null;
  torqueNm: number | null;
  fuelType: string | null;
  transmission: string | null;
  drivetrain: string | null;
  fuelEconomyKmpl: number | null;
  color: string | null;
  owners: number | null;
  vin: string | null;
  createdAt: string;
  updatedAt: string;
};

function serializeVehicleTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

export function toVehicleDto(vehicle: Vehicle): VehicleDto {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    price: Number(vehicle.price),
    quantity: vehicle.quantity,
    imageUrl: vehicle.imageUrl ?? null,
    year: vehicle.year ?? null,
    odometerKm: vehicle.odometerKm ?? null,
    engineCc: vehicle.engineCc ?? null,
    powerBhp: vehicle.powerBhp ?? null,
    torqueNm: vehicle.torqueNm ?? null,
    fuelType: vehicle.fuelType ?? null,
    transmission: vehicle.transmission ?? null,
    drivetrain: vehicle.drivetrain ?? null,
    fuelEconomyKmpl:
      vehicle.fuelEconomyKmpl === null || vehicle.fuelEconomyKmpl === undefined
        ? null
        : Number(vehicle.fuelEconomyKmpl),
    color: vehicle.color ?? null,
    owners: vehicle.owners ?? null,
    vin: vehicle.vin ?? null,
    createdAt: serializeVehicleTimestamp(vehicle.createdAt),
    updatedAt: serializeVehicleTimestamp(vehicle.updatedAt),
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

  async getById(id: string): Promise<VehicleDto> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) {
      throw new ApiError(404, "NOT_FOUND", "Vehicle not found");
    }
    return toVehicleDto(vehicle);
  }

  async update(id: string, data: UpdateVehicleInput): Promise<VehicleDto> {
    const existing = await this.vehicles.findById(id);
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Vehicle not found");
    }
    const vehicle = await this.vehicles.update(id, data);
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

  async restock(id: string, amount: number): Promise<VehicleDto> {
    const existing = await this.vehicles.findById(id);
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Vehicle not found");
    }
    const vehicle = await this.vehicles.restock(id, amount);
    return toVehicleDto(vehicle);
  }
}
