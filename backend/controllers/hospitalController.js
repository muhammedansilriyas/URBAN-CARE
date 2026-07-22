import HospitalInfo from '../models/HospitalInfo.js';

// @desc    Get hospital details
// @route   GET /api/hospital
// @access  Public
export const getHospitalDetails = async (req, res) => {
  try {
    let hospital = await HospitalInfo.findOne({});
    if (!hospital) {
      // Create a default if none exists
      hospital = await HospitalInfo.create({
        name: 'Urban Care Hospital',
        tagline: 'Your Health, Our Priority',
        description: 'Providing premium healthcare services with modern state-of-the-art facilities.',
        address: '123 Medical Park Road, Suite A, New York, NY 10010',
        phone: '+1 (555) 019-2834',
        emergencyPhone: '+1 (555) 019-9111',
        email: 'contact@urbancare.com',
        workingHours: '24/7 Emergency Care | Mon-Fri 8 AM - 8 PM OPD',
      });
    }
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update hospital details
// @route   PUT /api/hospital
// @access  Private/Admin
export const updateHospitalDetails = async (req, res) => {
  try {
    let hospital = await HospitalInfo.findOne({});
    if (!hospital) {
      hospital = new HospitalInfo({});
    }

    const { name, tagline, description, address, phone, emergencyPhone, email, workingHours } = req.body;

    hospital.name = name || hospital.name;
    hospital.tagline = tagline || hospital.tagline;
    hospital.description = description || hospital.description;
    hospital.address = address || hospital.address;
    hospital.phone = phone || hospital.phone;
    hospital.emergencyPhone = emergencyPhone || hospital.emergencyPhone;
    hospital.email = email || hospital.email;
    hospital.workingHours = workingHours || hospital.workingHours;

    const updatedHospital = await hospital.save();
    res.json(updatedHospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
