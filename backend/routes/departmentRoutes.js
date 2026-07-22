import express from 'express';
import {
  getDepartments,
  createDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all departments
router.get('/', getDepartments);

// CREATE a department (Admin only)
router.post('/', protect, adminOnly, createDepartment);

// DELETE a department (Admin only)
router.delete('/:id', protect, adminOnly, deleteDepartment);

export default router;
