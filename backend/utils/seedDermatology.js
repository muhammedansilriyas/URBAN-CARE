import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';

dotenv.config();

const seedDermatology = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding Dermatology data...');

    // 1. Create or Find Dermatology Department
    let dept = await Department.findOne({ name: 'Dermatology' });
    if (!dept) {
      dept = await Department.create({
        name: 'Dermatology',
        description: 'Comprehensive clinical diagnostic care and treatments for skin, hair, and nail conditions.',
      });
      console.log('Created Dermatology Department');
    } else {
      console.log('Dermatology Department already exists');
    }

    // 2. Create or Find Dermatology Doctor (Dr. Anya Kovic)
    const email = 'anya.kovic@urbanpatientcare.com';
    let doc = await Doctor.findOne({ email });
    if (!doc) {
      doc = await Doctor.create({
        name: 'Dr. Anya Kovic',
        email,
        phone: '+1 (555) 019-7733',
        department: dept._id,
        specialization: 'Dermatology',
        experience: 9,
        availability: ['Tuesday', 'Thursday', 'Friday'],
        imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400',
      });
      console.log('Created Doctor Dr. Anya Kovic');
    } else {
      console.log('Doctor Dr. Anya Kovic already exists');
    }

    console.log('Dermatology seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding Dermatology: ${error.message}`);
    process.exit(1);
  }
};

seedDermatology();
