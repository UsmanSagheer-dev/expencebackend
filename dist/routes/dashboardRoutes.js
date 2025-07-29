"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const dashboardController_1 = require("../controllers/dashboardController");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalExpenses:
 *                       type: number
 *                     monthlyExpenses:
 *                       type: number
 *                     totalBudgets:
 *                       type: number
 *                     activeBudgets:
 *                       type: number
 *                     totalLending:
 *                       type: number
 *                     pendingReturns:
 *                       type: number
 *                     recentExpenses:
 *                       type: array
 *                     categoryBreakdown:
 *                       type: array
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', dashboardController_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map