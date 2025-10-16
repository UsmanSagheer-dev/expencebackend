"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./utils/database"));
exports.prisma = database_1.default;
const PORT = process.env.PORT || 3001;
// Simple function to connect to database
async function connectDatabase() {
  try {
    await database_1.default.$connect();
  } catch (error) {
    process.exit(1);
  }
}
// Function to start the server
async function startServer() {
  try {
    await connectDatabase();
    const server = app_1.default.listen(PORT, () => {});
    // Simple graceful shutdown
    const gracefulShutdown = async () => {
      server.close(async () => {
        try {
          await database_1.default.$disconnect();
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
//# sourceMappingURL=server.js.map
