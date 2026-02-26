
import http from "http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { buildApp } from "./app";

const app = buildApp();
const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, `Hospital Intranet API running on :${env.PORT}`);
});

function shutdown(signal: string) {
  logger.warn({ signal }, "Shutting down");
  server.close((err?: Error) => {
    if (err) {
      logger.error({ err }, "Error closing server");
      process.exit(1);
      return;
    }
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal({ reason }, "Unhandled rejection");
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});

