import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardMap = {
        admin: '/manager',
        resident: '/resident',
        security: '/security'
      };
      navigate(dashboardMap[user.role] || '/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-background selection:bg-primary selection:text-on-primary">
      <header className="w-full flex justify-center items-center h-24 px-8 static bg-transparent">
        <h1 className="text-3xl font-black tracking-tighter text-primary">ASYS</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-20">
        {/* Login Section */}
        <section className="w-full max-w-md">
          <div className="bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/10">
            <div className="mb-10 text-center">
              <h2 className="text-xl font-bold tracking-tight text-primary mb-2">Welcome Back</h2>
              <p className="text-sm text-on-surface-variant font-medium">
                Access your resident portal management system.
              </p>
            </div>

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

              <div className="space-y-1 relative">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 focus:border-primary border-t-0 border-l-0 border-r-0 px-4 py-3 text-sm transition-all focus:ring-0 placeholder:text-outline"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link to="/forgot-password" className="text-xs font-bold text-primary underline underline-offset-4 hover:decoration-2 transition-all">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-4 text-sm font-bold tracking-tight hover:bg-primary-container transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </button>
            </form>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-4xl flex items-center gap-8">
          <div className="h-[1px] flex-grow bg-outline-variant/20"></div>
          <span className="text-[10px] font-black tracking-[0.2em] text-outline uppercase">Registration Gateway</span>
          <div className="h-[1px] flex-grow bg-outline-variant/20"></div>
        </div>

        {/* Registration Section */}
        <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Left Side: Role Selection */}
          <div className="md:col-span-4 space-y-8">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-primary mb-4">Create Account As:</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Select your operational role within the ASYS ecosystem to begin onboarding.
              </p>
            </div>
            <div className="space-y-4">
              <Link
                to="/signup/resident"
                className="w-full group text-left p-6 bg-surface-container-lowest border border-outline-variant/20 hover:border-primary transition-all duration-300 block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <span className="text-[10px] font-bold text-outline group-hover:text-primary">SELECT</span>
                </div>
                <span className="block font-bold text-primary mb-1">Resident</span>
                <span className="block text-xs text-on-surface-variant">
                  Access amenities, payments, and maintenance.
                </span>
              </Link>

              <Link
                to="/signup/admin"
                className="w-full group text-left p-6 bg-surface-container-low border border-transparent hover:bg-surface-container-lowest hover:border-outline-variant/20 transition-all duration-300 block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary">admin_panel_settings</span>
                  <span className="text-[10px] font-bold text-transparent group-hover:text-primary">SELECT</span>
                </div>
                <span className="block font-bold text-on-surface-variant group-hover:text-primary mb-1">Admin</span>
                <span className="block text-xs text-on-surface-variant">
                  Manage site logistics, parking, and residents.
                </span>
              </Link>
            </div>
          </div>

          {/* Right Side: Info Panel */}
          <div className="md:col-span-8 bg-surface-container-lowest p-10 border border-outline-variant/10">
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-6xl text-primary">how_to_reg</span>
              <h3 className="text-xl font-bold tracking-tight text-primary">Quick Registration</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-md mx-auto">
                Choose your role above to begin the registration process. Residents can self-register, 
                while Admin accounts are for building managers.
              </p>
              <div className="pt-6">
                <p className="text-xs text-on-surface-variant">
                  Already have an account? <Link to="/login" className="text-primary font-bold underline">Sign in here</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Decorative Pattern */}
        <div className="w-full h-64 bg-surface-container-low overflow-hidden relative opacity-40 group grayscale">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[180px] font-black text-surface-container-highest select-none">ASYS</span>
          </div>
          <div className="absolute inset-0 flex flex-wrap gap-4 p-8 opacity-20">
            <div className="w-24 h-24 bg-surface-dim"></div>
            <div className="w-48 h-24 bg-surface-container-high"></div>
            <div className="w-24 h-24 bg-surface-dim"></div>
            <div className="w-24 h-48 bg-surface-container-highest"></div>
            <div className="w-64 h-24 bg-surface-dim"></div>
            <div className="w-24 h-24 bg-surface-container-high"></div>
            <div className="w-48 h-48 bg-surface-dim"></div>
            <div className="w-24 h-24 bg-surface-container-high"></div>
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

export default LoginPage;
