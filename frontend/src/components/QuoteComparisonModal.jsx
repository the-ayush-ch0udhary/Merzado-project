import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle, XCircle, DollarSign, Clock, MapPin, Building, Info } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import api from '../services/api';

export const QuoteComparisonModal = ({ isOpen, onClose, rfq, onQuoteStatusUpdated }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen && rfq) {
      fetchQuotations();
    }
  }, [isOpen, rfq]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/quotations/rfq/${rfq._id || rfq.id}`);
      if (res.data.success) {
        setQuotations(res.data.quotations);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load received quotations.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (quoteId, newStatus) => {
    try {
      setActionLoading(quoteId);
      const res = await api.patch(`/quotations/${quoteId}/status`, {
        status: newStatus,
      });

      if (res.data.success) {
        setQuotations((prev) =>
          prev.map((q) => (q._id === quoteId ? { ...q, status: newStatus } : q))
        );
        if (onQuoteStatusUpdated) {
          onQuoteStatusUpdated(quoteId, newStatus);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quotation status.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen || !rfq) return null;

  // Find lowest price
  const minPrice = quotations.length > 0 ? Math.min(...quotations.map((q) => q.price)) : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '850px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Received Quotations Comparison</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--secondary-500)', marginTop: '0.25rem' }}>
              RFQ: <strong>{rfq.title}</strong> — {rfq.quantity} {rfq.unit} ({quotations.length} quotes received)
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--secondary-500)' }}>
              Loading quotations...
            </div>
          ) : quotations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--secondary-50)', borderRadius: 'var(--radius-md)' }}>
              <Info size={40} style={{ color: 'var(--secondary-400)', marginBottom: '0.75rem' }} />
              <h4 style={{ fontWeight: 700, color: 'var(--secondary-800)', marginBottom: '0.25rem' }}>
                No quotations submitted yet
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary-500)' }}>
                Suppliers have not submitted quotes for this RFQ yet. As soon as a supplier bids, it will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quotations.map((quote) => {
                const isLowest = quote.price === minPrice && quotations.length > 1;
                return (
                  <div
                    key={quote._id}
                    className="card"
                    style={{
                      border: quote.status === 'ACCEPTED'
                        ? '2px solid var(--success-accent)'
                        : isLowest
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border-color)',
                      backgroundColor: quote.status === 'ACCEPTED' ? 'var(--success-bg)' : 'var(--bg-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                            {quote.supplier?.companyName || quote.supplier?.name}
                          </span>
                          <StatusBadge status={quote.status} />
                          {isLowest && (
                            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', border: '1px solid var(--primary-200)' }}>
                              🌟 Best Price
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          <span>Contact: {quote.supplier?.name}</span>
                          {quote.supplier?.location && <span>📍 {quote.supplier.location}</span>}
                        </div>
                      </div>

                      {/* Price & Lead time */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                          ₹{Number(quote.price).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', justifyContent: 'flex-end', marginTop: '0.15rem' }}>
                          <Clock size={13} />
                          <span>Delivery in <strong>{quote.deliveryTime}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {quote.notes && (
                      <div
                        style={{
                          backgroundColor: 'var(--bg-surface-secondary)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--border-radius)',
                          fontSize: '0.875rem',
                          color: 'var(--text-main)',
                          marginTop: '0.5rem',
                          marginBottom: '1rem',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <strong>Supplier Notes:</strong> {quote.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      {quote.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateStatus(quote._id, 'ACCEPTED')}
                          disabled={actionLoading === quote._id}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircle size={15} />
                          {actionLoading === quote._id ? 'Updating...' : 'Accept & Award'}
                        </button>
                      )}

                      {quote.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(quote._id, 'REJECTED')}
                          disabled={actionLoading === quote._id}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <XCircle size={15} />
                          Decline
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
