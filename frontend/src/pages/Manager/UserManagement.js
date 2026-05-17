import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const UserManagement = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'resident',
    phone: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    apartment_id: '',
    role: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await api.get('/users');
      console.log('Users response:', response.data);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8 || formData.password.length > 20) {
      addToast('Password must be between 8 and 20 characters', 'error');
      return;
    }

    try {
      await api.post('/users', formData);
      addToast('User created successfully', 'success');
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role: 'resident', phone: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      addToast(error.response?.data?.error?.message || 'Failed to create user', 'error');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.patch(`/auth/activate-user/${userId}`, { is_active: !currentStatus });
      addToast(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      addToast('Failed to update user status', 'error');
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      apartment_id: user.apartment_id || '',
      role: user.role || 'resident'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${editingUser.user_id}`, editFormData);
      addToast('User updated successfully', 'success');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to update user', 'error');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password to 12345678?')) return;
    
    try {
      await api.post(`/users/${userId}/reset-password`);
      addToast('Password reset to 12345678', 'success');
    } catch (error) {
      console.error('Error resetting password:', error);
      addToast('Failed to reset password', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      addToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast(error?.response?.data?.error?.message || 'Failed to delete user', 'error');
    }
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'bg-primary text-on-primary';
    if (role === 'security') return 'bg-secondary-container text-on-secondary-container';
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
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    resident: users.filter(u => u.role === 'resident').length,
    security: users.filter(u => u.role === 'security').length,
    active: users.filter(u => u.is_active).length
  };

  return (
    <MainLayout>
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Manager</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Users</span>
      </div>

      <div className="px-8 pb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">User Management</h1>
            <p className="text-on-surface-variant">Manage user accounts and permissions</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-primary text-on-primary font-bold text-sm tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            New User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Total Users</div>
            <div className="text-3xl font-black text-primary">{stats.total}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Admins</div>
            <div className="text-3xl font-black text-primary">{stats.admin}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Residents</div>
            <div className="text-3xl font-black text-primary">{stats.resident}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Security</div>
            <div className="text-3xl font-black text-primary">{stats.security}</div>
          </div>
          <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
            <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Active</div>
            <div className="text-3xl font-black text-primary">{stats.active}</div>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-surface-container-lowest p-8 shadow-sm mb-8 border border-outline-variant/10">
            <h2 className="text-xl font-bold mb-6">Create New User</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    placeholder="8-20 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                    <option value="security">Security</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Create User
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

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-container-lowest p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Apartment Number</label>
                    <input
                      type="text"
                      value={editFormData.apartment_id}
                      onChange={(e) => setEditFormData({ ...editFormData, apartment_id: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                      placeholder="e.g., B-202"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm"
                    >
                      <option value="resident">Resident</option>
                      <option value="admin">Admin</option>
                      <option value="security">Security</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        {users.length > 0 ? (
          <div className="bg-surface-container-lowest shadow-sm border border-outline-variant/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-container">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Apartment</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-bold">{user.name}</td>
                    <td className="p-4 text-sm">{user.email}</td>
                    <td className="p-4 text-sm">{user.phone || 'N/A'}</td>
                    <td className="p-4 text-sm">{user.apartment_number || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase ${user.is_active ? 'bg-primary text-on-primary' : 'bg-error-container text-on-error-container'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1 text-xs font-bold uppercase bg-primary-container text-on-primary-container hover:opacity-80 transition-opacity"
                          title="Edit User"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.user_id)}
                          className="px-3 py-1 text-xs font-bold uppercase bg-secondary-container text-on-secondary-container hover:opacity-80 transition-opacity"
                          title="Reset Password"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.user_id, user.is_active)}
                          className={`px-3 py-1 text-xs font-bold uppercase ${
                            user.is_active 
                              ? 'bg-neutral-400 text-white hover:bg-neutral-500' 
                              : 'bg-primary text-on-primary hover:opacity-90'
                          } transition-all`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="px-3 py-1 text-xs font-bold uppercase bg-error-container text-on-error-container hover:opacity-80 transition-opacity"
                          title="Delete User"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">people</span>
            <p className="text-lg font-bold mb-2">No users found</p>
            <p className="text-sm text-on-surface-variant">Create your first user using the button above</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserManagement;
