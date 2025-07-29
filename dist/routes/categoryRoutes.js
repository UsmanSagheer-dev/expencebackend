"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get all categories
router.get('/', categoryController_1.getCategories);
// Create new category
router.post('/', (0, validation_1.validate)(validation_1.createCategorySchema), categoryController_1.createCategory);
// Update category
router.put('/:id', categoryController_1.updateCategory);
// Delete category
router.delete('/:id', categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map