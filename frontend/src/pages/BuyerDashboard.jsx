import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { RfqModal } from '../components/RfqModal';
import { QuoteComparisonModal } from '../components/QuoteComparisonModal';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  Layers,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Building,
  Eye,
  Award,
} from 'lucide-react';
import api from '../services/api';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [editingRfq, setEditingRfq] = useState(null);
  const [comparisonRfq, setComparisonRfq] = useState(null);

  useEffect(() => {
    fetchMyRfqs();
  }, []);

  const fetchMyRfqs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rfqs/buyer/my-rfqs');
      if (res.data.success) {
        setRfqs(res.data.rfqs);
      }
    } catch (err) {
      console.error('Failed to load buyer RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRfq(null);
    setIsRfqModalOpen(true);
  };

  const handleEditRfq = (rfq) => {
    setEditingRfq(rfq);
    setIsRfqModalOpen(true);
  };

  const handleRfqSaved = (savedRfq) => {
    fetchMyRfqs();
  };

  const handleToggleStatus = async (rfq) => {
    const newStatus = rfq.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await api.patch(`/rfqs/${rfq._id}/status`, { status: newStatus });
      if (res.data.success) {
        setRfqs((prev) =>
          prev.map((r) => (r._id === rfq._id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update RFQ status.');
    }
  };

  const handleDeleteRfq = async (rfqId) => {
    if (!window.confirm('Are you sure you want to delete this RFQ? All associated quotes will also be removed.')) {
      return;
    }

    try {
      const res = await api.delete(`/rfqs/${rfqId}`);
      if (res.data.success) {
        setRfqs((prev) => prev.filter((r) => r._id !== rfqId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete RFQ.');
    }
  };

  // Metrics
  const totalRfqs = rfqs.length;
  const openRfqs = rfqs.filter((r) => r.status === 'OPEN' && !r.isExpired).length;
  const totalQuotes = rfqs.reduce((acc, r) => acc + (r.quotationCount || 0), 0);
  const awardedRfqs = rfqs.filter((r) => r.status === 'AWARDED' || r.hasAcceptedQuote).length;

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-flex">
          <div>
            <h1 className="page-title">Buyer Procurement Dashboard</h1>
            <p className="page-subtitle">
              Manage your business requirements, track vendor quotes, and award commercial deals.
            </p>
          </div>

          <button onClick={handleCreateNew} className="btn btn-primary btn-lg">
            <PlusCircle size={20} />
            Post New RFQ
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: 'var(--primary-600)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-value">{totalRfqs}</div>
            <div className="stat-label">Total RFQs Posted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: 'var(--success-accent)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{openRfqs}</div>
            <div className="stat-label">Active / Open RFQs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: 'var(--warning-accent)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-value">{totalQuotes}</div>
            <div className="stat-label">Quotes Received</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ede9fe', color: '#6d28d9' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{awardedRfqs}</div>
            <div className="stat-label">Awarded Contracts</div>
          </div>
        </div>
      </div>

      {/* RFQs List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary-900)' }}>
          Your Submitted RFQs ({rfqs.length})
        </h2>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : rfqs.length === 0 ? (
        <EmptyState
          title="You haven't posted any RFQs yet"
          description="Create your first procurement requirement to start receiving competitive quotations from verified suppliers."
          actionLabel="Create First RFQ"
          onAction={handleCreateNew}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {rfqs.map((rfq) => (
            <div key={rfq._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span className="rfq-category">{rfq.category}</span>
                    <StatusBadge status={rfq.isExpired && rfq.status === 'OPEN' ? 'CLOSED' : rfq.status} />
                    {rfq.hasAcceptedQuote && (
                      <span className="badge badge-accepted">
                        <CheckCircle size={12} /> Deal Accepted
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary-900)', marginBottom: '0.25rem' }}>
                    <Link to={`/rfq/${rfq._id}`} style={{ color: 'inherit' }}>
                      {rfq.title}
                    </Link>
                  </h3>
                </div>

                {/* Quotation Counter Pill */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => setComparisonRfq(rfq)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem', fontWeight: 700 }}
                  >
                    <Eye size={15} />
                    Review Quotes ({rfq.quotationCount || 0})
                  </button>
                  {rfq.lowestQuotePrice && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--secondary-500)', marginTop: '0.3rem' }}>
                      Lowest Bid: <strong>₹{Number(rfq.lowestQuotePrice).toLocaleString()}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Description preview */}
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary-600)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {rfq.description}
              </p>

              {/* Specs & Actions Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--secondary-100)',
                  fontSize: '0.85rem',
                  color: 'var(--secondary-600)',
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span>Volume: <strong>{Number(rfq.quantity).toLocaleString()} {rfq.unit}</strong></span>
                  <span>Location: <strong>{rfq.location}</strong></span>
                  <span>Deadline: <strong>{new Date(rfq.deadline).toLocaleDateString()}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleEditRfq(rfq)}
                    className="btn btn-secondary btn-sm"
                    title="Edit RFQ Specifications"
                  >
                    <Edit size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleStatus(rfq)}
                    className="btn btn-secondary btn-sm"
                    title={rfq.status === 'OPEN' ? 'Close RFQ to new quotes' : 'Reopen RFQ'}
                  >
                    {rfq.status === 'OPEN' ? (
                      <>
                        <Lock size={14} /> Close
                      </>
                    ) : (
                      <>
                        <Unlock size={14} /> Reopen
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteRfq(rfq._id)}
                    className="btn btn-outline-danger btn-sm"
                    title="Delete RFQ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RFQ Create / Edit Modal */}
      <RfqModal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        editingRfq={editingRfq}
        onRfqSaved={handleRfqSaved}
      />

      {/* Quotes Review / Comparison Modal */}
      {comparisonRfq && (
        <QuoteComparisonModal
          isOpen={Boolean(comparisonRfq)}
          onClose={() => setComparisonRfq(null)}
          rfq={comparisonRfq}
          onQuoteStatusUpdated={fetchMyRfqs}
        />
      )}
    </div>
  );
};
