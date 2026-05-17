import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../utils/api';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchMaintenanceRequests();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await api.get('/maintenance/all');
      // Get only the 5 most recent requests
      setMaintenanceRequests((response.data.requests || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
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

  const paymentTrendData = {
    labels: dashboardData?.payment_trend?.map(item => 
      new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Dues Collected',
        data: dashboardData?.payment_trend?.map(item => item.amount) || [],
        borderColor: '#000000',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        tension: 0.4
      }
    ]
  };

  const requestCategoriesData = {
    labels: dashboardData?.request_categories?.map(item => item.category) || [],
    datasets: [
      {
        data: dashboardData?.request_categories?.map(item => item.count) || [],
        backgroundColor: ['#000000', '#474747', '#5e5e5e', '#777777']
      }
    ]
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-primary">Manager Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Overview of building operations and key metrics
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">payments</span>
              <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                This Month
              </span>
            </div>
            <h3 className="text-3xl font-black text-primary">
              ${dashboardData?.total_collected?.toFixed(2) || '0.00'} / ${dashboardData?.total_expected?.toFixed(2) || '0.00'}
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">Collected / Expected</p>
          </div>

          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">build</span>
              <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                Active
              </span>
            </div>
            <h3 className="text-3xl font-black text-primary">
              {dashboardData?.open_requests || 0}
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">Open Requests</p>
          </div>

          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">home</span>
              <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                Current
              </span>
            </div>
            <h3 className="text-3xl font-black text-primary">
              {dashboardData?.occupancy_rate || 0}%
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">Occupancy Rate</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <h3 className="text-lg font-bold text-primary mb-4">Payment Trend (12 Months)</h3>
            <Line data={paymentTrendData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <h3 className="text-lg font-bold text-primary mb-4">Maintenance Requests by Category</h3>
            <Pie data={requestCategoriesData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>

        {/* Recent Maintenance Requests */}
        <div className="mt-6 bg-surface-container-lowest p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary">Recent Maintenance Requests</h3>
            <a href="/manager/maintenance" className="text-xs font-bold uppercase text-primary hover:underline">
              View All
            </a>
          </div>
          {maintenanceRequests.length > 0 ? (
            <div className="space-y-3">
              {maintenanceRequests.map((request) => (
                <div key={request.request_id} className="flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="material-symbols-outlined text-primary">engineering</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold capitalize">{request.category}</span>
                        <span className="text-xs text-on-surface-variant">#{request.request_id}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant truncate">{request.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-on-surface-variant">{request.apartment_number || 'N/A'}</span>
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase ${
                      request.status === 'done' ? 'bg-surface-container-high text-on-surface' :
                      request.status === 'in_progress' ? 'bg-secondary-container text-on-secondary-container' :
                      'bg-primary text-on-primary'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-on-surface-variant py-8">No recent maintenance requests</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ManagerDashboard;
