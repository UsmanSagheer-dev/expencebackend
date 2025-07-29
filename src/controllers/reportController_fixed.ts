import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Get expense report
export const getExpenseReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, categoryId } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate as string);
      if (endDate) where.expenseDate.lte = new Date(endDate as string);
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    const [expenses, totalAmount, expensesByCategory] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy: { expenseDate: 'desc' }
      }),
      prisma.expense.aggregate({
        where,
        _sum: { totalPrice: true },
        _count: true
      }),
      prisma.expense.groupBy({
        by: ['categoryId'],
        where,
        _sum: { totalPrice: true },
        _count: true
      })
    ]);

    // Get category names for grouped data
    const categoryIds = expensesByCategory.map(item => item.categoryId).filter(Boolean);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    const expensesByCategoryWithNames = expensesByCategory.map(item => ({
      categoryId: item.categoryId,
      categoryName: item.categoryId ? categoryMap[item.categoryId] || 'Unknown' : 'Uncategorized',
      totalAmount: Number(item._sum.totalPrice || 0),
      count: item._count
    }));

    res.json({
      success: true,
      data: {
        expenses,
        summary: {
          totalAmount: Number(totalAmount._sum.totalPrice || 0),
          totalCount: totalAmount._count,
          expensesByCategory: expensesByCategoryWithNames
        }
      }
    });
  } catch (error) {
    console.error('Get expense report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch expense report'
      }
    });
  }
};

// Get budget report
export const getBudgetReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { budgetId } = req.query;

    const where: any = { userId };
    if (budgetId) {
      where.id = budgetId as string;
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        budgetExpenseToPersons: {
          include: {
            expense: {
              include: {
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    const budgetReports = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = budget.budgetExpenseToPersons.map(bep => bep.expense);
        
        const totalSpent = expenses.reduce((sum, expense) => 
          sum + Number(expense.totalPrice), 0
        );

        const remainingBudget = Number(budget.totalBudget) - totalSpent;
        const spentPercentage = (totalSpent / Number(budget.totalBudget)) * 100;

        // Get spending by category
        const expensesByCategory = expenses.reduce((acc, expense) => {
          const categoryName = expense.category?.name || 'Uncategorized';
          if (!acc[categoryName]) {
            acc[categoryName] = { total: 0, count: 0 };
          }
          acc[categoryName].total += Number(expense.totalPrice);
          acc[categoryName].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);

        return {
          budget,
          summary: {
            totalBudget: Number(budget.totalBudget),
            totalSpent,
            remainingBudget,
            spentPercentage,
            expenseCount: expenses.length,
            expensesByCategory
          }
        };
      })
    );

    res.json({
      success: true,
      data: budgetReports
    });
  } catch (error) {
    console.error('Get budget report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch budget report'
      }
    });
  }
};

// Get category report
export const getCategoryReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate as string);
      if (endDate) where.expenseDate.lte = new Date(endDate as string);
    }

    // Get categories with their expenses
    const categories = await prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true, color: true }
    });

    const categoryReports = await Promise.all(
      categories.map(async (category) => {
        const categoryExpenses = await prisma.expense.aggregate({
          where: { ...where, categoryId: category.id },
          _sum: { totalPrice: true },
          _count: true
        });

        const recentExpenses = await prisma.expense.findMany({
          where: { ...where, categoryId: category.id },
          orderBy: { expenseDate: 'desc' },
          take: 5,
          select: {
            id: true,
            productName: true,
            totalPrice: true,
            expenseDate: true
          }
        });

        return {
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          totalAmount: Number(categoryExpenses._sum.totalPrice || 0),
          expenseCount: categoryExpenses._count,
          recentExpenses
        };
      })
    );

    // Sort by total amount descending
    categoryReports.sort((a, b) => b.totalAmount - a.totalAmount);

    res.json({
      success: true,
      data: categoryReports
    });
  } catch (error) {
    console.error('Get category report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch category report'
      }
    });
  }
};

// Get monthly report
export const getMonthlyReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month as string) - 1 : new Date().getMonth();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    const where = {
      userId,
      expenseDate: {
        gte: startDate,
        lte: endDate
      }
    };

    const [expenses, totalAmount, dailyExpenses, budgetComparison] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy: { expenseDate: 'desc' }
      }),
      prisma.expense.aggregate({
        where,
        _sum: { totalPrice: true },
        _count: true
      }),
      prisma.expense.groupBy({
        by: ['expenseDate'],
        where,
        _sum: { totalPrice: true },
        _count: true
      }),
      // Get active budgets for this period
      prisma.budget.findMany({
        where: {
          userId,
          isActive: true,
          startDate: { lte: endDate },
          endDate: { gte: startDate }
        },
        include: {
          budgetExpenseToPersons: {
            where: {
              expense: {
                expenseDate: {
                  gte: startDate,
                  lte: endDate
                }
              }
            },
            include: {
              expense: true
            }
          }
        }
      })
    ]);

    // Calculate daily breakdown
    const dailyBreakdown = dailyExpenses.map(day => ({
      date: day.expenseDate,
      totalAmount: Number(day._sum.totalPrice || 0),
      expenseCount: day._count
    }));

    // Calculate budget comparison
    let budgetSummary = null;
    if (budgetComparison.length > 0) {
      const budget = budgetComparison[0];
      const budgetExpenses = budget.budgetExpenseToPersons.map(bep => bep.expense);
      const budgetSpent = budgetExpenses.reduce((sum, expense) => 
        sum + Number(expense.totalPrice), 0
      );

      budgetSummary = {
        budgetAmount: Number(budget.totalBudget),
        spentAmount: budgetSpent,
        remainingAmount: Number(budget.totalBudget) - budgetSpent,
        spentPercentage: (budgetSpent / Number(budget.totalBudget)) * 100
      };
    }

    res.json({
      success: true,
      data: {
        period: {
          year: currentYear,
          month: currentMonth + 1,
          startDate,
          endDate
        },
        summary: {
          totalAmount: Number(totalAmount._sum.totalPrice || 0),
          expenseCount: totalAmount._count,
          averagePerDay: Math.round((Number(totalAmount._sum.totalPrice || 0)) / endDate.getDate()),
          dailyBreakdown,
          budgetComparison: budgetSummary
        },
        expenses
      }
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch monthly report'
      }
    });
  }
};

// Get yearly report
export const getYearlyReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { year } = req.query;

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const where = {
      userId,
      expenseDate: {
        gte: startDate,
        lte: endDate
      }
    };

    const [totalAmount, monthlyBreakdown, categoryBreakdown, budgetComparison] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { totalPrice: true },
        _count: true
      }),
      // Get monthly breakdown using raw query for better grouping
      prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM expense_date) as month,
          SUM(total_price) as total,
          COUNT(*) as count
        FROM expenses 
        WHERE user_id = ${userId} 
          AND expense_date >= ${startDate}
          AND expense_date <= ${endDate}
        GROUP BY EXTRACT(MONTH FROM expense_date)
        ORDER BY month
      `,
      prisma.expense.groupBy({
        by: ['categoryId'],
        where,
        _sum: { totalPrice: true },
        _count: true
      }),
      prisma.budget.findMany({
        where: {
          userId,
          isActive: true,
          startDate: { lte: endDate },
          endDate: { gte: startDate }
        },
        include: {
          budgetExpenseToPersons: {
            where: {
              expense: {
                expenseDate: {
                  gte: startDate,
                  lte: endDate
                }
              }
            },
            include: {
              expense: true
            }
          }
        }
      })
    ]);

    // Get category names
    const categoryIds = categoryBreakdown.map(item => item.categoryId).filter(Boolean);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    const categoryReports = categoryBreakdown.map(item => ({
      categoryId: item.categoryId,
      categoryName: item.categoryId ? categoryMap[item.categoryId] || 'Unknown' : 'Uncategorized',
      totalAmount: Number(item._sum.totalPrice || 0),
      count: item._count
    }));

    res.json({
      success: true,
      data: {
        year: currentYear,
        summary: {
          totalAmount: Number(totalAmount._sum.totalPrice || 0),
          expenseCount: totalAmount._count,
          averagePerMonth: Math.round((Number(totalAmount._sum.totalPrice || 0)) / 12),
          monthlyBreakdown,
          categoryBreakdown: categoryReports
        }
      }
    });
  } catch (error) {
    console.error('Get yearly report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch yearly report'
      }
    });
  }
};

// Export report (placeholder for CSV/PDF export)
export const exportReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { format, type, startDate, endDate } = req.query;

    // For now, just return the data in JSON format
    // In a real implementation, you would generate CSV/PDF here
    
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate as string);
      if (endDate) where.expenseDate.lte = new Date(endDate as string);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { expenseDate: 'desc' }
    });

    if (format === 'csv') {
      // Generate CSV format
      const csvHeader = 'Date,Product Name,Category,Unit Price,Quantity,Unit,Total Price,Description\n';
      const csvData = expenses.map(expense => 
        `${expense.expenseDate.toISOString().split('T')[0]},${expense.productName},"${expense.category?.name || 'Uncategorized'}",${expense.unitPrice},${expense.quantity},${expense.unit},${expense.totalPrice},"${expense.description || ''}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expense-report.csv');
      res.send(csvHeader + csvData);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: expenses,
        meta: {
          format: format || 'json',
          type: type || 'expense',
          exportDate: new Date(),
          totalRecords: expenses.length
        }
      });
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export report'
      }
    });
  }
};
