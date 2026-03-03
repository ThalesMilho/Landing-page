import { PrismaClient } from "@prisma/client";
import { createChildLogger } from "./logger";

const log = createChildLogger("database");

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: [
      { level: "error", emit: "event" },
      { level: "warn",  emit: "event" },
    ],
  });

if (process.env["NODE_ENV"] !== "production") {
  global.__prisma = prisma;
}

prisma.$on("error" as never, (e: unknown) => {
  log.error(e, "Prisma error");
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  log.info("Database connected");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  log.info("Database disconnected");
}
