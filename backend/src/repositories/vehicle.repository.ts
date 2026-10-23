import type { Prisma, Vehicle } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export type CreateVehicleInput = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
};

export type VehicleSearchFilters = {
  make?: string;
  model?: string;
  category?: string;
};

export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  search(filters: VehicleSearchFilters): Promise<Vehicle[]>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  }

  findAll(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });
  }

  search(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    const where: Prisma.VehicleWhereInput = {};

    if (filters.make !== undefined) {
      where.make = { contains: filters.make, mode: "insensitive" };
    }
    if (filters.model !== undefined) {
      where.model = { contains: filters.model, mode: "insensitive" };
    }
    if (filters.category !== undefined) {
      where.category = { equals: filters.category, mode: "insensitive" };
    }

    return prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
  }
}
