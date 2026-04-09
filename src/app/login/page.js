'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ThemeToggle from '../../components/Toggle/ThemeToggle';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login
        sessionStorage.setItem('estimator_is_authorized', 'true');
        router.push('/');
        router.refresh(); // Refresh to ensure middleware picks up the new cookie
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      {/* Theme toggle fixed in top-right corner */}
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.5rem', zIndex: 999 }}>
        <ThemeToggle />
      </div>

      <section className="hero" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div className="hero__container" style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          gridTemplateColumns: '1fr',
          padding: 0
        }}>

          <div className="login-card" style={{
            width: '100%',
            maxWidth: '450px',
            margin: '0 auto',
            animation: 'fadeSlideUp 0.8s ease both'
          }}>
            <div className="configurator__header">
              <span className="configurator__label">Secure Access</span>
              <h2 className="configurator__title">3D Builder <span>Portal</span></h2>
              <p className="configurator__subtitle" style={{ margin: '1rem 0 2rem' }}>
                Please enter your credentials to access the 3D Building Estimator platform.
              </p>
            </div>

            <div className="configurator__form" style={{ position: 'relative' }}>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--cyan)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--cyan)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                {error && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 60, 90, 0.1)',
                    border: '1px solid var(--red-accent)',
                    color: 'var(--red-accent)',
                    fontSize: '0.85rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    fontFamily: 'var(--font-condensed)',
                    letterSpacing: '1px'
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="configurator__btn"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Authenticating...
                    </span>
                  ) : (
                    'Enter Workspace'
                  )}
                </button>
              </form>
            </div>

            <p style={{
              textAlign: 'center',
              marginTop: '2rem',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-condensed)',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
