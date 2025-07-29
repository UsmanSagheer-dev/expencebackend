import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';
import { validate, createCategorySchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all categories
router.get('/', getCategories);

// Create new category
router.post('/', validate(createCategorySchema), createCategory);

// Update category
router.put('/:id', updateCategory);

// Delete category
router.delete('/:id', deleteCategory);

export default router;
