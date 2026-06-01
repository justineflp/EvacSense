import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import {
  ChartIcon,
  EvacSenseMark,
  LocationIcon,
  StandbyIcon,
} from '../components/EvacSenseIcons';

function normalizeLoginError(status, message) {
  const text = String(message || '').toLowerCase();

  if (text.includes('pending')) {
    return 'Your account is pending admin approval.';
  }

  if (text.includes('rejected')) {
    return 'Your registration request was rejected. Please contact your administrator.';
  }

  if (status === 0) {
    return 'Connection unavailable. Please reconnect and try again.';
  }

  if (status === 401 || text.includes('invalid')) {
    return 'Invalid credentials. Please check your institutional email and password.';
  }

  if (text.includes('authentication unavailable')) {
    return 'Authentication unavailable. Please try again later.';
  }

  return 'Authentication unavailable. Please try again later.';
}

export default function WebLoginPage({ onLoginSuccess, navigate }) {
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [regRole, setRegRole] = useState('Student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regId, setRegId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

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
        return;
      }

      setError(normalizeLoginError(response.status, data.message || data.errors?.[0]));
    } catch (err) {
      setError('Connection unavailable. Please reconnect and try again.');
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
      setError('Please complete every field before continuing.');
      setLoading(false);
      return;
    }

    try {
      const backendRole = regRole === 'Coordinator' ? 'Drill Coordinator' : regRole;
      const isStudent = regRole === 'Student';
      const endpoint = isStudent
        ? 'http://127.0.0.1:5000/api/auth/register/student'
        : 'http://127.0.0.1:5000/api/auth/register/staff';

      const bodyData = isStudent
        ? {
            name: regName,
            email: regEmail,
            studentId: regId,
            password: regPassword,
            deviceId: `DEVICE-${Math.floor(1000 + Math.random() * 9000)}`
          }
        : {
            name: regName,
            email: regEmail,
            employeeId: regId,
            password: regPassword,
            role: backendRole,
            deviceId: `DEVICE-${Math.floor(1000 + Math.random() * 9000)}`
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok && response.status === 201) {
        if (isStudent) {
          setSuccessMessage(data.message || 'Student account created successfully. You can sign in now.');
        } else {
          setSuccessMessage('Your request is pending admin approval. You will be notified once it is reviewed.');
        }

        setRegName('');
        setRegEmail('');
        setRegId('');
        setRegPassword('');
        return;
      }

      setError(data.message || data.errors?.[0] || 'Registration request could not be completed.');
    } catch (err) {
      setError('Connection unavailable. Please reconnect and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBrandFeature = (Icon, title, text) => (
    <div className="auth-feature-item">
      <div className="auth-feature-icon">
        <Icon size={18} />
      </div>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );

  return (
    <div className="container auth-shell">
      <div className="auth-split">
        <aside className="auth-brand-panel">
          <div className="auth-brand-top">
            <div className="auth-brand-mark">
              <EvacSenseMark size={52} />
            </div>
            <div className="eyebrow auth-eyebrow">School safety technology platform</div>
            <h1 className="auth-brand-title">EvacSense</h1>
            <p className="auth-brand-tagline">Detect. Guide. Verify. Report.</p>
            <p className="auth-brand-copy">
              Smart earthquake drill accountability for schools, helping users confirm presence, follow evacuation routes, and verify safe arrival in real time.
            </p>
          </div>

          <div className="auth-feature-list">
            {renderBrandFeature(StandbyIcon, 'Live readiness', 'Monitor drill status and campus preparedness.')}
            {renderBrandFeature(LocationIcon, 'Route verification', 'Track safe paths and assembly zones.')}
            {renderBrandFeature(ChartIcon, 'Role-based reporting', 'View the right dashboard for each role.')}
          </div>

          <p className="auth-brand-footer-note">Teacher and Coordinator accounts require admin approval.</p>
        </aside>

        <section className="auth-form-panel">
          <div className="surface-card auth-card">
            <div className="auth-tabbar" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                role="tab"
                aria-selected={view === 'login'}
                className={`auth-tab ${view === 'login' ? 'auth-tab--active' : ''}`}
                onClick={() => {
                  setView('login');
                  setError('');
                  setSuccessMessage('');
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === 'register'}
                className={`auth-tab ${view === 'register' ? 'auth-tab--active' : ''}`}
                onClick={() => {
                  setView('register');
                  setError('');
                  setSuccessMessage('');
                }}
              >
                Register Account
              </button>
            </div>

            {view === 'login' ? (
              <div className="auth-stack fade-in-block">
                <div className="auth-head-copy">
                  <div className="eyebrow">Welcome back</div>
                  <h2 className="section-title">Sign in to continue to EvacSense</h2>
                  <p className="section-subtitle">Use your institutional credentials.</p>
                  <p className="auth-form-note">Teacher and Coordinator accounts require admin approval.</p>
                </div>

                <LoginForm
                  onSubmit={handlePasswordLogin}
                  loading={loading}
                  errorMessage={error}
                  submitLabel="Sign In"
                  emailPlaceholder="you@institution.edu"
                  passwordPlaceholder="Enter your password"
                  helperNote="Secure role-based access for students, teachers, coordinators, and administrators."
                />

                <div className="auth-support-grid" aria-label="Login support highlights">
                  <div className="auth-support-item">
                    <strong>Students</strong>
                    <p>Use your institutional email for instant access.</p>
                  </div>
                  <div className="auth-support-item">
                    <strong>Teachers</strong>
                    <p>Approved accounts unlock classroom attendance tools.</p>
                  </div>
                  <div className="auth-support-item">
                    <strong>Coordinators</strong>
                    <p>Admin approval is required before the dashboard opens.</p>
                  </div>
                </div>

                <div className="auth-actions">
                  <button
                    type="button"
                    className="auth-link auth-link--button"
                    onClick={() => navigate('recovery')}
                  >
                    Recover Account Access
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-stack fade-in-block">
                <div className="auth-head-copy">
                  <div className="eyebrow">Register account</div>
                  <h2 className="section-title">Create your institutional access</h2>
                  <p className="section-subtitle">Students can register directly. Teacher and Coordinator accounts require admin approval.</p>
                </div>

                {error && <div className="auth-alert auth-alert--error">{error}</div>}
                {successMessage && <div className="auth-alert auth-alert--success">{successMessage}</div>}

                <form onSubmit={handleRegistrationSubmit} className="auth-stack auth-register-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-role">Role</label>
                    <div className="auth-role-segmented" role="radiogroup" aria-label="Registration role">
                      <button type="button" className={`auth-role-chip ${regRole === 'Student' ? 'auth-role-chip--active' : ''}`} onClick={() => setRegRole('Student')}>Student</button>
                      <button type="button" className={`auth-role-chip ${regRole === 'Teacher' ? 'auth-role-chip--active' : ''}`} onClick={() => setRegRole('Teacher')}>Teacher</button>
                      <button type="button" className={`auth-role-chip ${regRole === 'Coordinator' ? 'auth-role-chip--active' : ''}`} onClick={() => setRegRole('Coordinator')}>Coordinator</button>
                    </div>
                    <p className="auth-role-hint">
                      {regRole === 'Student'
                        ? 'Student accounts are activated immediately.'
                        : 'Teacher and Coordinator accounts are submitted for admin approval.'}
                    </p>
                  </div>

                  <div className="auth-register-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-name">Full Name</label>
                      <input
                        id="reg-name"
                        type="text"
                        className="form-input auth-input"
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
                        className="form-input auth-input"
                        placeholder={regRole === 'Student' ? 'you@student.cit.edu' : 'you@cit.edu'}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-id">
                        {regRole === 'Student' ? 'Student ID Number' : 'Employee / Staff ID'}
                      </label>
                      <input
                        id="reg-id"
                        type="text"
                        className="form-input auth-input"
                        placeholder={regRole === 'Student' ? 'e.g. USR-006' : 'e.g. EMP-102'}
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
                          type={showRegPassword ? 'text' : 'password'}
                          className="form-input auth-input"
                          placeholder="Enter your password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="password-toggle"
                          aria-label={showRegPassword ? 'Hide password' : 'Show password'}
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
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting Request...' : regRole === 'Student' ? 'Register Account' : 'Submit for Approval'}
                  </button>

                  <p className="auth-form-footnote">Secure role-based access for students, teachers, coordinators, and administrators.</p>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setView('login');
                      setError('');
                      setSuccessMessage('');
                    }}
                    disabled={loading}
                  >
                    Back to Sign In
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
