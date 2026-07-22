import mongoose from 'mongoose';

const hospitalInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'City General Hospital',
    },
    tagline: {
      type: String,
      default: 'Your Health, Our Priority',
    },
    description: {
      type: String,
      default: 'Providing top-tier healthcare services with state-of-the-art facilities.',
    },
    address: {
      type: String,
      required: true,
      default: '123 Healthcare Ave, Medical District, NY 10001',
    },
    phone: {
      type: String,
      required: true,
      default: '+1 (555) 019-2834',
    },
    emergencyPhone: {
      type: String,
      required: true,
      default: '+1 (555) 019-9111',
    },
    email: {
      type: String,
      required: true,
      default: 'info@cityhospital.com',
    },
    workingHours: {
      type: String,
      default: '24/7 Emergency Service | Mon-Sat 8:00 AM - 8:00 PM Outpatient',
    },
  },
  {
    timestamps: true,
  }
);

const HospitalInfo = mongoose.model('HospitalInfo', hospitalInfoSchema);
export default HospitalInfo;
