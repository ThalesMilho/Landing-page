
import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { env } from "../config/env";

export class AppError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const errorHandler: ErrorRequestHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof AppError ? err.status : 500;
  const message = err instanceof Error ? err.message : "An unexpected error occurred";

  const logPayload = {
    err: err instanceof Error ? err : undefined,
    status,
    method: req.method,
    path: req.originalUrl,
  };

  if (status >= 500) {
    logger.error(logPayload, "Request failed");
  } else {
    logger.warn(logPayload, "Request failed");
  }

  res.status(status).json({
    status,
    error:
      status === 401
        ? "Unauthorized"
        : status === 403
          ? "Forbidden"
          : status === 400
            ? "Bad Request"
            : status === 429
              ? "Too Many Requests"
              : status === 404
                ? "Not Found"
                : status === 500
                  ? "Internal Server Error"
                  : "Error",
    message: env.NODE_ENV === "production" && status === 500 ? "An unexpected error occurred" : message,
  });
};

