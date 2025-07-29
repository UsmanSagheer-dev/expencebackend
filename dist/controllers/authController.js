"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 */
exports.register = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { email, password, name } = req.body;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            error: {
                code: 'USER_ALREADY_EXISTS',
                message: 'A user with this email already exists'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Hash password
    const hashedPassword = await (0, helpers_1.hashPassword)(password);
    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
        }
    });
    // Create default user settings
    await prisma.userSettings.create({
        data: {
            userId: user.id
        }
    });
    // Generate token
    const token = (0, helpers_1.generateToken)({
        userId: user.id,
        email: user.email
    });
    res.status(201).json({
        success: true,
        data: {
            user,
            token
        },
        message: 'User registered successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 */
exports.login = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
            createdAt: true
        }
    });
    if (!user) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Check password
    const isPasswordValid = await (0, helpers_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Generate token
    const token = (0, helpers_1.generateToken)({
        userId: user.id,
        email: user.email
    });
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        data: {
            user: userWithoutPassword,
            token
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
exports.getProfile = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            settings: {
                select: {
                    dashboardView: true,
                    currency: true,
                    theme: true
                }
            }
        }
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: 'User not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    res.json({
        success: true,
        data: { user },
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 */
exports.updateProfile = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const { name, email } = req.body;
    // Check if email is already taken by another user
    if (email) {
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id: userId }
            }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: 'This email is already taken'
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(name && { name }),
            ...(email && { email })
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
        }
    });
    res.json({
        success: true,
        data: { user: updatedUser },
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 */
exports.changePassword = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'MISSING_FIELDS',
                message: 'Current password and new password are required'
            },
            timestamp: new Date().toISOString()
        });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_PASSWORD',
                message: 'New password must be at least 6 characters long'
            },
            timestamp: new Date().toISOString()
        });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: 'User not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Verify current password
    const isCurrentPasswordValid = await (0, helpers_1.comparePassword)(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_CURRENT_PASSWORD',
                message: 'Current password is incorrect'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Hash new password
    const hashedNewPassword = await (0, helpers_1.hashPassword)(newPassword);
    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
    });
    res.json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
exports.logout = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    // Since we're using stateless JWT, logout is handled on the client side
    // We just return a success response
    res.json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=authController.js.map