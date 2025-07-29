"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Access token is required'
                },
                timestamp: new Date().toISOString()
            });
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Fetch the user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found'
                    },
                    timestamp: new Date().toISOString()
                });
            }
            req.user = user;
            next();
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token'
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'Authentication failed'
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            return next();
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (user) {
                req.user = user;
            }
        }
        catch (jwtError) {
            // Silently continue without user
        }
        next();
    }
    catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map