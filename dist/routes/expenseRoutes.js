"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseController_1 = require("../controllers/expenseController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
// import { uploadBillImage, handleUploadError } from '../middleware/upload';
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get expenses with filtering and pagination
router.get('/', (0, validation_1.validateQuery)(validation_1.expenseQuerySchema), expenseController_1.getExpenses);
// Get expense statistics
router.get('/stats', expenseController_1.getExpenseStats);
// Get expense summary
router.get('/summary', expenseController_1.getExpenseSummary);
// Get specific expense
router.get('/:id', expenseController_1.getExpenseById);
// Create new expense
router.post('/', (0, validation_1.validate)(validation_1.createExpenseSchema), expenseController_1.createExpense);
// Update expense
router.put('/:id', (0, validation_1.validate)(validation_1.updateExpenseSchema), expenseController_1.updateExpense);
// Delete expense
router.delete('/:id', expenseController_1.deleteExpense);
// Bulk delete expenses
router.delete('/bulk', expenseController_1.bulkDeleteExpenses);
// Upload bill image
// router.post('/:id/image', uploadBillImage, handleUploadError, uploadExpenseImage);
exports.default = router;
//# sourceMappingURL=expenseRoutes.js.map