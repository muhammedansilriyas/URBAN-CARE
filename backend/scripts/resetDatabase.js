import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

import Department from '../models/Department.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import Announcement from '../models/Announcement.js';
import Admin from '../models/Admin.js';
import HospitalInfo from '../models/HospitalInfo.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // DNS fallback error ignored
}

const resetDatabase = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected host: ${mongoose.connection.host} | Database: ${mongoose.connection.name}`);

    console.log('Clearing existing collections on MongoDB Atlas...');
    await Department.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Message.deleteMany({});
    await Announcement.deleteMany({});
    await Admin.deleteMany({});
    await HospitalInfo.deleteMany({});
    console.log('Collections cleared.');

    console.log('Seeding fresh initial collections on MongoDB Atlas...');

    // 1. Departments
    const standardDepts = [
      { name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnostics, and heart surgeries.' },
      { name: 'Neurology', description: 'Advanced treatment for brain, nerve, and spine-related complex conditions.' },
      { name: 'Pediatrics', description: 'Dedicated healthcare services, vaccination, and treatment for babies and children.' },
      { name: 'Orthopedics', description: 'Skeletal health, joint repairs, and sports medicine therapies.' },
      { name: 'Dermatology', description: 'Expert care for skin, hair, and nail health conditions.' },
      { name: 'Oncology', description: 'Diagnosis and treatment of various types of cancer.' },
    ];
    const createdDepts = await Department.insertMany(standardDepts);
    console.log(`- Created ${createdDepts.length} departments.`);

    const cardiology = createdDepts.find((d) => d.name === 'Cardiology');
    const neurology = createdDepts.find((d) => d.name === 'Neurology');
    const pediatrics = createdDepts.find((d) => d.name === 'Pediatrics');
    const orthopedics = createdDepts.find((d) => d.name === 'Orthopedics');
    const dermatology = createdDepts.find((d) => d.name === 'Dermatology');

    // 2. Admins
    const admin1 = await Admin.create({
      name: 'Super Admin',
      email: 'admin@urbanpatientcare.com',
      password: 'admin123',
      role: 'Admin',
    });
    console.log(`- Created Admin user (${admin1.email}).`);

    // 3. Patients
    const patient1 = await Patient.create({
      name: 'John Doe',
      email: 'patient@example.com',
      password: 'patient123',
      phone: '+1 (555) 019-2834',
      gender: 'Male',
      age: 32,
      role: 'Patient',
    });
    const hajiraUser = await Patient.create({
      name: 'Hajira',
      email: 'hajira@example.com',
      password: 'patient123',
      phone: '+1 (555) 019-2222',
      gender: 'Female',
      age: 30,
      role: 'Patient',
    });
    console.log(`- Created Patient accounts.`);

    // 4. Doctors
    const doctorsToSeed = [
      {
        name: 'Dr. Anand Kumar A',
        email: 'anand.kumar@urbanpatientcare.com',
        phone: '+1 (555) 019-3301',
        department: neurology?._id,
        specialization: 'Neurology',
        experience: 15,
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        imageUrl: '/dr-anand-kumar.png',
      },
      {
        name: 'Dr. Balaji Srimurugan',
        email: 'balaji.srimurugan@urbanpatientcare.com',
        phone: '+1 (555) 019-3302',
        department: cardiology?._id,
        specialization: 'Cardiology',
        experience: 12,
        availability: ['Tuesday', 'Thursday'],
        imageUrl: '/dr-balaji-srimurugan.png',
      },
      {
        name: 'Dr. Anjali Murali',
        email: 'anjali.murali@urbanpatientcare.com',
        phone: '+1 (555) 019-3303',
        department: cardiology?._id,
        specialization: 'Cardiology',
        experience: 10,
        availability: ['Wednesday', 'Friday'],
        imageUrl: '/dr-anjali-murali.png',
      },
      {
        name: 'Dr. Aiswarya R Kamath',
        email: 'aiswarya.kamath@urbanpatientcare.com',
        phone: '+1 (555) 019-3304',
        department: orthopedics?._id,
        specialization: 'Orthopedics',
        experience: 8,
        availability: ['Monday', 'Wednesday'],
        imageUrl: '/dr-aiswarya-r-kamath.png',
      },
      {
        name: 'Dr. Balu Vaidyanathan',
        email: 'balu.vaidyanathan@urbanpatientcare.com',
        phone: '+1 (555) 019-3305',
        department: cardiology?._id,
        specialization: 'Cardiology',
        experience: 14,
        availability: ['Thursday', 'Friday'],
        imageUrl: '/dr-balu-vaidyanathan.png',
      },
      {
        name: 'Dr. Saraf Udit Umesh',
        email: 'saraf.udit@urbanpatientcare.com',
        phone: '+1 (555) 019-3306',
        department: neurology?._id,
        specialization: 'Neurology',
        experience: 11,
        availability: ['Tuesday', 'Thursday'],
        imageUrl: '/dr-saraf-udit-umesh.png',
      },
      {
        name: 'Dr. Praveena N B',
        email: 'praveena.nb@urbanpatientcare.com',
        phone: '+1 (555) 019-3307',
        department: pediatrics?._id,
        specialization: 'Pediatrics',
        experience: 9,
        availability: ['Monday', 'Friday'],
        imageUrl: '/dr-praveena-n-b.png',
      },
      {
        name: 'Dr. Rakesh M. P.',
        email: 'rakesh.mp@urbanpatientcare.com',
        phone: '+1 (555) 019-3308',
        department: cardiology?._id,
        specialization: 'Cardiology',
        experience: 7,
        availability: ['Wednesday', 'Thursday'],
        imageUrl: '/dr-rakesh-m-p.png',
      },
      {
        name: 'Dr. Soumya Jagadeesan',
        email: 'soumya.jagadeesan@urbanpatientcare.com',
        phone: '+1 (555) 019-3309',
        department: dermatology?._id,
        specialization: 'Dermatology',
        experience: 6,
        availability: ['Tuesday', 'Friday'],
        imageUrl: '/dr-soumya-jagadeesan.png',
      },
    ];
    const createdDocs = await Doctor.insertMany(doctorsToSeed);
    console.log(`- Created ${createdDocs.length} doctor profiles.`);

    // 5. Appointments
    const docAnand = createdDocs.find((d) => d.name.includes('Anand'));
    const docAiswarya = createdDocs.find((d) => d.name.includes('Aiswarya'));

    await Appointment.create({
      patientId: hajiraUser._id,
      doctorId: docAnand?._id,
      departmentId: neurology?._id,
      patientName: hajiraUser.name,
      patientPhone: hajiraUser.phone,
      patientEmail: hajiraUser.email,
      patientGender: hajiraUser.gender,
      patientAge: hajiraUser.age,
      appointmentDate: new Date(),
      appointmentTime: '10:30 AM',
      symptoms: 'Neurological evaluation and migraine follow-up',
      status: 'Approved',
    });

    await Appointment.create({
      patientId: hajiraUser._id,
      doctorId: docAiswarya?._id,
      departmentId: orthopedics?._id,
      patientName: hajiraUser.name,
      patientPhone: hajiraUser.phone,
      patientEmail: hajiraUser.email,
      patientGender: hajiraUser.gender,
      patientAge: hajiraUser.age,
      appointmentDate: new Date(Date.now() + 86400000),
      appointmentTime: '02:30 PM',
      symptoms: 'Joint stiffness consultation',
      status: 'Pending',
    });
    console.log(`- Created initial appointment records.`);

    // 6. Messages
    await Message.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1 (555) 234-5678',
      subject: 'Insurance Policy Query',
      message: 'Hello, do you accept international health coverage policies for outpatient services?',
      isReplied: true,
      replyMessage: 'Yes, we accept major international policies. Please present your membership ID at Wing A counter.',
    });
    console.log(`- Created sample messages.`);

    // 7. Announcements
    await Announcement.create({
      title: 'Flu Vaccination Campaign',
      content: 'Free flu vaccination drive available at Wing C starting next Monday.',
      isActive: true,
    });
    console.log(`- Created announcements.`);

    // 8. Hospital Info
    await HospitalInfo.create({
      name: 'Urban Care Hospital',
      tagline: 'Your Health, Our Priority',
      description: 'Providing premium medical care with state-of-the-art healthcare facilities.',
      address: '123 Medical Park Road, Suite A, New York, NY 10010',
      phone: '+1 (555) 019-2834',
      emergencyPhone: '+1 (555) 019-9111',
      email: 'contact@urbancare.com',
      workingHours: '24/7 Emergency Care | Mon-Fri 8 AM - 8 PM OPD',
    });
    console.log(`- Created Hospital Profile record.`);

    console.log('Fresh database initialization completed successfully on MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();
