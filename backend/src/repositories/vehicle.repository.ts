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
  minPrice?: number;
  maxPrice?: number;
};

export type UpdateVehicleInput = Partial<
  Pick<Vehicle, "make" | "model" | "category"> & { price: number }
>;

export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  search(filters: VehicleSearchFilters): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  update(id: string, data: UpdateVehicleInput): Promise<Vehicle>;
  delete(id: string): Promise<Vehicle>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({ data });
  }

  findAll(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });
  }

  findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    return prisma.vehicle.update({ where: { id }, data });
  }

  delete(id: string): Promise<Vehicle> {
    return prisma.vehicle.delete({ where: { id } });
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
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    return prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
  }
}
