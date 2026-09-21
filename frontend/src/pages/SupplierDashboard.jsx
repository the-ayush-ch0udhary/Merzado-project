import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { QuoteModal } from '../components/QuoteModal';
import {
  FileCheck,
  CheckCircle,
  Clock,
  IndianRupee,
  Building,
  ArrowRight,
  Edit,
} from 'lucide-react';
import api from '../services/api';

export const SupplierDashboard = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuoteForRevision, setActiveQuoteForRevision] = useState(null);

  useEffect(() => {
    fetchMyQuotations();
  }, []);

  const fetchMyQuotations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quotations/my-quotations');
      if (res.data.success) {
        setQuotations(res.data.quotations);
      }
    } catch (err) {
      console.error('Failed to load supplier quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteRevised = () => {
    fetchMyQuotations();
  };

  // Metrics
  const totalQuotes = quotations.length;
  const acceptedQuotes = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const pendingQuotes = quotations.filter((q) => q.status === 'PENDING').length;
  const totalValue = quotations
    .filter((q) => q.status === 'ACCEPTED')
    .reduce((acc, q) => acc + q.price, 0);

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-flex">
          <div>
            <h1 className="page-title">Supplier Quotations Hub</h1>
            <p className="page-subtitle">
              Track the live status of your submitted vendor bids and procurement proposals.
            </p>
          </div>

          <Link to="/marketplace" className="btn btn-primary">
            Browse More RFQs
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: 'var(--primary-600)' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <div className="stat-value">{totalQuotes}</div>
            <div className="stat-label">Bids Submitted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: 'var(--success-accent)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{acceptedQuotes}</div>
            <div className="stat-label">Accepted Contracts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: 'var(--warning-accent)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{pendingQuotes}</div>
            <div className="stat-label">Awaiting Buyer Decision</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="stat-value">₹{Number(totalValue).toLocaleString()}</div>
            <div className="stat-label">Awarded Order Value</div>
          </div>
        </div>
      </div>

      {/* Quotations List */}
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary-900)', marginBottom: '1.25rem' }}>
        Submitted Commercial Quotations ({quotations.length})
      </h2>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No quotations submitted yet"
          description="Browse available RFQs in the marketplace and place your bids to win supplier contracts."
          actionLabel="Explore Marketplace"
          onAction={() => (window.location.href = '/marketplace')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {quotations.map((quote) => {
            const rfq = quote.rfq;
            if (!rfq) return null;

            return (
              <div
                key={quote._id}
                className="card"
                style={{
                  borderLeft:
                    quote.status === 'ACCEPTED'
                      ? '5px solid var(--success-accent)'
                      : quote.status === 'REJECTED'
                      ? '5px solid var(--danger-accent)'
                      : '5px solid var(--warning-accent)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span className="rfq-category">{rfq.category}</span>
                      <StatusBadge status={quote.status} />
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary-900)', marginBottom: '0.25rem' }}>
                      <Link to={`/rfq/${rfq._id}`}>{rfq.title}</Link>
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building size={14} />
                      Buyer: <strong>{rfq.buyer?.companyName || rfq.buyer?.name}</strong>
                    </div>
                  </div>

                  {/* Quoted Amount & Lead time */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      ₹{Number(quote.price).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary-600)', marginTop: '0.15rem' }}>
                      Lead time: <strong>{quote.deliveryTime}</strong>
                    </div>
                  </div>
                </div>

                {quote.notes && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary-700)', backgroundColor: 'var(--secondary-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <strong>Your Notes:</strong> {quote.notes}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--secondary-100)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--secondary-500)' }}>
                    Submitted on: <strong>{new Date(quote.createdAt).toLocaleDateString()}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {rfq.status === 'OPEN' && quote.status === 'PENDING' && (
                      <button
                        onClick={() => setActiveQuoteForRevision(quote)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit size={14} />
                        Revise Quote
                      </button>
                    )}

                    <Link to={`/rfq/${rfq._id}`} className="btn btn-secondary btn-sm">
                      View RFQ <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revision Modal */}
      {activeQuoteForRevision && (
        <QuoteModal
          isOpen={Boolean(activeQuoteForRevision)}
          onClose={() => setActiveQuoteForRevision(null)}
          rfq={activeQuoteForRevision.rfq}
          existingQuote={activeQuoteForRevision}
          onQuoteSubmitted={handleQuoteRevised}
        />
      )}
    </div>
  );
};
