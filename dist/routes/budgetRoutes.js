"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budgetController_1 = require("../controllers/budgetController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get all budgets
router.get('/', budgetController_1.getBudgets);
// Get current active budget
router.get('/current', budgetController_1.getCurrentBudget);
// Create new budget
router.post('/', (0, validation_1.validate)(validation_1.createBudgetSchema), budgetController_1.createBudget);
// Update budget
router.put('/:id', budgetController_1.updateBudget);
// Delete budget
router.delete('/:id', budgetController_1.deleteBudget);
// Add expense to person from budget
router.post('/:id/expenses-to-person', (0, validation_1.validate)(validation_1.budgetExpenseToPersonSchema), budgetController_1.addExpenseToPerson);
// Remove expense to person
router.delete('/expenses-to-person/:id', budgetController_1.removeExpenseToPerson);
exports.default = router;
//# sourceMappingURL=budgetRoutes.js.map