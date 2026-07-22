import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api.js';
import { getDoctorPhoto, handleDoctorImageError } from '../utils/doctorHelper.js';

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Wizard Step State: 1 | 2 | 3 | 'success'
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields State
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDate, setSelectedDate] = useState('Oct 7, 2026');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientAge, setPatientAge] = useState(user?.age || '');
  const [patientGender, setPatientGender] = useState(user?.gender || 'Male');
  const [symptoms, setSymptoms] = useState('');

  // Collections Lists
  const [depts, setDepts] = useState([]);
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Load departments and doctors metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data: deptData } = await API.get('/departments');
        setDepts(deptData);
        const { data: docData } = await API.get('/doctors');
        setDocs(docData);
      } catch (err) {
        // Fallbacks matching spec design
        setDepts([
          { _id: 'cardiology', name: 'Internal Vitality', description: 'Metabolic harmony and cellular health.', icon: 'vital_signs' },
          { _id: 'neurology', name: 'Neurological Balance', description: 'Optimizing cognitive rhythm & resilience.', icon: 'psychology' },
          { _id: 'orthopedics', name: 'Physical Restoration', description: 'Somatic recovery & biomechanics.', icon: 'self_care' },
          { _id: 'pediatrics', name: 'Nutritional Alchemy', description: 'Custom bio-nutrition for peak human performance.', icon: 'ecg_heart' },
          { _id: 'dermatology', name: 'Dermatological Care', description: 'Expert clinical skin and cellular rehabilitation.', icon: 'face' }
        ]);
        let fallbackDocsList = [
          {
            _id: '1',
            name: 'Dr. Anand Kumar A',
            specialization: 'Neurological Balance',
            department: { _id: 'neurology' },
            rating: 4.9,
            title: 'Neuroscience Specialist',
            imageUrl: '/dr-anand-kumar.png'
          },
          {
            _id: '2',
            name: 'Dr. Balaji Srimurugan',
            specialization: 'Internal Vitality',
            department: { _id: 'cardiology' },
            rating: 4.9,
            title: 'Cardiology Specialist',
            imageUrl: '/dr-balaji-srimurugan.png'
          },
          {
            _id: '3',
            name: 'Dr. Anjali Murali',
            specialization: 'Internal Vitality',
            department: { _id: 'cardiology' },
            rating: 5.0,
            title: 'Oncology Director',
            imageUrl: '/dr-anjali-murali.png'
          },
          {
            _id: '4',
            name: 'Dr. Aiswarya R Kamath',
            specialization: 'Physical Restoration',
            department: { _id: 'orthopedics' },
            rating: 4.8,
            title: 'Orthopedics Surgeon',
            imageUrl: '/dr-aiswarya-r-kamath.png'
          },
          {
            _id: '5',
            name: 'Dr. Balu Vaidyanathan',
            specialization: 'Internal Vitality',
            department: { _id: 'cardiology' },
            rating: 4.9,
            title: 'Senior Cardiac Specialist',
            imageUrl: '/dr-balu-vaidyanathan.png'
          },
          {
            _id: '6',
            name: 'Dr. Saraf Udit Umesh',
            specialization: 'Neurological Balance',
            department: { _id: 'neurology' },
            rating: 5.0,
            title: 'Neurology Expert',
            imageUrl: '/dr-saraf-udit-umesh.png'
          },
          {
            _id: '7',
            name: 'Dr. Praveena N B',
            specialization: 'Nutritional Alchemy',
            department: { _id: 'pediatrics' },
            rating: 4.8,
            title: 'Bio-Nutrition Expert',
            imageUrl: '/dr-praveena-n-b.png'
          },
          {
            _id: '8',
            name: 'Dr. Rakesh M. P.',
            specialization: 'Internal Vitality',
            department: { _id: 'cardiology' },
            rating: 4.7,
            title: 'Vitality Coordinator',
            imageUrl: '/dr-rakesh-m-p.png'
          },
          {
            _id: '9',
            name: 'Dr. Soumya Jagadeesan',
            specialization: 'Dermatological Care',
            department: { _id: 'dermatology' },
            rating: 4.9,
            title: 'Dermatology Consultant',
            imageUrl: '/dr-soumya-jagadeesan.png'
          }
        ];
        setDocs(fallbackDocsList);
      }
    };
    fetchMetadata();
  }, []);

  // Pre-load parameters from Doctors search router triggers
  useEffect(() => {
    if (location.state?.departmentId && depts.length > 0) {
      setSelectedDept(location.state.departmentId);
    }
    if (location.state?.doctorId && docs.length > 0) {
      const match = docs.find((d) => d._id === location.state.doctorId);
      if (match) {
        setSelectedDoc(match);
        const deptId = match.department?._id || match.specialization.toLowerCase();
        setSelectedDept(deptId);
        setCurrentStep(3);
      }
    }
  }, [location.state, depts, docs]);

  // Filter Doctors list based on selected department
  useEffect(() => {
    if (selectedDept) {
      const filtered = docs.filter(
        (d) =>
          d.department?._id === selectedDept ||
          d.specialization.toLowerCase() === selectedDept.toLowerCase() ||
          (selectedDept === 'cardiology' && d.specialization === 'Internal Vitality') ||
          (selectedDept === 'neurology' && d.specialization === 'Neurological Balance') ||
          (selectedDept === 'orthopedics' && d.specialization === 'Physical Restoration') ||
          (selectedDept === 'pediatrics' && d.specialization === 'Nutritional Alchemy') ||
          (selectedDept === 'dermatology' && d.specialization === 'Dermatological Care')
      );
      setFilteredDocs(filtered);
      if (
        selectedDoc &&
        selectedDoc.department?._id !== selectedDept &&
        selectedDoc.specialization.toLowerCase() !== selectedDept.toLowerCase()
      ) {
        setSelectedDoc(null);
      }
    } else {
      setFilteredDocs(docs);
    }
  }, [selectedDept, docs]);

  const handleSubmit = async () => {
    // 5. Log the booking data before submission
    console.log('Booking Data before validation/submission:', {
      selectedDept,
      selectedDoc: selectedDoc?._id,
      selectedTime,
      selectedDate,
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      patientGender,
      symptoms,
    });

    // 1 & 7. Find why the validation is failing and show the specific missing fields
    const missingFields = [];
    if (!selectedDept) missingFields.push('Department');
    if (!selectedDoc) missingFields.push('Doctor/Specialist');
    if (!selectedTime) missingFields.push('Appointment Time');
    if (!selectedDate) missingFields.push('Appointment Date');
    if (!patientName) missingFields.push('Patient Name');
    if (!patientPhone) missingFields.push('Patient Phone');
    if (!patientEmail) missingFields.push('Patient Email');
    if (!patientAge) missingFields.push('Patient Age');
    if (!patientGender) missingFields.push('Patient Gender');
    if (!symptoms) missingFields.push('Symptoms');

    if (missingFields.length > 0) {
      alert(`Please fill out all required fields. Missing: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    // 6. Fix the API request so all fields are sent correctly
    const payload = {
      patientId: user?._id || 'mock_patient',
      doctorId: selectedDoc?._id,
      departmentId: selectedDept,
      patientName,
      patientPhone,
      patientEmail,
      patientGender,
      patientAge: Number(patientAge),
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      symptoms,
    };

    try {
      const { data } = await API.post('/appointments', payload);
      
      // Clean up any legacy local cache to enforce database sync
      localStorage.removeItem('local_appointments');

      setCurrentStep('success');
      window.dispatchEvent(new Event('appointmentBooked'));
    } catch (err) {
      if (err.response) {
        alert(err.response.data?.message || 'Server error occurred during booking. Please try again.');
      } else {
        console.error('API booking error:', err);
        alert(err.message || 'Network error while contacting booking server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDeptName = () => {
    const dept = depts.find(d => d._id === selectedDept || d.name.toLowerCase() === selectedDept.toLowerCase());
    return dept ? dept.name : 'Pending selection';
  };

  return (
    <div className="bg-background text-on-surface min-h-screen relative overflow-hidden font-body-md">
      
      {/* Background Accent Blobs */}
      <div className="organic-blob bg-primary/10 w-[600px] h-[600px] -top-40 -right-40 absolute pointer-events-none rounded-full blur-[80px]" />
      <div className="organic-blob bg-[#646e57]/10 w-[400px] h-[400px] bottom-0 -left-20 absolute pointer-events-none rounded-full blur-[80px]" />

      <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pt-32 pb-20">
        
        {currentStep === 'success' ? (
          /* SUCCESS SCREEN */
          <div className="flex flex-col items-center justify-center max-w-xl mx-auto py-10">
            <div className="bg-surface-container-low border border-outline-variant p-8 md:p-12 rounded-[40px] shadow-2xl w-full text-center space-y-6">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-4xl scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-amber-600">Booking Requested!</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Your consultation request with <span className="font-bold text-on-surface">{selectedDoc?.name}</span> has been submitted for <span className="font-bold text-on-surface">{selectedDate}</span> at <span className="font-bold text-on-surface">{selectedTime}</span>.
              </p>
              
              <div className="p-6 bg-white/70 rounded-3xl border border-outline-variant/40 space-y-3 text-left">
                <div className="flex justify-between border-b border-outline-variant/35 pb-2 text-sm">
                  <span className="text-secondary font-medium">Booking Status</span>
                  <span className="font-bold text-amber-600 bg-amber-50/50 px-2 py-0.5 rounded-md border border-amber-200">Pending Approval</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/35 pb-2 text-sm">
                  <span className="text-secondary font-medium">Department</span>
                  <span className="font-semibold">{getDeptName()}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/35 pb-2 text-sm">
                  <span className="text-secondary font-medium">Patient Reference</span>
                  <span className="font-semibold">{patientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary font-medium">Consultation Fee</span>
                  <span className="font-semibold">$180.00</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-primary text-white py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                >
                  Print Schedule Receipt
                  <span className="material-symbols-outlined text-[18px]">print</span>
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-inverse-surface text-surface py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                >
                  Proceed to Payment
                  <span className="material-symbols-outlined text-[18px]">credit_card</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 border border-outline rounded-full font-bold text-secondary hover:bg-surface-container transition-colors cursor-pointer text-center text-sm"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* BOOKING VIEW */
          <div className="flex flex-col lg:flex-row gap-gutter relative items-start">
            
            {/* Left Column: Interactive Booking Wizard */}
            <div className="flex-grow w-full lg:max-w-[800px]">
              
              <header className="mb-12">
                <h1 className="font-display-lg text-display-lg text-primary font-black leading-none mb-2">Reserve Your Session</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Guided steps toward biological harmony and holistic vitality.</p>
              </header>

              {/* Dynamic Step Progress Indicator */}
              <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-2 select-none">
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep === 1 ? 'bg-primary text-white' : currentStep > 1 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {currentStep > 1 ? <span className="material-symbols-outlined text-[18px] font-bold">check</span> : '1'}
                  </div>
                  <span className={`font-label-sm text-label-sm uppercase tracking-widest ${currentStep === 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Department</span>
                </div>
                
                <div className="h-[2px] w-12 bg-outline-variant"></div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep === 2 ? 'bg-primary text-white' : currentStep > 2 ? 'bg-secondary text-white' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {currentStep > 2 ? <span className="material-symbols-outlined text-[18px] font-bold">check</span> : '2'}
                  </div>
                  <span className={`font-label-sm text-label-sm uppercase tracking-widest ${currentStep === 2 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Specialist</span>
                </div>
                
                <div className="h-[2px] w-12 bg-outline-variant"></div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep === 3 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>3</div>
                  <span className={`font-label-sm text-label-sm uppercase tracking-widest ${currentStep === 3 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Schedule</span>
                </div>
              </div>

              {/* STEP 1: Select Department */}
              {currentStep === 1 && (
                <section className="step-transition">
                  <div className="flex flex-col gap-8">
                    <button 
                      onClick={() => navigate(-1)}
                      className="flex items-center gap-2 text-primary hover:gap-4 transition-all w-fit font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      <span className="font-label-sm uppercase tracking-widest">Back</span>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {depts.map((d) => (
                      <button
                        key={d._id}
                        onClick={() => {
                          setSelectedDept(d._id);
                          setCurrentStep(2);
                        }}
                        className={`group text-left p-8 rounded-3xl bg-surface-container-low hover:bg-secondary-container transition-all duration-500 shadow-xl shadow-primary/5 flex flex-col gap-6 items-start active:scale-[0.98] cursor-pointer border ${
                          selectedDept === d._id ? 'border-primary-container bg-secondary-container' : 'border-transparent'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                          <span className="material-symbols-outlined text-3xl">{d.icon || 'medical_services'}</span>
                        </div>
                        <div>
                          <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold leading-tight">{d.name}</h3>
                          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{d.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

              {/* STEP 2: Specialist Selection */}
              {currentStep === 2 && (
                <section className="step-transition">
                  <div className="flex flex-col gap-8">
                    <button 
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2 text-primary hover:gap-4 transition-all w-fit font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      <span className="font-label-sm uppercase tracking-widest">Back to Departments</span>
                    </button>
                    
                    {filteredDocs.length === 0 ? (
                      <div className="p-10 text-center bg-surface-container-low rounded-3xl border border-outline-variant/40">
                        <p className="text-secondary italic text-body-md">No wellness specialists currently registered in this department.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocs.map((doc) => (
                          <div
                            key={doc._id}
                            onClick={() => {
                              setSelectedDoc(doc);
                              setCurrentStep(3);
                            }}
                            className={`group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer shadow-2xl shadow-primary/10 active:scale-[0.98] transition-transform border ${
                              selectedDoc?._id === doc._id ? 'border-primary ring-4 ring-primary-container' : 'border-transparent'
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 to-transparent z-10 opacity-70 group-hover:opacity-85 transition-opacity"></div>
                            <img 
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                              alt={doc.name} 
                              src={getDoctorPhoto(doc)} 
                              onError={(e) => handleDoctorImageError(e, doc.name)}
                            />
                            <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                              <h4 className="text-white font-headline-md text-headline-md mb-1 font-bold leading-tight">{doc.name}</h4>
                              <p className="text-white/80 font-label-sm text-label-sm uppercase tracking-widest">{doc.title || 'Wellness Coordinator'}</p>
                              <div className="mt-4 py-2 px-4 rounded-full bg-white/20 backdrop-blur-md text-white font-label-sm text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                View Schedule
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* STEP 3: Schedule Selection & Credentials */}
              {currentStep === 3 && (
                <section className="step-transition">
                  <div className="flex flex-col gap-8">
                    <button 
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-2 text-primary hover:gap-4 transition-all w-fit font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                      <span className="font-label-sm uppercase tracking-widest">Change Specialist</span>
                    </button>

                    <div className="bg-surface-container-low p-8 md:p-10 rounded-[40px] shadow-xl shadow-primary/5 space-y-8">
                      <div className="flex flex-col md:flex-row gap-10">
                        {/* Calendar Column */}
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-8">
                            <h4 className="font-headline-md text-headline-md font-bold text-primary">October 2026</h4>
                            <div className="flex gap-2">
                              <button type="button" className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white transition-colors cursor-pointer"><span className="material-symbols-outlined">chevron_left</span></button>
                              <button type="button" className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white transition-colors cursor-pointer"><span className="material-symbols-outlined">chevron_right</span></button>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-secondary mb-4 select-none">
                            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                          </div>
                          
                          <div className="grid grid-cols-7 gap-1.5">
                            <div className="aspect-square flex items-center justify-center text-on-surface-variant/30 text-sm">28</div>
                            <div className="aspect-square flex items-center justify-center text-on-surface-variant/30 text-sm">29</div>
                            <div className="aspect-square flex items-center justify-center text-on-surface-variant/30 text-sm">30</div>
                            
                            {[1, 2, 3, 4, 5, 6].map((day) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedDate(`Oct ${day}, 2026`)}
                                className={`aspect-square flex items-center justify-center rounded-full text-sm font-semibold hover:bg-secondary-container transition-colors cursor-pointer ${
                                  selectedDate === `Oct ${day}, 2026` ? 'bg-primary text-white' : 'bg-white/40'
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => setSelectedDate('Oct 7, 2026')}
                              className={`aspect-square flex items-center justify-center rounded-full text-sm font-bold cursor-pointer ring-4 ring-primary-container ${
                                selectedDate === 'Oct 7, 2026' ? 'bg-primary text-white' : 'bg-white border-2 border-primary'
                              }`}
                            >
                              7
                            </button>

                            {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((day) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedDate(`Oct ${day}, 2026`)}
                                className={`aspect-square flex items-center justify-center rounded-full text-sm font-semibold hover:bg-secondary-container transition-colors cursor-pointer ${
                                  selectedDate === `Oct ${day}, 2026` ? 'bg-primary text-white' : 'bg-white/40'
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Timeslots Column */}
                        <div className="w-full md:w-60 flex flex-col gap-3">
                          <h4 className="font-headline-md text-headline-md font-bold text-primary mb-4">Available Times</h4>
                          {['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'].map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`py-3.5 rounded-full border-2 text-center font-bold text-sm transition-all active:scale-[0.98] cursor-pointer ${
                                selectedTime === time
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-primary-fixed-dim hover:bg-primary-container text-on-surface'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Credentials Input Overlay inside Step 3 */}
                      <div className="border-t border-outline-variant/30 pt-8 space-y-6">
                        <h4 className="font-headline-md text-headline-md font-bold text-primary">Patient Credentials</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-1">
                            <label className="text-label-sm font-bold text-secondary uppercase tracking-wider">Full Name</label>
                            <input
                              type="text"
                              required
                              value={patientName}
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder="Adrian Sterling"
                              className="w-full bg-transparent underlined-input py-2 text-label-md outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-label-sm font-bold text-secondary uppercase tracking-wider">Contact Number</label>
                            <input
                              type="tel"
                              required
                              value={patientPhone}
                              onChange={(e) => setPatientPhone(e.target.value)}
                              placeholder="+1 (555) 000-0000"
                              className="w-full bg-transparent underlined-input py-2 text-label-md outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-label-sm font-bold text-secondary uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            required
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            placeholder="adrian@sterling.com"
                            className="w-full bg-transparent underlined-input py-2 text-label-md outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-1">
                            <label className="text-label-sm font-bold text-secondary uppercase tracking-wider">Age</label>
                            <input
                              type="number"
                              required
                              value={patientAge}
                              onChange={(e) => setPatientAge(e.target.value)}
                              placeholder="e.g. 28"
                              className="w-full bg-transparent underlined-input py-2 text-label-md outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-label-sm font-bold text-secondary uppercase tracking-wider">Gender</label>
                            <select
                              value={patientGender}
                              onChange={(e) => setPatientGender(e.target.value)}
                              className="w-full bg-transparent underlined-input py-2 text-label-md outline-none text-slate-700"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-label-sm font-bold text-secondary uppercase tracking-wider">Symptoms & Notes</label>
                          <input
                            type="text"
                            required
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Briefly describe metabolic or cognitive concerns..."
                            className="w-full bg-transparent underlined-input py-2 text-label-md outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full md:w-fit self-end py-4 px-12 rounded-full bg-primary text-white font-bold text-base shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
                    >
                      {loading ? 'Confirming...' : 'Confirm Consultation'}
                    </button>
                  </div>
                </section>
              )}

            </div>

            {/* Right Column: Booking Summary Sidebar */}
            <aside className="w-full lg:w-[360px] lg:sticky lg:top-32 bg-surface-container/50 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-2xl shadow-primary/5">
              <h2 className="font-headline-md text-headline-md text-primary mb-8 font-bold">Session Details</h2>
              <div className="space-y-8 text-on-surface">
                
                {/* Department Info */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined fill-icon">category</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-widest block mb-1">Department</span>
                    <p className="font-body-lg text-body-lg font-bold">{selectedDept ? getDeptName() : 'Pending selection'}</p>
                  </div>
                </div>

                {/* Specialist Info */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined fill-icon">person</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-widest block mb-1">Specialist</span>
                    <p className="font-body-lg text-body-lg font-bold">
                      {selectedDoc ? `${selectedDoc.name}` : 'Pending selection'}
                    </p>
                  </div>
                </div>

                {/* Date & Time Info */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined fill-icon">calendar_month</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-widest block mb-1">Date & Time</span>
                    <p className="font-body-lg text-body-lg font-bold">
                      {selectedDept && selectedDoc && selectedTime ? `${selectedDate} • ${selectedTime}` : 'Pending selection'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Consultation Fees block */}
              <div className="mt-12 pt-8 border-t border-outline-variant/30">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-body-md font-medium text-secondary">Consultation Fee</span>
                  <span className="font-headline-md text-headline-md font-bold text-primary">$180.00</span>
                </div>
                <p className="font-label-sm text-on-surface-variant italic leading-relaxed text-sm">
                  Session includes comprehensive biomarker review and personalized vitality roadmap.
                </p>
              </div>
            </aside>

          </div>
        )}

      </main>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[32px] max-w-md w-full p-8 shadow-2xl animate-scaleUp mx-4 relative overflow-hidden">
            
            {/* Background glowing blob */}
            <div className="organic-blob bg-primary/10 w-48 h-48 absolute -top-10 -right-10 rounded-full blur-xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                Secure Checkout
              </h3>
              {!paymentLoading && (
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentCompleted(false);
                  }} 
                  className="p-1 hover:bg-surface-container-high rounded-full cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary block">close</span>
                </button>
              )}
            </div>

            {paymentCompleted ? (
              /* PAYMENT SUCCESS SCREEN */
              <div className="text-center space-y-6 py-6 relative z-10">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                  <span className="material-symbols-outlined text-4xl scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-emerald-700">Payment Successful!</h4>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Thank you. Your consultation payment of <span className="font-bold text-on-surface">$180.00</span> has been successfully processed and verified.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentCompleted(false);
                    }}
                    className="w-full bg-primary text-white py-3.5 rounded-full font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* CARD PAYMENT FORM */
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setPaymentLoading(true);
                  setTimeout(() => {
                    setPaymentLoading(false);
                    setPaymentCompleted(true);
                  }, 2000);
                }}
                className="space-y-6 relative z-10"
              >
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/65 text-sm space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-secondary font-medium">Service</span>
                    <span className="font-bold text-on-surface">{getDeptName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary font-medium">Specialist</span>
                    <span className="font-bold text-on-surface">{selectedDoc?.name}</span>
                  </div>
                  <div className="flex justify-between border-t border-outline-variant/30 pt-2 font-bold text-base">
                    <span className="text-on-surface">Total Due</span>
                    <span className="text-primary">$180.00</span>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">Cardholder Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Adrian Sterling"
                      defaultValue={patientName}
                      className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-white outline-none focus:border-primary transition-colors text-on-surface font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">Card Number</label>
                    <div className="relative flex items-center">
                      <input 
                        type="text"
                        required
                        maxLength="19"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                          const matches = v.match(/\d{4,16}/g);
                          const match = (matches && matches[0]) || '';
                          const parts = [];
                          for (let i=0, len=match.length; i<len; i+=4) {
                            parts.push(match.substring(i, i+4));
                          }
                          if (parts.length > 0) {
                            setCardNumber(parts.join(' '));
                          } else {
                            setCardNumber(v);
                          }
                        }}
                        className="w-full pl-11 pr-4 py-3 border border-outline-variant rounded-xl text-sm bg-white outline-none focus:border-primary transition-colors text-on-surface font-semibold"
                      />
                      <span className="material-symbols-outlined text-secondary absolute left-4 text-[20px]">credit_card</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-secondary uppercase tracking-wider">Expiry Date</label>
                      <input 
                        type="text"
                        required
                        maxLength="5"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, '');
                          if (v.length >= 2) {
                            setCardExpiry(`${v.slice(0, 2)}/${v.slice(2, 4)}`);
                          } else {
                            setCardExpiry(v);
                          }
                        }}
                        className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-white outline-none focus:border-primary transition-colors text-center text-on-surface font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-secondary uppercase tracking-wider">CVV</label>
                      <input 
                        type="password"
                        required
                        maxLength="3"
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-4 py-3 border border-outline-variant rounded-xl text-sm bg-white outline-none focus:border-primary transition-colors text-center font-bold tracking-widest text-on-surface"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={paymentLoading}
                  className="w-full bg-primary hover:opacity-90 text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      Pay $180.00
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
