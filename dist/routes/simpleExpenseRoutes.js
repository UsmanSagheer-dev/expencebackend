"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// All routes require authentication
router.use(auth_1.authenticate);
// Get all expenses for the authenticated user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await prisma.expense.findMany({
            where: { userId },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                }
            },
            orderBy: { expenseDate: 'desc' }
        });
        res.json({
            success: true,
            data: {
                expenses,
                count: expenses.length
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch expenses'
            },
            timestamp: new Date().toISOString()
        });
    }
});
// Create new expense
router.post('/', (0, validation_1.validate)(validation_1.createExpenseSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemName, description, unitPrice, quantity, unit, categoryId, expenseDate } = req.body;
        // Set default values
        const finalUnitPrice = parseFloat(unitPrice || '0');
        const finalQuantity = parseFloat(quantity || '1');
        const finalUnit = unit || 'piece';
        const finalTotalPrice = finalUnitPrice * finalQuantity;
        // Verify category belongs to user
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
                    message: 'Category not found or does not belong to user'
                },
                timestamp: new Date().toISOString()
            });
        }
        const expense = await prisma.expense.create({
            data: {
                itemName,
                description: description || null,
                unitPrice: finalUnitPrice,
                quantity: finalQuantity,
                unit: finalUnit,
                totalPrice: finalTotalPrice,
                categoryId,
                userId,
                expenseDate: new Date(expenseDate || new Date())
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
            data: { expense },
            message: 'Expense created successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to create expense'
            },
            timestamp: new Date().toISOString()
        });
    }
});
// Get single expense
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;
        const expense = await prisma.expense.findFirst({
            where: {
                id: expenseId,
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
            data: { expense },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch expense'
            },
            timestamp: new Date().toISOString()
        });
    }
});
// Update expense
router.put('/:id', (0, validation_1.validate)(validation_1.updateExpenseSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;
        const { itemName, description, unitPrice, quantity, unit, categoryId, expenseDate } = req.body;
        // Check if expense exists and belongs to user
        const existingExpense = await prisma.expense.findFirst({
            where: {
                id: expenseId,
                userId
            }
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
        // If categoryId is provided, verify it belongs to user
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
                        message: 'Category not found or does not belong to user'
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
        const updateData = {};
        if (itemName !== undefined)
            updateData.itemName = itemName;
        if (description !== undefined)
            updateData.description = description;
        if (unitPrice !== undefined) {
            updateData.unitPrice = parseFloat(unitPrice);
            // If unitPrice is updated, recalculate totalPrice
            const currentQuantity = quantity !== undefined ? parseFloat(quantity) : existingExpense.quantity;
            updateData.totalPrice = updateData.unitPrice * Number(currentQuantity);
        }
        if (quantity !== undefined) {
            updateData.quantity = parseFloat(quantity);
            // If quantity is updated, recalculate totalPrice
            const currentUnitPrice = unitPrice !== undefined ? parseFloat(unitPrice) : existingExpense.unitPrice;
            updateData.totalPrice = Number(currentUnitPrice) * updateData.quantity;
        }
        if (unit !== undefined)
            updateData.unit = unit;
        if (categoryId !== undefined)
            updateData.categoryId = categoryId;
        if (expenseDate !== undefined)
            updateData.expenseDate = new Date(expenseDate);
        const expense = await prisma.expense.update({
            where: { id: expenseId },
            data: updateData,
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
            data: { expense },
            message: 'Expense updated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update expense'
            },
            timestamp: new Date().toISOString()
        });
    }
});
// Delete expense
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;
        // Check if expense exists and belongs to user
        const existingExpense = await prisma.expense.findFirst({
            where: {
                id: expenseId,
                userId
            }
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
        await prisma.expense.delete({
            where: { id: expenseId }
        });
        res.json({
            success: true,
            message: 'Expense deleted successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to delete expense'
            },
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=simpleExpenseRoutes.js.map