import React, { useState } from 'react';
import { KeyIcon } from '../components/EvacSenseIcons';

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
      const response = await fetch('http://127.0.0.1:5000/api/auth/recovery', {
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
      <div className="surface-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        textAlign: 'center',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(30, 136, 229, 0.1)',
            border: '1px solid rgba(30, 136, 229, 0.18)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--blue)'
          }}>
            <KeyIcon size={28} />
          </div>
          <h1 className="brand-title" style={{ fontSize: '1.75rem' }}>Account Recovery</h1>
          <p className="brand-subtitle" style={{ color: 'var(--text-secondary)' }}>Reset secure credentials</p>
        </div>

        {message ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{
              background: 'rgba(24, 160, 88, 0.08)',
              border: '1px solid rgba(24, 160, 88, 0.18)',
              color: 'var(--green)',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <strong>Dispatched Successfully!</strong><br />
              {message}
            </div>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => navigate('login')}
            >
              Return to Login Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {error && (
              <div style={{
                background: 'rgba(217, 45, 32, 0.08)',
                border: '1px solid rgba(217, 45, 32, 0.18)',
                color: 'var(--red)',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Enter your registered CIT institutional email address below. If your account exists in our database, we will dispatch a recovery credential link immediately.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="recovery-email">Institutional Email</label>
              <input
                id="recovery-email"
                type="email"
                className="form-input"
                placeholder="e.g. m.santos@student.cit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {loading ? 'Verifying Account...' : 'Dispatch Recovery Credentials'}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('login')}
              disabled={loading}
              style={{ width: '100%' }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
