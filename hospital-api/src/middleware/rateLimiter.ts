
import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const publicLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 10000, // Aumentado para desenvolvimento
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 5000, // Aumentado para desenvolvimento
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 1000, // Aumentado para desenvolvimento
  standardHeaders: true,
  legacyHeaders: false,
});

