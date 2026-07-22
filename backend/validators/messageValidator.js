// Validation rules for contact/feedback messages

export const validateMessage = (req, res, next) => {
  const { name, email, phone, subject, message } = req.body;
  const errors = [];

  if (!name || name.trim() === '') errors.push('Name is required');

  if (!email) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  } else if (!/^\+?[1-9]\d{1,14}$|^[0-9-\s()+]*$/.test(phone)) {
    errors.push('Invalid phone number format');
  }

  if (!subject || subject.trim() === '') errors.push('Subject is required');
  if (!message || message.trim() === '') errors.push('Message body is required');

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};
