import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const ParkingManagement = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [formData, setFormData] = useState({
    spot_number: '',
    type: 'standard',
    apartment_id: '',
    plate_number: '',
    is_occupied: false
  });

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const { addToast } = useToast();

  const fetchParkingSpots = async () => {
    try {
      console.log('Fetching parking spots...');
      const response = await api.get('/parking/spots');
      console.log('Parking response:', response.data);
      setParkingSpots(response.data.spots || []);
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to load parking spots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        spot_number: formData.spot_number,
        type: formData.type
      };
      
      // Add apartment_id if provided
      if (formData.apartment_id && formData.apartment_id.trim() !== '') {
        payload.apartment_id = formData.apartment_id;
      }
      
      // Add plate_number if provided (for handicapped spots)
      if (formData.plate_number && formData.plate_number.trim() !== '') {
        payload.plate_number = formData.plate_number;
      }
      
      await api.post('/parking/spots', payload);
      addToast('Parking spot created successfully', 'success');
      setShowAddModal(false);
      setFormData({ spot_number: '', type: 'standard', apartment_id: '', plate_number: '' });
      fetchParkingSpots();
    } catch (error) {
      console.error('Error creating parking spot:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to create parking spot', 'error');
    }
  };

  const handleEditClick = (spot) => {
    setEditingSpot(spot);
    setFormData({
      spot_number: spot.spot_number,
      type: spot.type,
      apartment_id: spot.apartment_display || '',
      plate_number: spot.plate_number || '',
      is_occupied: spot.is_occupied || false
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        spot_number: formData.spot_number,
        type: formData.type,
        is_occupied: formData.is_occupied
      };
      
      // Add apartment_id if provided
      if (formData.apartment_id && formData.apartment_id.trim() !== '') {
        payload.apartment_id = formData.apartment_id;
      } else {
        payload.apartment_id = null;
      }
      
      // Add plate_number if provided
      if (formData.plate_number && formData.plate_number.trim() !== '') {
        payload.plate_number = formData.plate_number;
      } else {
        payload.plate_number = null;
      }
      
      await api.put(`/parking/spots/${editingSpot.spot_id}`, payload);
      addToast('Parking spot updated successfully', 'success');
      setShowEditModal(false);
      setEditingSpot(null);
      fetchParkingSpots();
    } catch (error) {
      console.error('Error updating parking spot:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to update parking spot', 'error');
    }
  };

  const handleDelete = async (spotId) => {
    if (!window.confirm('Are you sure you want to delete this parking spot?')) return;
    
    try {
      await api.delete(`/parking/spots/${spotId}`);
      addToast('Parking spot deleted successfully', 'success');
      fetchParkingSpots();
    } catch (error) {
      console.error('Error deleting parking spot:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to delete parking spot', 'error');
    }
  };

  const filteredSpots = parkingSpots.filter(spot => {
    if (filter === 'all') return true;
    if (filter === 'occupied') return spot.status === 'occupied';
    if (filter === 'available') return spot.status !== 'occupied';
    return true;
  });

  const getSpotTypeColor = (type) => {
    if (type === 'handicap') return 'bg-error text-on-error';
    if (type === 'visitor') return 'bg-secondary-container text-on-secondary-container';
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
        <span className="text-primary">Parking</span>
      </div>

      <div className="px-8 pb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Parking Management</h1>
            <p className="text-on-surface-variant">Manage parking spots and assignments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-primary text-on-primary font-bold text-sm tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add Parking Spot
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-bold uppercase ${
              filter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
            }`}
          >
            All ({parkingSpots.length})
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-4 py-2 text-xs font-bold uppercase ${
              filter === 'occupied' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
            }`}
          >
            Occupied ({parkingSpots.filter(s => s.status === 'occupied').length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 text-xs font-bold uppercase ${
              filter === 'available' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
            }`}
          >
            Available ({parkingSpots.filter(s => !s.is_occupied).length})
          </button>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-lowest p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add Parking Spot</h2>
                <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Spot Number</label>
                    <input
                      type="text"
                      value={formData.spot_number}
                      onChange={(e) => setFormData({ ...formData, spot_number: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      placeholder="e.g., P-101"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    >
                      <option value="standard">Standard</option>
                      <option value="handicapped">Handicapped</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </div>
                  {formData.type !== 'visitor' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Apartment Number (Optional)</label>
                      <input
                        type="text"
                        value={formData.apartment_id}
                        onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                        placeholder="e.g., B-202"
                      />
                    </div>
                  )}
                  {(formData.type === 'handicapped' || formData.type === 'standard') && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">License Plate (Optional)</label>
                      <input
                        type="text"
                        value={formData.plate_number}
                        onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                        placeholder="ABC-1234"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                    Create Spot
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingSpot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-lowest p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Parking Spot</h2>
                <button onClick={() => setShowEditModal(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Spot Number</label>
                    <input
                      type="text"
                      value={formData.spot_number}
                      onChange={(e) => setFormData({ ...formData, spot_number: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    >
                      <option value="standard">Standard</option>
                      <option value="handicapped">Handicapped</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </div>
                  {formData.type !== 'visitor' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Apartment Number</label>
                      <input
                        type="text"
                        value={formData.apartment_id}
                        onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                        placeholder="e.g., B-202"
                      />
                    </div>
                  )}
                  {(formData.type === 'handicapped' || formData.type === 'standard') && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">License Plate</label>
                      <input
                        type="text"
                        value={formData.plate_number}
                        onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                        placeholder="ABC-1234"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Occupied Status</label>
                    <select
                      value={formData.is_occupied ? 'occupied' : 'available'}
                      onChange={(e) => setFormData({ ...formData, is_occupied: e.target.value === 'occupied' })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                    </select>
                  </div>
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

        {filteredSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSpots.map((spot) => (
              <div
                key={spot.spot_id}
                className={`p-6 border-2 transition-all ${
                  spot.is_occupied
                    ? 'bg-surface-container-low border-outline-variant/30'
                    : 'bg-surface-container-lowest border-primary/20 hover:border-primary'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl">local_parking</span>
                    <h3 className="text-xl font-black">{spot.spot_number}</h3>
                  </div>
                  <span className={`px-2 py-1 text-[9px] font-bold uppercase ${getSpotTypeColor(spot.type)}`}>
                    {spot.type}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-on-surface-variant">location_on</span>
                    <span className="text-on-surface-variant">Floor: {spot.floor}</span>
                  </div>
                  
                  {spot.apartment_id && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-primary">home</span>
                      <span className="font-bold">Apt: {spot.apartment_number || spot.apartment_id.substring(0, 8)}</span>
                    </div>
                  )}
                  {spot.plate_number && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-on-surface-variant">directions_car</span>
                      <span className="text-on-surface-variant">{spot.plate_number}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase ${spot.status === 'occupied' ? 'bg-error-container text-on-error-container' : 'bg-primary text-on-primary'}`}>
                      {spot.status || 'Available'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(spot)}
                        className="p-1 hover:bg-primary-container hover:text-on-primary-container transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(spot.spot_id)}
                        className="p-1 hover:bg-error-container hover:text-on-error-container transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">local_parking</span>
            <p className="text-lg font-bold mb-2">No parking spots found</p>
            <p className="text-sm text-on-surface-variant">
              {filter !== 'all' ? `No ${filter} spots at the moment` : 'No parking spots configured'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ParkingManagement;
