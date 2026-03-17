"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const log = (0, logger_1.createChildLogger)("database");
exports.prisma = global.__prisma ??
    new client_1.PrismaClient({
        log: [
            { level: "error", emit: "event" },
            { level: "warn", emit: "event" },
        ],
    });
if (process.env["NODE_ENV"] !== "production") {
    global.__prisma = exports.prisma;
}
exports.prisma.$on("error", (e) => {
    log.error(e, "Prisma error");
});
async function connectDatabase() {
    await exports.prisma.$connect();
    log.info("Database connected");
}
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
    log.info("Database disconnected");
}
//# sourceMappingURL=database.js.map