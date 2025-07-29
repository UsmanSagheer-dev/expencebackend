import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { asyncHandler, parseDate, calculatePagination, getPaginationMeta } from '../utils/helpers';

const prisma = new PrismaClient();

export const getBudgets = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { page = '1', limit = '20', isActive } = req.query as any;

  const pagination = calculatePagination(parseInt(page), parseInt(limit));
  const where: any = { userId };

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

  const paginationMeta = getPaginationMeta(pagination.page, pagination.limit, total);

  res.json({
    success: true,
    data: budgets,
    pagination: paginationMeta,
    timestamp: new Date().toISOString()
  });
});

export const createBudget = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { totalBudget, budgetPeriod, startDate, endDate } = req.body;

  const budget = await prisma.budget.create({
    data: {
      userId,
      totalBudget,
      budgetPeriod,
      startDate: parseDate(startDate),
      endDate: parseDate(endDate)
    }
  });

  res.status(201).json({
    success: true,
    data: budget,
    message: 'Budget created successfully',
    timestamp: new Date().toISOString()
  });
});

export const updateBudget = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
      ...(startDate && { startDate: parseDate(startDate) }),
      ...(endDate && { endDate: parseDate(endDate) }),
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

export const deleteBudget = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export const getCurrentBudget = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export const addExpenseToPerson = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export const removeExpenseToPerson = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
