"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Create a single instance of Prisma Client
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
});
// Handle connection errors
prisma.$on('error', (e) => {
    console.error('Prisma error:', e);
});
// Graceful shutdown
const gracefulShutdown = async () => {
    await prisma.$disconnect();
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
exports.default = prisma;
//# sourceMappingURL=database.js.map