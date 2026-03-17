"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChildLogger = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const env_1 = require("./env");
const transport = env_1.env.NODE_ENV === "development"
    ? pino_1.default.transport({
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
    })
    : undefined;
exports.logger = (0, pino_1.default)({
    level: env_1.env.LOG_LEVEL,
    base: { service: "hospital-intranet-api", env: env_1.env.NODE_ENV },
    redact: {
        paths: ["req.headers.authorization", "req.headers.cookie"],
        remove: true,
    },
}, transport);
const createChildLogger = (module) => exports.logger.child({ module });
exports.createChildLogger = createChildLogger;
//# sourceMappingURL=logger.js.map