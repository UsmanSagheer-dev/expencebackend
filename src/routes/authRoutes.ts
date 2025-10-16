import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/me', getProfile);
router.get('/profile', getProfile); // Alternative endpoint for profile
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/logout', logout);

export default router;
