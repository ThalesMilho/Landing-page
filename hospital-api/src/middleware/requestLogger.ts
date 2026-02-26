
import type { RequestHandler } from "express";
import { logger } from "../config/logger";

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level]({
      req: {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
      res: {
        statusCode: res.statusCode,
      },
      durationMs: Number(durationMs.toFixed(2)),
    }, "HTTP request");
  });

  next();
};

