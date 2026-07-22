import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api.js';
import { getDoctorPhoto, handleDoctorImageError } from '../utils/doctorHelper.js';

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await API.get(`/doctors/${id}`);
        setDoctor(data);
      } catch (err) {
        // Fallback mock details matching default specialists lists
        setDoctor({
          _id: id,
          name: id === 'dr_smith' ? 'Dr. James Wilson' : id === 'dr_chen' ? 'Dr. Elena Chen' : 'Dr. Leo Rodriguez',
          email: 'doctor@urbanpatientcare.com',
          phone: '+1 (555) 019-3388',
          specialization: id === 'dr_smith' ? 'Cardiology' : id === 'dr_chen' ? 'Neurology' : 'Pediatrics',
          department: { name: id === 'dr_smith' ? 'Cardiology' : id === 'dr_chen' ? 'Neurology' : 'Pediatrics', _id: id === 'dr_smith' ? 'cardiology' : id === 'dr_chen' ? 'neurology' : 'pediatrics' },
          experience: 14,
          availability: ['Monday', 'Wednesday', 'Friday'],
          imageUrl: id === 'dr_smith' 
            ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAq2oipd51dPa6KdHDlQyUeVDKKwaH88udddVR4B3v0sZZ0l3i4vJMzIT4fXbiPVdAjTu6WQ5POrTbDdvB_dW-Z8fc3Kt1MenB8KwcJTBeiIyyg-DjWz-V67DkQy0A2y95ThR46gm_pCGZsY7ltBK2V-5-mPSX6XOOLerNEkeecBDVIazMae76_j4SNsBWmFITb2E72ZNXz3S146eCeRk24PzUz43eIRNMnykXd8JAGLFmeuFWSLkYyTg'
            : id === 'dr_chen'
            ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLVtpIcZrfkU3g492ndqoD6rwkywpumLd53c5zjvheDohq4ba-mkcasxI9e8FwhIqMy7s9vcNBxmk32JSqK6zsGfPHhoSGFlCX2r91HQIvFTLTz_xkT0T_C9S8F3T-8L_PxC53h48lZ5GNMBp0gyOoHKLRU-NE7DSqWY8SzyaE3tSQJ1o2BYwdABxicdTHqV28mP5bSDSFRmqOskQd8gwGkE562RQ1fhGHRXLcWJFolNrG6bcA6dcK-Q'
            : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZzi97XqVoY6vszEfvV24AMF28Tp5j69ikRwP041Jd1BClRmntxu3h8eaXre5pOeJaQGURCjCqVZqwaa1762LLIWqwTNYgUuDmQT1S5lt_ulPzmT2jw80PkurGi4kEvJwntkO-CoWqYmAlllWjEUR2r14y1MskdFiwZcRByLlcbfclCqUBZAM5fBoOSZhwuA5ez1cO0l5hRakBiaBTxtFlwcWL9CWEHaNWUPNwCdceJ3dSvZ6HycIaYw',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <main className="max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        <div className="max-w-3xl mx-auto">
          
          <Link to="/doctors" className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm font-semibold mb-6 transition-colors">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span> Back to Doctors Directory
          </Link>

          {doctor && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row border-b border-outline-variant/60 p-lg gap-lg items-center md:items-start">
                <img
                  src={getDoctorPhoto(doctor)}
                  alt={doctor.name}
                  onError={(e) => handleDoctorImageError(e, doctor?.name)}
                  className="w-44 h-44 rounded-xl object-cover bg-slate-50 shrink-0 border border-outline-variant/40"
                />
                <div className="flex-1 text-center md:text-left mt-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {doctor.department?.name}
                  </span>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface mt-3 font-bold">{doctor.name}</h1>
                  <p className="text-secondary font-bold text-sm mt-1">{doctor.specialization}</p>

                  <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm mx-auto md:mx-0 text-on-surface">
                    <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/35 text-center">
                      <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Experience</p>
                      <p className="text-primary font-bold text-lg mt-0.5">{doctor.experience} Years</p>
                    </div>
                    <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/35 text-center">
                      <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Department</p>
                      <p className="text-primary font-bold text-sm mt-1.5 truncate">{doctor.department?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-lg space-y-8 text-on-surface">
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface mb-3 flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-primary text-xl">schedule</span> Consultations & Availability
                  </h2>
                  <p className="text-secondary text-sm leading-relaxed mb-4">
                    Available for in-person outpatient consultations and virtual diagnostic audits on the following schedules:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(doctor.availability || []).map((day, i) => (
                      <span key={i} className="bg-primary-container text-on-primary-container border border-primary/20 text-xs px-3 py-1.5 rounded-lg font-bold">
                        {day} (9:00 AM - 5:00 PM)
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface mb-3 flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span> Clinical Expertise & Biography
                  </h2>
                  <p className="text-secondary text-sm leading-relaxed">
                    {doctor.name} is a board-certified consulting practitioner with extensive clinical history in {doctor.specialization}.
                    Committed to delivering evidence-based diagnostics, custom treatment programs, and premium patient rehabilitation programs.
                  </p>
                </div>

                <div className="bg-surface-container p-lg rounded-xl border border-outline-variant/40 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="font-bold text-on-surface">Need to consult with {doctor.name}?</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-medium">Book your session through our patient wizard desk.</p>
                  </div>
                  <Link
                    to="/book-appointment"
                    state={{ doctorId: doctor._id, departmentId: doctor.department?._id }}
                    className="bg-primary text-on-primary hover:opacity-90 active:scale-95 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shrink-0"
                  >
                    Book Session
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;
