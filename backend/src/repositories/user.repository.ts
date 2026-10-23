import type { Role, User } from "@prisma/client";
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
  create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({ data });
  }

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
}
