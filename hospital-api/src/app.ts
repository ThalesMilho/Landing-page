
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

export function buildApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());

  app.use(
    cors({
      origin: env.ALLOWED_ORIGIN,
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

