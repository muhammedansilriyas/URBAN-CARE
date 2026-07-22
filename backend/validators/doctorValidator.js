// Validation rules for Doctor module requests

export const validateDoctor = (req, res, next) => {
  const errors = [];

  // Auto-generate email & phone fallbacks if omitted in admin form
  if (!req.body.email || req.body.email.trim() === '') {
    const cleanName = (req.body.name || 'doctor').toLowerCase().replace(/[^a-z0-9]/g, '');
    req.body.email = `${cleanName}_${Date.now()}@urbanpatientcare.com`;
  }

  if (!req.body.phone || req.body.phone.trim() === '') {
    req.body.phone = '+1 (555) 019-3333';
  }

  const { name, email, phone, specialization, experience } = req.body;

  if (!name || name.trim() === '') errors.push('Doctor name is required');

  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Invalid email format');
  }

  if (phone && !/^\+?[1-9]\d{1,14}$|^[0-9-\s()+]*$/.test(phone)) {
    errors.push('Invalid phone number format');
  }

  if (!specialization || specialization.trim() === '') {
    errors.push('Specialization is required');
  }

  if (experience === undefined || experience === null || experience === '') {
    errors.push('Experience in years is required');
  } else {
    const expNum = Number(experience);
    if (isNaN(expNum) || expNum < 0 || expNum > 60) {
      errors.push('Experience must be a valid number of years between 0 and 60');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};
