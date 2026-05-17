import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const ReservationManagement = () => {
  const { addToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [commonAreas, setCommonAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    area_id: '',
    start_time: '',
    end_time: '',
    guest_count: 1
  });

  useEffect(() => {
    fetchReservations();
    fetchCommonAreas();
  }, []);

  const fetchCommonAreas = async () => {
    try {
      const response = await api.get('/reservations/common-areas');
      setCommonAreas(response.data.areas || []);
    } catch (error) {
      console.error('Error fetching common areas:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      console.log('Fetching all reservations...');
      const response = await api.get('/reservations/all');
      console.log('Reservations response:', response.data);
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      addToast('Reservation created successfully', 'success');
      setShowCreateModal(false);
      setFormData({ area_id: '', start_time: '', end_time: '', guest_count: 1 });
      fetchReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to create reservation', 'error');
    }
  };

  const handleEditClick = (reservation) => {
    setEditingReservation(reservation);
    setFormData({
      area_id: reservation.area_id,
      start_time: new Date(reservation.start_time).toISOString().slice(0, 16),
      end_time: new Date(reservation.end_time).toISOString().slice(0, 16),
      guest_count: reservation.guest_count || 1
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/reservations/${editingReservation.reservation_id}`, formData);
      addToast('Reservation updated successfully', 'success');
      setShowEditModal(false);
      setEditingReservation(null);
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to update reservation', 'error');
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    
    try {
      await api.put(`/reservations/${reservationId}/cancel`);
      addToast('Reservation cancelled successfully', 'success');
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to cancel reservation', 'error');
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-primary text-on-primary';
    if (status === 'cancelled') return 'bg-error-container text-on-error-container';
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

  const stats = {
    total: reservations.length,
    active: reservations.filter(r => r.status === 'active').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    completed: reservations.filter(r => r.status === 'completed').length
  };

  return (
    <MainLayout>
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Manager</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Reservations</span>
      </div>

      <div className="px-8 pb-8">
        <div className="mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Reservation Management</h1>
              <p className="text-on-surface-variant">View and manage all common area reservations</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary text-on-primary font-bold text-sm tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Create Reservation
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Total</div>
            <div className="text-3xl font-black text-primary">{stats.total}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Active</div>
            <div className="text-3xl font-black text-primary">{stats.active}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Cancelled</div>
            <div className="text-3xl font-black text-error">{stats.cancelled}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Completed</div>
            <div className="text-3xl font-black text-secondary">{stats.completed}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-bold uppercase ${filter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-xs font-bold uppercase ${filter === 'active' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 text-xs font-bold uppercase ${filter === 'cancelled' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-lowest p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create Reservation</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Common Area</label>
                  <select
                    value={formData.area_id}
                    onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  >
                    <option value="">Select Area</option>
                    {commonAreas.map(area => (
                      <option key={area.area_id} value={area.area_id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Guest Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.guest_count}
                    onChange={(e) => setFormData({ ...formData, guest_count: parseInt(e.target.value) })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                    Create Reservation
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingReservation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-lowest p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Reservation</h2>
                <button onClick={() => setShowEditModal(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Common Area</label>
                  <select
                    value={formData.area_id}
                    onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  >
                    <option value="">Select Area</option>
                    {commonAreas.map(area => (
                      <option key={area.area_id} value={area.area_id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Guest Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.guest_count}
                    onChange={(e) => setFormData({ ...formData, guest_count: parseInt(e.target.value) })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reservations List */}
        {filteredReservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReservations.map((reservation) => (
              <div key={reservation.reservation_id} className="bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">event_seat</span>
                    <div>
                      <h3 className="font-bold text-lg">{reservation.area_name}</h3>
                      <p className="text-xs text-on-surface-variant">Reservation #{reservation.reservation_id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                    <span>{reservation.user_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
                    <span>{new Date(reservation.start_time).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
                    <span>{new Date(reservation.end_time).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">group</span>
                    <span>{reservation.guest_count} guests</span>
                  </div>
                </div>
                {reservation.status === 'active' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(reservation)}
                      className="flex-1 py-2 bg-primary-container text-on-primary-container text-xs font-bold uppercase hover:opacity-80 transition-opacity"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(reservation.reservation_id)}
                      className="flex-1 py-2 bg-error-container text-on-error-container text-xs font-bold uppercase hover:opacity-80 transition-opacity"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">event_seat</span>
            <p className="text-lg font-bold mb-2">No reservations found</p>
            <p className="text-sm text-on-surface-variant">
              {filter !== 'all' ? `No ${filter} reservations at the moment` : 'No reservations have been made yet'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ReservationManagement;
