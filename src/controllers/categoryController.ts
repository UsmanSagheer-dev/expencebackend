import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all user categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
export const getCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { expenses: true }
      }
    }
  });

  res.json({
    success: true,
    data: categories,
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
export const createCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { name, color } = req.body;

  // Check if category with same name already exists
  const existingCategory = await prisma.category.findFirst({
    where: {
      userId,
      name: { equals: name, mode: 'insensitive' }
    }
  });

  if (existingCategory) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CATEGORY_EXISTS',
        message: 'A category with this name already exists'
      },
      timestamp: new Date().toISOString()
    });
  }

  const category = await prisma.category.create({
    data: {
      userId,
      name,
      color
    }
  });

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
export const updateCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { name, color } = req.body;

  // Check if category exists
  const existingCategory = await prisma.category.findFirst({
    where: { id, userId }
  });

  if (!existingCategory) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Check if another category with same name exists
  if (name && name !== existingCategory.name) {
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: { equals: name, mode: 'insensitive' },
        NOT: { id }
      }
    });

    if (duplicateCategory) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CATEGORY_EXISTS',
          message: 'A category with this name already exists'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(color !== undefined && { color })
    }
  });

  res.json({
    success: true,
    data: updatedCategory,
    message: 'Category updated successfully',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
export const deleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const category = await prisma.category.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: { expenses: true }
      }
    }
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Check if category has expenses
  if (category._count.expenses > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'CATEGORY_HAS_EXPENSES',
        message: `Cannot delete category. It has ${category._count.expenses} associated expenses.`,
        details: {
          expenseCount: category._count.expenses
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  await prisma.category.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Category deleted successfully',
    timestamp: new Date().toISOString()
  });
});
