import { Router } from 'express';
import {
  getLendingRecords,
  createLendingRecord,
  updateLendingRecord,
  deleteLendingRecord,
  markReturn,
  getLendingStats
} from '../controllers/lendingController';
import { authenticate } from '../middleware/auth';
import { validate, createLendingSchema, returnLendingSchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get lending statistics
router.get('/stats', getLendingStats);

// Get all lending records
router.get('/', getLendingRecords);

// Create new lending record
router.post('/', validate(createLendingSchema), createLendingRecord);

// Update lending record
router.put('/:id', updateLendingRecord);

// Delete lending record
router.delete('/:id', deleteLendingRecord);

// Mark return payment
router.put('/:id/return', validate(returnLendingSchema), markReturn);

export default router;
