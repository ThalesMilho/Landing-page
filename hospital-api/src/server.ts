
import http from "http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { buildApp } from "./app";
import { getDb } from "./db/database"; // Importa o better-sqlite3

const app = buildApp();
const server = http.createServer(app);

async function bootstrap() {
  // Inicializa o banco de dados better-sqlite3
  getDb();
  logger.info("Database connected");

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, `Hospital Intranet API running on :${env.PORT}`);
  });
}

bootstrap().catch((err: unknown) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});

function shutdown(signal: string) {
  logger.warn({ signal }, "Shutting down");
  server.close((err?: Error) => {
    if (err) {
      logger.error({ err }, "Error closing server");
      process.exit(1);
      return;
    }
    disconnectDatabase()
      .then(() => process.exit(0))
      .catch((dbErr: unknown) => {
        logger.error({ err: dbErr }, "Error disconnecting database");
        process.exit(1);
      });
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

