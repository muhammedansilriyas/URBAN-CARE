import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role not allowed - display premium access denied view
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-center p-6 animate-fadeIn">
        <span className="material-symbols-outlined text-rose-600 text-6xl mb-4">gpp_bad</span>
        <h1 className="font-display-lg text-display-lg text-rose-600 mb-2 font-bold">Access Denied</h1>
        <p className="text-on-surface-variant font-body-lg text-body-lg max-w-sm mb-6 leading-relaxed">
          You do not have permission to access this resource. Administrator privileges are required.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-6 py-3 bg-primary text-on-primary font-semibold rounded-full shadow hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          >
            Go to Home
          </button>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-6 py-3 bg-surface-container border border-outline-variant text-on-surface font-semibold rounded-full hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer"
          >
            Login Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
