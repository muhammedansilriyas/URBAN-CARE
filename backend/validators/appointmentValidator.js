// Validation rules for Appointment booking requests

export const validateAppointment = (req, res, next) => {
  const {
    doctorId,
    departmentId,
    patientName,
    patientPhone,
    patientEmail,
    patientGender,
    patientAge,
    appointmentDate,
    appointmentTime,
    symptoms,
  } = req.body;

  const errors = [];

  if (!doctorId || doctorId.trim() === '') errors.push('Doctor ID is required');
  if (!departmentId || departmentId.trim() === '') errors.push('Department ID is required');
  if (!patientName || patientName.trim() === '') errors.push('Patient name is required');
  
  if (!patientEmail) {
    errors.push('Patient email is required');
  } else if (!/\S+@\S+\.\S+/.test(patientEmail)) {
    errors.push('Invalid email format');
  }

  if (!patientPhone || patientPhone.trim() === '') {
    errors.push('Patient phone number is required');
  } else if (!/^\+?[1-9]\d{1,14}$|^[0-9-\s()+]*$/.test(patientPhone)) {
    errors.push('Invalid phone number format');
  }

  if (!patientGender || !['Male', 'Female', 'Other'].includes(patientGender)) {
    errors.push('Patient gender must be Male, Female, or Other');
  }

  if (patientAge === undefined || patientAge === null || patientAge === '') {
    errors.push('Patient age is required');
  } else {
    const ageNum = Number(patientAge);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      errors.push('Patient age must be a valid number between 1 and 120');
    }
  }

  if (!appointmentDate) {
    errors.push('Appointment date is required');
  } else {
    const dateObj = new Date(appointmentDate);
    if (isNaN(dateObj.getTime())) {
      errors.push('Invalid appointment date');
    }
  }

  if (!appointmentTime || appointmentTime.trim() === '') {
    errors.push('Appointment time is required');
  }

  if (!symptoms || symptoms.trim() === '') {
    errors.push('Symptoms description is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};
