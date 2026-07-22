import express from 'express';
import {
  getMessages,
  getPatientMessages,
  createMessage,
  replyMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateMessage } from '../validators/messageValidator.js';

const router = express.Router();

// GET all messages (Admin only)
router.get('/', protect, adminOnly, getMessages);

// GET messages for the logged-in patient
router.get('/patient', protect, getPatientMessages);

// CREATE / send a message
router.post('/', validateMessage, createMessage);

// REPLY to a message (Admin only)
router.put('/:id/reply', protect, adminOnly, replyMessage);

// DELETE a message (Admin only)
router.delete('/:id', protect, adminOnly, deleteMessage);

export default router;
