import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments({});
    const totalDepartments = await Department.countDocuments({});
    const totalPatients = await Patient.countDocuments({});
    const totalAppointments = await Appointment.countDocuments({});

    const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
    const approvedAppointments = await Appointment.countDocuments({ status: 'Approved' });
    const rejectedAppointments = await Appointment.countDocuments({ status: 'Rejected' });
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });

    // Today's bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todaysAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startOfToday, $lte: endOfToday },
    });

    // Recent Appointments (last 5)
    const recentAppointments = await Appointment.find({})
      .populate('doctorId', 'name specialization')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalDoctors,
      totalDepartments,
      totalPatients,
      totalAppointments,
      statusCounts: {
        pending: pendingAppointments,
        approved: approvedAppointments,
        rejected: rejectedAppointments,
        completed: completedAppointments,
      },
      todaysAppointments,
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
