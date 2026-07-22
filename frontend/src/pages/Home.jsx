import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleDepartmentClick = (specialty) => {
    navigate('/doctors', { state: { initialSpecialty: specialty } });
  };

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-container min-h-screen">
      
      {/* Hero Section: Editorial Style */}
      <section className="relative w-full min-h-[700px] lg:h-[870px] overflow-hidden px-margin-mobile md:px-margin-desktop py-xl lg:py-0 grid grid-cols-12 items-center">
        <div className="col-span-12 lg:col-span-7 z-10 space-y-6 mt-10 lg:mt-0">
          <p className="text-label-md font-label-md text-primary tracking-[0.2em] mb-2 uppercase">A NEW STANDARD IN CARE</p>
          <h1 className="text-6xl lg:text-8xl font-black leading-[0.9]">
  Redefining <br />
  Healthcare <br />
  <span className="text-[#646e57]">
    Architecture.
  </span>
</h1>
          <p className="text-body-lg font-body-lg max-w-lg text-on-surface-variant leading-relaxed">
            Experience a clinical environment where precision meets serenity. We treat medical data with the reverence of fine art, ensuring every patient journey is as sophisticated as it is safe.
          </p>
        </div>

        {/* Architectural Background Image */}
        <div className="absolute right-0 top-0 w-full lg:w-2/3 h-full -z-0 opacity-20 lg:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
          <img
            className="w-full h-full object-cover"
            alt="Minimalist medical atrium architecture"
            src="/hero_atrium_hd.png"
          />
        </div>


      </section>

      {/* Departments: Bento Grid */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 bg-surface border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Centers of Excellence</h2>
              <div className="w-24 h-1 bg-primary"></div>
            </div>
            <p className="text-label-md font-label-md text-primary max-w-xs sm:text-right">
              Specialized architectural wings dedicated to advanced medical sciences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter h-auto lg:h-[700px]">
            {/* Cardiology */}
            <div 
              onClick={() => handleDepartmentClick('Cardiology')}
              className="lg:col-span-8 relative group overflow-hidden border border-outline-variant/20 rounded-xl cursor-pointer shadow-sm min-h-[300px]"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Modern Cardiology wing"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrpF7QaGDnkt3NsX_B-6pM0F9iFWDOJymLl7x1UmW8bJNQVGTtmS71SXyI2oXkt3vTTzZCbdcYR_d5aTunKSLmT8HiyySFzeKZIa8AM8oZ826Za27m1iNZ3-8e7996SGBK12v_nqj-7CopKwQQZw5I1TkJv1pOKMQItgAfO04aoiltbhCcllCgrbUVa7wcIutoDdT6JzFei2EVne3CyUMA1yejT9D9gmM8Bu67tVmWcnYsPIoYqHXK3w"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="font-headline-md text-headline-md font-bold">Advanced Cardiology</h3>
                <p className="text-label-sm font-label-sm opacity-80 uppercase tracking-widest mt-2">Precision Diagnostics</p>
              </div>
            </div>

            {/* Neurology */}
            <div 
              onClick={() => handleDepartmentClick('Neurology')}
              className="lg:col-span-4 relative group overflow-hidden border border-outline-variant/20 rounded-xl cursor-pointer shadow-sm min-h-[300px]"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Neurology MRI suite"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYe4khaBjhIaFSQhYaRCHadnbMdn4F9Rw7CA0ZV-eA97ZlGms9-jv3Li2yYME0LYzJsK2KPS3uBKrODV-BE_7rgblFJqwPVph2e2uNoZgES4MOL7T15yaauZMHDTWGL9vUjDUuJup-SmEjAJuqYUtqEgA-XER5eEVKt8_X39__vE2lKv_FK_fziRv5t9WoMzPgiANnx8kWd3bSsvrMz5zbfDI8kilHNtTECF8MA-xMILSKrdXYoZQ6WA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="font-headline-md text-headline-md font-bold">Neurology</h3>
                <p className="text-label-sm font-label-sm opacity-80 uppercase tracking-widest mt-2">Neural Mapping</p>
              </div>
            </div>

            {/* Oncology */}
            <div 
              onClick={() => handleDepartmentClick('Oncology')}
              className="lg:col-span-4 relative group overflow-hidden border border-outline-variant/20 rounded-xl cursor-pointer shadow-sm min-h-[300px]"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Oncology laboratory equipment"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcyebK-9R6xFO3B9-Q7UjqKJqXN88EeW6oIUytZbNgS_rrKmKWDjFGNPIN8QWrm38y-mu5hdmpbPQUbWGBAPzgGwvIElwmg5P2pIwGwMREXKFTcbwE_V1IBP6c__AEBnPKGyXScH3P4vlrJBaGtBVSrfPtGPt-0GCA0Kuex_ePyuablESIsuAj8BGuStixWU5wUbY0HqWCDvfYYgfoEHnvV8tzevidp6oCwjMvi777fn4aBJ6GMPuEGw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="font-headline-md text-headline-md font-bold">Oncology</h3>
                <p className="text-label-sm font-label-sm opacity-80 uppercase tracking-widest mt-2">Personalized Therapy</p>
              </div>
            </div>

            {/* Pediatrics */}
            <div 
              onClick={() => handleDepartmentClick('Pediatrics')}
              className="lg:col-span-8 relative group overflow-hidden border border-outline-variant/20 rounded-xl cursor-pointer shadow-sm min-h-[300px]"
            >
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Bright Pediatrics clinic"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1v70nERe5zgwSJmeUMfhoLCVQU9rLm7la3DX-HwfGiVs6_RYEmN7bPEX7noNenhb65iopb1df1wPmk1KlgVT8r1Wolk40y-BWBSXgKR3eMngkmJbOUOi2maGo_BpbYtW-QqkeLy1muvWAlQNUx2_179lGY495uVGWnD6KaahlpdnzjDxes6daa9bYQC788Lhjn2U1efckgdIIUGej99yJCFIa-m4XVMtXKcbDnK48Hl88xtJzEpJ4dw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="font-headline-md text-headline-md font-bold">Pediatrics</h3>
                <p className="text-label-sm font-label-sm opacity-80 uppercase tracking-widest mt-2">Next Generation Care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Announcements: Asymmetrical Grid */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-gutter items-center">
          <div className="lg:col-span-4 space-y-6">
            <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight font-bold">
              Clinical <br />
              Perspectives
            </h2>
            <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
              Stay informed with our latest research, facility updates, and medical breakthroughs curated for our patient community.
            </p>
            <Link 
              to="/announcements" 
              className="flex items-center gap-4 text-label-md font-label-md group text-primary font-bold hover:underline"
            >
              VIEW ALL ANNOUNCEMENTS
              <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Announcement 1 */}
            <div className="glass-panel p-6 flex flex-col justify-between min-h-[300px] border-l-4 border-l-primary rounded-r-xl shadow-sm bg-white/50 border border-outline-variant">
              <div>
                <span className="text-label-sm font-label-sm text-primary uppercase tracking-widest font-semibold">Oct 24, 2024</span>
                <h4 className="font-headline-md text-headline-md text-on-surface mt-4 mb-3 font-bold leading-snug">Pioneering Robotics in Minimally Invasive Surgery</h4>
                <p className="text-body-md font-body-md text-on-surface-variant line-clamp-3 leading-relaxed">
                  The surgical wing has integrated the latest Xenon-7 robotic assistance, reducing recovery times by 40% across all inpatient procedures.
                </p>
              </div>
              <Link to="/announcements" className="text-label-md font-label-md border-b border-on-surface w-fit mt-8 font-bold hover:opacity-80">
                READ MORE
              </Link>
            </div>

            {/* Announcement 2 */}
            <div className="glass-panel p-6 flex flex-col justify-between min-h-[300px] border-l-4 border-l-inverse-surface rounded-r-xl shadow-sm bg-white/50 border border-outline-variant">
              <div>
                <span className="text-label-sm font-label-sm text-primary uppercase tracking-widest font-semibold">Oct 21, 2024</span>
                <h4 className="font-headline-md text-headline-md text-on-surface mt-4 mb-3 font-bold leading-snug">New Wellness Pavillion Opening in St. Jude</h4>
                <p className="text-body-md font-body-md text-on-surface-variant line-clamp-3 leading-relaxed">
                  Our new architectural expansion focusing on holistic recovery and mental health is now accepting consultations.
                </p>
              </div>
              <Link to="/announcements" className="text-label-md font-label-md border-b border-on-surface w-fit mt-8 font-bold hover:opacity-80">
                READ MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Contact Section */}
      <section className="px-margin-mobile md:px-margin-desktop py-16 bg-inverse-surface text-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-gutter">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <h2 className="font-headline-lg text-headline-lg font-bold text-surface-bright leading-tight">Ready for specialized consultation?</h2>
            <p className="text-body-lg font-body-lg text-surface-bright/70 leading-relaxed">
              Our clinical coordinators are available to map your health journey within our structural care ecosystem.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link
              to="/book-appointment"
              className="bg-primary-container text-on-primary-container px-10 py-5 rounded-full font-label-md text-label-md hover:scale-105 transition-transform active:scale-95 text-center shadow-md font-bold"
            >
              BOOK A CONSULTATION
            </Link>
            <Link
              to="/departments"
              className="border border-outline px-10 py-5 rounded-full font-label-md text-label-md hover:bg-surface/10 transition-colors text-center font-bold"
            >
              VIRTUAL TOUR
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
