import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const CommonAreasManagement = () => {
  const { addToast } = useToast();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    max_hours: '',
    open_time: '07:00',
    close_time: '23:00'
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await api.get('/common-areas');
      setAreas(response.data.areas || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      addToast('Failed to load common areas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await api.put(`/common-areas/${editingArea.area_id}`, formData);
        addToast('Area updated successfully', 'success');
      } else {
        await api.post('/common-areas', formData);
        addToast('Area created successfully', 'success');
      }
      setShowForm(false);
      setEditingArea(null);
      setFormData({ name: '', capacity: '', max_hours: '', open_time: '07:00', close_time: '23:00' });
      fetchAreas();
    } catch (error) {
      console.error('Error saving area:', error);
      addToast(error.response?.data?.error?.message || 'Failed to save area', 'error');
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      capacity: area.capacity,
      max_hours: area.max_hours,
      open_time: area.open_time,
      close_time: area.close_time
    });
    setShowForm(true);
  };

  const handleDelete = async (areaId) => {
    if (!window.confirm('Are you sure you want to delete this area?')) return;
    try {
      await api.delete(`/common-areas/${areaId}`);
      addToast('Area deleted successfully', 'success');
      fetchAreas();
    } catch (error) {
      console.error('Error deleting area:', error);
      addToast('Failed to delete area', 'error');
    }
  };

  const handleToggleActive = async (areaId, currentStatus) => {
    try {
      await api.patch(`/common-areas/${areaId}`, { is_active: !currentStatus });
      addToast(`Area ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchAreas();
    } catch (error) {
      console.error('Error toggling area status:', error);
      addToast('Failed to update area status', 'error');
    }
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
        <span className="text-primary">Common Areas</span>
      </div>

      <div className="px-8 pb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Common Areas</h1>
            <p className="text-on-surface-variant">Manage reservable common areas</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingArea(null);
              setFormData({ name: '', capacity: '', max_hours: '', open_time: '07:00', close_time: '23:00' });
            }}
            className="px-6 py-3 bg-primary text-on-primary font-bold text-sm tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            New Area
          </button>
        </div>

        {showForm && (
          <div className="bg-surface-container-lowest p-8 shadow-sm mb-8 border border-outline-variant/10">
            <h2 className="text-xl font-bold mb-6">{editingArea ? 'Edit Area' : 'Create New Area'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Area Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    placeholder="e.g., Swimming Pool"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    placeholder="Max people"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Max Hours</label>
                  <input
                    type="number"
                    value={formData.max_hours}
                    onChange={(e) => setFormData({ ...formData, max_hours: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    placeholder="Max reservation hours"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Open Time</label>
                  <input
                    type="time"
                    value={formData.open_time}
                    onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
                    className="w-full bg-transparent border border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Close Time</label>
                  <input
                    type="time"
                    value={formData.close_time}
                    onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
                    className="w-full bg-transparent border border-outline-variant focus:border-primary focus:ring-0 py-2 px-3 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  {editingArea ? 'Update Area' : 'Create Area'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingArea(null);
                  }}
                  className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {areas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div key={area.area_id} className="bg-surface-container-lowest p-6 border border-outline-variant/10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{area.name}</h3>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase ${area.is_active ? 'bg-primary text-on-primary' : 'bg-error-container text-on-error-container'}`}>
                    {area.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Capacity:</span>
                    <span className="font-bold">{area.capacity} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Max Hours:</span>
                    <span className="font-bold">{area.max_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Hours:</span>
                    <span className="font-bold">{area.open_time} - {area.close_time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(area)}
                    className="flex-1 px-3 py-2 text-xs font-bold uppercase bg-primary-container text-on-primary-container hover:opacity-80 transition-opacity"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(area.area_id, area.is_active)}
                    className="flex-1 px-3 py-2 text-xs font-bold uppercase bg-secondary-container text-on-secondary-container hover:opacity-80 transition-opacity"
                  >
                    {area.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(area.area_id)}
                    className="px-3 py-2 text-xs font-bold uppercase bg-error-container text-on-error-container hover:opacity-80 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">meeting_room</span>
            <p className="text-lg font-bold mb-2">No common areas found</p>
            <p className="text-sm text-on-surface-variant">Create your first common area using the button above</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CommonAreasManagement;
