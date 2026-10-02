import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AccountRecoveryPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setMessage(data.message);
      } else {
        setError(data.message || data.errors?.[0] || 'Recovery failed.');
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
        maxWidth: '460px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--accent-gold-bg)',
            border: '1px solid var(--accent-gold)',
            margin: '0 auto 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold-hover)'
          }}><Key size={32} /></div>
          <h1 className="brand-title" style={{ fontSize: '1.75rem' }}>Account Recovery</h1>
          <p className="brand-subtitle">Reset Secure Credentials</p>
        </div>

        {message ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <div>
                <strong>Dispatched Successfully!</strong><br />
                {message}
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => navigate('login')}
              style={{ marginTop: '1rem' }}
            >
              Return to Login Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <div>{error}</div>
              </div>
            )}

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Enter your registered <strong>institutional email address</strong> below. If your account exists in our database, we will dispatch a simulated recovery credential link immediately.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="recovery-email">Institutional Email</label>
              <input
                id="recovery-email"
                type="email"
                className="form-input"
                placeholder="e.g. m.santos@evacsense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Verifying Account...' : 'Dispatch Recovery Credentials'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('login')}
                disabled={loading}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
