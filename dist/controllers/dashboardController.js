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
                _sum: { amount: true },
                _count: true
            }),
            // Monthly expenses
            prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: startOfMonth }
                },
                _sum: { amount: true },
                _count: true
            }),
            // Yearly expenses
            prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: startOfYear }
                },
                _sum: { amount: true }
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
                _sum: { amount: true }
            }),
            // Pending returns
            prisma.lendingRecord.aggregate({
                where: {
                    userId,
                    isReturned: false
                },
                _sum: { amount: true },
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
                    date: { gte: startOfMonth }
                },
                _sum: { amount: true },
                _count: true
            }),
            // Monthly trend (last 6 months)
            Promise.all(Array.from({ length: 6 }, (_, i) => {
                const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
                return prisma.expense.aggregate({
                    where: {
                        userId,
                        date: {
                            gte: monthStart,
                            lte: monthEnd
                        }
                    },
                    _sum: { amount: true }
                }).then(result => ({
                    month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    amount: result._sum.amount || 0
                }));
            })),
            // Top categories
            prisma.expense.groupBy({
                by: ['categoryId'],
                where: { userId },
                _sum: { amount: true },
                orderBy: {
                    _sum: {
                        amount: 'desc'
                    }
                },
                take: 5
            })
        ]);
        // Get category names for breakdown
        const categoryIds = categoryBreakdown.map(item => item.categoryId);
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
            categoryName: categoryMap[item.categoryId] || 'Unknown',
            amount: item._sum.amount || 0,
            count: item._count
        }));
        // Get category names for top categories
        const topCategoryIds = topCategories.map(item => item.categoryId);
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
            categoryName: topCategoryMap[item.categoryId] || 'Unknown',
            amount: item._sum.amount || 0
        }));
        // Calculate budget utilization
        const currentBudgets = await prisma.budget.findMany({
            where: {
                userId,
                startDate: { lte: currentDate },
                endDate: { gte: currentDate }
            },
            include: {
                budgetExpensesToPerson: {
                    include: {
                        expense: true
                    }
                }
            }
        });
        const budgetUtilization = currentBudgets.map(budget => {
            const spent = budget.budgetExpensesToPerson.reduce((sum, item) => sum + item.expense.amount, 0);
            const percentage = budget.totalAmount > 0 ? (spent / budget.totalAmount) * 100 : 0;
            return {
                budgetName: budget.name,
                totalAmount: budget.totalAmount,
                spentAmount: spent,
                remainingAmount: budget.totalAmount - spent,
                utilizationPercentage: Math.round(percentage)
            };
        });
        const dashboardData = {
            summary: {
                totalExpenses: totalExpenses._sum.amount || 0,
                totalExpenseCount: totalExpenses._count,
                monthlyExpenses: monthlyExpenses._sum.amount || 0,
                monthlyExpenseCount: monthlyExpenses._count,
                yearlyExpenses: yearlyExpenses._sum.amount || 0,
                totalBudgets,
                activeBudgets,
                totalLending: totalLending._sum.amount || 0,
                pendingReturns: pendingReturns._sum.amount || 0,
                pendingReturnCount: pendingReturns._count
            },
            recentExpenses: recentExpenses.map(expense => ({
                id: expense.id,
                title: expense.title,
                amount: expense.amount,
                date: expense.date,
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
        console.error('Get dashboard stats error:', error);
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