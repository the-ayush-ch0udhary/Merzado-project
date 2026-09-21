import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'BUYER') {
          navigate('/buyer/dashboard');
        } else {
          navigate('/marketplace');
        }
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const res = await demoLogin(role);
      if (res.success) {
        if (role === 'BUYER') {
          navigate('/buyer/dashboard');
        } else {
          navigate('/marketplace');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2.5rem 1rem 4rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--border-radius)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '0.75rem',
            }}
          >
            <Boxes size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Welcome to ProcureFlow
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            B2B Marketplace for Requests for Quotations
          </p>
        </div>

        {/* Demo accounts */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--border-radius)',
            padding: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            <UserCheck size={16} />
            Quick 1-Click Demo Login
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Test immediately with pre-loaded RFQs and vendor quotations:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('BUYER')}
              disabled={loading}
              className="btn btn-sm"
              style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600 }}
            >
              🏢 Demo Buyer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('SUPPLIER')}
              disabled={loading}
              className="btn btn-sm"
              style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', fontWeight: 600 }}
            >
              🏭 Demo Supplier
            </button>
          </div>
        </div>

        {/* Standard Login Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
            Sign In with Email
          </h2>

          {error && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                borderRadius: 'var(--border-radius)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                border: '1px solid var(--danger-border)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
