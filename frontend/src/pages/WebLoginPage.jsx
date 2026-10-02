import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { ShieldCheck, Activity, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function WebLoginPage({ onLoginSuccess, navigate }) {
  const [view, setView] = useState('login'); // login | register | sso_select
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Registration Fields
  const [regRole, setRegRole] = useState('Student'); // Student | Teacher | Drill Coordinator
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regId, setRegId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);


  const handlePasswordLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        if (data.user.role === 'Student') {
          setError('Access Denied: Student accounts must use the EvacSense Mobile App.');
          return;
        }
        onLoginSuccess(data.session.token, data.user);
      } else {
        setError(data.message || data.errors?.[0] || 'Authentication failed.');
      }
    } catch (err) {
      setError('Connection to EvacSense authorization server failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };



  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!regName || !regEmail || !regId || !regPassword) {
      setError('Please fill out all fields.');
      setLoading(false);
      return;
    }

    try {
      let endpoint = '';
      let bodyData = {};

      if (regRole === 'Student') {
        endpoint = `${API_BASE_URL}/api/auth/register/student`;
        bodyData = {
          name: regName,
          email: regEmail,
          studentId: regId,
          password: regPassword,
          deviceId: 'DEVICE-' + Math.floor(1000 + Math.random() * 9000)
        };
      } else {
        endpoint = `${API_BASE_URL}/api/auth/register/staff`;
        bodyData = {
          name: regName,
          email: regEmail,
          employeeId: regId,
          password: regPassword,
          role: regRole,
          deviceId: 'DEVICE-' + Math.floor(1000 + Math.random() * 9000)
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await response.json();

      if (response.ok && (data.status === 'success' || data.status === 'pending')) {
        setSuccessMessage(data.message);
        // Clear fields
        setRegName('');
        setRegEmail('');
        setRegId('');
        setRegPassword('');
      } else {
        setError(data.message || data.errors?.[0] || 'Registration failed.');
      }

    } catch (err) {
      setError('Connection to EvacSense authorization server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eds-page-wrapper">
      {/* 1. Header Bar */}
      <header className="eds-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
          }}>
            <ShieldCheck size={26} color="#38bdf8" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', color: '#ffffff', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
              EvacSense
            </h2>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>
              SAFETY & EMERGENCY MANAGEMENT
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.7)', padding: '0.4rem 0.85rem', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <Activity size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>
            Emergency Evacuation Platform
          </span>
        </div>
      </header>

      {/* 2. Main Center Card Container */}
      <main className="eds-card-container">
        <div className="eds-login-card">
          
          {/* Professional Header Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1.25rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #7dd3fc',
            boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.2)'
          }}>
            <ShieldCheck size={36} color="#0369a1" />
          </div>

          {/* Card Title */}
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
            {view === 'login' ? 'EvacSense Portal' : 'Register Account'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem 0', fontWeight: 500 }}>
            {view === 'login' ? 'Sign in to access evacuation drills & building safety' : 'Create an institutional account to join EvacSense'}
          </p>

          {/* 1. Login View */}
          {view === 'login' && (
            <LoginForm 
              onSubmit={handlePasswordLogin} 
              loading={loading} 
              errorMessage={error}
              onNavigateRecovery={() => navigate('recovery')}
              onCreateAccount={() => { setView('register'); setError(''); setSuccessMessage(''); }}
            />
          )}

          {/* 2. Registration View */}
          {view === 'register' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out', textAlign: 'left' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.25rem', textAlign: 'center', fontWeight: '700' }}>Account Registration</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>Submit institutional credentials to join EvacSense</p>

              {error && (
                <div className="alert alert-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <div>{error}</div>
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <div>{successMessage}</div>
                </div>
              )}

              <form onSubmit={handleRegistrationSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-role">Role</label>
                  <select
                    id="reg-role"
                    className="form-input"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    style={{ background: '#ffffff', color: 'var(--text-primary)' }}
                  >
                    <option value="Student">Student (Auto-Activated)</option>
                    <option value="Teacher">Teacher / Staff (Requires Admin Approval)</option>
                    <option value="Drill Coordinator">Drill Coordinator (Requires Admin Approval)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maria Santos"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Institutional Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input"
                    placeholder={regRole === 'Student' ? 'username@student.cit.edu' : 'username@cit.edu'}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-id">
                    {regRole === 'Student' ? 'Student ID Number' : 'Employee ID Number'}
                  </label>
                  <input
                    id="reg-id"
                    type="text"
                    className="form-input"
                    placeholder="e.g. USR-006"
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="••••••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label="Toggle password visibility"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                    >
                      {showRegPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', borderRadius: '8px' }}
                  >
                    {loading ? 'Submitting Registration...' : 'Register Secure Profile'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setView('login'); setError(''); setSuccessMessage(''); }}
                    disabled={loading}
                    style={{ background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '8px' }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* 3. Footer Bar */}
      <footer className="eds-footer">
        © 2024 EvacSense Emergency Evacuation System | Real-Time Safety & Drill Management
      </footer>
    </div>
  );
}
