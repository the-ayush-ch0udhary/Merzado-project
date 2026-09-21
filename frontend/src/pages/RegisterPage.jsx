import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Building2, Factory, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
    companyName: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        if (res.user.role === 'BUYER') {
          navigate('/buyer/dashboard');
        } else {
          navigate('/marketplace');
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2.5rem 1rem 4rem' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              backgroundColor: '#2563eb',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '0.75rem',
            }}
          >
            <Boxes size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Join ProcureFlow Marketplace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Choose your business role to begin trading
          </p>
        </div>

        <div className="card">
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                borderRadius: 'var(--border-radius)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                border: '1px solid var(--danger-border)',
              }}
            >
              {error}
            </div>
          )}

          {/* Role selector cards */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.6rem' }}>
              Select Your Role <span style={{ color: 'var(--danger-accent)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                onClick={() => handleRoleSelect('BUYER')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--border-radius)',
                  border: formData.role === 'BUYER' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: formData.role === 'BUYER' ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <Building2
                  size={24}
                  style={{
                    color: formData.role === 'BUYER' ? 'var(--primary)' : 'var(--text-muted)',
                    marginBottom: '0.35rem',
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Buyer
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Post requirements & receive quotes
                </div>
              </div>

              <div
                onClick={() => handleRoleSelect('SUPPLIER')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--border-radius)',
                  border: formData.role === 'SUPPLIER' ? '2px solid #0284c7' : '1px solid var(--border-color)',
                  backgroundColor: formData.role === 'SUPPLIER' ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <Factory
                  size={24}
                  style={{
                    color: formData.role === 'SUPPLIER' ? '#0284c7' : 'var(--text-muted)',
                    marginBottom: '0.35rem',
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Supplier
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Browse RFQs & submit quotations
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Ayush Kumar"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-input"
                  placeholder="e.g. Apex Industries Ltd."
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / City</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Bengaluru, India"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Creating Account...' : `Register as ${formData.role === 'BUYER' ? 'Buyer' : 'Supplier'}`}
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
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
