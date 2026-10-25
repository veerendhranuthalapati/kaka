import { Prisma, type Role, type User } from "@prisma/client";
import { ApiError } from "../errors/ApiError.js";
import { prisma } from "../lib/prisma.js";

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  role: Role;
};

export interface UserRepository {
  create(data: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  incrementTokenVersion(id: string): Promise<User>;
}

function mapUniqueViolation(error: Prisma.PrismaClientKnownRequestError): ApiError {
  const target = error.meta?.target;
  const fields = Array.isArray(target) ? target : [];
  if (fields.includes("email")) {
    return new ApiError(409, "EMAIL_TAKEN", "Email already registered");
  }
  return new ApiError(409, "CONFLICT", "Resource conflict");
}

export class PrismaUserRepository implements UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    try {
      return await prisma.user.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw mapUniqueViolation(error);
      }
      throw error;
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async incrementTokenVersion(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}
