import Appointment from './Appointment.js';

// Re-export Appointment model as Booking to ensure single source of truth
const Booking = Appointment;
export default Booking;

