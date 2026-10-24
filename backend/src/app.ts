import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config, type TrustProxySetting } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { ApiError } from "./errors/ApiError.js";
import { authRouter } from "./routes/auth.routes.js";
import { vehiclesRouter } from "./routes/vehicles.routes.js";

export type AppOptions = {
  authRateLimitMax?: number;
  authRateLimitWindowMs?: number;
  trustProxy?: TrustProxySetting;
};

/** Express application factory for production and Supertest. */
export function createApp(options: AppOptions = {}): Express {
  const app = express();
  app.set("trust proxy", options.trustProxy ?? config.trustProxy);
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
    }),
  );
  app.use(express.json());

  const authLimiter = rateLimit({
    windowMs: options.authRateLimitWindowMs ?? config.authRateLimitWindowMs,
    max: options.authRateLimitMax ?? config.authRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests",
        },
      });
    },
  });
  app.use("/api/auth", authLimiter);
  app.use("/api/auth", authRouter);
  app.use("/api/vehicles", vehiclesRouter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use((_req, _res, next) => {
    next(new ApiError(404, "NOT_FOUND", "Route not found"));
  });

  app.use(errorHandler);

  return app;
}
