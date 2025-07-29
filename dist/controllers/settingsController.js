"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
exports.getSettings = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    let settings = await prisma.userSettings.findUnique({
        where: { userId }
    });
    // Create default settings if they don't exist
    if (!settings) {
        settings = await prisma.userSettings.create({
            data: { userId }
        });
    }
    res.json({
        success: true,
        data: settings,
        timestamp: new Date().toISOString()
    });
});
exports.updateSettings = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const { dashboardView, currency, theme } = req.body;
    const settings = await prisma.userSettings.upsert({
        where: { userId },
        update: {
            ...(dashboardView && { dashboardView }),
            ...(currency && { currency }),
            ...(theme && { theme })
        },
        create: {
            userId,
            dashboardView: dashboardView || 'today',
            currency: currency || 'PKR',
            theme: theme || 'light'
        }
    });
    res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=settingsController.js.map