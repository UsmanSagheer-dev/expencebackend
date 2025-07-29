import { Router } from 'express';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getCurrentBudget,
  addExpenseToPerson,
  removeExpenseToPerson
} from '../controllers/budgetController';
import { authenticate } from '../middleware/auth';
import { validate, createBudgetSchema, budgetExpenseToPersonSchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all budgets
router.get('/', getBudgets);

// Get current active budget
router.get('/current', getCurrentBudget);

// Create new budget
router.post('/', validate(createBudgetSchema), createBudget);

// Update budget
router.put('/:id', updateBudget);

// Delete budget
router.delete('/:id', deleteBudget);

// Add expense to person from budget
router.post('/:id/expenses-to-person', validate(budgetExpenseToPersonSchema), addExpenseToPerson);

// Remove expense to person
router.delete('/expenses-to-person/:id', removeExpenseToPerson);

export default router;
