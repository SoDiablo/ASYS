import React, { useState } from 'react';
import { useToast } from '../Toast/Toast';
import api from '../../utils/api';

const MaintenanceModal = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    category: 'plumbing',
    description: '',
    priority: 'medium'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance/requests', formData);
      addToast('Maintenance request submitted successfully!', 'success');
      setFormData({ category: 'plumbing', description: '', priority: 'medium' });
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting request:', error);
      addToast(error.response?.data?.error?.message || 'Failed to submit request', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest max-w-2xl w-full p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tight">New Maintenance Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 text-sm"
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="general">General Repair</option>
              <option value="landscaping">Landscaping</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 text-sm resize-none"
              placeholder="Describe the issue in detail..."
              rows="4"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Submit Request
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
