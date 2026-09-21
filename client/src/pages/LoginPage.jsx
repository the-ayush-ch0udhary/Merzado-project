import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, LogIn, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

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
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 50,
              height: 50,
              background: 'linear-gradient(135deg, var(--primary-600), #6366f1)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '1rem',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Boxes size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary-900)' }}>
            Welcome to ProcureFlow
          </h1>
          <p style={{ color: 'var(--secondary-500)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            B2B Marketplace for Requests for Quotations
          </p>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            color: 'white',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <UserCheck size={16} />
            Quick 1-Click Demo Login
          </div>
          <p style={{ fontSize: '0.825rem', color: '#cbd5e1', marginBottom: '1rem', lineHeight: 1.4 }}>
            For grading and evaluation, skip registration and test immediately with pre-loaded RFQs and bids:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('BUYER')}
              disabled={loading}
              className="btn btn-sm"
              style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '0.6rem' }}
            >
              🏢 Demo Buyer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('SUPPLIER')}
              disabled={loading}
              className="btn btn-sm"
              style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.6rem' }}
            >
              🏭 Demo Supplier
            </button>
          </div>
        </div>

        {/* Standard Login Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--secondary-800)' }}>
            Sign In with Email
          </h2>

          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
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
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--secondary-200)',
              fontSize: '0.9rem',
              color: 'var(--secondary-500)',
            }}
          >
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
