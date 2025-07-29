"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseQuerySchema = exports.paginationQuerySchema = exports.validateQuery = exports.validate = exports.budgetExpenseToPersonSchema = exports.updateSettingsSchema = exports.returnCompanyMoneySchema = exports.createCompanyMoneySchema = exports.returnLendingSchema = exports.createLendingSchema = exports.createBudgetSchema = exports.updateExpenseSchema = exports.createExpenseSchema = exports.createCategorySchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Validation schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(1, 'Name is required')
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required'),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional()
});
exports.createExpenseSchema = zod_1.z.object({
    categoryId: zod_1.z.string().optional(),
    itemName: zod_1.z.string().min(1, 'Item name is required'),
    unitPrice: zod_1.z.number().positive('Unit price must be positive'),
    quantity: zod_1.z.number().positive('Quantity must be positive'),
    unit: zod_1.z.string().min(1, 'Unit is required'),
    expenseDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    description: zod_1.z.string().optional()
});
exports.updateExpenseSchema = zod_1.z.object({
    categoryId: zod_1.z.string().optional(),
    itemName: zod_1.z.string().min(1, 'Item name is required').optional(),
    unitPrice: zod_1.z.number().positive('Unit price must be positive').optional(),
    quantity: zod_1.z.number().positive('Quantity must be positive').optional(),
    unit: zod_1.z.string().min(1, 'Unit is required').optional(),
    expenseDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    description: zod_1.z.string().optional()
});
exports.createBudgetSchema = zod_1.z.object({
    totalBudget: zod_1.z.number().positive('Total budget must be positive'),
    budgetPeriod: zod_1.z.enum(['daily', 'weekly', 'monthly']),
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
});
exports.createLendingSchema = zod_1.z.object({
    personName: zod_1.z.string().min(1, 'Person name is required'),
    amountTaken: zod_1.z.number().positive('Amount taken must be positive'),
    lendingDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Lending date must be in YYYY-MM-DD format'),
    description: zod_1.z.string().optional()
});
exports.returnLendingSchema = zod_1.z.object({
    amountReturned: zod_1.z.number().positive('Amount returned must be positive')
});
exports.createCompanyMoneySchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1, 'Company name is required'),
    amountReceived: zod_1.z.number().positive('Amount received must be positive'),
    transactionDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Transaction date must be in YYYY-MM-DD format'),
    description: zod_1.z.string().optional()
});
exports.returnCompanyMoneySchema = zod_1.z.object({
    amountReturned: zod_1.z.number().positive('Amount returned must be positive')
});
exports.updateSettingsSchema = zod_1.z.object({
    dashboardView: zod_1.z.enum(['today', 'week', 'month']).optional(),
    currency: zod_1.z.string().min(1).optional(),
    theme: zod_1.z.enum(['light', 'dark']).optional()
});
exports.budgetExpenseToPersonSchema = zod_1.z.object({
    personName: zod_1.z.string().min(1, 'Person name is required'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    description: zod_1.z.string().optional()
});
// Generic validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map((err) => ({
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
exports.validate = validate;
// Query validation middleware
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map((err) => ({
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
exports.validateQuery = validateQuery;
// Pagination query schema
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100).optional()
});
// Expense query schema
exports.expenseQuerySchema = exports.paginationQuerySchema.extend({
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    categoryId: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['date', 'amount', 'itemName']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    search: zod_1.z.string().optional()
});
//# sourceMappingURL=validation.js.map