"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validation_1.validate)(validation_1.registerSchema), authController_1.register);
router.post('/login', (0, validation_1.validate)(validation_1.loginSchema), authController_1.login);
// Protected routes
router.use(auth_1.authenticate); // All routes below require authentication
router.get('/me', authController_1.getProfile);
router.get('/profile', authController_1.getProfile); // Alternative endpoint for profile
router.put('/profile', authController_1.updateProfile);
router.post('/change-password', authController_1.changePassword);
router.post('/logout', authController_1.logout);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map