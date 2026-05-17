import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../utils/api';

const MaintenanceManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('Fetching maintenance requests...');
      const response = await api.get('/maintenance/all');
      console.log('Maintenance response:', response.data);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await api.patch(`/maintenance/requests/${requestId}/status`, { status: newStatus });
      alert('Status updated successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusColor = (status) => {
    if (status === 'done') return 'bg-surface-container-high text-on-surface';
    if (status === 'in_progress') return 'bg-secondary-container text-on-secondary-container';
    return 'bg-primary text-on-primary';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'urgent') return 'text-error';
    if (priority === 'high') return 'text-primary';
    return 'text-on-surface-variant';
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
        <span className="text-primary">Maintenance</span>
      </div>

      <div className="px-8 pb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Maintenance Management</h1>
            <p className="text-on-surface-variant">Manage and assign maintenance requests</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-bold uppercase ${
                filter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 text-xs font-bold uppercase ${
                filter === 'pending' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
              }`}
            >
              Pending ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 text-xs font-bold uppercase ${
                filter === 'in_progress' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
              }`}
            >
              In Progress ({requests.filter(r => r.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-4 py-2 text-xs font-bold uppercase ${
                filter === 'done' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
              }`}
            >
              Done ({requests.filter(r => r.status === 'done').length})
            </button>
          </div>
        </div>

        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.request_id} className="bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-primary">engineering</span>
                      <h3 className="text-lg font-bold capitalize">{request.category}</h3>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-bold uppercase ${getPriorityColor(request.priority)}`}>
                        {request.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-3">{request.description}</p>
                    <div className="flex items-center gap-6 text-xs text-on-surface-variant">
                      <span>Request #{request.request_id}</span>
                      <span>Apartment: {request.apartment_number || 'N/A'}</span>
                      <span>Resident: {request.resident_name || 'N/A'}</span>
                      <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusUpdate(request.request_id, e.target.value)}
                      className="text-xs bg-surface-container border border-outline-variant px-3 py-2 font-bold uppercase focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">engineering</span>
            <p className="text-lg font-bold mb-2">No maintenance requests found</p>
            <p className="text-sm text-on-surface-variant">
              {filter !== 'all' ? `No ${filter.replace('_', ' ')} requests at the moment` : 'All requests have been handled'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MaintenanceManagement;
