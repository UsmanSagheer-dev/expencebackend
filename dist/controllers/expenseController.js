"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpenseSummary = exports.getExpenseStats = exports.uploadExpenseImage = exports.bulkDeleteExpenses = exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenseById = exports.getExpenses = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const upload_1 = require("../middleware/upload");
const prisma = new client_1.PrismaClient();
/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get expenses with filtering and pagination
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.getExpenses = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const { page = '1', limit = '20', startDate, endDate, categoryId, sortBy = 'date', sortOrder = 'desc', search } = req.query;
    const pagination = (0, helpers_1.calculatePagination)(parseInt(page), parseInt(limit));
    // Build where clause
    const where = { userId };
    if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate)
            where.expenseDate.gte = (0, helpers_1.parseDate)(startDate);
        if (endDate)
            where.expenseDate.lte = (0, helpers_1.parseDate)(endDate);
    }
    if (categoryId) {
        where.categoryId = categoryId;
    }
    if (search) {
        where.OR = [
            { itemName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }
    // Build order by clause
    const orderBy = {};
    switch (sortBy) {
        case 'date':
            orderBy.expenseDate = sortOrder;
            break;
        case 'amount':
            orderBy.totalPrice = sortOrder;
            break;
        case 'itemName':
            orderBy.itemName = sortOrder;
            break;
        default:
            orderBy.expenseDate = 'desc';
    }
    // Get expenses with pagination
    const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
            where,
            orderBy,
            skip: pagination.skip,
            take: pagination.take,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                }
            }
        }),
        prisma.expense.count({ where })
    ]);
    const paginationMeta = (0, helpers_1.getPaginationMeta)(pagination.page, pagination.limit, total);
    res.json({
        success: true,
        data: expenses,
        pagination: paginationMeta,
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.getExpenseById = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const expense = await prisma.expense.findFirst({
        where: {
            id,
            userId
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        }
    });
    if (!expense) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'EXPENSE_NOT_FOUND',
                message: 'Expense not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    res.json({
        success: true,
        data: expense,
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.createExpense = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user.id;
    const { categoryId, itemName, unitPrice, quantity, unit, expenseDate, description } = req.body;
    // Calculate total price
    const totalPrice = (0, helpers_1.roundToTwoDecimals)(unitPrice * quantity);
    // Validate category exists if provided
    if (categoryId) {
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId
            }
        });
        if (!category) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CATEGORY',
                    message: 'Category not found'
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    const expense = await prisma.expense.create({
        data: {
            userId,
            categoryId,
            itemName,
            unitPrice,
            quantity,
            unit,
            totalPrice,
            expenseDate: (0, helpers_1.parseDate)(expenseDate),
            description
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        }
    });
    res.status(201).json({
        success: true,
        data: expense,
        message: 'Expense created successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.updateExpense = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { categoryId, itemName, unitPrice, quantity, unit, expenseDate, description } = req.body;
    // Check if expense exists
    const existingExpense = await prisma.expense.findFirst({
        where: { id, userId }
    });
    if (!existingExpense) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'EXPENSE_NOT_FOUND',
                message: 'Expense not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Validate category if provided
    if (categoryId) {
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId
            }
        });
        if (!category) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CATEGORY',
                    message: 'Category not found'
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    // Calculate new total price if unit price or quantity changed
    let totalPrice = existingExpense.totalPrice;
    const newUnitPrice = unitPrice !== undefined ? unitPrice : Number(existingExpense.unitPrice);
    const newQuantity = quantity !== undefined ? quantity : Number(existingExpense.quantity);
    if (unitPrice !== undefined || quantity !== undefined) {
        totalPrice = (0, helpers_1.roundToTwoDecimals)(newUnitPrice * newQuantity);
    }
    const updatedExpense = await prisma.expense.update({
        where: { id },
        data: {
            ...(categoryId !== undefined && { categoryId }),
            ...(itemName && { itemName }),
            ...(unitPrice !== undefined && { unitPrice }),
            ...(quantity !== undefined && { quantity }),
            ...(unit && { unit }),
            ...(expenseDate && { expenseDate: (0, helpers_1.parseDate)(expenseDate) }),
            ...(description !== undefined && { description }),
            totalPrice
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        }
    });
    res.json({
        success: true,
        data: updatedExpense,
        message: 'Expense updated successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.deleteExpense = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const expense = await prisma.expense.findFirst({
        where: { id, userId }
    });
    if (!expense) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'EXPENSE_NOT_FOUND',
                message: 'Expense not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Delete associated bill image if exists
    if (expense.billImageUrl) {
        if (expense.billImageUrl.includes('cloudinary.com')) {
            const publicId = (0, upload_1.extractPublicId)(expense.billImageUrl);
            await (0, upload_1.deleteFromCloudinary)(publicId);
        }
    }
    await prisma.expense.delete({
        where: { id }
    });
    res.json({
        success: true,
        message: 'Expense deleted successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/expenses/bulk:
 *   delete:
 *     summary: Delete multiple expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.bulkDeleteExpenses = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { ids } = req.body;
    const userId = req.user?.id;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_IDS',
                message: 'Please provide an array of expense IDs'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Get expenses to delete (to handle image cleanup)
    const expensesToDelete = await prisma.expense.findMany({
        where: {
            id: { in: ids },
            userId
        },
        select: {
            id: true,
            billImageUrl: true
        }
    });
    if (expensesToDelete.length === 0) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'NO_EXPENSES_FOUND',
                message: 'No expenses found to delete'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Delete images from Cloudinary
    for (const expense of expensesToDelete) {
        if (expense.billImageUrl && expense.billImageUrl.includes('cloudinary.com')) {
            const publicId = (0, upload_1.extractPublicId)(expense.billImageUrl);
            await (0, upload_1.deleteFromCloudinary)(publicId);
        }
    }
    // Delete expenses
    const deletedCount = await prisma.expense.deleteMany({
        where: {
            id: { in: ids },
            userId
        }
    });
    res.json({
        success: true,
        data: { deletedCount: deletedCount.count },
        message: `${deletedCount.count} expenses deleted successfully`,
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/expenses/{id}/image:
 *   post:
 *     summary: Upload bill image for expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.uploadExpenseImage = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'NO_FILE_UPLOADED',
                message: 'No file uploaded'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Check if expense exists
    const expense = await prisma.expense.findFirst({
        where: { id, userId }
    });
    if (!expense) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'EXPENSE_NOT_FOUND',
                message: 'Expense not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Delete old image if exists
    if (expense.billImageUrl && expense.billImageUrl.includes('cloudinary.com')) {
        const publicId = (0, upload_1.extractPublicId)(expense.billImageUrl);
        await (0, upload_1.deleteFromCloudinary)(publicId);
    }
    // Upload new image
    const imageUrl = await (0, upload_1.uploadToCloudinary)(file.path);
    // Update expense with new image URL
    const updatedExpense = await prisma.expense.update({
        where: { id },
        data: { billImageUrl: imageUrl },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        }
    });
    res.json({
        success: true,
        data: updatedExpense,
        message: 'Bill image uploaded successfully',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/expenses/stats:
 *   get:
 *     summary: Get expense statistics
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.getExpenseStats = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;
    const where = { userId };
    if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate)
            where.expenseDate.gte = (0, helpers_1.parseDate)(startDate);
        if (endDate)
            where.expenseDate.lte = (0, helpers_1.parseDate)(endDate);
    }
    // Get total expenses and amount
    const totalStats = await prisma.expense.aggregate({
        where,
        _count: { id: true },
        _sum: { totalPrice: true },
        _avg: { totalPrice: true }
    });
    // Get expenses by category
    const expensesByCategory = await prisma.expense.groupBy({
        by: ['categoryId'],
        where,
        _count: { id: true },
        _sum: { totalPrice: true },
        orderBy: {
            _sum: {
                totalPrice: 'desc'
            }
        }
    });
    // Get category details
    const categoryIds = expensesByCategory
        .map((item) => item.categoryId)
        .filter(Boolean);
    const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true, color: true }
    });
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
    const categoryBreakdown = expensesByCategory.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryId ? categoryMap.get(item.categoryId)?.name || 'Unknown' : 'Uncategorized',
        categoryColor: item.categoryId ? categoryMap.get(item.categoryId)?.color : null,
        totalAmount: Number(item._sum.totalPrice || 0),
        count: item._count.id
    }));
    res.json({
        success: true,
        data: {
            totalExpenses: totalStats._count.id,
            totalAmount: Number(totalStats._sum.totalPrice || 0),
            averageExpense: Number(totalStats._avg.totalPrice || 0),
            expensesByCategory: categoryBreakdown
        },
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /api/expenses/summary:
 *   get:
 *     summary: Get expense summary (today, week, month)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
exports.getExpenseSummary = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const now = new Date();
    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    // This week
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    // This month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const [todayStats, weekStats, monthStats] = await Promise.all([
        prisma.expense.aggregate({
            where: {
                userId,
                expenseDate: { gte: todayStart, lte: todayEnd }
            },
            _count: { id: true },
            _sum: { totalPrice: true }
        }),
        prisma.expense.aggregate({
            where: {
                userId,
                expenseDate: { gte: weekStart, lte: weekEnd }
            },
            _count: { id: true },
            _sum: { totalPrice: true }
        }),
        prisma.expense.aggregate({
            where: {
                userId,
                expenseDate: { gte: monthStart, lte: monthEnd }
            },
            _count: { id: true },
            _sum: { totalPrice: true }
        })
    ]);
    res.json({
        success: true,
        data: {
            today: {
                count: todayStats._count.id,
                total: Number(todayStats._sum.totalPrice || 0)
            },
            week: {
                count: weekStats._count.id,
                total: Number(weekStats._sum.totalPrice || 0)
            },
            month: {
                count: monthStats._count.id,
                total: Number(monthStats._sum.totalPrice || 0)
            }
        },
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=expenseController.js.map