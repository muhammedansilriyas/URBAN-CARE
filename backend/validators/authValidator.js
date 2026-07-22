// Validation rules for authentication requests

export const validateRegister = (req, res, next) => {
  const { name, email, password, phone, gender, age } = req.body;
  const errors = [];

  if (!name || name.trim() === '') errors.push('Name is required');
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  } else if (!/^\+?[1-9]\d{1,14}$|^[0-9-\s()+]*$/.test(phone)) {
    // Basic phone number format regex
    errors.push('Invalid phone number format');
  }

  if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
    errors.push('Gender must be Male, Female, or Other');
  }

  if (age === undefined || age === null || age === '') {
    errors.push('Age is required');
  } else {
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      errors.push('Age must be a valid number between 1 and 120');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { email, phone, gender, age } = req.body;
  const errors = [];

  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Invalid email format');
  }

  if (phone && !/^\+?[1-9]\d{1,14}$|^[0-9-\s()+]*$/.test(phone)) {
    errors.push('Invalid phone number format');
  }

  if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
    errors.push('Gender must be Male, Female, or Other');
  }

  if (age !== undefined && age !== null && age !== '') {
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      errors.push('Age must be a valid number between 1 and 120');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};
