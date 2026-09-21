import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './StatusBadge';
import {
  Boxes,
  LayoutDashboard,
  FileCheck,
  LogOut,
  LogIn,
  UserPlus,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const Navbar = ({ onOpenCreateRfq }) => {
  const { user, logout, isBuyer, isSupplier, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (role) => {
    await demoLogin(role);
    if (role === 'BUYER') {
      navigate('/buyer/dashboard');
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Boxes size={22} />
          </div>
          <div>
            Procure<span className="highlight">Flow</span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--secondary-400)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              B2B RFQ Marketplace
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link
            to="/marketplace"
            className={`nav-link ${
              location.pathname === '/marketplace' || location.pathname === '/'
                ? 'active'
                : ''
            }`}
          >
            <Boxes size={16} />
            Marketplace Feed
          </Link>

          {user && isBuyer && (
            <Link
              to="/buyer/dashboard"
              className={`nav-link ${
                location.pathname === '/buyer/dashboard' ? 'active' : ''
              }`}
            >
              <LayoutDashboard size={16} />
              Buyer Dashboard
            </Link>
          )}

          {user && isSupplier && (
            <Link
              to="/supplier/submissions"
              className={`nav-link ${
                location.pathname === '/supplier/submissions' ? 'active' : ''
              }`}
            >
              <FileCheck size={16} />
              My Quotations
            </Link>
          )}
        </div>

        {/* User / Auth section */}
        <div className="nav-user">
          {user ? (
            <>
              {isBuyer && onOpenCreateRfq && (
                <button
                  onClick={onOpenCreateRfq}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <PlusCircle size={15} />
                  Post RFQ
                </button>
              )}

              <div className="user-badge">
                <RoleBadge role={user.role} />
                <span style={{ color: 'var(--secondary-900)' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>

              {/* Quick Switch Button for Evaluator / Testing */}
              <button
                onClick={() =>
                  handleQuickSwitch(isBuyer ? 'SUPPLIER' : 'BUYER')
                }
                className="btn btn-secondary btn-sm"
                title={`Quick switch to ${isBuyer ? 'Supplier' : 'Buyer'} demo account`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                <RefreshCw size={12} />
                Switch to {isBuyer ? 'Supplier' : 'Buyer'}
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} />
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
