import express, { type Express } from "express";

import helmet from "helmet";

import { config, type TrustProxySetting } from "./config/env.js";

import { createCorsMiddleware } from "./config/corsMiddleware.js";

import { buildHelmetOptions } from "./config/helmetOptions.js";

import { errorHandler } from "./middleware/errorHandler.js";

import {

  rejectComplexQueryStrings,

  rejectPrototypePollution,

  requireJsonContentType,

} from "./middleware/requestGuards.js";

import { requestIdMiddleware } from "./middleware/requestId.js";

import { requestLoggingMiddleware } from "./middleware/requestLogging.js";

import {

  authNoStore,

  varyOrigin,

} from "./middleware/securityHeaders.js";

import {

  createAuthRateLimiter,

  createGlobalRateLimiter,

  type RateLimitOptions,

} from "./middleware/rateLimits.js";

import { ApiError } from "./errors/ApiError.js";

import { authRouter } from "./routes/auth.routes.js";

import { createVehiclesRouter } from "./routes/vehicles.routes.js";



export type AppOptions = RateLimitOptions & {

  trustProxy?: TrustProxySetting;

};



/** Express application factory for production and Supertest. */

export function createApp(options: AppOptions = {}): Express {

  const app = express();

  app.disable("x-powered-by");

  app.set("trust proxy", options.trustProxy ?? config.trustProxy);



  app.use(requestIdMiddleware);

  app.use(helmet(buildHelmetOptions(config.nodeEnv)));

  app.use((_req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=()",
    );
    next();
  });

  app.use(varyOrigin);

  app.use(createCorsMiddleware(config.corsOrigins));

  app.use(createGlobalRateLimiter(options));

  app.use(express.json({ limit: "16kb", strict: true }));

  app.use(requireJsonContentType);

  app.use(rejectComplexQueryStrings);

  app.use(rejectPrototypePollution);

  app.use(requestLoggingMiddleware);



  const authLimiter = createAuthRateLimiter(options);

  app.use("/api/auth", authNoStore);

  app.use("/api/auth", authLimiter);

  app.use("/api/auth", authRouter);

  app.use("/api/vehicles", createVehiclesRouter(options));



  app.get("/health", (_req, res) => {

    res.status(200).json({ status: "ok" });

  });



  app.use((_req, _res, next) => {

    next(new ApiError(404, "NOT_FOUND", "Route not found"));

  });



  app.use(errorHandler);



  return app;

}


