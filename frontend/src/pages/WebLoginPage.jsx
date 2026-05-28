import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';

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

  // Default seeded Google accounts for quick SSO testing
  const ssoAccounts = [
    { name: "Maria Santos", email: "m.santos@student.cit.edu" },
    { name: "Dr. Jose Reyes", email: "j.reyes@cit.edu" },
    { name: "Engr. Ana Cruz", email: "a.cruz@cit.edu" },
    { name: "Mr. Carlo Lim", email: "c.lim@cit.edu" },
    { name: "Juan dela Cruz", email: "j.delacruz@student.cit.edu" },
    { name: "External Account", email: "guest@gmail.com" }
  ];

  const handlePasswordLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
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

  const handleSSOLogin = async (email, name) => {
    setLoading(true);
    setError('');
    setView('login');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/google-sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          googleToken: 'VALID_SIMULATED_SSO_TOKEN_' + Date.now()
        })
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        onLoginSuccess(data.session.token, data.user);
      } else {
        setError(data.message || data.errors?.[0] || 'Google SSO failed.');
      }
    } catch (err) {
      setError('Connection to EvacSense authorization server failed.');
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
        endpoint = 'http://127.0.0.1:5000/api/auth/register/student';
        bodyData = {
          name: regName,
          email: regEmail,
          studentId: regId,
          password: regPassword,
          deviceId: 'DEVICE-' + Math.floor(1000 + Math.random() * 9000)
        };
      } else {
        endpoint = 'http://127.0.0.1:5000/api/auth/register/staff';
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
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem',
        textAlign: 'center',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        
        {/* Logo and Brand Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #991b1b, #fbbf24)',
            margin: '0 auto 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(153, 27, 27, 0.35)',
            fontFamily: 'Outfit'
          }}>⚡️</div>
          <h1 className="brand-title" style={{ fontSize: '2rem' }}>EvacSense</h1>
          <p className="brand-subtitle" style={{ fontSize: '0.75rem' }}>CIT-U Earthquake Drill Suite</p>
        </div>

        {/* 1. Login View */}
        {view === 'login' && (
          <>
            <LoginForm 
              onSubmit={handlePasswordLogin} 
              loading={loading} 
              errorMessage={error} 
            />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.25rem 0',
              color: 'var(--text-muted)'
            }}>
              <hr style={{ flex: 1, border: '0', borderTop: '1px solid var(--border-glass)' }} />
              <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</span>
              <hr style={{ flex: 1, border: '0', borderTop: '1px solid var(--border-glass)' }} />
            </div>

            <button 
              type="button" 
              className="btn btn-secondary btn-sso"
              onClick={() => setView('sso_select')}
              disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}
            >
              Google Workspace SSO
            </button>

            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => { setView('register'); setError(''); setSuccessMessage(''); }}
              disabled={loading}
              style={{ width: '100%', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)' }}
            >
              Create Institutional Account
            </button>

            <div style={{ marginTop: '1.25rem' }}>
              <button 
                type="button"
                onClick={() => navigate('recovery')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textDecoration: 'underline'
                }}
              >
                Forgot Password or Account Recovery?
              </button>
            </div>
          </>
        )}

        {/* 2. Registration View */}
        {view === 'register' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', textAlign: 'left' }}>
            <h3 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.25rem', textAlign: 'center' }}>Account Registration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>Submit institutional credentials to join EvacSense</p>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>{error}</div>
            )}

            {successMessage && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#34d399',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>{successMessage}</div>
            )}

            <form onSubmit={handleRegistrationSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">Role</label>
                <select
                  id="reg-role"
                  className="form-input"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{ background: 'rgba(15,23,42,0.85)', color: '#ffffff' }}
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
                <input
                  id="reg-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginBottom: '0.75rem' }}
              >
                {loading ? 'Submitting Registration...' : 'Register Secure Profile'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setView('login'); setError(''); setSuccessMessage(''); }}
                disabled={loading}
                style={{ width: '100%' }}
              >
                Back to Login
              </button>
            </form>
          </div>
        )}

        {/* 3. SSO Simulated Profile Selector View */}
        {view === 'sso_select' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Simulated Google SSO Portal</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Select a mock institutional profile to assert identity:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              {ssoAccounts.map((acc, index) => (
                <button
                  key={index}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleSSOLogin(acc.email, acc.name)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.75rem 1rem',
                    textAlign: 'left'
                  }}
                >
                  <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{acc.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.email}</span>
                </button>
              ))}
            </div>

            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setView('login')}
              style={{ width: '100%' }}
            >
              Cancel and Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
