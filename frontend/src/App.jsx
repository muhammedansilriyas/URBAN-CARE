import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import API from './services/api.js';
import { authSuccess } from './store/slices/authSlice.js';

// Pages
import Home from './pages/Home.jsx';
import Departments from './pages/Departments.jsx';
import Doctors from './pages/Doctors.jsx';
import DoctorProfile from './pages/DoctorProfile.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import Contact from './pages/Contact.jsx';
import Announcements from './pages/Announcements.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Lock Admin users to the admin side only
  if (isAuthenticated && user?.role === 'Admin' && !isAdminRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-body-md selection:bg-primary-container overflow-x-hidden">

      {!isAdminRoute && <Navbar />}
      
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Patient Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Patient', 'Admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute allowedRoles={['Patient', 'Admin']}>
                <BookAppointment />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['Patient', 'Admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
