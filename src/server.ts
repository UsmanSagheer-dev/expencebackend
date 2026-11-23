import app from "./app";
import prisma from "./utils/database";

const PORT = process.env.PORT || 3001;

async function connectDatabase(retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log("Database connected");
      return true;
    } catch (error) {
      console.error(
        `Database connection attempt ${attempt}/${retries} failed`,
      );
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
      }
    }
  }
  return false;
}

// Function to start the server
async function startServer() {
  try {
    const isDatabaseConnected = await connectDatabase();

    const server = app.listen(PORT, () => {});
    if (!isDatabaseConnected) {
      console.error(
        "Server started without a database connection. Check DATABASE_URL and Neon database availability.",
      );
    }

    // Simple graceful shutdown
    const gracefulShutdown = async () => {
      server.close(async () => {
        try {
          await prisma.$disconnect();
        } catch (error) {}

        process.exit(0);
      });
    };

    // Handle shutdown signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    process.exit(1);
  }
}

// When run locally or as a container, start the HTTP listener.
// Vercel imports the module and serves the exported Express app directly.
if (require.main === module) {
  startServer();
}

export { prisma };
export default app;

// Vercel's Node.js builder invokes the CommonJS module export as a handler.
module.exports = app;
