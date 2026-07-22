import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctorPhoto,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { validateDoctor } from '../validators/doctorValidator.js';

const router = express.Router();

// GET all doctors
router.get('/', getDoctors);

// GET single doctor
router.get('/:id', getDoctorById);

// CREATE a doctor (Admin only)
router.post('/', protect, adminOnly, upload.single('photo'), validateDoctor, createDoctor);

// UPDATE doctor photo (Admin only)
router.put('/:id/photo', protect, adminOnly, upload.single('photo'), updateDoctorPhoto);

// DELETE a doctor (Admin only)
router.delete('/:id', protect, adminOnly, deleteDoctor);

export default router;
