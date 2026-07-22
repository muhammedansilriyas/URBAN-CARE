import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStart, fetchSuccess, fetchFail } from '../store/slices/announcementSlice.js';
import API from '../services/api.js';

const Announcements = () => {
  const dispatch = useDispatch();
  const { announcements, loading } = useSelector((state) => state.announcements);

  useEffect(() => {
    const loadAnnouncements = async () => {
      dispatch(fetchStart());
      try {
        const { data } = await API.get('/announcements');
        dispatch(fetchSuccess(data));
      } catch (err) {
        dispatch(fetchFail(err.response?.data?.message || err.message));
        // Fallback mockup updates
        dispatch(fetchSuccess([
          { _id: '1', title: 'Free Annual Health Camp 2026', content: 'Urban Patient Care is hosting a free multi-specialty diagnostic camp on July 15th, 2026, offering general physical checkups and blood sugar examinations.', createdAt: '2026-07-01T08:00:00.000Z' },
          { _id: '2', title: 'New Pediatrics Wing Inauguration', content: 'Our new pediatric specialized intensive unit starts operations on July 10th. Dr. Emily Watson will lead the child therapy and immunization consultations.', createdAt: '2026-06-28T09:30:00.000Z' },
          { _id: '3', title: 'Influenza Vaccination Drive', content: 'Patients can pre-register for seasonal flu shots at the outpatient clinic starting Monday. Walk-in slots are open from 9:00 AM to 1:00 PM.', createdAt: '2026-06-25T14:00:00.000Z' },
        ]));
      }
    };
    loadAnnouncements();
  }, [dispatch]);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <main className="max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        <div className="max-w-3xl mx-auto space-y-lg">
          <header className="text-center md:text-left mb-xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center justify-center md:justify-start gap-2 mb-xs">
              <span className="material-symbols-outlined text-primary text-4xl">campaign</span> Hospital Announcements
            </h1>
            <p className="text-on-surface-variant font-body-lg text-body-lg">
              Stay up to date with Urban Patient Care clinic schedules, timing revisions, and wellness drives.
            </p>
          </header>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map((post) => (
                <div key={post._id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-3 font-semibold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    <span>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <h2 className="font-title-lg text-title-lg text-on-surface mb-2 font-bold">{post.title}</h2>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Announcements;
