"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        // Get all stats in parallel
        const [totalExpenses, monthlyExpenses, yearlyExpenses, totalBudgets, activeBudgets, totalLending, pendingReturns, recentExpenses, categoryBreakdown, monthlyTrend, topCategories] = await Promise.all([
            // Total expenses
            prisma.expense.aggregate({
                where: { userId },
                _sum: { totalPrice: true },
                _count: true
            }),
            // Monthly expenses
            prisma.expense.aggregate({
                where: {
                    userId,
                    expenseDate: { gte: startOfMonth }
                },
                _sum: { totalPrice: true },
                _count: true
            }),
            // Yearly expenses
            prisma.expense.aggregate({
                where: {
                    userId,
                    expenseDate: { gte: startOfYear }
                },
                _sum: { totalPrice: true }
            }),
            // Total budgets
            prisma.budget.count({
                where: { userId }
            }),
            // Active budgets
            prisma.budget.count({
                where: {
                    userId,
                    startDate: { lte: currentDate },
                    endDate: { gte: currentDate }
                }
            }),
            // Total lending
            prisma.lendingRecord.aggregate({
                where: { userId },
                _sum: { amountTaken: true }
            }),
            // Pending returns
            prisma.lendingRecord.aggregate({
                where: {
                    userId,
                    isSettled: false
                },
                _sum: { amountTaken: true },
                _count: true
            }),
            // Recent expenses
            prisma.expense.findMany({
                where: { userId },
                include: {
                    category: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            // Category breakdown for current month
            prisma.expense.groupBy({
                by: ['categoryId'],
                where: {
                    userId,
                    expenseDate: { gte: startOfMonth }
                },
                _sum: { totalPrice: true },
                _count: true
            }),
            // Monthly trend (last 6 months)
            Promise.all(Array.from({ length: 6 }, (_, i) => {
                const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
                return prisma.expense.aggregate({
                    where: {
                        userId,
                        expenseDate: {
                            gte: monthStart,
                            lte: monthEnd
                        }
                    },
                    _sum: { totalPrice: true }
                }).then(result => ({
                    month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    amount: result._sum.totalPrice || 0
                }));
            })),
            // Top categories
            prisma.expense.groupBy({
                by: ['categoryId'],
                where: { userId },
                _sum: { totalPrice: true },
                orderBy: {
                    _sum: {
                        totalPrice: 'desc'
                    }
                },
                take: 5
            })
        ]);
        // Get category names for breakdown
        const categoryIds = categoryBreakdown.map(item => item.categoryId).filter((id) => id !== null);
        const categories = await prisma.category.findMany({
            where: {
                id: { in: categoryIds }
            },
            select: { id: true, name: true }
        });
        const categoryMap = categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {});
        // Format category breakdown
        const formattedCategoryBreakdown = categoryBreakdown.map(item => ({
            categoryName: item.categoryId ? categoryMap[item.categoryId] || 'Unknown' : 'Unknown',
            amount: item._sum.totalPrice || 0,
            count: item._count
        }));
        // Get category names for top categories
        const topCategoryIds = topCategories.map(item => item.categoryId).filter((id) => id !== null);
        const topCategoriesData = await prisma.category.findMany({
            where: {
                id: { in: topCategoryIds }
            },
            select: { id: true, name: true }
        });
        const topCategoryMap = topCategoriesData.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {});
        const formattedTopCategories = topCategories.map(item => ({
            categoryName: item.categoryId ? topCategoryMap[item.categoryId] || 'Unknown' : 'Unknown',
            amount: item._sum.totalPrice || 0
        }));
        // Budget utilization calculation
        const activeBudgetsList = await prisma.budget.findMany({
            where: {
                userId,
                isActive: true,
                startDate: { lte: currentDate },
                endDate: { gte: currentDate }
            },
            include: {
                budgetExpenseToPersons: true
            }
        });
        const budgetUtilization = await Promise.all(activeBudgetsList.map(async (budget) => {
            // Get expenses within budget period
            const budgetExpenses = await prisma.expense.aggregate({
                where: {
                    userId,
                    expenseDate: {
                        gte: budget.startDate,
                        lte: budget.endDate
                    }
                },
                _sum: { totalPrice: true }
            });
            // Calculate expenses to persons
            const expensesToPersons = budget.budgetExpenseToPersons.reduce((sum, expense) => sum + Number(expense.amount), 0);
            const totalExpenseUsed = Number(budgetExpenses._sum.totalPrice || 0) + expensesToPersons;
            const remainingBudget = Number(budget.totalBudget) - totalExpenseUsed;
            const utilizationPercentage = (totalExpenseUsed / Number(budget.totalBudget)) * 100;
            return {
                budgetId: budget.id,
                period: budget.budgetPeriod,
                totalBudget: budget.totalBudget,
                expenseUsed: budgetExpenses._sum.totalPrice || 0,
                expensesToPersons,
                totalUsed: totalExpenseUsed,
                remaining: remainingBudget,
                utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
                isOverBudget: totalExpenseUsed > Number(budget.totalBudget),
                startDate: budget.startDate,
                endDate: budget.endDate
            };
        }));
        const dashboardData = {
            summary: {
                totalExpenses: totalExpenses._sum.totalPrice || 0,
                totalExpenseCount: totalExpenses._count,
                monthlyExpenses: monthlyExpenses._sum.totalPrice || 0,
                monthlyExpenseCount: monthlyExpenses._count,
                yearlyExpenses: yearlyExpenses._sum.totalPrice || 0,
                totalBudgets,
                activeBudgets,
                totalLending: totalLending._sum.amountTaken || 0,
                pendingReturns: pendingReturns._sum?.amountTaken ?? 0,
                pendingReturnCount: pendingReturns._count
            },
            recentExpenses: recentExpenses.map(expense => ({
                id: expense.id,
                title: expense.itemName,
                amount: expense.totalPrice,
                date: expense.expenseDate,
                category: expense.category?.name || 'Uncategorized',
                createdAt: expense.createdAt
            })),
            categoryBreakdown: formattedCategoryBreakdown,
            monthlyTrend: monthlyTrend.reverse(), // Show oldest to newest
            topCategories: formattedTopCategories,
            budgetUtilization
        };
        res.json({
            success: true,
            data: dashboardData,
            message: 'Dashboard statistics retrieved successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch dashboard statistics'
            }
        });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=dashboardController.js.map