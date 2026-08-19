import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <svg className="w-9 h-9 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const Login = () => {
  const [role, setRole] = useState('job_seeker'); // job_seeker, recruiter, admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');
    try {
      const user = await login(email, password);
      
      if (user.role !== role) {
        setRole(user.role); // Auto-switch role tab for convenience
        navigate('/discover');
        return;
      }
      
      navigate('/discover');
    } catch (err) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-grid">
      {/* Left side: Value proposition / Brand (Light Slate) */}
      <div className="md:w-1/2 flex flex-col justify-between p-8 md:p-16 bg-slate-100/80 border-r border-slate-200/60 relative overflow-hidden">
        {/* Logo and Wordmark */}
        <div className="flex items-center space-x-3 z-10">
          <Logo />
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">SwipeX</span>
        </div>

        {/* Value Proposition */}
        <div className="my-auto py-12 md:py-0 max-w-md z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Connecting top talent with leading teams, one swipe at a time.
          </h2>
          <p className="text-slate-600 mt-4 text-sm leading-relaxed">
            SwipeX is an intelligent, swipe-based discovery platform designed to simplify career growth. Experience direct, fast, and secure connections.
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 z-10">
          &copy; 2026 SwipeX Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Onboarding Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-xs mt-1">Please enter your credentials to log in.</p>
          </div>

          {localError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 mb-5 text-xs text-red-700">
              {localError}
            </div>
          )}

          {/* Segmented Control */}
          <div className="segmented-control rounded-xl flex mb-6">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg segmented-button ${
                role === 'job_seeker' ? 'active' : ''
              }`}
              onClick={() => {
                setRole('job_seeker');
                setLocalError('');
              }}
            >
              Job Seeker
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg segmented-button ${
                role === 'recruiter' ? 'active' : ''
              }`}
              onClick={() => {
                setRole('recruiter');
                setLocalError('');
              }}
            >
              Recruiter
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg segmented-button ${
                role === 'admin' ? 'active' : ''
              }`}
              onClick={() => {
                setRole('admin');
                setLocalError('');
              }}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-accent hover:bg-accent-light text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-light hover:underline font-semibold transition">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
