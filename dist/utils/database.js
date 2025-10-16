"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectDatabase = exports.checkDatabaseHealth = void 0;
const client_1 = require("@prisma/client");
// Optimized Prisma Client with better connection pooling
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'], // Reduced logging
    errorFormat: 'pretty',
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
// Lightweight health check - no logging to reduce noise
const checkDatabaseHealth = async () => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        // Only log if it's been a while since last error
        console.error('❌ Database connection lost');
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
// Optimized reconnect function
const reconnectDatabase = async () => {
    try {
        console.log('🔄 Reconnecting to database...');
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('✅ Database reconnected successfully');
    }
    catch (error) {
        console.error('❌ Database reconnection failed:', error);
        throw error;
    }
};
exports.reconnectDatabase = reconnectDatabase;
// Handle connection errors with smart reconnection
let lastErrorTime = 0;
const ERROR_COOLDOWN = 30000; // 30 seconds cooldown between error logs
prisma.$on('error', async (e) => {
    const now = Date.now();
    // Only log errors every 30 seconds to reduce spam
    if (now - lastErrorTime > ERROR_COOLDOWN) {
        console.error('❌ Prisma error:', e.message);
        lastErrorTime = now;
    }
    // If it's a connection error, try to reconnect
    if (e.message?.includes('connection') || e.message?.includes('Connection') || e.message?.includes('Closed')) {
        try {
            await (0, exports.reconnectDatabase)();
        }
        catch (reconnectError) {
            // Silent fail to prevent spam
        }
    }
});
// Graceful shutdown
const gracefulShutdown = async () => {
    await prisma.$disconnect();
    console.log('🗄️ Database disconnected');
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
exports.default = prisma;
//# sourceMappingURL=database.js.map