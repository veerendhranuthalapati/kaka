import type { Vehicle } from "@prisma/client";
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
}
