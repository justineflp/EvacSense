import React, { useState } from 'react';

export default function LoginForm({ onSubmit, loading, errorMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {validationError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          textAlign: 'left'
        }}>
          <strong>Validation Error:</strong> {validationError}
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          textAlign: 'left'
        }}>
          <strong>Auth Error:</strong> {errorMessage}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="email">Institutional Email</label>
        <input
          id="email"
          type="email"
          className="form-input"
          placeholder="username@student.cit.edu or @cit.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="form-input"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ marginTop: '0.5rem' }}
      >
        {loading ? 'Authenticating Secure Session...' : 'Authenticate Securely'}
      </button>
    </form>
  );
}
