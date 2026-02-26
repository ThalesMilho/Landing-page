
import type { RequestHandler } from "express";
import { env } from "../config/env";

export const healthController: RequestHandler = (_req, res) => {
  res.json({
    status: "healthy",
    service: "hospital-intranet-api",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

