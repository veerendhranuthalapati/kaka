import type { Vehicle } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type CreateVehicleInput = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
};

export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  }
}
