import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      console.log('Reset token (dev only):', response.data.token);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-background selection:bg-primary selection:text-on-primary">
      <header className="w-full flex justify-center items-center h-24 px-8 static bg-transparent">
        <h1 className="text-3xl font-black tracking-tighter text-primary">ASYS</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-12">
        <section className="w-full max-w-md">
          <div className="bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/10">
            <div className="mb-10 text-center">
              <span className="material-symbols-outlined text-5xl text-primary mb-4 block">lock_reset</span>
              <h2 className="text-xl font-bold tracking-tight text-primary mb-2">Reset Password</h2>
              <p className="text-sm text-on-surface-variant font-medium">
                Enter your email address and we'll send you a reset link.
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="p-4 bg-primary-container text-on-primary-container text-sm">
                  Reset link sent! Check your email for instructions.
                </div>
                <Link
                  to="/login"
                  className="w-full block text-center bg-surface-container-high text-primary py-4 text-sm font-bold tracking-tight hover:bg-surface-container-highest transition-all duration-300"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-1">
                      Email Address
                    </label>
                    <input
                      className="w-full bg-surface-container-low border-b border-outline-variant/30 focus:border-primary border-t-0 border-l-0 border-r-0 px-4 py-3 text-sm transition-all focus:ring-0 placeholder:text-outline"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-on-primary py-4 text-sm font-bold tracking-tight hover:bg-primary-container transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <Link
                    to="/login"
                    className="w-full block text-center bg-surface-container-high text-primary py-4 text-sm font-bold tracking-tight hover:bg-surface-container-highest transition-all duration-300"
                  >
                    Back to Login
                  </Link>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

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

export default ForgotPassword;
