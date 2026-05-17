import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [duesData, setDuesData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [reservationsData, setReservationsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [maintenanceRes, reservationsRes] = await Promise.all([
        api.get('/maintenance/requests'),
        api.get('/reservations/user')
      ]);

      setMaintenanceData(maintenanceRes.data.requests || []);
      setReservationsData(reservationsRes.data.reservations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  const completedRequests = maintenanceData.filter(r => r.status === 'done').slice(0, 2);
  const upcomingReservations = reservationsData.filter(r => r.status === 'active').slice(0, 2);

  return (
    <MainLayout>
      <div className="h-10 bg-surface-dim border-b border-outline-variant/20 px-8 flex items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Home / Dashboard / Overview
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Hero Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Welcome back, {user?.name || 'Resident'}.</h1>
            <p className="text-on-surface-variant font-medium">Your building status is clear with <span className="text-primary underline">{maintenanceData.filter(r => r.status === 'pending').length} pending items</span>.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/resident/dues" className="px-6 py-2.5 bg-primary text-on-primary font-bold text-sm tracking-tight">Pay Now</Link>
            <Link to="/resident/reservations" className="px-6 py-2.5 bg-secondary-container text-on-secondary-container font-bold text-sm tracking-tight">Make Reservation</Link>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Critical Reminders */}
            <div className="bg-surface-container-lowest p-6 shadow-sm border border-neutral-100/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">priority_high</span>
                  Critical Reminders
                </h2>
                <span className="text-[10px] font-bold uppercase bg-surface-container px-2 py-1">Action Required</span>
              </div>
              <div className="space-y-4">
                {upcomingReservations.length > 0 ? (
                  upcomingReservations.map((reservation) => (
                    <div key={reservation.reservation_id} className="flex items-center justify-between p-4 bg-surface-container-low">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">pool</span>
                        </div>
                        <div>
                          <div className="font-bold text-sm">{reservation.area_name}</div>
                          <div className="text-xs text-on-surface-variant">
                            {new Date(reservation.start_time).toLocaleDateString()} • {new Date(reservation.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold px-2 py-1 bg-white border border-outline-variant/30">CONFIRMED</div>
                        <Link to="/resident/reservations" className="text-[10px] font-bold uppercase underline hover:text-on-surface-variant mt-1">Manage</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">event_available</span>
                    <p className="text-sm">No upcoming reservations</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recently Completed */}
            <div className="bg-surface-container-lowest p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight mb-8">Recently Completed</h2>
              <div className="space-y-6">
                {completedRequests.length > 0 ? (
                  completedRequests.map((request) => (
                    <div key={request.request_id} className="group border-b border-neutral-50 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold capitalize">{request.category} - {request.description.substring(0, 30)}</div>
                          <div className="text-xs text-on-surface-variant">Ticket #{request.request_id} • Completed {new Date(request.updated_at).toLocaleDateString()}</div>
                        </div>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1">RESOLVED</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">check_circle</span>
                    <p className="text-sm">No completed requests yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Activity Feed */}
            <div className="bg-surface-container-low p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black uppercase tracking-widest">Activity Feed</h2>
                <span className="material-symbols-outlined text-lg">history</span>
              </div>
              <div className="space-y-8 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/30">
                {maintenanceData.slice(0, 3).map((request, index) => (
                  <div key={request.request_id} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center ring-4 ring-surface-container-low">
                      <span className="material-symbols-outlined text-[10px] text-white">engineering</span>
                    </div>
                    <div className="text-xs font-bold capitalize">{request.category}</div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{request.description.substring(0, 60)}...</p>
                    <div className="text-[10px] text-on-surface-variant/50 mt-2">{new Date(request.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-primary p-6 text-on-primary">
              <h2 className="text-xs font-black uppercase tracking-widest mb-6 opacity-80">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <Link to="/resident/maintenance" className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 transition-colors text-left group">
                  <span className="material-symbols-outlined text-lg">add_box</span>
                  <span className="text-sm font-bold">New Maintenance</span>
                  <span className="material-symbols-outlined ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                </Link>
                <Link to="/resident/reservations" className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 transition-colors text-left group">
                  <span className="material-symbols-outlined text-lg">hub</span>
                  <span className="text-sm font-bold">Amenity Portal</span>
                  <span className="material-symbols-outlined ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResidentDashboard;
