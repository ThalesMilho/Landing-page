"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3001),
    NODE_ENV: zod_1.z.enum(["development", "production"]).default("development"),
    AZURE_TENANT_ID: zod_1.z.string().min(1),
    AZURE_CLIENT_ID: zod_1.z.string().min(1),
    AZURE_AUDIENCE: zod_1.z.string().min(1),
    ALLOWED_ORIGIN: zod_1.z.string().min(1),
    DATABASE_URL: zod_1.z.string().url({ message: "DATABASE_URL must be a valid URL" }),
    UPLOAD_DIR: zod_1.z.string().default("uploads"),
    MAX_FILE_SIZE_MB: zod_1.z
        .string()
        .default("20")
        .transform(Number)
        .pipe(zod_1.z.number().positive()),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(200),
    LOG_LEVEL: zod_1.z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map