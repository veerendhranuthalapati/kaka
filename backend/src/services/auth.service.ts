import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Role, User } from "@prisma/client";
import { config } from "../config/env.js";
import {
  JWT_ALGORITHM,
  JWT_CLOCK_TOLERANCE_SEC,
  JWT_EXPIRES_IN,
} from "../config/jwt.js";
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

const DUMMY_PASSWORD_HASH =
  "$2b$12$ahDuA3JokgR8gAcja/yCDeO71rfknRaIfytQ2wXWwB4DahB13gqRq";

function toPublicUser(user: {
  id: string;
  email: string;
  role: Role;
}): PublicUser {
  return { id: user.id, email: user.email, role: user.role };
}

export function signAccessToken(user: Pick<User, "id" | "tokenVersion">): string {
  return jwt.sign(
    { tv: user.tokenVersion },
    config.jwtSecret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: JWT_EXPIRES_IN,
      subject: user.id,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    },
  );
}

export function verifyAccessToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, config.jwtSecret, {
    algorithms: [JWT_ALGORITHM],
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
    clockTolerance: JWT_CLOCK_TOLERANCE_SEC,
  }) as jwt.JwtPayload;
}

export class AuthService {
  constructor(private readonly users: UserRepository = new PrismaUserRepository()) {}

  async register(body: RegisterBody): Promise<RegisterResult> {
    const passwordHash = await bcrypt.hash(body.password, config.bcryptCost);
    const existing = await this.users.findByEmail(body.email);
    if (existing) {
      throw new ApiError(409, "EMAIL_TAKEN", "Email already registered");
    }
    const user = await this.users.create({
      email: body.email,
      passwordHash,
      role: "USER",
    });
    return { user: toPublicUser(user), token: signAccessToken(user) };
  }

  async login(body: LoginBody): Promise<RegisterResult> {
    const user = await this.users.findByEmail(body.email);
    const compareHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const passwordMatches = await bcrypt.compare(body.password, compareHash);

    if (!user || !passwordMatches) {
      throw new ApiError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    return { user: toPublicUser(user), token: signAccessToken(user) };
  }

  async logout(userId: string): Promise<void> {
    await this.users.incrementTokenVersion(userId);
  }
}
