import express from 'express';
import {
  registerPatient,
  loginUser,
  getUserProfile,
  updateUserProfile,
  exchangeMockToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
} from '../validators/authValidator.js';

const router = express.Router();

// Register a new patient
router.post('/register', validateRegister, registerPatient);

// Auth user & get token
router.post('/login', validateLogin, loginUser);

// Get user profile
router.get('/me', protect, getUserProfile);

// Update user profile
router.put('/profile', protect, validateProfileUpdate, updateUserProfile);

// Exchange mock token for real JWT token
router.post('/exchange-token', exchangeMockToken);

export default router;
