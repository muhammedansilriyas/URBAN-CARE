import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import { uploadImage, deleteImage } from '../utils/imageUpload.js';
import mongoose from 'mongoose';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('department');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single doctor details
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const doctor = await Doctor.findById(req.params.id).populate('department');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a doctor
// @route   POST /api/doctors
// @access  Private/Admin
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      experience,
      availability,
      imageUrl,
      department,
      title,
      location,
      status,
      rating,
      reviewsCount,
      acceptingNew,
      telemedicine,
    } = req.body;

    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor already exists with this email' });
    }

    // Resolve department cleanly to a valid Mongoose ObjectId
    let departmentId = null;

    if (department && mongoose.Types.ObjectId.isValid(department)) {
      departmentId = department;
    } else if (department && typeof department === 'string' && department.trim() !== '') {
      let deptByName = await Department.findOne({ name: new RegExp(`^${department.trim()}$`, 'i') });
      if (deptByName) {
        departmentId = deptByName._id;
      }
    }

    if (!departmentId && specialization) {
      let deptBySpec = await Department.findOne({ name: new RegExp(`^${specialization.trim()}$`, 'i') });
      if (!deptBySpec) {
        deptBySpec = await Department.create({
          name: specialization,
          description: `Specialized medical department for ${specialization} treatments.`
        });
      }
      departmentId = deptBySpec._id;
    }

    if (!departmentId) {
      let firstDept = await Department.findOne({});
      if (!firstDept) {
        firstDept = await Department.create({
          name: 'General Medicine',
          description: 'Comprehensive general healthcare and diagnostics.'
        });
      }
      departmentId = firstDept._id;
    }

    let finalImageUrl = imageUrl || '';
    let finalPublicId = '';

    if (req.file) {
      const uploadResult = await uploadImage(req.file, req);
      finalImageUrl = uploadResult.imageUrl;
      finalPublicId = uploadResult.imagePublicId;
    }

    const doctor = await Doctor.create({
      name,
      email,
      phone: phone || '+1 (555) 019-3333',
      department: departmentId,
      specialization: specialization || 'General Practitioner',
      experience: Number(experience) || 5,
      availability: availability ? (Array.isArray(availability) ? availability : availability.split(',')) : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      imageUrl: finalImageUrl,
      imagePublicId: finalPublicId,
      title: title || `${specialization || 'General'} Specialist`,
      location: location || 'Wing A, Rm 101',
      status: status || 'Available Today',
      rating: rating ? Number(rating) : 5.0,
      reviewsCount: reviewsCount ? Number(reviewsCount) : 1,
      acceptingNew: acceptingNew === 'true' || acceptingNew === true,
      telemedicine: telemedicine === 'true' || telemedicine === true,
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate('department');
    res.status(201).json(populatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor photo
// @route   PUT /api/doctors/:id/photo
// @access  Private/Admin
export const updateDoctorPhoto = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // Delete old image if it exists
    if (doctor.imagePublicId) {
      await deleteImage(doctor.imagePublicId);
    }

    // Upload new image
    const { imageUrl, imagePublicId } = await uploadImage(req.file, req);

    doctor.imageUrl = imageUrl;
    doctor.imagePublicId = imagePublicId;
    const updatedDoctor = await doctor.save();

    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
export const deleteDoctor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Delete associated image file from storage
    if (doctor.imagePublicId) {
      await deleteImage(doctor.imagePublicId);
    }

    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
