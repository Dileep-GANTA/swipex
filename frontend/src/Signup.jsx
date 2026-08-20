import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('job seeker');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/register', {
        full_name: fullName, email: email, password: password, role: role
      });

      setSuccess(true);
     sessionStorage.setItem('token', response.data.access_token);
      setTimeout(() => navigate('/home'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <>
      <style>{`
        .pro-input:focus, .pro-select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
        .pro-btn { transition: background-color 0.2s, transform 0.1s; }
        .pro-btn:hover { background-color: #1d4ed8; }
        .pro-btn:active { transform: scale(0.98); }
      `}</style>

      <div style={styles.pageContainer}>
        
        {/* Increased Opacity Background Typography */}
        <div style={styles.bgQuote}>
          DISCOVER.<br/>CONNECT.<br/>CONQUER.
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.brand}>SwipeX</h1>
            <p style={styles.subtitle}>Create your professional profile</p>
          </div>

          {error && <div style={styles.errorMessage}>{error}</div>}
          {success && <div style={styles.successMessage}>Account created successfully. Redirecting...</div>}

          <form onSubmit={handleSignup} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                className="pro-input"
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                className="pro-input"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                className="pro-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Type</label>
              <select 
                className="pro-select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                style={styles.select}
              >
                <option value="job seeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <button type="submit" className="pro-btn" style={styles.primaryButton}>
              Create Account
            </button>
          </form>

          <p style={styles.footerText}>
            Already have an account? <Link to="/" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

const styles = {
  pageContainer: { position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b1120', padding: '20px', fontFamily: "'Inter', -apple-system, sans-serif" },
  bgQuote: { position: 'absolute', bottom: '5%', right: '-2%', fontSize: '12vw', fontWeight: '800', color: 'rgba(255, 255, 255, 0.06)', lineHeight: '0.85', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0, userSelect: 'none', textAlign: 'right' }, // Changed opacity to 0.06
  card: { position: 'relative', zIndex: 10, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  brand: { margin: 0, fontSize: '32px', color: '#ffffff', fontWeight: '700', letterSpacing: '-0.5px' },
  subtitle: { margin: '8px 0 0 0', color: '#94a3b8', fontSize: '15px' },
  errorMessage: { backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', border: '1px solid rgba(220, 38, 38, 0.2)', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center' },
  successMessage: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#cbd5e1' },
  input: { padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '15px', color: '#f8fafc', outline: 'none', transition: 'all 0.2s' },
  select: { padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '15px', color: '#f8fafc', outline: 'none', transition: 'all 0.2s' },
  primaryButton: { padding: '12px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  footerText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#94a3b8' },
  link: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }
};

export default Signup;