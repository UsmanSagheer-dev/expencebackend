"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const companyMoneyController_1 = require("../controllers/companyMoneyController");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyMoneyRecord:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: Record ID
 *         amount:
 *           type: number
 *           description: Amount
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           description: Transaction type
 *         description:
 *           type: string
 *           description: Transaction description
 *         date:
 *           type: string
 *           format: date-time
 *           description: Transaction date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/company-money:
 *   get:
 *     summary: Get company money records
 *     tags: [Company Money]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/', companyMoneyController_1.getCompanyMoneyRecords);
/**
 * @swagger
 * /api/company-money:
 *   post:
 *     summary: Create company money record
 *     tags: [Company Money]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', companyMoneyController_1.createCompanyMoneyRecord);
/**
 * @swagger
 * /api/company-money/{id}:
 *   put:
 *     summary: Update company money record
 *     tags: [Company Money]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
router.put('/:id', companyMoneyController_1.updateCompanyMoneyRecord);
/**
 * @swagger
 * /api/company-money/{id}:
 *   delete:
 *     summary: Delete company money record
 *     tags: [Company Money]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
router.delete('/:id', companyMoneyController_1.deleteCompanyMoneyRecord);
/**
 * @swagger
 * /api/company-money/stats:
 *   get:
 *     summary: Get company money statistics
 *     tags: [Company Money]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', companyMoneyController_1.getCompanyMoneyStats);
exports.default = router;
//# sourceMappingURL=companyMoneyRoutes.js.map