import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const Reservations = () => {
  const { addToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    area_id: '',
    start_time: '',
    end_time: '',
    guest_count: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reservationsRes, areasRes] = await Promise.all([
        api.get('/reservations/user'),
        api.get('/reservations/areas')
      ]);
      setReservations(reservationsRes.data.reservations || []);
      setAreas(areasRes.data.areas || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      addToast('Failed to load reservations', 'error');
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
      await api.post('/reservations', formData);
      addToast('Reservation created successfully!', 'success');
      setShowForm(false);
      setFormData({ area_id: '', start_time: '', end_time: '', guest_count: 1 });
      fetchData();
    } catch (error) {
      console.error('Error creating reservation:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to create reservation';
      addToast(errorMessage, 'error');
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.put(`/reservations/${reservationId}/cancel`);
      addToast('Reservation cancelled successfully', 'success');
      fetchData();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      addToast('Failed to cancel reservation', 'error');
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Portal</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Reservations</span>
      </div>

      <div className="px-8 pb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Amenity Reservations</h1>
            <p className="text-on-surface-variant">Book and manage common area reservations</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-primary text-on-primary font-bold text-sm tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            New Reservation
          </button>
        </div>

        {/* Reservation Form */}
        {showForm && (
          <div className="bg-surface-container-lowest p-8 shadow-sm mb-8">
            <h2 className="text-xl font-bold mb-6">Create New Reservation</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Area</label>
                  <select
                    name="area_id"
                    value={formData.area_id}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  >
                    <option value="">Select an area</option>
                    {areas.map((area) => (
                      <option key={area.area_id} value={area.area_id}>
                        {area.name} (Capacity: {area.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Guest Count</label>
                  <input
                    type="number"
                    name="guest_count"
                    value={formData.guest_count}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Start Time</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">End Time</label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Create Reservation
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

        {/* Reservations List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your Reservations</h2>
          {reservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((reservation) => (
                <div key={reservation.reservation_id} className="bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-3xl">event_seat</span>
                      <div>
                        <h3 className="font-bold text-lg">{reservation.area_name}</h3>
                        <p className="text-xs text-on-surface-variant">Reservation #{reservation.reservation_id}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase ${
                      reservation.status === 'active' ? 'bg-primary text-on-primary' :
                      reservation.status === 'cancelled' ? 'bg-error-container text-on-error-container' :
                      'bg-surface-container text-on-surface'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{new Date(reservation.start_time).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{new Date(reservation.end_time).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">group</span>
                      <span>{reservation.guest_count} guests</span>
                    </div>
                  </div>
                  {reservation.status === 'active' && (
                    <button
                      onClick={() => handleCancel(reservation.reservation_id)}
                      className="mt-4 w-full py-2 bg-error-container text-on-error-container text-xs font-bold uppercase hover:opacity-80 transition-opacity"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface-container-lowest">
              <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">event_seat</span>
              <p className="text-lg font-bold mb-2">No reservations found</p>
              <p className="text-sm text-on-surface-variant">Create your first reservation using the button above</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Reservations;
