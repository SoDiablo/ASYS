import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../utils/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-error text-on-error';
    if (priority === 'medium') return 'bg-secondary-container text-on-secondary-container';
    return 'bg-surface-container text-on-surface';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Portal</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Announcements</span>
      </div>

      <div className="px-8 pb-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter mb-2">Building Announcements</h1>
          <p className="text-on-surface-variant">Stay updated with the latest news and updates from building management</p>
        </div>

        {announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div key={announcement.announcement_id} className="bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{announcement.title}</h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Posted on {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{announcement.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">campaign</span>
            <p className="text-lg font-bold mb-2">No announcements available</p>
            <p className="text-sm text-on-surface-variant">Check back later for updates from building management</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Announcements;
