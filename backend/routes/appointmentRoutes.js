import express from 'express';
import {
  getAppointments,
  bookAppointment,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateAppointment } from '../validators/appointmentValidator.js';

const router = express.Router();

// GET all appointments (filtered by role: admin gets all, patient gets their own)
router.get('/', protect, getAppointments);

// CREATE / book a new appointment
router.post('/', protect, validateAppointment, bookAppointment);

// UPDATE appointment status (Admin only)
router.put('/:id/status', protect, adminOnly, updateAppointmentStatus);

export default router;
