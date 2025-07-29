"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const reportController_1 = require("../controllers/reportController");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * @swagger
 * /api/reports/expenses:
 *   get:
 *     summary: Get expense report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: Expense report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/expenses', reportController_1.getExpenseReport);
/**
 * @swagger
 * /api/reports/budgets:
 *   get:
 *     summary: Get budget report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/budgets', reportController_1.getBudgetReport);
/**
 * @swagger
 * /api/reports/categories:
 *   get:
 *     summary: Get category report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *     responses:
 *       200:
 *         description: Category report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/categories', reportController_1.getCategoryReport);
/**
 * @swagger
 * /api/reports/monthly:
 *   get:
 *     summary: Get monthly report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for the monthly report
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Month for the report (1-12)
 *     responses:
 *       200:
 *         description: Monthly report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/monthly', reportController_1.getMonthlyReport);
/**
 * @swagger
 * /api/reports/yearly:
 *   get:
 *     summary: Get yearly report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for the report
 *     responses:
 *       200:
 *         description: Yearly report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/yearly', reportController_1.getYearlyReport);
/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Export report data
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [expenses, budgets, categories]
 *         description: Type of report to export
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *           default: csv
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *     responses:
 *       200:
 *         description: Report exported successfully
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/export', reportController_1.exportReport);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map