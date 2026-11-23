"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./utils/database"));
exports.prisma = database_1.default;
const PORT = process.env.PORT || 3001;
async function connectDatabase(retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await database_1.default.$connect();
            console.log("Database connected");
            return true;
        }
        catch (error) {
            console.error(`Database connection attempt ${attempt}/${retries} failed`);
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
        const server = app_1.default.listen(PORT, () => { });
        if (!isDatabaseConnected) {
            console.error("Server started without a database connection. Check DATABASE_URL and Neon database availability.");
        }
        // Simple graceful shutdown
        const gracefulShutdown = async () => {
            server.close(async () => {
                try {
                    await database_1.default.$disconnect();
                }
                catch (error) { }
                process.exit(0);
            });
        };
        // Handle shutdown signals
        process.on("SIGTERM", gracefulShutdown);
        process.on("SIGINT", gracefulShutdown);
    }
    catch (error) {
        process.exit(1);
    }
}
// When run locally or as a container, start the HTTP listener.
// Vercel imports the module and serves the exported Express app directly.
if (require.main === module) {
    startServer();
}
exports.default = app_1.default;
// Vercel invokes the module export as an HTTP handler.
module.exports = (req, res) => (0, app_1.default)(req, res);
//# sourceMappingURL=server.js.map