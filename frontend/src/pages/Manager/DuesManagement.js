import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const DuesManagement = () => {
  const { addToast } = useToast();
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [monthlyExpected, setMonthlyExpected] = useState('0');
  const [isEditingExpected, setIsEditingExpected] = useState(false);
  const [formData, setFormData] = useState({
    apartment_id: '',
    amount: '',
    period_month: '',
    due_date: ''
  });

  useEffect(() => {
    fetchDues();
    fetchMonthlyExpected();
  }, []);

  const fetchMonthlyExpected = async () => {
    try {
      const response = await api.get('/settings/payment');
      setMonthlyExpected(response.data.monthly_expected_total || '0');
    } catch (error) {
      console.error('Error fetching monthly expected:', error);
    }
  };

  const handleUpdateExpected = async () => {
    try {
      await api.patch('/settings/monthly-expected', {
        monthly_expected_total: monthlyExpected
      });
      
      addToast('Monthly expected total updated successfully', 'success');
      setIsEditingExpected(false);
    } catch (error) {
      console.error('Error updating monthly expected:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to update monthly expected', 'error');
    }
  };

  const fetchDues = async () => {
    try {
      console.log('Fetching all dues...');
      const response = await api.get('/dues/all');
      console.log('Dues response:', response.data);
      setDues(response.data.apartments || []);
    } catch (error) {
      console.error('Error fetching dues:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to load dues data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/dues', formData);
      addToast('Payment created successfully', 'success');
      setShowCreateModal(false);
      setFormData({ apartment_id: '', amount: '', period_month: '', due_date: '' });
      fetchDues();
    } catch (error) {
      console.error('Error creating payment:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to create payment', 'error');
    }
  };

  const filteredDues = dues.filter(due => {
    if (filter === 'all') return true;
    return due.status === filter;
  });

  const getStatusColor = (status) => {
    if (status === 'paid') return 'bg-primary text-on-primary';
    if (status === 'overdue') return 'bg-error text-on-error';
    return 'bg-secondary-container text-on-secondary-container';
  };

  const getTotalAmount = (amount, penalty) => {
    return (parseFloat(amount) + parseFloat(penalty || 0)).toFixed(2);
  };

  const handleStatusChange = async (dueId, newStatus) => {
    try {
      await api.patch(`/dues/${dueId}/status`, { status: newStatus });
      addToast('Payment status updated successfully', 'success');
      fetchDues();
    } catch (error) {
      console.error('Error updating status:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to update status', 'error');
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

  const stats = {
    total: dues.length,
    paid: dues.filter(d => d.status === 'paid').length,
    pending: dues.filter(d => d.status === 'pending').length,
    overdue: dues.filter(d => d.status === 'overdue').length,
    totalAmount: dues.reduce((sum, d) => sum + parseFloat(d.amount) + parseFloat(d.penalty || 0), 0),
    totalPaid: dues.filter(d => d.status === 'paid').reduce((sum, d) => sum + parseFloat(d.amount) + parseFloat(d.penalty || 0), 0)
  };

  return (
    <MainLayout>
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Manager</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Dues Management</span>
      </div>

      <div className="px-8 pb-8">
        <div className="mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Dues Management</h1>
              <p className="text-on-surface-variant">View and manage all apartment dues</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary text-on-primary font-bold text-sm tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Create Payment
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Total Dues</div>
            <div className="text-3xl font-black text-primary">{stats.total}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Paid</div>
            <div className="text-3xl font-black text-primary">{stats.paid}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Pending</div>
            <div className="text-3xl font-black text-secondary">{stats.pending}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Overdue</div>
            <div className="text-3xl font-black text-error">{stats.overdue}</div>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-primary text-on-primary p-6 mb-8 border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold mb-2">Total Collected / Total Expected</div>
              <div className="text-4xl font-black">${stats.totalPaid.toFixed(2)} / ${parseFloat(monthlyExpected).toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest font-bold mb-2">Remaining</div>
              <div className="text-3xl font-black">${(parseFloat(monthlyExpected) - stats.totalPaid).toFixed(2)}</div>
            </div>
            <div>
              {isEditingExpected ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyExpected}
                    onChange={(e) => setMonthlyExpected(e.target.value)}
                    className="w-32 px-3 py-2 bg-on-primary text-primary border-2 border-on-primary focus:ring-0 text-sm font-bold"
                    placeholder="0.00"
                  />
                  <button
                    onClick={handleUpdateExpected}
                    className="px-4 py-2 bg-on-primary text-primary text-xs font-bold uppercase hover:opacity-80"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingExpected(false);
                      fetchMonthlyExpected();
                    }}
                    className="px-4 py-2 bg-error text-on-error text-xs font-bold uppercase hover:opacity-80"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingExpected(true)}
                  className="px-4 py-2 bg-on-primary text-primary text-xs font-bold uppercase hover:opacity-80 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit Expected
                </button>
              )}
            </div>
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
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 text-xs font-bold uppercase ${
              filter === 'paid' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
            }`}
          >
            Paid ({stats.paid})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-xs font-bold uppercase ${
              filter === 'pending' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 text-xs font-bold uppercase ${
              filter === 'overdue' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
            }`}
          >
            Overdue ({stats.overdue})
          </button>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-lowest p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create Payment</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Apartment Number</label>
                  <input
                    type="text"
                    value={formData.apartment_id}
                    onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    placeholder="e.g., B-202"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Period Month</label>
                  <input
                    type="month"
                    value={formData.period_month ? formData.period_month.substring(0, 7) : ''}
                    onChange={(e) => setFormData({ ...formData, period_month: e.target.value ? e.target.value + '-01' : '' })}
                    className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary px-3 py-2 text-sm"
                    required
                  />
                </div>
                

                
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
                    Create Payment
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dues Table */}
        {filteredDues.length > 0 ? (
          <div className="bg-surface-container-lowest shadow-sm border border-outline-variant/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-container">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
                  <th className="p-4">Apartment</th>
                  <th className="p-4">Resident</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Penalty</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredDues.map((due) => (
                  <tr key={due.due_id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-bold">{due.apartment_number || 'N/A'}</td>
                    <td className="p-4 text-sm">{due.resident_name || 'Unassigned'}</td>
                    <td className="p-4 text-sm">{new Date(due.period_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-sm font-bold">${parseFloat(due.amount).toFixed(2)}</td>
                    <td className="p-4 text-sm text-error">${parseFloat(due.penalty || 0).toFixed(2)}</td>
                    <td className="p-4 text-sm font-black">${getTotalAmount(due.amount, due.penalty)}</td>
                    <td className="p-4 text-sm">{new Date(due.due_date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase ${getStatusColor(due.status)}`}>
                        {due.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={due.status}
                        onChange={(e) => handleStatusChange(due.due_id, e.target.value)}
                        className="text-xs bg-surface-container border border-outline-variant px-2 py-1 focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">payments</span>
            <p className="text-lg font-bold mb-2">No dues found</p>
            <p className="text-sm text-on-surface-variant">
              {filter !== 'all' ? `No ${filter} dues at the moment` : 'No dues have been generated yet'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DuesManagement;
