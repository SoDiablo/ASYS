import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const SignupResident = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    apartmentId: '',
    apartmentNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 20) {
      setError('Password must be between 8 and 20 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/public/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'resident',
        phone: formData.phone,
        apartment_id: formData.apartmentId
      });

      alert('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-background selection:bg-primary selection:text-on-primary">
      <header className="w-full flex justify-center items-center h-24 px-8 static bg-transparent">
        <h1 className="text-3xl font-black tracking-tighter text-primary">ASYS</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/login" className="text-sm text-primary hover:underline flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Login
            </Link>
          </div>

          <div className="bg-surface-container-lowest p-10 border border-outline-variant/10">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">person</span>
                <h2 className="text-2xl font-black tracking-tighter text-primary">Resident Registration</h2>
              </div>
              <p className="text-sm text-on-surface-variant">
                Create your resident account to access amenities, payments, and maintenance services.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Full Legal Name
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 focus:border-primary border-t-0 border-l-0 border-r-0 px-4 py-3 text-sm transition-all focus:ring-0"
                    placeholder="Johnathan Doe"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Active Email
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 focus:border-primary border-t-0 border-l-0 border-r-0 px-4 py-3 text-sm transition-all focus:ring-0"
                    placeholder="j.doe@work.com"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Mobile Number
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 focus:border-primary border-t-0 border-l-0 border-r-0 px-4 py-3 text-sm transition-all focus:ring-0"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Apartment Number */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Apartment Number (Optional)
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 focus:border-primary border-t-0 border-l-0 border-r-0 px-4 py-3 text-sm transition-all focus:ring-0"
                    placeholder="e.g., B-202"
                    type="text"
                    name="apartmentId"
                    value={formData.apartmentId}
                    onChange={handleChange}
                  />
                </div>

                {/* Apartment Number */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Apartment Number
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 focus:border-primary border-t-0 border-l-0 border-r-0 px-4 py-3 text-sm transition-all focus:ring-0"
                    placeholder="Block A - 402"
                    type="text"
                    name="apartmentNumber"
                    value={formData.apartmentNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                    Security Password
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 focus:border-primary border-t-0 border-l-0 border-r-0 px-4 py-3 text-sm transition-all focus:ring-0"
                    placeholder="Create a strong password (8-20 characters)"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Terms */}
                <div className="md:col-span-2 flex items-start gap-3 pt-4">
                  <input
                    className="mt-1 rounded-none border-outline-variant text-primary focus:ring-0"
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="terms">
                    By proceeding, I agree to the architectural standards and data governance policies of ASYS Site Management.
                  </label>
                </div>

                {/* Submit */}
                <div className="md:col-span-2 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-primary text-on-primary text-sm font-bold tracking-tight hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center bg-surface-container-low mt-20">
        <div className="flex gap-8 mb-6 md:mb-0">
          <a className="text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest" href="#">Privacy</a>
          <a className="text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest" href="#">Compliance</a>
          <a className="text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest" href="#">Site Map</a>
        </div>
        <div className="text-[10px] font-bold text-outline uppercase tracking-tighter">
          © 2024 ASYS Architectural Systems. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default SignupResident;