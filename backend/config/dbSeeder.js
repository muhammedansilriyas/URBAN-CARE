import Department from '../models/Department.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import Announcement from '../models/Announcement.js';
import Admin from '../models/Admin.js';

export const seedDatabase = async () => {
  try {
    console.log('Checking if database needs seeding...');

    // 1. Seed Departments if none exist
    let deptsCount = await Department.countDocuments();
    if (deptsCount === 0) {
      console.log('Seeding standard departments...');
      const standardDepts = [
        { name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnostics, and heart surgeries.' },
        { name: 'Neurology', description: 'Advanced treatment for brain, nerve, and spine-related complex conditions.' },
        { name: 'Pediatrics', description: 'Dedicated healthcare services, vaccination, and treatment for babies and children.' },
        { name: 'Orthopedics', description: 'Skeletal health, joint repairs, and sports medicine therapies.' },
        { name: 'Dermatology', description: 'Expert care for skin, hair, and nail health conditions.' },
        { name: 'Oncology', description: 'Diagnosis and treatment of various types of cancer.' },
      ];
      await Department.insertMany(standardDepts);
      console.log('Departments seeded.');
    }

    // Load departments for referencing
    const cardiology = await Department.findOne({ name: 'Cardiology' });
    const neurology = await Department.findOne({ name: 'Neurology' });
    const pediatrics = await Department.findOne({ name: 'Pediatrics' });
    const orthopedics = await Department.findOne({ name: 'Orthopedics' });
    const dermatology = await Department.findOne({ name: 'Dermatology' });
    const oncology = await Department.findOne({ name: 'Oncology' });

    // 2. Seed Admin if none exist (additional safety net)
    let adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('Seeding demo admins...');
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@urbanpatientcare.com',
        password: 'admin123',
        role: 'Admin',
      });
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@caregrid.com',
        password: 'admin123',
        role: 'Admin',
      });
      console.log('Admins seeded.');
    }

    // 3. Seed Patients if none exist
    let patientCount = await Patient.countDocuments();
    let patientUser, adilUser, hajiraUser, ansilUser;
    if (patientCount === 0) {
      console.log('Seeding demo patients...');
      patientUser = await Patient.create({
        name: 'John Doe',
        email: 'patient@example.com',
        password: 'patient123',
        phone: '+1 (555) 019-2834',
        gender: 'Male',
        age: 32,
        role: 'Patient',
      });
      adilUser = await Patient.create({
        name: 'Adil',
        email: 'adil@example.com',
        password: 'patient123',
        phone: '+1 (555) 019-1111',
        gender: 'Male',
        age: 25,
        role: 'Patient',
      });
      hajiraUser = await Patient.create({
        name: 'Hajira',
        email: 'hajira@example.com',
        password: 'patient123',
        phone: '+1 (555) 019-2222',
        gender: 'Female',
        age: 30,
        role: 'Patient',
      });
      ansilUser = await Patient.create({
        name: 'Ansil',
        email: 'ansil@example.com',
        password: 'patient123',
        phone: '+1 (555) 019-3333',
        gender: 'Male',
        age: 28,
        role: 'Patient',
      });
      console.log('Patients seeded.');
    } else {
      patientUser = await Patient.findOne({ email: 'patient@example.com' });
      adilUser = await Patient.findOne({ email: 'adil@example.com' });
      hajiraUser = await Patient.findOne({ email: 'hajira@example.com' });
      ansilUser = await Patient.findOne({ email: 'ansil@example.com' });

      // Fallback creations if they were partially cleared
      if (!patientUser) {
        patientUser = await Patient.create({ name: 'John Doe', email: 'patient@example.com', password: 'patient123', phone: '+1 (555) 019-2834', gender: 'Male', age: 32, role: 'Patient' });
      }
      if (!adilUser) {
        adilUser = await Patient.create({ name: 'Adil', email: 'adil@example.com', password: 'patient123', phone: '+1 (555) 019-1111', gender: 'Male', age: 25, role: 'Patient' });
      }
      if (!hajiraUser) {
        hajiraUser = await Patient.create({ name: 'Hajira', email: 'hajira@example.com', password: 'patient123', phone: '+1 (555) 019-2222', gender: 'Female', age: 30, role: 'Patient' });
      }
      if (!ansilUser) {
        ansilUser = await Patient.create({ name: 'Ansil', email: 'ansil@example.com', password: 'patient123', phone: '+1 (555) 019-3333', gender: 'Male', age: 28, role: 'Patient' });
      }
    }

    // 4. Seed Doctors if none exist
    let doctorsCount = await Doctor.countDocuments();
    let doctorsList = [];
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
      }
    ];

    if (doctorsCount === 0) {
      console.log('Seeding demo doctors...');
      for (const doc of doctorsToSeed) {
        const created = await Doctor.create(doc);
        doctorsList.push(created);
      }
      console.log('Doctors seeded.');
    } else {
      doctorsList = await Doctor.find({});
    }

    const doctorAnand = doctorsList.find(d => d.name.includes('Anand')) || doctorsList[0];
    const doctorBalaji = doctorsList.find(d => d.name.includes('Balaji')) || doctorsList[1];
    const doctorPraveena = doctorsList.find(d => d.name.includes('Praveena')) || doctorsList[2];

    // 5. Seed Appointments if none exist
    let appointmentsCount = await Appointment.countDocuments();
    if (appointmentsCount === 0 && adilUser && doctorAnand) {
      console.log('Seeding demo appointments...');
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

      // Adil booking
      await Appointment.create({
        patientId: adilUser._id,
        doctorId: doctorAnand._id,
        departmentId: neurology?._id,
        patientName: adilUser.name,
        patientPhone: adilUser.phone,
        patientEmail: adilUser.email,
        patientGender: adilUser.gender,
        patientAge: adilUser.age,
        appointmentDate: yesterday,
        appointmentTime: '10:30 AM',
        symptoms: 'Chronic migraine headaches and visual aura',
        status: 'Pending',
      });

      // Hajira booking
      if (doctorBalaji) {
        await Appointment.create({
          patientId: hajiraUser._id,
          doctorId: doctorBalaji._id,
          departmentId: cardiology?._id,
          patientName: hajiraUser.name,
          patientPhone: hajiraUser.phone,
          patientEmail: hajiraUser.email,
          patientGender: hajiraUser.gender,
          patientAge: hajiraUser.age,
          appointmentDate: yesterday,
          appointmentTime: '02:00 PM',
          symptoms: 'Chest discomfort and shortness of breath during exercise',
          status: 'Approved',
        });
      }

      // Ansil booking
      if (doctorPraveena) {
        await Appointment.create({
          patientId: ansilUser._id,
          doctorId: doctorPraveena._id,
          departmentId: pediatrics?._id,
          patientName: ansilUser.name,
          patientPhone: ansilUser.phone,
          patientEmail: ansilUser.email,
          patientGender: ansilUser.gender,
          patientAge: ansilUser.age,
          appointmentDate: yesterday,
          appointmentTime: '11:15 AM',
          symptoms: 'Child nutrition consultation and growth assessment',
          status: 'Pending',
        });
      }
      console.log('Appointments seeded.');
    }

    // 6. Seed Messages (Inquiries) if none exist
    let messagesCount = await Message.countDocuments();
    if (messagesCount === 0) {
      console.log('Seeding sample messages...');
      await Message.create({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1 (555) 234-5678',
        subject: 'Billing Inquiry',
        message: 'Hello, I wanted to ask about payment plans and options for my upcoming cardiology appointment. Do you accept international health insurance policies?',
        isReplied: false,
      });

      await Message.create({
        name: 'David Miller',
        email: 'david@example.com',
        phone: '+1 (555) 876-5432',
        subject: 'Prescription Refill Request',
        message: 'Hi Doctor, could we please get a refill on my child asthma inhaler prescription? The previous one expired last week.',
        isReplied: true,
        replyMessage: 'Certainly. I have reviewed the records and sent a refill authorization directly to your registered pharmacy.',
      });
      console.log('Messages seeded.');
    }

    // 7. Seed Announcements if none exist
    let announcementsCount = await Announcement.countDocuments();
    if (announcementsCount === 0) {
      console.log('Seeding announcements...');
      await Announcement.create({
        title: 'Flu Vaccination Drive',
        content: 'Our annual flu vaccination campaign starts next Monday. Walk-ins are welcome from 9:00 AM to 4:00 PM at Wing C. Please bring your insurance card.',
        isActive: true,
      });

      await Announcement.create({
        title: 'New Pediatric Specialist Joined',
        content: 'We are thrilled to welcome Dr. Praveena N B to our Pediatrics wing. She specializes in pediatric immunology and has over 9 years of clinical experience.',
        isActive: true,
      });
      console.log('Announcements seeded.');
    }

    console.log('Database seeding checks completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
