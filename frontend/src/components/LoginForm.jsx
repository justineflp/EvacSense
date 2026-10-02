import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ onSubmit, loading, errorMessage, onNavigateRecovery, onCreateAccount }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please enter both your User ID / Email and password.');
      return;
    }

    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', textAlign: 'left' }}>
      {validationError && (
        <div className="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div><strong>Validation Error:</strong> {validationError}</div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <div><strong>Auth Error:</strong> {errorMessage}</div>
        </div>
      )}

      {/* User ID Field */}
      <div className="form-group">
        <label className="form-label" htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>
          <User size={16} /> User ID
        </label>
        <input
          id="email"
          type="text"
          className="form-input"
          placeholder="Enter your ID (e.g., 21-123456)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Password Field */}
      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label" htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>
          <Lock size={16} /> Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="form-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{ paddingRight: '75px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{showPassword ? 'Hide' : 'Show'}</span>
          </button>
        </div>
      </div>

      {/* Options Row: Remember Me & Forgot Password */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ accentColor: '#0f172a', cursor: 'pointer' }}
          />
          Remember Me
        </label>

        {onNavigateRecovery && (
          <button
            type="button"
            onClick={onNavigateRecovery}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Forgot Password?
          </button>
        )}
      </div>

      {/* Main Log In Button */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '0.85rem',
          fontWeight: '700',
          fontSize: '1rem',
          width: '100%',
          marginBottom: '0.85rem',
          border: 'none',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Logging In...' : 'Log In'}
      </button>

      {/* Create Account Action Button */}
      <button
        type="button"
        onClick={onCreateAccount}
        disabled={loading}
        style={{
          width: '100%',
          background: '#f1f5f9',
          color: '#334155',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '0.75rem',
          fontWeight: '600',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        Create Account
      </button>
    </form>
  );
}
