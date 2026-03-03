import pino from "pino";
import { env } from "./env";

const transport = env.NODE_ENV === "development"
  ? pino.transport({
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard" },
    })
  : undefined;

export const logger = pino(
  {
    level: env.LOG_LEVEL,
    base: { service: "hospital-intranet-api", env: env.NODE_ENV },
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie"],
      remove: true,
    },
  },
  transport
);

export const createChildLogger = (module: string) => logger.child({ module });