"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController_1 = require("../controllers/settingsController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get user settings
router.get('/', settingsController_1.getSettings);
// Update user settings
router.put('/', (0, validation_1.validate)(validation_1.updateSettingsSchema), settingsController_1.updateSettings);
exports.default = router;
//# sourceMappingURL=settingsRoutes.js.map