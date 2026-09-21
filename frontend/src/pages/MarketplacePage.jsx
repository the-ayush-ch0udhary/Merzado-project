import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingGrid } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { QuoteModal } from '../components/QuoteModal';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  PlusCircle,
  Building,
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  'ALL',
  'Metals & Manufacturing',
  'Energy & Power',
  'Textiles & Apparel',
  'IT Services & Consulting',
  'Packaging & Paper',
];

export const MarketplacePage = ({ onOpenCreateRfq }) => {
  const { user, isBuyer, isSupplier } = useAuth();

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [sortBy, setSortBy] = useState('deadline_asc');

  // Quotation Modal state
  const [activeRfqForQuote, setActiveRfqForQuote] = useState(null);

  useEffect(() => {
    fetchRfqs();
  }, [selectedCategory, statusFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRfqs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        status: statusFilter,
        sortBy,
      };

      const res = await api.get('/rfqs', { params });
      if (res.data.success) {
        setRfqs(res.data.rfqs);
      }
    } catch (err) {
      console.error('Failed to load RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmitted = (newQuote) => {
    // Update RFQ card in-place with user's new quotation
    setRfqs((prev) =>
      prev.map((r) =>
        r._id === activeRfqForQuote._id
          ? {
              ...r,
              quotationCount: (r.quotationCount || 0) + (r.myQuotation ? 0 : 1),
              myQuotation: newQuote,
            }
          : r
      )
    );
  };

  const formatDeadline = (deadlineStr) => {
    if (!deadlineStr) return '';
    const date = new Date(deadlineStr);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends Today';
    if (diffDays === 1) return 'Ends Tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-flex">
          <div>
            <h1 className="page-title">B2B RFQ Marketplace Feed</h1>
            <p className="page-subtitle">
              Discover active procurement requirements and submit competitive vendor quotations.
            </p>
          </div>

          {isBuyer && (
            <button onClick={onOpenCreateRfq} className="btn btn-primary">
              <PlusCircle size={18} />
              Post New RFQ
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="search-filter-bar">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Keyword Search */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by product, material, location, or requirement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="OPEN">Status: Active (Open)</option>
            <option value="CLOSED">Status: Closed</option>
            <option value="ALL">Status: All RFQs</option>
          </select>

          {/* Sort By */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '170px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="deadline_asc">Closing Soonest</option>
            <option value="createdAt_desc">Newest First</option>
            <option value="quantity_desc">Highest Quantity</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-500)', marginRight: '0.25rem' }}>
            Categories:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat === 'ALL' ? 'All Sectors' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Cards Grid */}
      {loading ? (
        <LoadingGrid count={6} />
      ) : rfqs.length === 0 ? (
        <EmptyState
          title="No RFQs Match Your Criteria"
          description="Try broadening your search term or selecting 'All Sectors' from the categories."
          actionLabel={isBuyer ? 'Create an RFQ Now' : undefined}
          onAction={isBuyer ? onOpenCreateRfq : undefined}
        />
      ) : (
        <div className="rfq-grid">
          {rfqs.map((rfq) => {
            const daysLeft = formatDeadline(rfq.deadline);
            const isClosed = rfq.status !== 'OPEN' || rfq.isExpired;

            return (
              <div key={rfq._id} className="card rfq-card">
                <div>
                  <div className="rfq-card-header">
                    <span className="rfq-category">{rfq.category}</span>
                    <StatusBadge status={rfq.isExpired && rfq.status === 'OPEN' ? 'CLOSED' : rfq.status} />
                  </div>

                  <h3 className="rfq-title">
                    <Link to={`/rfq/${rfq._id}`}>{rfq.title}</Link>
                  </h3>

                  <p className="rfq-description">{rfq.description}</p>

                  <div className="rfq-specs">
                    <div className="spec-item">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.825rem', flexShrink: 0 }}>
                        <Layers size={13} /> Quantity:
                      </span>
                      <strong style={{ color: 'var(--text-main)', textAlign: 'right', fontSize: '0.85rem' }}>
                        {Number(rfq.quantity).toLocaleString()} {rfq.unit}
                      </strong>
                    </div>

                    <div className="spec-item">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.825rem', flexShrink: 0 }}>
                        <MapPin size={13} /> Location:
                      </span>
                      <strong style={{ color: 'var(--text-main)', textAlign: 'right', fontSize: '0.85rem' }}>
                        {rfq.location}
                      </strong>
                    </div>

                    <div className="spec-item">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.825rem', flexShrink: 0 }}>
                        <Clock size={13} /> Deadline:
                      </span>
                      <strong style={{ color: rfq.isExpired ? 'var(--danger-accent)' : 'var(--text-main)', textAlign: 'right', fontSize: '0.85rem' }}>
                        {new Date(rfq.deadline).toLocaleDateString()} ({daysLeft})
                      </strong>
                    </div>

                    {rfq.buyer && (
                      <div className="spec-item">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.825rem', flexShrink: 0 }}>
                          <Building size={13} /> Buyer:
                        </span>
                        <strong style={{ color: 'var(--text-main)', textAlign: 'right', fontSize: '0.85rem' }}>
                          {rfq.buyer.companyName || rfq.buyer.name}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div>
                  {/* If supplier already quoted */}
                  {rfq.myQuotation && (
                    <div
                      style={{
                        padding: '0.6rem 0.85rem',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius)',
                        fontSize: '0.85rem',
                        marginBottom: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--text-main)',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>
                        Your Quote: <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>₹{Number(rfq.myQuotation.price).toLocaleString()}</strong>
                      </span>
                      <StatusBadge status={rfq.myQuotation.status} />
                    </div>
                  )}

                  <div className="rfq-footer">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>{rfq.quotationCount || 0}</strong> {rfq.quotationCount === 1 ? 'quote' : 'quotes'} received
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/rfq/${rfq._id}`} className="btn btn-secondary btn-sm">
                        Details
                      </Link>

                      {isSupplier && !isClosed && (
                        <button
                          onClick={() => setActiveRfqForQuote(rfq)}
                          className="btn btn-primary btn-sm"
                        >
                          {rfq.myQuotation ? 'Revise Bid' : 'Submit Quote'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quote Submission Modal */}
      {activeRfqForQuote && (
        <QuoteModal
          isOpen={Boolean(activeRfqForQuote)}
          onClose={() => setActiveRfqForQuote(null)}
          rfq={activeRfqForQuote}
          existingQuote={activeRfqForQuote.myQuotation}
          onQuoteSubmitted={handleQuoteSubmitted}
        />
      )}
    </div>
  );
};
