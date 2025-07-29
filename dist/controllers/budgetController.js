"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeExpenseToPerson = exports.addExpenseToPerson = exports.getCurrentBudget = exports.deleteBudget = exports.updateBudget = exports.createBudget = exports.getBudgets = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
exports.getBudgets = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const { page = '1', limit = '20', isActive } = req.query;
    const pagination = (0, helpers_1.calculatePagination)(parseInt(page), parseInt(limit));
    const where = { userId };
    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }
    const [budgets, total] = await Promise.all([
        prisma.budget.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: pagination.skip,
            take: pagination.take,
            include: {
                budgetExpenseToPersons: true,
                _count: {
                    select: { budgetExpenseToPersons: true }
                }
            }
        }),
        prisma.budget.count({ where })
    ]);
    const paginationMeta = (0, helpers_1.getPaginationMeta)(pagination.page, pagination.limit, total);
    res.json({
        success: true,
        data: budgets,
        pagination: paginationMeta,
        timestamp: new Date().toISOString()
    });
});
exports.createBudget = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user.id;
    const { totalBudget, budgetPeriod, startDate, endDate } = req.body;
    const budget = await prisma.budget.create({
        data: {
            userId,
            totalBudget,
            budgetPeriod,
            startDate: (0, helpers_1.parseDate)(startDate),
            endDate: (0, helpers_1.parseDate)(endDate)
        }
    });
    res.status(201).json({
        success: true,
        data: budget,
        message: 'Budget created successfully',
        timestamp: new Date().toISOString()
    });
});
exports.updateBudget = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { totalBudget, budgetPeriod, startDate, endDate, isActive } = req.body;
    const budget = await prisma.budget.findFirst({
        where: { id, userId }
    });
    if (!budget) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'BUDGET_NOT_FOUND',
                message: 'Budget not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    const updatedBudget = await prisma.budget.update({
        where: { id },
        data: {
            ...(totalBudget !== undefined && { totalBudget }),
            ...(budgetPeriod && { budgetPeriod }),
            ...(startDate && { startDate: (0, helpers_1.parseDate)(startDate) }),
            ...(endDate && { endDate: (0, helpers_1.parseDate)(endDate) }),
            ...(isActive !== undefined && { isActive })
        }
    });
    res.json({
        success: true,
        data: updatedBudget,
        message: 'Budget updated successfully',
        timestamp: new Date().toISOString()
    });
});
exports.deleteBudget = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const budget = await prisma.budget.findFirst({
        where: { id, userId }
    });
    if (!budget) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'BUDGET_NOT_FOUND',
                message: 'Budget not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    await prisma.budget.delete({
        where: { id }
    });
    res.json({
        success: true,
        message: 'Budget deleted successfully',
        timestamp: new Date().toISOString()
    });
});
exports.getCurrentBudget = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const now = new Date();
    const currentBudget = await prisma.budget.findFirst({
        where: {
            userId,
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now }
        },
        include: {
            budgetExpenseToPersons: true
        }
    });
    res.json({
        success: true,
        data: currentBudget,
        timestamp: new Date().toISOString()
    });
});
exports.addExpenseToPerson = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { personName, amount, description } = req.body;
    const budget = await prisma.budget.findFirst({
        where: { id, userId }
    });
    if (!budget) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'BUDGET_NOT_FOUND',
                message: 'Budget not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    const expenseToPerson = await prisma.budgetExpenseToPerson.create({
        data: {
            budgetId: id,
            personName,
            amount,
            description
        }
    });
    res.status(201).json({
        success: true,
        data: expenseToPerson,
        message: 'Expense to person added successfully',
        timestamp: new Date().toISOString()
    });
});
exports.removeExpenseToPerson = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const expenseToPerson = await prisma.budgetExpenseToPerson.findFirst({
        where: {
            id,
            budget: { userId }
        }
    });
    if (!expenseToPerson) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'EXPENSE_TO_PERSON_NOT_FOUND',
                message: 'Expense to person not found'
            },
            timestamp: new Date().toISOString()
        });
    }
    await prisma.budgetExpenseToPerson.delete({
        where: { id }
    });
    res.json({
        success: true,
        message: 'Expense to person removed successfully',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=budgetController.js.map