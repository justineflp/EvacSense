import React, { useEffect, useState } from 'react';
import WebLoginPage from './pages/WebLoginPage';
import Dashboard from './pages/Dashboard';
import AccountRecoveryPage from './pages/AccountRecoveryPage';

export default function App() {
  const [view, setView] = useState('login'); // login | dashboard | recovery
  const [token, setToken] = useState(localStorage.getItem('evacsense_token') || '');
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Auto-validate session token on load
  useEffect(() => {
    const validateSession = async () => {
      const savedToken = localStorage.getItem('evacsense_token');
      if (!savedToken) {
        setInitialLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/validate-token', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          setToken(savedToken);
          setUser(data.user);
          setView('dashboard');
        } else {
          // Token expired or invalid
          localStorage.removeItem('evacsense_token');
        }
      } catch (err) {
        console.error('Session validation error:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    validateSession();
  }, []);

  const handleLoginSuccess = (newToken, loggedUser) => {
    localStorage.setItem('evacsense_token', newToken);
    setToken(newToken);
    setUser(loggedUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('evacsense_token');
    setToken('');
    setUser(null);
    setView('login');
  };

  if (initialLoading) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div className="loader-ring"></div>
        <p className="loading-copy" style={{ fontFamily: 'Outfit' }}>
          Verifying secure session interface...
        </p>
      </div>
    );
  }

  return (
    <>
      {view === 'login' && (
        <WebLoginPage 
          onLoginSuccess={handleLoginSuccess} 
          navigate={setView} 
        />
      )}
      {view === 'recovery' && (
        <AccountRecoveryPage 
          navigate={setView} 
        />
      )}
      {view === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          token={token} 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
}
