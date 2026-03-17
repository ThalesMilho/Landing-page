"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const app_1 = require("./app");
const database_1 = require("./config/database");
const app = (0, app_1.buildApp)();
const server = http_1.default.createServer(app);
async function bootstrap() {
    await (0, database_1.connectDatabase)();
    server.listen(env_1.env.PORT, () => {
        logger_1.logger.info({ port: env_1.env.PORT }, `Hospital Intranet API running on :${env_1.env.PORT}`);
    });
}
bootstrap().catch((err) => {
    logger_1.logger.fatal({ err }, "Failed to start server");
    process.exit(1);
});
function shutdown(signal) {
    logger_1.logger.warn({ signal }, "Shutting down");
    server.close((err) => {
        if (err) {
            logger_1.logger.error({ err }, "Error closing server");
            process.exit(1);
            return;
        }
        (0, database_1.disconnectDatabase)()
            .then(() => process.exit(0))
            .catch((dbErr) => {
            logger_1.logger.error({ err: dbErr }, "Error disconnecting database");
            process.exit(1);
        });
    });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
    logger_1.logger.fatal({ reason }, "Unhandled rejection");
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    logger_1.logger.fatal({ err }, "Uncaught exception");
    process.exit(1);
});
//# sourceMappingURL=server.js.map