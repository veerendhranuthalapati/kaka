import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { vehiclesRouter } from "./routes/vehicles.routes.js";

/** Express application factory for production and Supertest. */
export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
    }),
  );
  app.use(express.json());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  if (process.env.NODE_ENV !== "test") {
    app.use("/api/auth", authLimiter);
  }
  app.use("/api/auth", authRouter);

  app.use("/api/auth", authRouter);
  app.use("/api/vehicles", vehiclesRouter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
}
