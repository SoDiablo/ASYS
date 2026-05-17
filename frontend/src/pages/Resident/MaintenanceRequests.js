import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useToast } from '../../components/Toast/Toast';
import api from '../../utils/api';

const MaintenanceRequests = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    category: 'electric',
    customCategory: '',
    description: '',
    photo: null,
    photoPreview: null
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/maintenance/requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      addToast('Failed to load maintenance requests', 'error');
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
      const category = formData.category === 'other' ? formData.customCategory : formData.category;
      
      if (formData.category === 'other' && !formData.customCategory.trim()) {
        addToast('Please specify the category for "Other"', 'error');
        return;
      }
      
      const requestData = {
        category: category,
        description: formData.description,
        priority: 'medium'
      };
      
      // If photo is selected, convert to base64
      if (formData.photo) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          requestData.photo_url = reader.result;
          
          try {
            await api.post('/maintenance/requests', requestData);
            addToast('Maintenance request submitted successfully!', 'success');
            setFormData({ category: 'electric', customCategory: '', description: '', photo: null, photoPreview: null });
            fetchRequests();
          } catch (error) {
            console.error('Error submitting request:', error);
            const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to submit request';
            addToast(errorMessage, 'error');
          }
        };
        reader.readAsDataURL(formData.photo);
      } else {
        await api.post('/maintenance/requests', requestData);
        addToast('Maintenance request submitted successfully!', 'success');
        setFormData({ category: 'electric', customCategory: '', description: '', photo: null, photoPreview: null });
        fetchRequests();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Failed to submit request';
      addToast(errorMessage, 'error');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addToast('Photo size must be less than 5MB', 'error');
        return;
      }
      setFormData({ 
        ...formData, 
        photo: file,
        photoPreview: URL.createObjectURL(file)
      });
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.status === 'pending';
    if (filter === 'done') return req.status === 'done';
    return true;
  });

  const getStatusBadge = (status) => {
    if (status === 'done') return 'px-2 py-1 text-[9px] font-black uppercase tracking-tighter bg-surface-container-high text-on-surface';
    if (status === 'in_progress') return 'px-2 py-1 text-[9px] font-black uppercase tracking-tighter bg-secondary-container text-on-secondary-container';
    return 'px-2 py-1 text-[9px] font-black uppercase tracking-tighter bg-primary text-on-primary';
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
      {/* Breadcrumb Rail */}
      <div className="flex items-center gap-2 mb-12 py-2 border-b border-surface-dim/20 text-[10px] tracking-widest uppercase font-bold text-on-surface-variant px-8">
        <span>Portal</span>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-primary">Maintenance</span>
      </div>

      <div className="px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Maintenance Form Section */}
          <section className="lg:col-span-5 space-y-10">
            <header>
              <h1 className="text-4xl font-black tracking-tight mb-2">New Request</h1>
              <p className="text-on-surface-variant text-sm">Submit a ticket for site maintenance or repairs.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8 bg-surface-container-lowest p-8 shadow-sm">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 text-sm"
                >
                  <option value="electric">Electric</option>
                  <option value="water">Water</option>
                  <option value="elevator">Elevator</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Custom Category Input - shown only when "Other" is selected */}
              {formData.category === 'other' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Specify Category</label>
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 transition-all py-3 text-sm"
                    placeholder="e.g., Door repair, Window issue, etc."
                    required
                  />
                </div>
              )}

              {/* Description */}
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

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Supporting Media</label>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="group relative flex flex-col items-center justify-center w-full h-40 border border-dashed border-outline-variant/40 bg-surface-container-low hover:bg-surface-variant/20 transition-all cursor-pointer"
                >
                  {formData.photoPreview ? (
                    <div className="relative w-full h-full">
                      <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFormData({ ...formData, photo: null, photoPreview: null });
                        }}
                        className="absolute top-2 right-2 bg-error text-on-error p-2 rounded-full hover:opacity-80"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl mb-2 text-outline">add_a_photo</span>
                      <span className="text-xs text-on-surface-variant">Click to upload photo (max 5MB)</span>
                    </>
                  )}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              >
                Submit Request
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </section>

          {/* Maintenance List Section */}
          <section className="lg:col-span-7 space-y-10">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Active Logs</h2>
                <p className="text-on-surface-variant text-sm">Track your ongoing and past tickets.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase border ${
                    filter === 'all'
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase border ${
                    filter === 'pending'
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('done')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase border ${
                    filter === 'done'
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                  }`}
                >
                  Done
                </button>
              </div>
            </header>

            {/* Cards Grid/List */}
            <div className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div key={request.request_id} className={`bg-surface-container-lowest p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow ${request.status === 'pending' ? 'border-l-4 border-primary' : ''}`}>
                    <div className="w-full md:w-32 h-24 bg-surface-container flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {request.photo_url ? (
                        <img src={request.photo_url} alt="Issue" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-outline text-3xl">image_not_supported</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                            Log #{request.request_id} — {request.category}
                          </span>
                          <h3 className="font-bold text-lg leading-tight capitalize">{request.description.substring(0, 50)}</h3>
                        </div>
                        <span className={getStatusBadge(request.status)}>
                          {request.status === 'in_progress' ? 'Progress' : request.status}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant line-clamp-2">{request.description}</p>
                      <div className="pt-4 flex items-center gap-4 text-[10px] text-outline font-medium">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <span className="material-symbols-outlined text-[14px]">
                            {request.status === 'done' ? 'verified' : 'hourglass_empty'}
                          </span>
                          {request.status === 'done' ? 'Resolved' : 'Awaiting Assignee'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">engineering</span>
                  <p className="text-lg font-bold mb-2">No maintenance requests found</p>
                  <p className="text-sm">Submit a new request using the form on the left</p>
                </div>
              )}
            </div>

            {/* Footer Summary Card */}
            <div className="bg-surface-container-low p-8 border border-outline-variant/10 text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-4">Urgent Issue?</p>
              <p className="text-sm mb-6 max-w-xs mx-auto">For after-hours structural or flood emergencies, please contact the site supervisor directly.</p>
              <a className="text-primary font-black text-lg underline decoration-2 underline-offset-4" href="tel:+18005557297">+1 800 555 ASYS</a>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default MaintenanceRequests;
