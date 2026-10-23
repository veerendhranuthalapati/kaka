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
        throw new ApiError(409, "EMAIL_TAKEN", "Email already registered");
      }
      throw error;
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
}
