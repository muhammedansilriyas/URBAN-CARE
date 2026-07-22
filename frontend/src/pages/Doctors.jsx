import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchStart, fetchSuccess, fetchFail } from '../store/slices/doctorSlice.js';
import API from '../services/api.js';
import { getDoctorPhoto, handleDoctorImageError } from '../utils/doctorHelper.js';

const Doctors = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { doctors, loading } = useSelector((state) => state.doctors);
  const { user } = useSelector((state) => state.auth);

  // Filters Drawer State
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter Values
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]); // Array support for multiple specialties
  const [experienceLevel, setExperienceLevel] = useState('All'); // Attending, Registrar, Clinical Director, All

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Initialize search or specialty parameters passed from the Home page bento/search bar
  useEffect(() => {
    if (location.state?.initialSearch) {
      setSearchTerm(location.state.initialSearch);
    }
    if (location.state?.initialSpecialty) {
      setSelectedSpecialties([location.state.initialSpecialty]);
    }
  }, [location.state]);

  useEffect(() => {
    const loadDoctors = async () => {
      dispatch(fetchStart());
      try {
        const { data } = await API.get('/doctors');
        dispatch(fetchSuccess(data));
      } catch (err) {
        dispatch(fetchFail(err.response?.data?.message || err.message));
        dispatch(fetchSuccess([]));
      }
    };
    loadDoctors();
  }, [dispatch]);

  // Filtering Logic
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialties.length === 0 || 
                             selectedSpecialties.includes(doc.specialization);

    const matchesSeniority = experienceLevel === 'All' || 
                             (doc.seniority && doc.seniority.toLowerCase() === experienceLevel.toLowerCase());

    return matchesSearch && matchesSpecialty && matchesSeniority;
  });

  // Reset pagination page on search / filter alteration
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialties, experienceLevel]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSpecialtyToggle = (spec) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const handleBookRedirect = (doc) => {
    navigate('/book-appointment', {
      state: {
        doctorId: doc._id,
        departmentId: doc.specialization.toLowerCase()
      }
    });
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      
      {/* Main Content Canvas */}
      <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1920px] mx-auto min-h-screen">
        
        {/* Header Section with Asymmetrical Negative Space */}
        <header className="grid grid-cols-12 mb-16 items-start gap-4">
          <div className="col-span-12 md:col-span-8 flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <h1 className="font-display-lg text-display-lg mb-6 leading-none text-on-surface">Clinical Specialists</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Our roster represents the convergence of architectural precision and medical excellence. Filter by department or expertise to find your primary care architect.
              </p>
            </div>
            
            {/* Filter Toggle Button */}
            <button 
              onClick={() => setFilterOpen(true)}
              className="p-3 border border-outline-variant bg-white/60 hover:bg-surface-container-high rounded-full transition-all flex items-center justify-center text-primary cursor-pointer shadow-sm w-fit self-end mt-4 md:mt-0"
              title="Open Filters Pane"
            >
              <span className="material-symbols-outlined text-[24px]">tune</span>
            </button>
          </div>
          <div className="hidden md:block col-span-4" />
        </header>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20 bg-white/60 border border-outline-variant rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-4xl text-secondary mb-2">person_search</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">No Specialists Found</h3>
            <p className="text-on-surface-variant text-body-md mt-1">Try modifying your filter parameters or search queries.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialties([]);
                setExperienceLevel('All');
              }}
              className="mt-6 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Asymmetrical Grid: 0,3 col-span-8, 1,2 col-span-4 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              {paginatedDoctors.map((doc, index) => {
                const modIndex = index % 4;

                // Modulo Card 1: Large Weight, Image Left, Text Right (col-span-8)
                if (modIndex === 0) {
                  return (
                    <div 
                      key={doc._id} 
                      onClick={() => handleBookRedirect(doc)}
                      className="col-span-12 lg:col-span-8 group cursor-pointer"
                    >
                      <div className="doctor-card-hover bg-white/60 backdrop-blur border border-outline-variant/35 p-6 md:p-gutter h-auto lg:h-[500px] flex flex-col lg:flex-row gap-gutter relative overflow-hidden rounded-xl shadow-sm hover:shadow-md">
                        <div className="w-full lg:w-1/2 h-64 lg:h-full bg-surface-container-high overflow-hidden rounded-lg border border-outline-variant/20">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={doc.name}
                            src={getDoctorPhoto(doc)}
                            onError={(e) => handleDoctorImageError(e, doc.name)}
                          />
                        </div>
                        <div className="w-full lg:w-1/2 flex flex-col justify-between py-2">
                          <div className="space-y-4">
                            <span className="font-label-sm text-label-sm tracking-[0.2em] text-primary mb-2 block uppercase font-bold">{doc.specialization}</span>
                            <h2 className="font-headline-lg text-headline-lg mb-4 text-on-surface">{doc.name}</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3 md:line-clamp-4">
                              {doc.description || 'Dedicated to providing high-end clinical treatment and personalized patient diagnostics.'}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              <span className="px-3 py-1 bg-surface-container font-label-sm text-label-sm uppercase tracking-wider rounded font-medium text-secondary">{doc.school || 'Harvard Medical'}</span>
                              <span className="px-3 py-1 bg-surface-container font-label-sm text-label-sm uppercase tracking-wider rounded font-medium text-secondary">{doc.experience}+ Yrs Exp</span>
                            </div>
                          </div>
                          <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-center mt-6">
                            <div className="font-label-md text-label-md text-on-surface font-semibold">{doc.status || 'Available Today'}</div>
                            <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Modulo Card 2 & 3: Standard Weight, Vertical Image on Top (col-span-4)
                if (modIndex === 1 || modIndex === 2) {
                  return (
                    <div 
                      key={doc._id} 
                      onClick={() => handleBookRedirect(doc)}
                      className="col-span-12 md:col-span-6 lg:col-span-4 group cursor-pointer"
                    >
                      <div className="doctor-card-hover bg-white/60 backdrop-blur border border-outline-variant/35 p-6 md:p-gutter h-auto lg:h-[500px] flex flex-col gap-6 relative overflow-hidden rounded-xl shadow-sm hover:shadow-md">
                        <div className="w-full h-64 bg-surface-container-high overflow-hidden rounded-lg border border-outline-variant/20">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={doc.name}
                            src={getDoctorPhoto(doc)}
                            onError={(e) => handleDoctorImageError(e, doc.name)}
                          />
                        </div>
                        <div className="flex flex-col flex-grow justify-between">
                          <div className="space-y-2">
                            <span className="font-label-sm text-label-sm tracking-[0.2em] text-primary mb-1 block uppercase font-bold">{doc.specialization}</span>
                            <h2 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">{doc.name}</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
                              {doc.description || ' হেমোodynamic monitoring and structural heart interventions.'}
                            </p>
                          </div>
                          <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-center mt-4">
                            <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">BOOK CONSULTATION</span>
                            <span className="material-symbols-outlined text-primary font-bold">add</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Modulo Card 4: Large Weight, Image Right, Text Left (col-span-8, flex-row-reverse)
                if (modIndex === 3) {
                  return (
                    <div 
                      key={doc._id} 
                      onClick={() => handleBookRedirect(doc)}
                      className="col-span-12 lg:col-span-8 group cursor-pointer"
                    >
                      <div className="doctor-card-hover bg-white/60 backdrop-blur border border-outline-variant/35 p-6 md:p-gutter h-auto lg:h-[500px] flex flex-col lg:flex-row-reverse gap-gutter relative overflow-hidden rounded-xl shadow-sm hover:shadow-md">
                        <div className="w-full lg:w-1/2 h-64 lg:h-full bg-surface-container-high overflow-hidden rounded-lg border border-outline-variant/20">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={doc.name}
                            src={getDoctorPhoto(doc)}
                            onError={(e) => handleDoctorImageError(e, doc.name)}
                          />
                        </div>
                        <div className="w-full lg:w-1/2 flex flex-col justify-between py-2 text-left">
                          <div className="space-y-4">
                            <span className="font-label-sm text-label-sm tracking-[0.2em] text-primary mb-2 block uppercase font-bold">{doc.specialization}</span>
                            <h2 className="font-headline-lg text-headline-lg mb-4 text-on-surface">{doc.name}</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3 md:line-clamp-4">
                              {doc.description || 'Expert in clinical surgical reconstruction, orthopedic skeletal repair, and biomechanical innovation.'}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              <span className="px-3 py-1 bg-surface-container font-label-sm text-label-sm uppercase tracking-wider rounded font-medium text-secondary">{doc.school || 'Johns Hopkins'}</span>
                              <span className="px-3 py-1 bg-surface-container font-label-sm text-label-sm uppercase tracking-wider rounded font-medium text-secondary">{doc.experience}+ Yrs Exp</span>
                            </div>
                          </div>
                          <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-center mt-6">
                            <div className="font-label-md text-label-md text-on-surface font-semibold">{doc.status || 'Available Today'}</div>
                            <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">calendar_today</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-md">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex gap-sm">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg border font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-primary text-on-primary border-primary'
                          : 'border-outline-variant hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}

      </main>

      {/* Slide-out Filter Pane Backdrop */}
      {filterOpen && (
        <div 
          onClick={() => setFilterOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300"
        />
      )}

      {/* Slide-out Filter Drawer Pane */}
      <aside className={`fixed top-0 right-0 h-screen w-80 bg-inverse-surface text-surface z-[70] transition-transform duration-300 p-8 flex flex-col shadow-2xl ${
        filterOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex justify-between items-center mb-12">
          <h3 className="font-headline-md text-headline-md font-bold tracking-tight text-white">Refine Search</h3>
          <button 
            onClick={() => setFilterOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow space-y-10 overflow-y-auto pr-2">
          {/* Search Inputs inside drawer */}
          <div className="space-y-2">
            <h4 className="font-label-sm text-label-sm tracking-[0.2em] text-primary-container uppercase font-semibold">Search Keywords</h4>
            <input 
              type="text" 
              placeholder="Search specialty, name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-outline bg-transparent text-white px-3 py-2 rounded focus:ring-0 outline-none text-sm"
            />
          </div>

          {/* Specialization Checkbox Group */}
          <div className="space-y-4">
            <h4 className="font-label-sm text-label-sm tracking-[0.2em] text-primary-container uppercase font-semibold">Specialization</h4>
            <div className="space-y-3">
              {['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Neuroscience', 'Dermatology'].map((spec) => (
                <label key={spec} className="flex items-center gap-3 cursor-pointer group select-none text-white/80">
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(spec)}
                    onChange={() => handleSpecialtyToggle(spec)}
                    className="w-4 h-4 rounded bg-transparent border-outline text-primary focus:ring-0"
                  />
                  <span className="font-label-md text-label-md group-hover:text-primary-container transition-colors font-medium">
                    {spec}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Seniority Options */}
          <div className="space-y-4">
            <h4 className="font-label-sm text-label-sm tracking-[0.2em] text-primary-container uppercase font-semibold">Seniority</h4>
            <div className="flex flex-col gap-2">
              {['All', 'Attending Physician', 'Specialist Registrar', 'Clinical Director'].map((level) => (
                <button
                  key={level}
                  onClick={() => setExperienceLevel(level === 'All' ? 'All' : level)}
                  className={`w-full text-left font-label-md text-label-md py-2 border-b border-white/10 hover:border-primary-container transition-colors cursor-pointer ${
                    experienceLevel.toLowerCase() === level.toLowerCase() ? 'text-primary-container border-primary-container font-bold' : 'text-white/60'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 mt-auto flex gap-2">
          <button 
            onClick={() => setFilterOpen(false)}
            className="flex-1 bg-primary text-white py-3 font-label-md text-label-md uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer rounded"
          >
            Apply Filters
          </button>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialties([]);
              setExperienceLevel('All');
            }}
            className="w-20 py-3 font-label-sm text-label-sm text-white/60 hover:text-white transition-colors cursor-pointer border border-white/15 rounded text-center"
          >
            Reset
          </button>
        </div>
      </aside>

    </div>
  );
};

export default Doctors;
