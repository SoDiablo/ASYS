import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const Parking = () => {
  const { addToast } = useToast();
  const [parkingSpots, setParkingSpots] = useState([]);
  const [mySpot, setMySpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [plateNumber, setPlateNumber] = useState('');

  useEffect(() => {
    fetchParkingData();
  }, []);

  const fetchParkingData = async () => {
    try {
      const response = await api.get('/parking/spots');
      const spots = response.data.spots || [];
      setParkingSpots(spots);
      
      // Find user's current spot
      const userSpot = spots.find(spot => spot.is_mine);
      setMySpot(userSpot);
    } catch (error) {
      console.error('Error fetching parking data:', error);
      addToast('Failed to load parking spots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSpot = (spot) => {
    setSelectedSpot(spot);
    setShowClaimModal(true);
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/parking/spots/${selectedSpot.spot_id}`, {
        status: 'occupied',
        plate_number: plateNumber
      });
      addToast('Parking spot claimed successfully!', 'success');
      setShowClaimModal(false);
      setPlateNumber('');
      setSelectedSpot(null);
      fetchParkingData();
    } catch (error) {
      console.error('Error claiming spot:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to claim parking spot';
      addToast(errorMessage, 'error');
    }
  };

  const handleReleaseSpot = async () => {
    if (!window.confirm('Are you sure you want to release your parking spot?')) return;
    
    try {
      await api.put(`/parking/spots/${mySpot.spot_id}`, {
        status: 'available',
        plate_number: null,
        apartment_id: null
      });
      addToast('Parking spot released successfully', 'success');
      fetchParkingData();
    } catch (error) {
      console.error('Error releasing spot:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to release parking spot';
      addToast(errorMessage, 'error');
    }
  };

  const getSpotTypeColor = (type) => {
    if (type === 'handicapped') return 'bg-error text-on-error';
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

  const availableSpots = parkingSpots.filter(spot => spot.status === 'available' && spot.type !== 'visitor');

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Portal</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Parking</span>
      </div>

      <div className="px-8 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter mb-2">Parking Management</h1>
          <p className="text-on-surface-variant">View and manage your parking spot</p>
        </div>

        {/* My Current Spot */}
        {mySpot && (
          <div className="mb-8 bg-primary-container p-6 border-l-4 border-primary">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined">local_parking</span>
                  Your Parking Spot
                </h2>
                <div className="space-y-2">
                  <p className="text-lg font-bold">Spot: {mySpot.spot_number}</p>
                  <p className="text-sm">Floor: {mySpot.floor}</p>
                  <p className="text-sm">Type: <span className="capitalize">{mySpot.type}</span></p>
                  <p className="text-sm">Plate: {mySpot.plate_number}</p>
                </div>
              </div>
              <button
                onClick={handleReleaseSpot}
                className="px-4 py-2 bg-error text-on-error text-xs font-bold uppercase hover:opacity-80 transition-opacity"
              >
                Release Spot
              </button>
            </div>
          </div>
        )}

        {/* Available Spots */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Available Spots ({availableSpots.length})
          </h2>
        </div>

        {availableSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableSpots.map((spot) => (
              <div
                key={spot.spot_id}
                className="p-6 border-2 border-primary/20 bg-surface-container-lowest hover:border-primary transition-all"
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
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-on-surface-variant">location_on</span>
                    <span className="text-on-surface-variant">Floor: {spot.floor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                    <span className="font-bold text-primary">Available</span>
                  </div>
                </div>

                {!mySpot && (
                  <button
                    onClick={() => handleClaimSpot(spot)}
                    className="w-full py-2 bg-primary text-on-primary text-xs font-bold uppercase hover:opacity-90 transition-opacity"
                  >
                    Claim Spot
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">local_parking</span>
            <p className="text-lg font-bold mb-2">No available parking spots</p>
            <p className="text-sm text-on-surface-variant">
              {mySpot ? 'You already have a parking spot assigned' : 'All parking spots are currently occupied'}
            </p>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedSpot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest p-8 max-w-md w-full border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Claim Parking Spot</h2>
              <button onClick={() => setShowClaimModal(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-surface-container">
              <p className="text-sm text-on-surface-variant mb-2">Spot Details:</p>
              <p className="font-bold text-lg">{selectedSpot.spot_number}</p>
              <p className="text-sm">Floor: {selectedSpot.floor}</p>
              <p className="text-sm capitalize">Type: {selectedSpot.type}</p>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Vehicle Plate Number
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm uppercase"
                  placeholder="ABC-1234"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Claim Spot
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowClaimModal(false)} 
                  className="flex-1 px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Parking;
