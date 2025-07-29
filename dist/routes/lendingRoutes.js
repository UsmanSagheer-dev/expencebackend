"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lendingController_1 = require("../controllers/lendingController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get lending statistics
router.get('/stats', lendingController_1.getLendingStats);
// Get all lending records
router.get('/', lendingController_1.getLendingRecords);
// Create new lending record
router.post('/', (0, validation_1.validate)(validation_1.createLendingSchema), lendingController_1.createLendingRecord);
// Update lending record
router.put('/:id', lendingController_1.updateLendingRecord);
// Delete lending record
router.delete('/:id', lendingController_1.deleteLendingRecord);
// Mark return payment
router.put('/:id/return', (0, validation_1.validate)(validation_1.returnLendingSchema), lendingController_1.markReturn);
exports.default = router;
//# sourceMappingURL=lendingRoutes.js.map