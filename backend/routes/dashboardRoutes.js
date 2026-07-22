import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET dashboard statistics (Admin only)
router.get('/', protect, adminOnly, getDashboardStats);

export default router;
