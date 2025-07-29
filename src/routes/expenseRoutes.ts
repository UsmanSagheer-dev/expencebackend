import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses,
  uploadExpenseImage,
  getExpenseStats,
  getExpenseSummary
} from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import {
  validate,
  validateQuery,
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema
} from '../middleware/validation';
// import { uploadBillImage, handleUploadError } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get expenses with filtering and pagination
router.get('/', validateQuery(expenseQuerySchema), getExpenses);

// Get expense statistics
router.get('/stats', getExpenseStats);

// Get expense summary
router.get('/summary', getExpenseSummary);

// Get specific expense
router.get('/:id', getExpenseById);

// Create new expense
router.post('/', validate(createExpenseSchema), createExpense);

// Update expense
router.put('/:id', validate(updateExpenseSchema), updateExpense);

// Delete expense
router.delete('/:id', deleteExpense);

// Bulk delete expenses
router.delete('/bulk', bulkDeleteExpenses);

// Upload bill image
// router.post('/:id/image', uploadBillImage, handleUploadError, uploadExpenseImage);

export default router;
