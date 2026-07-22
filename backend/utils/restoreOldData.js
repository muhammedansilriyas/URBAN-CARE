import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import Announcement from '../models/Announcement.js';
import Patient from '../models/Patient.js';
import Admin from '../models/Admin.js';
import { seedDatabase } from '../config/dbSeeder.js';

dotenv.config();

const restore = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected to restore old data...');

    // Clear all collections to ensure fresh defaults are seeded
    await Doctor.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    await Patient.deleteMany({});
    await Message.deleteMany({});
    await Announcement.deleteMany({});
    await Admin.deleteMany({});
    console.log('Cleared all collections.');

    // Seed database
    await seedDatabase();
    console.log('Old database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error restoring old data: ${error.message}`);
    process.exit(1);
  }
};

restore();
