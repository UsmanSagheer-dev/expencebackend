import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional()
});

export const createExpenseSchema = z.object({
  categoryId: z.string().optional(),
  itemName: z.string().min(1, 'Item name is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z.string().optional()
});

export const updateExpenseSchema = z.object({
  categoryId: z.string().optional(),
  itemName: z.string().min(1, 'Item name is required').optional(),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  description: z.string().optional()
});

export const createBudgetSchema = z.object({
  totalBudget: z.number().positive('Total budget must be positive'),
  budgetPeriod: z.enum(['daily', 'weekly', 'monthly']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
});

export const createLendingSchema = z.object({
  personName: z.string().min(1, 'Person name is required'),
  amountTaken: z.number().positive('Amount taken must be positive'),
  lendingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Lending date must be in YYYY-MM-DD format'),
  description: z.string().optional()
});

export const returnLendingSchema = z.object({
  amountReturned: z.number().positive('Amount returned must be positive')
});

export const createCompanyMoneySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  amountReceived: z.number().positive('Amount received must be positive'),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Transaction date must be in YYYY-MM-DD format'),
  description: z.string().optional()
});

export const returnCompanyMoneySchema = z.object({
  amountReturned: z.number().positive('Amount returned must be positive')
});

export const updateSettingsSchema = z.object({
  dashboardView: z.enum(['today', 'week', 'month']).optional(),
  currency: z.string().min(1).optional(),
  theme: z.enum(['light', 'dark']).optional()
});

export const budgetExpenseToPersonSchema = z.object({
  personName: z.string().min(1, 'Person name is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional()
});

// Generic validation middleware
export const validate = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors
          },
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  };
};

// Query validation middleware
export const validateQuery = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          error: {
            code: 'QUERY_VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: errors
          },
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  };
};

// Pagination query schema
export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).optional()
});

// Expense query schema
export const expenseQuerySchema = paginationQuerySchema.extend({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'itemName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional()
});
