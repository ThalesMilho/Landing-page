import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  AUTH_MODE: process.env.AUTH_MODE || "mock",
  DB_PATH: process.env.DB_PATH || "./data/hospital.db",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./data/uploads",
  AZURE_TENANT_ID: process.env.AZURE_TENANT_ID || "",
  AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID || "",
  AZURE_AUDIENCE: process.env.AZURE_AUDIENCE || "",
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  DATABASE_URL: process.env.DATABASE_URL || "./data/hospital.db",
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 20,
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 200,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};