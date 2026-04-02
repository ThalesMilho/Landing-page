
import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { NextFunction, Request, Response } from "express";

import { env } from "./config/env";
import { apiLimiter, publicLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, AppError } from "./middleware/errorHandler";
import routes from "./routes";
import { getDb } from "./db/database";

export function buildApp() {
  const app = express();

  getDb();

  app.set("trust proxy", 1);

  app.use(helmet());

  const normalizeOrigin = (value: string) => value.trim().replace(/\/$/, "").toLowerCase();

  const allowedOrigins = env.ALLOWED_ORIGIN.split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) {
          cb(null, true);
          return;
        }

        const normalizedOrigin = normalizeOrigin(origin);

        if (allowedOrigins.includes("*")) {
          cb(null, true);
          return;
        }

        if (allowedOrigins.includes(normalizedOrigin)) {
          cb(null, true);
          return;
        }

        if (env.NODE_ENV === "development" || env.AUTH_MODE === "mock") {
          const devAllowedOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3})(:\d+)?$/;
          if (devAllowedOrigin.test(normalizedOrigin)) {
            cb(null, true);
            return;
          }
        }

        cb(new AppError(`CORS origin not allowed: ${origin}`, 403));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "50kb" }));
  app.use(requestLogger);

  app.use(publicLimiter);
  app.use(apiLimiter);

  app.use(routes);

  app.use((_req: Request, _res: Response, next: NextFunction) => next(new AppError("Not Found", 404)));
  app.use(errorHandler);

  return app;
}

