import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all announcements
router.get('/', getAnnouncements);

// CREATE an announcement (Admin only)
router.post('/', protect, adminOnly, createAnnouncement);

// DELETE an announcement (Admin only)
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

export default router;
