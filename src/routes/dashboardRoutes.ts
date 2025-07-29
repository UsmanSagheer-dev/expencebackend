import express from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardStats } from '../controllers/dashboardController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

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
router.get('/stats', getDashboardStats);

export default router;
