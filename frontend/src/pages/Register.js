import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <svg className="w-9 h-9 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('job_seeker'); // job_seeker or recruiter
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Live password validation
  const passChecks = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = passChecks.length && passChecks.number && passChecks.special;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setLocalError('Please satisfy all password strength requirements.');
      return;
    }

    setSubmitting(true);

    const payload = {
      email,
      password,
      role,
      full_name: fullName,
    };

    if (role === 'job_seeker') {
      payload.phone = phone || null;
      payload.location = location || null;
    } else {
      payload.company_name = companyName;
      payload.company_website = companyWebsite || null;
    }

    try {
      await register(payload);
      navigate('/discover');
    } catch (err) {
      setLocalError(err.message || 'Registration failed.');
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

        {/* Value Prop */}
        <div className="my-auto py-12 md:py-0 max-w-md z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Build your profile. Discover matching jobs. Grow instantly.
          </h2>
          <p className="text-slate-600 mt-4 text-sm leading-relaxed">
            Create an account to discover jobs tailored to your skills. Swipe right on jobs you love, and match directly with recruiting managers.
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 z-10">
          &copy; 2026 SwipeX Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an account</h1>
            <p className="text-slate-500 text-xs mt-1">Get started by choosing your profile role.</p>
          </div>

          {localError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 mb-5 text-xs text-red-700">
              {localError}
            </div>
          )}

          {/* Segmented control for Role */}
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
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-450"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-450"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Conditional Role-Based Profile Fields */}
            {role === 'job_seeker' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="phone">
                    Phone (Optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-450"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="location">
                    Location (Optional)
                  </label>
                  <input
                    id="location"
                    type="text"
                    className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-450"
                    placeholder="San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="companyName">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-450"
                    placeholder="Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="companyWebsite">
                    Company Website (Optional)
                  </label>
                  <input
                    id="companyWebsite"
                    type="url"
                    className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-450"
                    placeholder="https://acme.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-450"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="w-full custom-input rounded-lg px-3.5 py-2 text-sm placeholder-slate-450"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Dynamic, live password requirements list */}
            <div className="text-[11px] p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-600 font-semibold block mb-1">Password Requirements:</span>
              <div className="flex items-center space-x-2">
                <span className={passChecks.length ? 'text-teal-600' : 'text-gray-300'}>
                  {passChecks.length ? '●' : '○'}
                </span>
                <span className={passChecks.length ? 'text-slate-700' : 'text-slate-400'}>At least 8 characters</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={passChecks.number ? 'text-teal-600' : 'text-gray-300'}>
                  {passChecks.number ? '●' : '○'}
                </span>
                <span className={passChecks.number ? 'text-slate-700' : 'text-slate-400'}>At least 1 number</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={passChecks.special ? 'text-teal-600' : 'text-gray-300'}>
                  {passChecks.special ? '●' : '○'}
                </span>
                <span className={passChecks.special ? 'text-slate-700' : 'text-slate-400'}>At least 1 special character</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-accent hover:bg-accent-light text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-light hover:underline font-semibold transition">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
