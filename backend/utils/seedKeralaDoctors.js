import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';

dotenv.config();

const seedKeralaDoctors = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding Kerala doctors...');

    // Clear existing doctors and departments to avoid duplicates
    await Doctor.deleteMany({});
    await Department.deleteMany({});
    console.log('Cleared existing doctors and departments.');

    // 1. Create Departments
    const deptsData = [
      { name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnostics, and heart surgeries.' },
      { name: 'Neurology', description: 'Advanced treatment for brain, nerve, and spine-related complex conditions.' },
      { name: 'Pediatrics', description: 'Dedicated healthcare services, vaccination, and treatment for babies and children.' },
      { name: 'Orthopedics', description: 'Skeletal health, joint repairs, and sports medicine therapies.' },
      { name: 'Dermatology', description: 'Expert care for skin, hair, and nail health conditions.' },
      { name: 'Oncology', description: 'Diagnosis and treatment of various types of cancer.' }
    ];

    const depts = {};
    for (const d of deptsData) {
      const created = await Department.create(d);
      depts[d.name.toLowerCase()] = created._id;
    }
    console.log('Created departments.');

    // 2. Create Doctors
    const docsData = [
      {
        name: 'Dr. Madhavan Nair',
        email: 'madhavan.nair@keralahospital.com',
        phone: '+91 94470 12345',
        department: depts['cardiology'],
        specialization: 'Cardiology',
        experience: 15,
        availability: ['Monday', 'Wednesday', 'Friday'],
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Dr. Lakshmi Priya',
        email: 'lakshmi.priya@keralahospital.com',
        phone: '+91 94470 23456',
        department: depts['neurology'],
        specialization: 'Neurology',
        experience: 12,
        availability: ['Tuesday', 'Thursday'],
        imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Dr. Thomas Kurian',
        email: 'thomas.kurian@keralahospital.com',
        phone: '+91 94470 34567',
        department: depts['oncology'],
        specialization: 'Oncology',
        experience: 18,
        availability: ['Monday', 'Tuesday', 'Wednesday'],
        imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Dr. Anjali Menon',
        email: 'anjali.menon@keralahospital.com',
        phone: '+91 94470 45678',
        department: depts['orthopedics'],
        specialization: 'Orthopedics',
        experience: 10,
        availability: ['Wednesday', 'Thursday', 'Friday'],
        imageUrl: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Dr. Gautham Krishna',
        email: 'gautham.krishna@keralahospital.com',
        phone: '+91 94470 56789',
        department: depts['pediatrics'],
        specialization: 'Pediatrics',
        experience: 8,
        availability: ['Monday', 'Tuesday', 'Thursday'],
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Dr. Rupa Pillai',
        email: 'rupa.pillai@keralahospital.com',
        phone: '+91 94470 67890',
        department: depts['dermatology'],
        specialization: 'Dermatology',
        experience: 9,
        availability: ['Tuesday', 'Thursday', 'Friday'],
        imageUrl: 'https://images.unsplash.com/photo-1622253694242-abeb37a33e97?auto=format&fit=crop&q=80&w=400'
      }
    ];

    await Doctor.create(docsData);
    console.log('Created Kerala doctors.');

    console.log('Kerala Doctors seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding Kerala doctors: ${error.message}`);
    process.exit(1);
  }
};

seedKeralaDoctors();
