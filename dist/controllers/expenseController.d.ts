/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get expenses with filtering and pagination
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const getExpenses: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const getExpenseById: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const createExpense: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const updateExpense: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const deleteExpense: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/expenses/bulk:
 *   delete:
 *     summary: Delete multiple expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const bulkDeleteExpenses: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/expenses/{id}/image:
 *   post:
 *     summary: Upload bill image for expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const uploadExpenseImage: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/expenses/stats:
 *   get:
 *     summary: Get expense statistics
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const getExpenseStats: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/expenses/summary:
 *   get:
 *     summary: Get expense summary (today, week, month)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
export declare const getExpenseSummary: (req: any, res: any, next: any) => void;
//# sourceMappingURL=expenseController.d.ts.map