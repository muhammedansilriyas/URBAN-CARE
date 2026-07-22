import Patient from '../models/Patient.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js'; // Synchronized unified user collection
import generateToken from '../utils/generateToken.js';

// Helper to seed demo admin if it doesn't exist
export const seedDemoAdmin = async () => {
  const adminExists1 = await Admin.findOne({ email: 'admin@urbanpatientcare.com' });
  if (!adminExists1) {
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@urbanpatientcare.com',
      password: 'admin123',
      role: 'Admin',
    });
  }
  const adminExists2 = await Admin.findOne({ email: 'admin@caregrid.com' });
  if (!adminExists2) {
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@caregrid.com',
      password: 'admin123',
      role: 'Admin',
    });
  }

  // Sync to User collection as well
  const uExists1 = await User.findOne({ email: 'admin@urbanpatientcare.com' });
  if (!uExists1) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@urbanpatientcare.com',
      password: 'admin123',
      role: 'Admin',
    });
  }
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, gender, age, role } = req.body;

    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return res.status(400).json({ message: 'Patient already exists with this email' });
    }

    const patient = await Patient.create({
      name,
      email,
      password,
      phone,
      gender,
      age: Number(age),
      role: role || 'Patient',
    });

    // Also sync to User model
    await User.create({
      name,
      email,
      password,
      phone,
      gender,
      age: Number(age),
      role: 'Patient',
    });

    if (patient) {
      res.status(201).json({
        token: generateToken(patient._id, 'Patient'),
        user: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          gender: patient.gender,
          age: patient.age,
          role: patient.role,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid patient data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Auto-seed demo admin if necessary
    await seedDemoAdmin();

    // Check in Admin collection first
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      return res.json({
        token: generateToken(admin._id, 'Admin'),
        user: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    }

    // Check in Patient collection next
    const patient = await Patient.findOne({ email });
    if (patient && (await patient.matchPassword(password))) {
      return res.json({
        token: generateToken(patient._id, 'Patient'),
        user: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          gender: patient.gender,
          age: patient.age,
          role: patient.role,
        },
      });
    }

    // If both failed
    return res.status(401).json({ message: 'Invalid email or password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    let user;
    if (req.userRole === 'Admin') {
      user = await Admin.findById(req.user._id);
    } else {
      user = await Patient.findById(req.user._id);
    }

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = req.userRole === 'Admin'
          ? await Admin.findOne({ email: req.body.email })
          : await Patient.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = req.body.email;
      }
      
      if (req.userRole === 'Patient') {
        user.phone = req.body.phone || user.phone;
        user.gender = req.body.gender || user.gender;
        user.age = req.body.age !== undefined ? Number(req.body.age) : user.age;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // Also sync to User model
      const syncedUser = await User.findOne({ email: updatedUser.email });
      if (syncedUser) {
        syncedUser.name = updatedUser.name;
        if (req.body.password) syncedUser.password = req.body.password;
        syncedUser.phone = updatedUser.phone || syncedUser.phone;
        syncedUser.gender = updatedUser.gender || syncedUser.gender;
        syncedUser.age = updatedUser.age || syncedUser.age;
        await syncedUser.save();
      }
      
      res.json({
        token: generateToken(updatedUser._id, updatedUser.role),
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          ...(updatedUser.role === 'Patient' && {
            phone: updatedUser.phone,
            gender: updatedUser.gender,
            age: updatedUser.age,
          })
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Exchange mock token for real JWT token
// @route   POST /api/auth/exchange-token
// @access  Public
export const exchangeMockToken = async (req, res) => {
  try {
    const { mockToken } = req.body;
    await seedDemoAdmin();

    if (mockToken === 'mocked_jwt_token_for_admin_user') {
      const admin = await Admin.findOne({ email: 'admin@urbanpatientcare.com' });
      if (admin) {
        return res.json({
          token: generateToken(admin._id, 'Admin'),
          user: {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        });
      }
    } else if (mockToken === 'mocked_jwt_token_for_patient_user') {
      const patient = await Patient.findOne({ email: 'patient@example.com' });
      if (patient) {
        return res.json({
          token: generateToken(patient._id, 'Patient'),
          user: {
            _id: patient._id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            gender: patient.gender,
            age: patient.age,
            role: patient.role,
          },
        });
      }
    }
    return res.status(400).json({ message: 'Invalid mock token' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
