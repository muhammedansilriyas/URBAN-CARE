import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import API from '../services/api.js';
import { getDoctorPhoto, handleDoctorImageError } from '../utils/doctorHelper.js';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [appointments, setAppointments] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = async () => {
    if (!isAuthenticated) {
      setAppointments([]);
      return;
    }
    try {
      const { data } = await API.get('/appointments');
      setAppointments(data || []);
    } catch (err) {
      console.warn('Failed to fetch appointments for notifications from MongoDB:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [isAuthenticated, user]);

  useEffect(() => {
    window.addEventListener('appointmentBooked', fetchAppointments);
    return () => {
      window.removeEventListener('appointmentBooked', fetchAppointments);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (showNotifications && !e.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showNotifications]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100';
  };

  const handleLogout = () => {
    console.log('Logging out from Navbar...');
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path) => {
    return `font-label-md text-label-md transition-colors ${
      isActive(path)
        ? 'text-primary font-bold border-b-2 border-primary pb-1'
        : 'text-secondary hover:text-primary'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-6 xl:px-margin-desktop h-20 flex justify-between items-center w-full">
        <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
          <Link to="/" className="font-headline-md text-headline-md font-extrabold text-primary select-none shrink-0 flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Urban Care Logo" className="w-9 h-9 object-contain" />
            <span>Urban Patient Care</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 lg:gap-5 xl:gap-8">
            <Link className={linkClass('/')} to="/">Home</Link>
            <Link className={linkClass('/departments')} to="/departments">Departments</Link>
            <Link className={linkClass('/doctors')} to="/doctors">Doctors</Link>
            <Link className={linkClass('/book-appointment')} to="/book-appointment">Appointments</Link>
            <Link className={linkClass('/contact')} to="/contact">Inquiries</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 xl:gap-6">
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <div className="relative notifications-container">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer transition-all flex items-center justify-center relative p-1 rounded-full hover:bg-surface-container-low outline-none"
                >
                  notifications
                  {appointments.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-600 rounded-full"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 p-4 max-h-96 overflow-y-auto">
                    <h4 className="font-bold text-primary text-sm mb-3 border-b pb-2 flex justify-between items-center">
                      <span>Upcoming Bookings</span>
                      {appointments.length > 0 && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
                          {appointments.length}
                        </span>
                      )}
                    </h4>
                    {appointments.length === 0 ? (
                      <p className="text-on-surface-variant text-xs py-2 text-center font-medium">No upcoming appointments scheduled.</p>
                    ) : (
                      <div className="space-y-3">
                        {appointments.map((app) => {
                          const docName = app.doctorName || app.doctorId?.name || 'Practitioner';
                          const apptDate = app.date || (app.appointmentDate ? new Date(app.appointmentDate).toLocaleDateString() : 'N/A');
                          const apptTime = app.time || app.appointmentTime;
                          return (
                            <div 
                              key={app._id || app.id} 
                              onClick={() => {
                                setSelectedAppointment(app);
                                setShowNotifications(false);
                              }}
                              className="p-3 bg-surface-container-low hover:bg-surface-container-high rounded-lg border border-outline-variant/60 flex items-start gap-3 text-left cursor-pointer transition-colors"
                            >
                              <span className="material-symbols-outlined text-primary text-lg mt-0.5">calendar_today</span>
                              <div className="flex-1">
                                <p className="font-bold text-xs text-on-surface leading-tight">{docName}</p>
                                <p className="text-[10px] text-on-surface-variant mt-1">{apptDate} at {apptTime}</p>
                                <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold mt-2 border ${
                                  app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 border-l pl-4 border-outline-variant/60">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-secondary hover:text-primary transition-all group" title="View Profile">
                  <FaUserCircle className="text-2xl group-hover:text-primary transition-colors" />
                  <span className="hidden sm:inline text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{user?.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-secondary hover:text-rose-600 p-1 rounded-md transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-lg" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-5 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md transition-all hover:opacity-85 active:scale-95">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* DETAILED BOOKING MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[32px] max-w-md w-full p-6 shadow-2xl animate-scaleUp mx-4">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/60 pb-3">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">clinical_notes</span>
                Booking Details
              </h3>
              <button 
                onClick={() => setSelectedAppointment(null)} 
                className="p-1 hover:bg-surface-container-high rounded-full cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-secondary block">close</span>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/40">
                <img 
                  src={getDoctorPhoto(selectedAppointment)} 
                  alt={selectedAppointment.doctorName || selectedAppointment.doctorId?.name}
                  onError={(e) => handleDoctorImageError(e, selectedAppointment.doctorName || selectedAppointment.doctorId?.name)}
                  className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                />
                <div>
                  <h4 className="font-bold text-on-surface text-base text-left">
                    {selectedAppointment.doctorName || selectedAppointment.doctorId?.name || 'Practitioner'}
                  </h4>
                  <p className="text-secondary text-xs font-medium text-left">
                    {selectedAppointment.doctorId?.title || selectedAppointment.doctorId?.specialization || 'Wellness Specialist'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white/70 rounded-2xl border border-outline-variant/40 space-y-3">
                <div className="flex justify-between border-b border-outline-variant/35 pb-2">
                  <span className="text-secondary font-medium">Consultation Date</span>
                  <span className="font-bold text-on-surface text-right">
                    {selectedAppointment.date || (selectedAppointment.appointmentDate ? new Date(selectedAppointment.appointmentDate).toLocaleDateString() : 'N/A')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/35 pb-2">
                  <span className="text-secondary font-medium">Consultation Time</span>
                  <span className="font-bold text-on-surface text-right">{selectedAppointment.time || selectedAppointment.appointmentTime}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/35 pb-2">
                  <span className="text-secondary font-medium">Patient Name</span>
                  <span className="font-bold text-on-surface text-right">{selectedAppointment.patientName}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/35 pb-2">
                  <span className="text-secondary font-medium">Contact Phone</span>
                  <span className="font-semibold text-on-surface text-right">{selectedAppointment.patientPhone}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/35 pb-2">
                  <span className="text-secondary font-medium">Contact Email</span>
                  <span className="font-semibold text-on-surface text-right truncate max-w-[180px]">{selectedAppointment.patientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-medium">Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    selectedAppointment.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedAppointment.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              {selectedAppointment.symptoms && (
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50 text-left">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">Symptoms & Patient Notes</span>
                  <p className="text-xs text-on-surface-variant italic">"{selectedAppointment.symptoms}"</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedAppointment(null)} 
              className="mt-6 w-full bg-primary hover:opacity-90 text-white font-bold py-3 rounded-full transition-all text-sm cursor-pointer shadow-md"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
