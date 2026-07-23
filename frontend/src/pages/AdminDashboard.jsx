import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice.js';
import API from '../services/api.js';
import { getDoctorPhoto, handleDoctorImageError } from '../utils/doctorHelper.js';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const isDemo = token && token.startsWith('mocked_jwt_token');

  const [activeTab, setActiveTab] = useState('overview'); // tabs: overview, departments, doctors, appointments, messages, announcements, settings
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Settings States (Fetched directly from MongoDB)
  const [hospitalName, setHospitalName] = useState('Urban Care');
  const [hospitalPhone, setHospitalPhone] = useState('+1 (555) 019-2834');
  const [hospitalEmail, setHospitalEmail] = useState('contact@urbancare.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);

  useEffect(() => {
    const fetchHospitalInfo = async () => {
      try {
        const { data } = await API.get('/hospital');
        if (data) {
          if (data.name) setHospitalName(data.name);
          if (data.phone) setHospitalPhone(data.phone);
          if (data.email) setHospitalEmail(data.email);
        }
      } catch (err) {
        console.warn('Failed to load hospital details from MongoDB:', err);
      }
    };
    fetchHospitalInfo();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await API.put('/hospital', {
        name: hospitalName,
        phone: hospitalPhone,
        email: hospitalEmail,
      });
      alert('Dashboard settings saved successfully to MongoDB!');
    } catch (err) {
      console.error('Failed to save hospital settings to DB:', err);
      alert(err.response?.data?.message || 'Failed to save hospital settings');
    }
  };

  // Modal State
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);

  // Departments State
  const [depts, setDepts] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  // Doctors State
  const [doctorsList, setDoctorsList] = useState([]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [availToday, setAvailToday] = useState(false);
  const [acceptingNew, setAcceptingNew] = useState(false);
  const [telemedicine, setTelemedicine] = useState(false);

  // New Doctor Form State
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpec, setNewDocSpec] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocExp, setNewDocExp] = useState('');
  const [newDocLocation, setNewDocLocation] = useState('');
  const [newDocStatus, setNewDocStatus] = useState('Available Today');
  const [newDocImg, setNewDocImg] = useState('');
  const [newDocFile, setNewDocFile] = useState(null);

  // Appointments State
  const [appointments, setAppointments] = useState([]);
  const [selectedApptDetails, setSelectedApptDetails] = useState(null);

  // Inquiries State
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  // Fetch all dashboard data from DB
  const fetchData = async () => {
    try {
      const [deptsRes, docsRes, apptsRes, msgsRes, annsRes, hospRes] = await Promise.all([
        API.get('/departments'),
        API.get('/doctors'),
        API.get('/appointments'),
        API.get('/messages'),
        API.get('/announcements'),
        API.get('/hospital').catch(() => null),
      ]);

      let dbDepts = deptsRes.data || [];
      if (dbDepts.length < 6) {
        const standardDepts = [
          { name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnostics, and heart surgeries.' },
          { name: 'Neurology', description: 'Advanced treatment for brain, nerve, and spine-related complex conditions.' },
          { name: 'Pediatrics', description: 'Dedicated healthcare services, vaccination, and treatment for babies and children.' },
          { name: 'Orthopedics', description: 'Skeletal health, joint repairs, and sports medicine therapies.' },
          { name: 'Dermatology', description: 'Expert care for skin, hair, and nail health conditions.' },
          { name: 'Oncology', description: 'Diagnosis and treatment of various types of cancer.' },
        ];
        
        for (const std of standardDepts) {
          const alreadyExists = dbDepts.some(d => d.name.toLowerCase() === std.name.toLowerCase());
          if (!alreadyExists) {
            try {
              const { data } = await API.post('/departments', std);
              dbDepts.push(data);
            } catch (err) {
              console.error(`Failed to seed department ${std.name}:`, err);
            }
          }
        }
      }

      setDepts(dbDepts);
      setDoctorsList(docsRes.data || []);
      setAppointments(apptsRes.data || []);
      setMessages(msgsRes.data || []);
      setAnnouncements(annsRes.data || []);
      
      if (hospRes && hospRes.data) {
        setHospitalName(hospRes.data.name || 'Urban Care');
        setHospitalPhone(hospRes.data.phone || '+1 (555) 019-2834');
        setHospitalEmail(hospRes.data.email || 'contact@urbancare.com');
      }
    } catch (err) {
      console.error('API connection failed:', err);
      setDepts([]);
      setDoctorsList([]);
      setAppointments([]);
      setMessages([]);
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [token]);

  // Handlers
  const handleLogout = () => {
    console.log('Logging out from AdminDashboard...');
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDeptName || !newDeptDesc) return;
    try {
      const { data } = await API.post('/departments', { name: newDeptName, description: newDeptDesc });
      const currentDepts = depts[0]?._id === '1' ? [] : depts;
      setDepts([...currentDepts, data]);
      setNewDeptName('');
      setNewDeptDesc('');
      setShowAddDeptModal(false);
    } catch (err) {
      console.error('Failed to create department:', err);
      alert(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleDeleteDept = async (id) => {
    if (id === '1' || id === '2' || id === '3' || id === '4' || id === '5' || id === '6') {
      setDepts(depts.filter(item => item._id !== id));
      return;
    }
    try {
      await API.delete(`/departments/${id}`);
      setDepts(depts.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete department:', err);
      alert('Failed to delete department');
    }
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!newDocName || !newDocSpec || !newDocExp) return;
    try {
      const formData = new FormData();
      formData.append('name', newDocName);
      formData.append('specialization', newDocSpec);
      formData.append('experience', Number(newDocExp));
      formData.append('phone', '+1 (555) 019-3333');
      const cleanEmail = `${newDocName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@urbanpatientcare.com`;
      formData.append('email', cleanEmail);
      formData.append('title', newDocTitle || `${newDocSpec} Specialist`);
      formData.append('location', newDocLocation || 'Wing A, Rm 101');
      formData.append('status', newDocStatus || 'Available Today');
      formData.append('rating', 5.0);
      formData.append('reviewsCount', 1);
      formData.append('acceptingNew', true);
      formData.append('telemedicine', true);

      // Match department by specialization
      const matchedDept = depts.find(d => d.name.toLowerCase() === newDocSpec.toLowerCase());
      if (matchedDept) {
        formData.append('department', matchedDept._id);
      } else {
        formData.append('department', newDocSpec);
      }

      if (newDocFile) {
        formData.append('photo', newDocFile);
      } else if (newDocImg) {
        formData.append('imageUrl', newDocImg);
      }

      const { data } = await API.post('/doctors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const currentDocs = doctorsList[0]?._id === '1' ? [] : doctorsList;
      setDoctorsList([...currentDocs, data]);
      setNewDocName('');
      setNewDocSpec('');
      setNewDocTitle('');
      setNewDocExp('');
      setNewDocLocation('');
      setNewDocImg('');
      setNewDocFile(null);
      setShowAddDocModal(false);
      alert('Doctor profile created and saved to MongoDB Atlas!');
    } catch (err) {
      console.error('Failed to create doctor profile:', err);
      alert(err.response?.data?.message || 'Failed to create doctor profile');
    }
  };

  const handleUploadPhoto = async (id, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const { data } = await API.put(`/doctors/${id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update doctors list with the new image URL, adding a cachebuster timestamp to prevent caching issues!
      setDoctorsList(prev => prev.map(d => d._id === id ? { ...d, imageUrl: `${data.imageUrl}?t=${Date.now()}` } : d));
    } catch (err) {
      console.error('Failed to upload doctor photo:', err);
      alert(err.response?.data?.message || 'Failed to upload doctor photo');
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400';
  };

  const handleDeleteDoc = async (id) => {
    if (Number(id) >= 1 && Number(id) <= 6) {
      setDoctorsList(doctorsList.filter(d => d._id !== id));
      return;
    }
    try {
      await API.delete(`/doctors/${id}`);
      setDoctorsList(doctorsList.filter(d => d._id !== id));
    } catch (err) {
      console.error('Failed to delete doctor:', err);
      alert('Failed to delete doctor');
    }
  };

  const handleAppointmentStatus = async (id, newStatus) => {
    if (id === '1' || id === '2' || id === '3') {
      setAppointments(appointments.map(app => app._id === id || app.id === id ? { ...app, status: newStatus } : app));
      return;
    }
    try {
      const { data } = await API.put(`/appointments/${id}/status`, { status: newStatus });
      setAppointments(prev => prev.map(app => (app._id === id || app.id === id ? { ...app, ...data, status: newStatus } : app)));
      if (selectedApptDetails && (selectedApptDetails._id === id || selectedApptDetails.id === id)) {
        setSelectedApptDetails(prev => prev ? { ...prev, ...data, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to update status';
      alert(`Error updating appointment: ${errMsg}`);
    }
  };

  const handleReplyMessage = async (id) => {
    const text = replyText[id];
    if (!text) return;
    if (id === '1' || id === '2') {
      setMessages(messages.map(msg => msg._id === id || msg.id === id ? { ...msg, isReplied: true, replied: true, replyMessage: text, reply: text } : msg));
      setReplyText({ ...replyText, [id]: '' });
      return;
    }
    try {
      await API.put(`/messages/${id}/reply`, { replyMessage: text });
      setMessages(messages.map(msg => msg._id === id ? { ...msg, isReplied: true, replyMessage: text } : msg));
      setReplyText({ ...replyText, [id]: '' });
    } catch (err) {
      console.error('Failed to reply to inquiry:', err);
      alert('Failed to submit reply');
    }
  };

  const handleAddAnn = async (e) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    try {
      const { data } = await API.post('/announcements', { title: newAnnTitle, content: newAnnContent });
      const currentAnns = announcements[0]?._id === '1' ? [] : announcements;
      setAnnouncements([...currentAnns, data]);
      setNewAnnTitle('');
      setNewAnnContent('');
      setShowAddAnnModal(false);
    } catch (err) {
      console.error('Failed to publish announcement:', err);
      alert(err.response?.data?.message || 'Failed to publish announcement');
    }
  };

  const handleDeleteAnn = async (id) => {
    if (id === '1' || id === '2') {
      setAnnouncements(announcements.filter(item => item._id !== id && item.id !== id));
      return;
    }
    try {
      await API.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      alert('Failed to delete announcement');
    }
  };

  // Filter Doctors list
  const filteredDoctors = doctorsList.filter((doc) => {
    const docSpec = doc.specialization || doc.department?.name || '';
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          docSpec.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || docSpec.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesAvail = !availToday || doc.status === 'Available Today';
    const matchesNew = !acceptingNew || doc.acceptingNew;
    const matchesTele = !telemedicine || doc.telemedicine;
    return matchesSearch && matchesSpecialty && matchesAvail && matchesNew && matchesTele;
  });

  return (
    <div className="flex h-screen overflow-hidden text-on-surface select-none bg-slate-50 admin-dashboard-root">
      {/* Styles Injection */}
      <style>{`
        .admin-dashboard-root {
          --color-primary: #646e57;
          --color-outline-variant: rgba(100, 110, 87, 0.15);
        }
        .glass {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(100, 110, 87, 0.05);
        }
        .sidebar-glass {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.3);
        }
        .stat-card-gradient {
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,244,235,0.7) 100%);
        }
        .sparkline {
          height: 30px;
          width: 80px;
          background: linear-gradient(90deg, transparent 0%, rgba(100, 110, 87, 0.1) 50%, transparent 100%);
          mask-image: url("data:image/svg+xml,%3Csvg width='80' height='30' viewBox='0 0 80 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 25 L10 15 L20 20 L30 5 L40 18 L50 12 L60 22 L70 10 L80 15' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='80' height='30' viewBox='0 0 80 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 25 L10 15 L20 20 L30 5 L40 18 L50 12 L60 22 L70 10 L80 15' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
        }
        .hero-pattern {
          background-color: #646e57;
          background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0);
          background-size: 24px 24px;
        }
        .status-badge-glow {
          box-shadow: 0 0 12px currentColor;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .main-bg-gradient {
          background: radial-gradient(circle at top right, #e2e6de 0%, #f4f6f2 100%);
          min-height: 100vh;
        }
      `}</style>

      {/* Mobile Sidebar backdrop scrim */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-35 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar navigation wrapper */}
      <aside className={`sidebar-glass flex flex-col h-full py-6 items-center lg:items-stretch flex-shrink-0 z-30 transition-all duration-300
        fixed left-0 top-0 h-screen md:h-full md:static md:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-20 lg:w-64'}
      `}>
        <div className="px-4 mb-8 flex items-center gap-4 w-full justify-center lg:justify-start">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          <div className="hidden lg:block overflow-hidden whitespace-nowrap">
            <span className="font-bold text-lg text-primary block leading-tight">Urban Care</span>
            <p className="text-[10px] uppercase tracking-tighter opacity-50 font-semibold text-on-surface-variant">Controller</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col space-y-4 px-3 w-full items-center lg:items-stretch">
          <button 
            onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
            className={`flex items-center justify-center lg:justify-start gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer text-left text-sm font-medium border border-transparent ${
              activeTab === 'overview' ? 'bg-white/60 text-primary shadow-sm border-white/40 font-bold' : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'overview' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
            <span className="hidden lg:block">Dashboard</span>
          </button>

          <button 
            onClick={() => { setActiveTab('doctors'); setMobileSidebarOpen(false); }}
            className={`flex items-center justify-center lg:justify-start gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer text-left text-sm font-medium border border-transparent ${
              activeTab === 'doctors' ? 'bg-white/60 text-primary shadow-sm border-white/40 font-bold' : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'doctors' ? "'FILL' 1" : "'FILL' 0" }}>medical_services</span>
            <span className="hidden lg:block">Doctors</span>
          </button>

          <button 
            onClick={() => { setActiveTab('departments'); setMobileSidebarOpen(false); }}
            className={`flex items-center justify-center lg:justify-start gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer text-left text-sm font-medium border border-transparent ${
              activeTab === 'departments' ? 'bg-white/60 text-primary shadow-sm border-white/40 font-bold' : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'departments' ? "'FILL' 1" : "'FILL' 0" }}>domain</span>
            <span className="hidden lg:block">Departments</span>
          </button>

          <button 
            onClick={() => { setActiveTab('appointments'); setMobileSidebarOpen(false); }}
            className={`flex items-center justify-center lg:justify-start gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer text-left text-sm font-medium border border-transparent ${
              activeTab === 'appointments' ? 'bg-white/60 text-primary shadow-sm border-white/40 font-bold' : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'appointments' ? "'FILL' 1" : "'FILL' 0" }}>event</span>
            <span className="hidden lg:block">Appointments</span>
          </button>

          <button 
            onClick={() => { setActiveTab('messages'); setMobileSidebarOpen(false); }}
            className={`flex items-center justify-center lg:justify-start gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer text-left text-sm font-medium border border-transparent ${
              activeTab === 'messages' ? 'bg-white/60 text-primary shadow-sm border-white/40 font-bold' : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'messages' ? "'FILL' 1" : "'FILL' 0" }}>mail</span>
            <span className="hidden lg:block">Messages</span>
          </button>

          <button 
            onClick={() => { setActiveTab('announcements'); setMobileSidebarOpen(false); }}
            className={`flex items-center justify-center lg:justify-start gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer text-left text-sm font-medium border border-transparent ${
              activeTab === 'announcements' ? 'bg-white/60 text-primary shadow-sm border-white/40 font-bold' : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'announcements' ? "'FILL' 1" : "'FILL' 0" }}>campaign</span>
            <span className="hidden lg:block">Broadcasts</span>
          </button>

          <div className="pt-8 mt-auto w-full flex flex-col space-y-3 items-center lg:items-stretch">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center lg:justify-start gap-3 text-slate-400 hover:text-primary transition-all rounded-xl text-left cursor-pointer text-sm font-medium px-4 py-3 border border-transparent w-full"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="hidden lg:block">Main Website</span>
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
              className={`flex items-center justify-center lg:justify-start gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer text-left text-sm font-medium border border-transparent w-full ${
                activeTab === 'settings' ? 'bg-white/60 text-primary shadow-sm border-white/40 font-bold' : 'text-slate-400 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
              <span className="hidden lg:block">Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center lg:justify-start gap-3 text-slate-400 hover:text-primary transition-all rounded-xl text-left cursor-pointer text-sm font-medium px-4 py-3 border border-transparent w-full"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="hidden lg:block">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 main-bg-gradient">
        
        {/* Top Header bar */}
        <header className="h-20 flex items-center justify-between px-10 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full glass cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative hidden sm:block">
              <input 
                className="glass border-none rounded-full px-8 py-2 text-sm w-72 focus:ring-2 focus:ring-primary/20 pl-12 outline-none" 
                placeholder="Global search..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-4 top-2 text-slate-400">search</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 mr-6">
              <button onClick={() => setActiveTab('doctors')} className="hover:text-primary transition-colors cursor-pointer">Directories</button>
              <button onClick={() => setActiveTab('appointments')} className="hover:text-primary transition-colors cursor-pointer">Analytics</button>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-600 hover:text-primary transition-colors relative cursor-pointer">
                <span className="material-symbols-outlined">notifications</span>
                {appointments.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                )}
              </button>
              
              <div className="flex items-center gap-3 glass pl-3 pr-4 py-1 rounded-full border border-white/60">
                <img 
                  alt="Admin Badge Avatar" 
                  className="w-8 h-8 rounded-full shadow-sm" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOqinaF5USyES-IdGQlbWBQnpUlB-FZ6zostZU6x34ZV7RVN8ni9O2qYXGUImvqzWlYfDDIF5cpuPbAy1D17WTFuPwIU0sQaV2UPJ00PTTs6R-fIUa-WSFc9Iw1euF0Wvc5KcKI6x-lll-aGbTXuSZP26Nyxc-6WTZH564fSgiRABetKoiAlBGzuYR92P4dgNm0YzscUXFU2lFCfZltQqdiRcSMH4PEXk2T8EVDM0519IjzWyn2VA0SQ"
                />
                <span className="hidden lg:block text-xs font-bold text-slate-700">{user?.name || 'Admin Panel'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic Area */}
        <main className="flex-grow overflow-y-auto px-10 pb-8 space-y-6 scrollbar-hide">
          
          {isDemo && (
            <div className="bg-amber-50/80 border border-amber-200/50 backdrop-blur-md text-amber-800 px-6 py-4 rounded-3xl flex items-center justify-between gap-3 text-sm font-medium shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 animate-pulse">warning</span>
                <span>
                  <strong>Demo Mode Active:</strong> The backend API server was unreachable during login. Displaying local offline preview datasets.
                </span>
              </div>
              <button 
                onClick={() => {
                  alert("To connect to the live database, please make sure your Node backend server is running on port 5000 and log out/log back in.");
                }}
                className="text-xs bg-amber-600/10 hover:bg-amber-600/20 text-amber-900 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Learn More
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Hero Banner Section */}
              <section className="hero-pattern rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center text-white shadow-2xl shadow-primary/10">
                <div className="z-10 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">Welcome back, Director</h1>
                  <p className="text-white/80 max-w-md">Everything is running smoothly today. You have <span className="font-bold underline">{appointments.filter(a => a.status === 'Pending').length} appointments</span> awaiting your review.</p>
                  <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                    <button onClick={() => navigate('/book-appointment')} className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer">Generate Report</button>
                    <button onClick={() => setActiveTab('appointments')} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/30 transition-all cursor-pointer">View Schedule</button>
                  </div>
                </div>
                <div className="hidden md:block absolute right-[-5%] bottom-[-20%] opacity-20">
                  <span className="material-symbols-outlined !text-[240px]">health_and_safety</span>
                </div>
              </section>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => setActiveTab('doctors')} className="glass p-6 rounded-2xl flex flex-col gap-3 group hover:translate-y-[-4px] transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">medical_services</span>
                    </div>
                    <div className="sparkline opacity-40"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Doctors</p>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-3xl font-bold text-slate-800">{doctorsList.length}</span>
                      <span className="text-xs text-emerald-600 font-bold mb-1">+2.4%</span>
                    </div>
                  </div>
                </div>

                <div onClick={() => setActiveTab('departments')} className="glass p-6 rounded-2xl flex flex-col gap-3 group hover:translate-y-[-4px] transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <span className="material-symbols-outlined">domain</span>
                    </div>
                    <div className="sparkline opacity-40" style={{ filter: 'hue-rotate(90deg)' }}></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Departments</p>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-3xl font-bold text-slate-800">{depts.length}</span>
                      <span className="text-xs text-slate-400 font-medium mb-1">Stable</span>
                    </div>
                  </div>
                </div>

                <div onClick={() => setActiveTab('appointments')} className="glass p-6 rounded-2xl flex flex-col gap-3 group hover:translate-y-[-4px] transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <span className="material-symbols-outlined">event_note</span>
                    </div>
                    <div className="sparkline opacity-40" style={{ filter: 'hue-rotate(45deg)' }}></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Req</p>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-3xl font-bold text-slate-800">{appointments.filter(a => a.status === 'Pending').length}</span>
                      <span className="text-xs text-orange-500 font-bold mb-1">High</span>
                    </div>
                  </div>
                </div>

                <div onClick={() => setActiveTab('messages')} className="glass p-6 rounded-2xl flex flex-col gap-3 group hover:translate-y-[-4px] transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div className="sparkline opacity-40" style={{ filter: 'hue-rotate(120deg)' }}></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unread Msg</p>
                    <div className="flex items-end gap-3 mt-1">
                      <span className="text-3xl font-bold text-slate-800">{messages.filter(m => !m.isReplied).length}</span>
                      <span className="text-xs text-green-600 font-bold mb-1">-12%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview Details Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Pending Appointments Schedule */}
                <div className="lg:col-span-2 glass rounded-3xl overflow-hidden flex flex-col p-6">
                  <div className="flex justify-between items-center border-b border-white/30 pb-4 mb-4">
                    <h2 className="font-bold text-xl text-slate-800 font-headline-lg">Recent Appointments</h2>
                    <button onClick={() => setActiveTab('appointments')} className="text-primary font-bold text-sm hover:underline px-4 py-1 rounded-lg hover:bg-primary/5 transition-all cursor-pointer">Expand Table</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.1em]">
                          <th className="px-4 pb-2">Patient</th>
                          <th className="px-4 pb-2">Practitioner</th>
                          <th className="px-4 pb-2">Schedule</th>
                          <th className="px-4 pb-2">Status</th>
                          <th className="px-4 pb-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {appointments.slice(0, 5).map((app) => (
                          <tr key={app._id || app.id} className="group hover:bg-white/50 transition-all">
                            <td className="bg-white/40 px-4 py-4 rounded-l-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-primary font-bold text-xs">{app.patientName.charAt(0)}</div>
                                <span className="font-bold text-slate-700">{app.patientName}</span>
                              </div>
                            </td>
                            <td className="bg-white/40 px-4 py-4 text-slate-700 font-semibold">
                              {app.doctorName || app.doctorId?.name || 'Unassigned'}
                            </td>
                            <td className="bg-white/40 px-4 py-4 text-slate-500 font-semibold">
                              {app.date || (app.appointmentDate ? new Date(app.appointmentDate).toLocaleDateString() : 'N/A')}
                            </td>
                            <td className="bg-white/40 px-4 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase status-badge-glow ${
                                app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="bg-white/40 px-4 py-4 rounded-r-2xl text-center">
                              <div className="flex gap-2 justify-center items-center">
                                <button 
                                  onClick={() => setSelectedApptDetails(app)} 
                                  className="border border-slate-200 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg hover:bg-white transition-all cursor-pointer"
                                >
                                  DETAILS
                                </button>
                                {app.status === 'Pending' && (
                                  <>
                                    <button onClick={() => handleAppointmentStatus(app._id || app.id, 'Approved')} className="bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer">APPROVE</button>
                                    <button onClick={() => handleAppointmentStatus(app._id || app.id, 'Rejected')} className="border border-slate-200 text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-lg hover:bg-white transition-all cursor-pointer">REJECT</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right sidebar details */}
                <div className="flex flex-col gap-6">
                  {/* Quick actions panel */}
                  <section className="glass p-6 rounded-3xl">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">bolt</span>
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button onClick={() => setShowAddDocModal(true)} className="w-full flex items-center gap-4 p-4 bg-white/40 hover:bg-white shadow-sm rounded-2xl transition-all group border border-transparent hover:border-primary/10 cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">person_add</span>
                        </div>
                        <span className="font-bold text-slate-700 text-sm">Add New Practitioner</span>
                      </button>

                      <button onClick={() => setShowAddAnnModal(true)} className="w-full flex items-center gap-4 p-4 bg-white/40 hover:bg-white shadow-sm rounded-2xl transition-all group border border-transparent hover:border-primary/10 cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">campaign</span>
                        </div>
                        <span className="font-bold text-slate-700 text-sm">Post Broadcast</span>
                      </button>
                    </div>
                  </section>

                  {/* Activity log tracker */}
                  <section className="glass p-6 rounded-3xl flex-grow">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800">System Activity</h3>
                      <button onClick={fetchData} className="material-symbols-outlined text-slate-400 hover:rotate-180 transition-all duration-500 cursor-pointer">refresh</button>
                    </div>
                    <div className="space-y-6 relative">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200"></div>
                      <div className="relative flex gap-4 pl-8">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-primary rounded-full ring-4 ring-white"></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Dr. Smith added to Cardiology</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">10 MIN AGO</span>
                        </div>
                      </div>
                      <div className="relative flex gap-4 pl-8">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-green-500 rounded-full ring-4 ring-white"></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">New appointment booked</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">25 MIN AGO</span>
                        </div>
                      </div>
                      <div className="relative flex gap-4 pl-8">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-slate-300 rounded-full ring-4 ring-white"></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Maintenance cycle finished</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">1 HOUR AGO</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLINICIANS */}
          {activeTab === 'doctors' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Hospital Doctors Registry</h1>
                  <p className="text-slate-500 text-sm">Create and remove specialist profiles across hospital wings.</p>
                </div>
                <button 
                  onClick={() => setShowAddDocModal(true)}
                  className="bg-primary hover:opacity-95 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Doctor
                </button>
              </div>

              {/* Filters / Search Block */}
              <div className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Search Name</label>
                  <input 
                    type="text" 
                    placeholder="Search doctor..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border-slate-200 bg-white/50 focus:border-primary focus:ring-0 rounded-xl text-sm p-4 outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Specialty Wing</label>
                  <select 
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full border-slate-200 bg-white/50 focus:border-primary focus:ring-0 rounded-xl text-sm p-4 outline-none text-slate-700"
                  >
                    {['All', 'Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Endocrinology'].map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 md:pt-4">
                  <input 
                    type="checkbox"
                    checked={availToday}
                    onChange={(e) => setAvailToday(e.target.checked)}
                    id="avail-today"
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                  />
                  <label htmlFor="avail-today" className="text-xs font-semibold text-slate-600 cursor-pointer">Available Today</label>
                </div>

                <div className="flex items-center gap-3 md:pt-4">
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('All');
                      setAvailToday(false);
                      setAcceptingNew(false);
                      setTelemedicine(false);
                    }}
                    className="text-xs font-bold text-primary hover:underline ml-auto cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Clinicians Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map(doc => (
                  <div key={doc._id} className="glass rounded-3xl overflow-hidden flex flex-col group hover:translate-y-[-4px] transition-all duration-300">
                    <div className="h-44 relative bg-slate-100 overflow-hidden">
                      <img 
                        src={getDoctorPhoto(doc)} 
                        alt={doc.name} 
                        onError={(e) => handleDoctorImageError(e, doc.name)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute top-4 right-4 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full status-badge-glow ${
                        (doc.status || '').includes('Available') ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}>
                        {doc.status || 'Available Today'}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 leading-tight">{doc.name}</h3>
                        <p className="text-xs text-primary font-bold mt-1">{doc.title || `${doc.specialization} Specialist`}</p>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Wing: {doc.specialization} &bull; Exp: {doc.experience} Years</p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/40 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-amber-500 text-sm !fill-1">star</span>
                          {doc.rating || 5.0} ({doc.reviewsCount || 10} reviews)
                        </span>
                        
                        <div className="flex gap-3 items-center">
                          <label className="text-xs text-primary font-bold hover:underline cursor-pointer select-none">
                            Update Photo
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleUploadPhoto(doc._id, e.target.files[0])} 
                            />
                          </label>
                          <button 
                            onClick={() => handleDeleteDoc(doc._id)}
                            className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Hospital Wing Logistics</h1>
                  <p className="text-slate-500 text-sm">Add or delete key clinical departments.</p>
                </div>
                <button 
                  onClick={() => setShowAddDeptModal(true)}
                  className="bg-primary hover:opacity-95 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Department
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {depts.map(dept => (
                  <div key={dept._id} className="glass p-6 rounded-3xl flex flex-col justify-between group hover:translate-y-[-4px] transition-all duration-300">
                    <div>
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                        <span className="material-symbols-outlined text-2xl">domain</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight">{dept.name}</h3>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{dept.description}</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/40 flex justify-end">
                      <button 
                        onClick={() => handleDeleteDept(dept._id)}
                        className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Remove Department
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Appointments Schedule Registers</h1>
                <p className="text-slate-500 text-sm">Review, approve, or reject pending medical scheduling requests.</p>
              </div>

              <div className="glass rounded-3xl overflow-hidden p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.1em]">
                        <th className="px-4 pb-2">Booking ID</th>
                        <th className="px-4 pb-2">Patient Name & Contact</th>
                        <th className="px-4 pb-2">Doctor</th>
                        <th className="px-4 pb-2">Department</th>
                        <th className="px-4 pb-2">Date & Time</th>
                        <th className="px-4 pb-2">Status</th>
                        <th className="px-4 pb-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {appointments.map(app => (
                        <tr key={app._id || app.id} className="group hover:bg-white/50 transition-all">
                          <td className="bg-white/40 px-4 py-4 rounded-l-2xl font-mono text-xs font-bold text-slate-600">
                            {app._id || app.id}
                          </td>
                          <td className="bg-white/40 px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{app.patientName}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{app.patientEmail}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{app.patientPhone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="bg-white/40 px-4 py-4 text-slate-700 font-semibold">
                            {app.doctorName || app.doctorId?.name || 'Unassigned'}
                          </td>
                          <td className="bg-white/40 px-4 py-4 text-slate-600 font-medium">
                            {app.departmentId?.name || app.department || 'General Clinic'}
                          </td>
                          <td className="bg-white/40 px-4 py-4 text-slate-500 font-semibold">
                            <div>{app.date || (app.appointmentDate ? new Date(app.appointmentDate).toLocaleDateString() : 'N/A')}</div>
                            <div className="text-[11px] text-primary font-bold">{app.time || app.appointmentTime}</div>
                          </td>
                          <td className="bg-white/40 px-4 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase status-badge-glow ${
                              app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                           <td className="bg-white/40 px-4 py-4 rounded-r-2xl text-center">
                             <div className="flex gap-2 justify-center items-center">
                               <button 
                                 onClick={() => setSelectedApptDetails(app)} 
                                 className="border border-slate-200 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg hover:bg-white transition-all cursor-pointer"
                                >
                                  DETAILS
                               </button>
                               {app.status === 'Pending' && (
                                 <>
                                   <button onClick={() => handleAppointmentStatus(app._id || app.id, 'Approved')} className="bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer">APPROVE</button>
                                   <button onClick={() => handleAppointmentStatus(app._id || app.id, 'Rejected')} className="border border-slate-200 text-rose-600 text-[10px] font-black px-2.5 py-1 rounded-lg hover:bg-white transition-all cursor-pointer">REJECT</button>
                                 </>
                               )}
                             </div>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PATIENT MESSAGES (INQUIRIES) */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Patient Messages Board</h1>
                <p className="text-slate-500 text-sm">Read and submit response dialogues to patients contact forms.</p>
              </div>

              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg._id || msg.id} className="glass p-6 rounded-3xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800">{msg.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{msg.email} &bull; Subject: {msg.subject}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase status-badge-glow ${
                        msg.isReplied || msg.replied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {msg.isReplied || msg.replied ? 'Replied' : 'Pending Reply'}
                      </span>
                    </div>

                    <div className="bg-white/40 p-4 rounded-2xl border border-white/20 text-slate-600 text-sm leading-relaxed mt-2 italic">
                      "{msg.message}"
                    </div>

                    {msg.isReplied || msg.replied ? (
                      <div className="mt-2 pt-2 border-t border-white/40 text-sm text-slate-700">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Admin Response Log</span>
                        <p className="font-semibold text-slate-800">"{msg.replyMessage || msg.reply}"</p>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-white/40 flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Type administrator response..."
                          value={replyText[msg._id || msg.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [msg._id || msg.id]: e.target.value })}
                          className="flex-1 border-slate-200 bg-white/50 focus:border-primary focus:ring-0 rounded-xl text-sm p-4 outline-none"
                        />
                        <button 
                          onClick={() => handleReplyMessage(msg._id || msg.id)}
                          className="bg-primary hover:opacity-95 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                        >
                          Submit Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Hospital Broadcast Notices</h1>
                  <p className="text-slate-500 text-sm">Post emergency announcements and clinical notices.</p>
                </div>
                <button 
                  onClick={() => setShowAddAnnModal(true)}
                  className="bg-primary hover:opacity-95 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined">add</span>
                  Publish Notice
                </button>
              </div>

              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann._id || ann.id} className="glass p-6 rounded-3xl flex flex-col justify-between group">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">campaign</span>
                        {ann.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-3 leading-relaxed">{ann.content}</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/40 flex justify-end">
                      <button 
                        onClick={() => handleDeleteAnn(ann._id || ann.id)}
                        className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Remove Notice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Control Panel Settings</h1>
                <p className="text-slate-500 text-sm">Configure hospital profiles, operational modes, and dashboard notifications.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hospital Profile Form */}
                <div className="glass p-8 rounded-3xl space-y-6">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">domain</span>
                    Hospital Profile Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black tracking-wider uppercase text-slate-400 mb-2">Hospital Name</label>
                      <input 
                        type="text" 
                        value={hospitalName} 
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full border border-slate-200 bg-white/50 focus:border-primary focus:ring-0 rounded-xl text-sm p-4 outline-none text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black tracking-wider uppercase text-slate-400 mb-2">Support Email Address</label>
                      <input 
                        type="email" 
                        value={hospitalEmail} 
                        onChange={(e) => setHospitalEmail(e.target.value)}
                        className="w-full border border-slate-200 bg-white/50 focus:border-primary focus:ring-0 rounded-xl text-sm p-4 outline-none text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black tracking-wider uppercase text-slate-400 mb-2">Contact Phone</label>
                      <input 
                        type="text" 
                        value={hospitalPhone} 
                        onChange={(e) => setHospitalPhone(e.target.value)}
                        className="w-full border border-slate-200 bg-white/50 focus:border-primary focus:ring-0 rounded-xl text-sm p-4 outline-none text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveSettings}
                    className="w-full bg-primary hover:opacity-95 text-white font-bold py-4 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>

                {/* System Configuration Options */}
                <div className="space-y-6">
                  <div className="glass p-8 rounded-3xl space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">settings_suggest</span>
                      System Configurations
                    </h3>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">Maintenance Mode</h4>
                          <p className="text-xs text-slate-500">Temporarily restrict patient access to booking schedules.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={maintenanceMode}
                            onChange={(e) => setMaintenanceMode(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">Auto-Approve Appointments</h4>
                          <p className="text-xs text-slate-500">Automatically set incoming appointments to approved status.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={autoApprove}
                            onChange={(e) => setAutoApprove(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-8 rounded-3xl space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">security</span>
                      Security Credentials
                    </h3>
                    <p className="text-xs text-slate-500">To update password configurations or keys, contact system supervisors.</p>
                    <div className="flex items-center gap-3 bg-white/40 p-4 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-slate-400">info</span>
                      <span className="text-xs text-slate-600 font-semibold">Active Session Role: Clinical Director</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Dynamic Footer */}
        <footer className="h-16 flex items-center justify-between px-10 text-[11px] text-slate-400 font-bold uppercase tracking-widest z-10 shrink-0">
          <div>© 2024 Urban Patient Care Excellence. All rights reserved.</div>
          <div className="flex gap-6">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Help Center</a>
          </div>
        </footer>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {showFabMenu && (
          <div className="mb-3 bg-white rounded-2xl shadow-xl border border-outline-variant/40 p-3 flex flex-col gap-1 animate-scaleUp min-w-[160px]">
            <button 
              onClick={() => { setShowAddDocModal(true); setShowFabMenu(false); }} 
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 hover:text-primary text-xs font-bold rounded-lg cursor-pointer text-left w-full"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>Add Doctor</span>
            </button>
            
            <button 
              onClick={() => { setShowAddDeptModal(true); setShowFabMenu(false); }} 
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 hover:text-primary text-xs font-bold rounded-lg cursor-pointer text-left w-full"
            >
              <span className="material-symbols-outlined text-sm">domain_add</span>
              <span>Add Department</span>
            </button>

            <button 
              onClick={() => { setShowAddAnnModal(true); setShowFabMenu(false); }} 
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 hover:text-primary text-xs font-bold rounded-lg cursor-pointer text-left w-full"
            >
              <span className="material-symbols-outlined text-sm">campaign</span>
              <span>Post Broadcast</span>
            </button>
          </div>
        )}

        <button 
          onClick={() => setShowFabMenu(!showFabMenu)}
          className="w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <span className="material-symbols-outlined !text-[32px] relative z-10 transform group-hover:rotate-90 transition-transform">add</span>
        </button>
      </div>

      {/* ADD CLINICIAN MODAL */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="glass p-6 rounded-3xl max-w-md w-full mx-4 shadow-2xl space-y-4 text-on-surface">
            <div className="flex justify-between items-center border-b border-white/30 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Add New Doctor Profile</h3>
              <button onClick={() => setShowAddDocModal(false)} className="material-symbols-outlined hover:text-rose-600 transition-colors cursor-pointer">close</button>
            </div>
            
            <form onSubmit={handleAddDoc} className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Alistair Thorne" 
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialty Wing</label>
                <select 
                  value={newDocSpec}
                  onChange={(e) => setNewDocSpec(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none text-slate-600"
                >
                  <option value="">Select Wing</option>
                  {['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Endocrinology'].map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cardiology & Hypertension" 
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Years Experience</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 12" 
                    required
                    value={newDocExp}
                    onChange={(e) => setNewDocExp(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location / Rm</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Wing A, Rm 402" 
                    value={newDocLocation}
                    onChange={(e) => setNewDocLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Photo URL</label>
                  <input 
                    type="text" 
                    placeholder="Optional image link..." 
                    value={newDocImg}
                    onChange={(e) => setNewDocImg(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none"
                    disabled={!!newDocFile}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or Upload Photo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setNewDocFile(e.target.files[0])}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none"
                    disabled={!!newDocImg}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer mt-4"
              >
                Create Doctor Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD DEPARTMENT MODAL */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="glass p-6 rounded-3xl max-w-md w-full mx-4 shadow-2xl space-y-4 text-on-surface">
            <div className="flex justify-between items-center border-b border-white/30 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Add New Department</h3>
              <button onClick={() => setShowAddDeptModal(false)} className="material-symbols-outlined hover:text-rose-600 transition-colors cursor-pointer">close</button>
            </div>
            
            <form onSubmit={handleAddDept} className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ophthalmology" 
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Description</label>
                <textarea 
                  rows="3"
                  placeholder="Summarize wing diagnostics and focus..."
                  required
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer mt-4"
              >
                Create Department
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POST ANNOUNCEMENT MODAL */}
      {showAddAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="glass p-6 rounded-3xl max-w-md w-full mx-4 shadow-2xl space-y-4 text-on-surface">
            <div className="flex justify-between items-center border-b border-white/30 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Publish General Broadcast</h3>
              <button onClick={() => setShowAddAnnModal(false)} className="material-symbols-outlined hover:text-rose-600 transition-colors cursor-pointer">close</button>
            </div>
            
            <form onSubmit={handleAddAnn} className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notice Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Main Clinic Maintenance Cycle" 
                  required
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notice Content</label>
                <textarea 
                  rows="4"
                  placeholder="Type broadcast text visible to patients and staff..."
                  required
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white/60 focus:border-primary outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer mt-4"
              >
                Publish Broadcast Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedApptDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md border border-white/50 rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-scaleUp text-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase mb-2 ${
                  selectedApptDetails.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  selectedApptDetails.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {selectedApptDetails.status}
                </span>
                <h3 className="text-xl font-bold text-slate-800">Booking Reservation Details</h3>
              </div>
              <button 
                onClick={() => setSelectedApptDetails(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-5">
              {/* Booking ID Header Block */}
              <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Booking ID</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{selectedApptDetails._id || selectedApptDetails.id}</span>
              </div>

              {/* Patient Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-black tracking-wider uppercase text-slate-400">Patient Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                    <span className="font-bold text-slate-700">{selectedApptDetails.patientName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Age / Gender</span>
                    <span className="font-bold text-slate-700">{selectedApptDetails.patientAge || 'N/A'} yrs &bull; {selectedApptDetails.patientGender || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                    <span className="font-semibold text-slate-600 truncate block">{selectedApptDetails.patientEmail}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Phone Number</span>
                    <span className="font-semibold text-slate-600">{selectedApptDetails.patientPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-black tracking-wider uppercase text-slate-400">Consultation Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Assigned Practitioner</span>
                    <span className="font-bold text-slate-700">{selectedApptDetails.doctorName || selectedApptDetails.doctorId?.name || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Clinical Department</span>
                    <span className="font-semibold text-slate-600">{selectedApptDetails.departmentId?.name || selectedApptDetails.department || 'General Clinic'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Scheduled Appointment Time</span>
                    <span className="font-bold text-primary">
                      {selectedApptDetails.date || (selectedApptDetails.appointmentDate ? new Date(selectedApptDetails.appointmentDate).toLocaleDateString() : 'N/A')} &bull; {selectedApptDetails.time || selectedApptDetails.appointmentTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-black tracking-wider uppercase text-slate-400">Symptoms & Chief Complaint</h4>
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 text-xs italic text-slate-600 leading-relaxed">
                  "{selectedApptDetails.symptoms || 'No symptoms or patient notes provided.'}"
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button 
                onClick={() => setSelectedApptDetails(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer"
              >
                Close
              </button>
              {selectedApptDetails.status === 'Pending' && (
                <>
                  <button 
                    onClick={() => { handleAppointmentStatus(selectedApptDetails._id || selectedApptDetails.id, 'Rejected'); setSelectedApptDetails(null); }}
                    className="border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Reject Request
                  </button>
                  <button 
                    onClick={() => { handleAppointmentStatus(selectedApptDetails._id || selectedApptDetails.id, 'Approved'); setSelectedApptDetails(null); }}
                    className="bg-primary hover:opacity-95 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                  >
                    Approve Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
