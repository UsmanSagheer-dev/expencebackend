import { PrismaClient } from "@prisma/client";

// Optimized Prisma Client with better connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"], // Reduced logging
  errorFormat: "pretty",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Lightweight health check - no logging to reduce noise
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // Only log if it's been a while since last error
    return false;
  }
};

// Optimized reconnect function
export const reconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    await prisma.$connect();
  } catch (error) {
    throw error;
  }
};

// Handle connection errors with smart reconnection
let lastErrorTime = 0;
const ERROR_COOLDOWN = 30000; // 30 seconds cooldown between error logs

prisma.$on("error", async (e: any) => {
  const now = Date.now();

  // Only log errors every 30 seconds to reduce spam
  if (now - lastErrorTime > ERROR_COOLDOWN) {
    lastErrorTime = now;
  }

  // If it's a connection error, try to reconnect
  if (
    e.message?.includes("connection") ||
    e.message?.includes("Connection") ||
    e.message?.includes("Closed")
  ) {
    try {
      await reconnectDatabase();
    } catch (reconnectError) {
      // Silent fail to prevent spam
    }
  }
});

// Graceful shutdown
const gracefulShutdown = async () => {
  await prisma.$disconnect();
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default prisma;
