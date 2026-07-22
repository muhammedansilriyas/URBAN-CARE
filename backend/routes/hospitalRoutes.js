import express from 'express';
import {
  getHospitalDetails,
  updateHospitalDetails,
} from '../controllers/hospitalController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET hospital details
router.get('/', getHospitalDetails);

// UPDATE hospital details (Admin only)
router.put('/', protect, adminOnly, updateHospitalDetails);

export default router;
