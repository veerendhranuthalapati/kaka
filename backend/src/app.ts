import express, { type Express } from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";

/** Express application factory for production and Supertest. */
export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.use("/api/auth", authRouter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
}
