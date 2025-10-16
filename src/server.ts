import app from "./app";
import prisma from "./utils/database";

const PORT = process.env.PORT || 3001;

// Simple function to connect to database
async function connectDatabase() {
  try {
    await prisma.$connect();
  } catch (error) {
    process.exit(1);
  }
}

// Function to start the server
async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {});

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

// Start the application
startServer();

export { prisma };
