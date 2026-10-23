import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { config } from "../config/env.js";
import { JWT_ALGORITHM, JWT_EXPIRES_IN } from "../config/jwt.js";
import { ApiError } from "../errors/ApiError.js";
import type { LoginBody } from "../validators/auth.login.schema.js";
import type { RegisterBody } from "../validators/auth.register.schema.js";
import {
  PrismaUserRepository,
  type UserRepository,
} from "../repositories/user.repository.js";

export type PublicUser = {
  id: string;
  email: string;
  role: Role;
};

export type RegisterResult = {
  user: PublicUser;
  token: string;
};

function toPublicUser(user: {
  id: string;
  email: string;
  role: Role;
}): PublicUser {
  return { id: user.id, email: user.email, role: user.role };
}

export class AuthService {
  constructor(private readonly users: UserRepository = new PrismaUserRepository()) {}

  async register(body: RegisterBody): Promise<RegisterResult> {
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await this.users.create({
      email: body.email.toLowerCase(),
      passwordHash,
      role: "USER",
    });
    return { user: toPublicUser(user), token: this.signToken(user) };
  }

  async login(body: LoginBody): Promise<RegisterResult> {
    const user = await this.users.findByEmail(body.email.toLowerCase());

    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new ApiError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    return { user: toPublicUser(user), token: this.signToken(user) };
  }

  private signToken(user: { id: string; email: string; role: Role }): string {
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN },
    );
  }
}
