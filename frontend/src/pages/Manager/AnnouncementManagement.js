import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const AnnouncementManagement = () => {
  const { addToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    target_audience: 'all'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      console.log('Fetching announcements...');
      const response = await api.get('/announcements');
      console.log('Announcements response:', response.data);
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', formData);
      addToast('Announcement created successfully', 'success');
      setShowForm(false);
      setFormData({ title: '', content: '', priority: 'medium', target_audience: 'all' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to create announcement', 'error');
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await api.delete(`/announcements/${announcementId}`);
      addToast('Announcement deleted successfully', 'success');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to delete announcement', 'error');
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
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Manager</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Announcements</span>
      </div>

      <div className="px-8 pb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Announcement Management</h1>
            <p className="text-on-surface-variant">Create and manage building announcements</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-primary text-on-primary font-bold text-sm tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            New Announcement
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-surface-container-lowest p-8 shadow-sm mb-8 border border-outline-variant/10">
            <h2 className="text-xl font-bold mb-6">Create New Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                  placeholder="Announcement title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm resize-none"
                  placeholder="Announcement content"
                  rows="4"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Target Audience</label>
                <select
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="residents">Residents Only</option>
                  <option value="admin">Admins Only</option>
                  <option value="security">Security Only</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Publish Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.announcement_id} className="bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold tracking-tight">{announcement.title}</h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Posted on {new Date(announcement.created_at).toLocaleDateString()} at {new Date(announcement.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase ${getPriorityColor(announcement.priority || 'medium')}`}>
                      {announcement.priority || 'medium'}
                    </span>
                    <span className="px-3 py-1 text-[10px] font-bold uppercase bg-surface-container text-on-surface">
                      {announcement.target_audience || 'all'}
                    </span>
                    <button
                      onClick={() => handleDelete(announcement.announcement_id)}
                      className="p-2 hover:bg-error-container hover:text-on-error-container transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{announcement.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">campaign</span>
            <p className="text-lg font-bold mb-2">No announcements yet</p>
            <p className="text-sm text-on-surface-variant">Create your first announcement using the button above</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AnnouncementManagement;
