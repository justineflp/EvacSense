import React, { useState } from 'react';
import { KeyIcon } from './EvacSenseIcons';

export default function LoginForm({
  onSubmit,
  loading,
  errorMessage,
  submitLabel = 'Sign In',
  emailPlaceholder = 'you@institution.edu',
  passwordPlaceholder = 'Enter your password',
  helperNote = 'Use your institutional credentials.',
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please enter both your institutional email and password.');
      return;
    }

    // Strict CIT Domain verification
    if (!email.endsWith('@cit.edu') && !email.endsWith('@student.cit.edu')) {
      setValidationError('Only institutional accounts (@cit.edu or @student.cit.edu) are permitted.');
      return;
    }

    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {validationError && (
        <div style={{
          background: 'rgba(217, 45, 32, 0.08)',
          border: '1px solid rgba(217, 45, 32, 0.18)',
          color: 'var(--red)',
          padding: '0.9rem 1rem',
          borderRadius: '14px',
          fontSize: '0.875rem',
          marginBottom: '0.25rem',
          textAlign: 'left'
        }}>
          <strong>Validation issue:</strong> {validationError}
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: 'rgba(217, 45, 32, 0.08)',
          border: '1px solid rgba(217, 45, 32, 0.18)',
          color: 'var(--red)',
          padding: '0.9rem 1rem',
          borderRadius: '14px',
          fontSize: '0.875rem',
          marginBottom: '0.25rem',
          textAlign: 'left'
        }}>
          <strong>Sign-in error:</strong> {errorMessage}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="email">Institutional Email</label>
        <input
          id="email"
          type="email"
          className="form-input"
          placeholder={emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="form-input"
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(30, 136, 229, 0.08)',
              border: '1px solid rgba(30, 136, 229, 0.14)',
              borderRadius: '999px',
              cursor: 'pointer',
              color: 'var(--blue)',
              fontSize: '1.2rem',
              padding: '0.35rem'
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
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

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ marginTop: '0.5rem' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
          <KeyIcon size={16} />
          {loading ? 'Authenticating Secure Session...' : submitLabel}
        </span>
      </button>

      <p className="auth-form-footnote">{helperNote}</p>
    </form>
  );
}
