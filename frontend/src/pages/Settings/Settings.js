import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const Settings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [paymentSettings, setPaymentSettings] = useState({
    payment_transfer_method: '',
    payment_transfer_details: '',
    monthly_expected_total: '0'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      
      if (user.role === 'admin') {
        fetchPaymentSettings();
      }
    }
  }, [user]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await api.get('/settings/payment');
      setPaymentSettings(response.data);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/users/${user.user_id}`, {
        name: profileData.name,
        phone: profileData.phone
      });
      addToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast(error.response?.data?.error?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8 || passwordData.newPassword.length > 20) {
      addToast('Password must be between 8 and 20 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/users/${user.user_id}`, {
        password: passwordData.newPassword
      });
      addToast('Password updated successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      addToast(error.response?.data?.error?.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/settings/payment', paymentSettings);
      addToast('Payment settings updated successfully', 'success');
    } catch (error) {
      console.error('Error updating payment settings:', error);
      addToast(error.response?.data?.error?.message || 'Failed to update payment settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Portal</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Settings</span>
      </div>

      <div className="px-8 pb-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter mb-2">Account Settings</h1>
          <p className="text-on-surface-variant">Manage your profile and security settings</p>
        </div>

        {/* Profile Information */}
        <div className="bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/10 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">person</span>
            <h2 className="text-xl font-bold">Profile Information</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                className="w-full bg-surface-container-low border-0 border-b border-outline-variant py-2 text-sm cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-on-surface-variant">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Payment Transfer Settings (Admin Only) */}
        {user?.role === 'admin' && (
          <div className="bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/10 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
              <h2 className="text-xl font-bold">Payment Transfer Settings</h2>
            </div>

            <form onSubmit={handlePaymentSettingsUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Monthly Expected Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentSettings.monthly_expected_total}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, monthly_expected_total: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                  placeholder="e.g., 5000.00"
                  required
                />
                <p className="text-xs text-on-surface-variant">Set the expected total dues amount for the current month</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Transfer Method</label>
                <input
                  type="text"
                  value={paymentSettings.payment_transfer_method}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_transfer_method: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                  placeholder="e.g., IBAN, Bank Transfer, PayPal"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Transfer Details</label>
                <textarea
                  value={paymentSettings.payment_transfer_details}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_transfer_details: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm resize-none"
                  placeholder="e.g., TR00 0000 0000 0000 0000 0000 00"
                  rows="3"
                  required
                />
                <p className="text-xs text-on-surface-variant">This information will be shown to residents when making payments</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Payment Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Change Password */}
        <div className="bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">lock</span>
            <h2 className="text-xl font-bold">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                placeholder="8-20 characters"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="mt-6 p-6 bg-surface-container-low">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Account Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Role:</span>
              <span className="font-bold capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Account Status:</span>
              <span className="font-bold text-primary">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">User ID:</span>
              <span className="font-mono text-xs">{user?.user_id}</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
