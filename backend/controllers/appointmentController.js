import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';

// Helper to ensure doctor details & photo are populated even for legacy/unlinked bookings
const enrichAppointments = async (appointments) => {
  const allDoctors = await Doctor.find({}).lean();
  return appointments.map((appt) => {
    const plainAppt = appt.toObject ? appt.toObject() : { ...appt };
    const docRef = plainAppt.doctorId;

    // Check if doctorId is populated and contains imageUrl
    if (docRef && typeof docRef === 'object' && docRef.imageUrl) {
      return plainAppt;
    }

    // Try matching by ObjectId string
    let matchedDoc = null;
    if (docRef) {
      const docIdStr = typeof docRef === 'object' ? String(docRef._id || docRef) : String(docRef);
      matchedDoc = allDoctors.find((d) => String(d._id) === docIdStr);
    }

    // Try matching by doctorName
    if (!matchedDoc && plainAppt.doctorName) {
      const cleanName = plainAppt.doctorName.replace(/^Dr\.\s*/i, '').trim();
      matchedDoc = allDoctors.find((d) =>
        d.name.toLowerCase().includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(d.name.toLowerCase())
      );
    }

    if (matchedDoc) {
      plainAppt.doctorId = matchedDoc;
      if (!plainAppt.doctorName) plainAppt.doctorName = matchedDoc.name;
    }

    return plainAppt;
  });
};

// @desc    Get all appointments/bookings
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    // Prevent caching on client/proxies to guarantee fresh status
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    let appointments = [];
    if (req.userRole === 'Admin') {
      appointments = await Appointment.find({})
        .populate('doctorId')
        .populate('departmentId')
        .sort({ createdAt: -1 });
    } else {
      appointments = await Appointment.find({ patientId: req.user._id })
        .populate('doctorId')
        .populate('departmentId')
        .sort({ createdAt: -1 });
    }

    const enriched = await enrichAppointments(appointments);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book / Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const bookAppointment = async (req, res) => {
  try {
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

    // Create single Appointment record in database
    const newAppointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      departmentId,
      patientName,
      patientPhone,
      patientEmail,
      patientGender,
      patientAge: Number(patientAge),
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      symptoms,
      status: 'Pending',
    });

    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate('doctorId')
      .populate('departmentId');

    // Create notification for the patient
    await Notification.create({
      recipient: req.user._id,
      title: 'Appointment Booked',
      message: `Your appointment for ${appointmentTime} on ${new Date(appointmentDate).toLocaleDateString()} has been requested and is pending approval.`,
      type: 'Appointment',
    });

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private/Admin
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Pending', 'Approved', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('doctorId').populate('departmentId');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Notify patient of status update
    await Notification.create({
      recipient: appointment.patientId,
      title: `Appointment ${status}`,
      message: `Your appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} is now ${status}.`,
      type: 'Appointment',
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
