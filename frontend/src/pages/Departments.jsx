import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStart, fetchSuccess, fetchFail } from '../store/slices/departmentSlice.js';
import API from '../services/api.js';

const Departments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { departments, loading } = useSelector((state) => state.departments);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [timerText, setTimerText] = useState('00:00:00');

  // Load departments list
  useEffect(() => {
    const loadDepartments = async () => {
      dispatch(fetchStart());
      try {
        const { data } = await API.get('/departments');
        dispatch(fetchSuccess(data));
      } catch (err) {
        dispatch(fetchFail(err.response?.data?.message || err.message));
        // Fallback mockup departments aligned with MedCore theme icons and lead specialists
        dispatch(fetchSuccess([
          { _id: 'cardiology', name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnostics, and heart surgeries.', icon: 'favorite' },
          { _id: 'neurology', name: 'Neurology', description: 'Advanced treatment for brain, nerve, and spine-related complex conditions.', icon: 'psychology' },
          { _id: 'pediatrics', name: 'Pediatrics', description: 'Dedicated healthcare services, vaccination, and treatment for babies and children.', icon: 'child_care' },
          { _id: 'orthopedics', name: 'Orthopedics', description: 'Skeletal health, joint repairs, and sports medicine therapies.', icon: 'done' },
          { _id: 'dermatology', name: 'Dermatology', description: 'Expert care for skin, hair, and nail health conditions.', icon: 'face' },
          { _id: 'oncology', name: 'Oncology', description: 'Diagnosis and treatment of various types of cancer.', icon: 'biotech' },
        ]));
      }
    };
    loadDepartments();
  }, [dispatch]);

  // Elapsed Session Timer Logic
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      setTimerText(`${hours}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detailed mockup stats mapping to department items
  const getDeptDetails = (deptId) => {
    const details = {
      cardiology: { idCode: 'DEPT-01', lead: 'Dr. Balaji Srimurugan', slots: '04 Today', rating: '4.9', badge: 'Active', isHigh: false },
      neurology: { idCode: 'DEPT-02', lead: 'Dr. Anand Kumar A', slots: '02 Today', rating: '5.0', badge: 'Active', isHigh: false },
      pediatrics: { idCode: 'DEPT-03', lead: 'Dr. Praveena N B', slots: '08 Today', rating: '4.8', badge: 'Active', isHigh: false },
      orthopedics: { idCode: 'DEPT-04', lead: 'Dr. Aiswarya R Kamath', slots: '01 Today', rating: '4.8', badge: 'Active', isHigh: false },
      dermatology: { idCode: 'DEPT-05', lead: 'Dr. Soumya Jagadeesan', slots: '06 Today', rating: '4.9', badge: 'Active', isHigh: false },
      oncology: { idCode: 'DEPT-06', lead: 'Dr. Anjali Murali', slots: 'Waitlist Only', rating: '5.0', badge: 'High Demand', isHigh: true }
    };
    return details[deptId.toLowerCase()] || { idCode: 'DEPT-XX', lead: 'Senior Practitioner', slots: 'Available', rating: '4.8', badge: 'Active', isHigh: false };
  };

  const handleCardClick = (dept) => {
    navigate('/doctors', { state: { initialSpecialty: dept.name } });
  };

  const filteredDepts = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-background text-on-surface min-h-screen relative font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed">
      
      {/* Background Technical Grid Backdrop */}
      <div className="fixed inset-0 technical-grid-line pointer-events-none z-0"></div>

      <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-5xl mx-auto relative z-10 space-y-12">
        
        {/* Department Directory */}
        <div className="z-10 space-y-12">
          
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2 font-black leading-none">Department Selection</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Precision medical routing for St. Jude Premium members. Select a specialized unit for diagnostic consultation or ongoing clinical care.
            </p>
            
            {/* Search Input */}
            <div className="relative mt-6 w-full max-w-md">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary">search</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredDepts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-outline-variant/30 rounded-xl">
              <p className="text-secondary italic text-body-md">No medical departments match your keyword search.</p>
            </div>
          ) : (
            /* Department Asymmetrical Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/30 border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
              {filteredDepts.map((dept) => {
                const info = getDeptDetails(dept._id);
                return (
                  <div
                    key={dept._id}
                    onClick={() => handleCardClick(dept)}
                    className="bg-white p-8 group hover:bg-surface-container-low transition-all cursor-pointer border-outline-variant/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="material-symbols-outlined text-primary-fixed-dim text-4xl">{dept.icon || 'medical_services'}</span>
                        <div className="text-right">
                          <span className="block font-label-sm text-primary uppercase tracking-tighter opacity-60 text-[10px]">{info.idCode}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                            info.isHigh ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
                          }`}>
                            {info.badge}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-4 font-bold group-hover:text-primary transition-colors">{dept.name}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">{dept.description}</p>
                    </div>

                    <div className="space-y-3 font-label-sm border-t border-outline-variant/10 pt-4 text-on-surface">
                      <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                        <span className="text-on-surface-variant font-medium">Lead Specialist</span>
                        <span className="font-semibold">{info.lead}</span>
                      </div>
                      <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                        <span className="text-on-surface-variant font-medium">Available Slots</span>
                        <span className={`font-bold ${info.isHigh ? 'text-error' : 'text-primary'}`}>{info.slots}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant font-medium">Clinical Rating</span>
                        <span className="flex items-center gap-1 font-bold">
                          {info.rating} <span className="material-symbols-outlined text-yellow-600 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Stats Accents */}
          <div className="flex flex-wrap gap-8 py-6 border-t border-outline-variant/20 text-on-surface-variant select-none">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm uppercase tracking-widest text-[11px] font-bold">214 Active Practitioners</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span className="font-label-sm uppercase tracking-widest text-[11px] font-bold">99.8% System Uptime</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-outline"></span>
              <span className="font-label-sm uppercase tracking-widest text-[11px] font-bold">ISO 27001 Certified</span>
            </div>
          </div>

        </div>

      </main>

      {/* Floating Emergency Response FAB */}
      <button
        onClick={() => navigate('/contact')}
        className="fixed bottom-10 right-10 bg-error text-white w-16 h-16 shadow-2xl flex items-center justify-center rounded-full group hover:scale-110 transition-all z-50 cursor-pointer border border-white/25"
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
        <div className="absolute right-20 bg-white border border-outline-variant px-4 py-2 text-on-surface rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="font-label-sm uppercase tracking-widest text-error font-bold text-xs">Emergency Response</span>
        </div>
      </button>

    </div>
  );
};

export default Departments;
