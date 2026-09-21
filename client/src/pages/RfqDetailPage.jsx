import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { QuoteModal } from '../components/QuoteModal';
import { QuoteComparisonModal } from '../components/QuoteComparisonModal';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  DollarSign,
  Clock,
  Send,
  FileCheck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';

export const RfqDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isBuyer, isSupplier } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    fetchRfqDetails();
  }, [id]);

  const fetchRfqDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/rfqs/${id}`);
      if (res.data.success) {
        setRfq(res.data.rfq);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load RFQ details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmitted = (newQuote) => {
    setRfq((prev) => ({
      ...prev,
      myQuotation: newQuote,
      quotationCount: (prev.quotationCount || 0) + (prev.myQuotation ? 0 : 1),
    }));
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--secondary-500)', fontSize: '1.1rem' }}>
          Loading RFQ details...
        </div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger-accent)', marginBottom: '1rem' }}>
          {error || 'RFQ Not Found'}
        </h2>
        <Link to="/marketplace" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && rfq.buyer && user.id === (rfq.buyer._id || rfq.buyer.id);
  const isClosed = rfq.status !== 'OPEN' || rfq.isExpired;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/marketplace"
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          Back to All RFQs
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Main Details */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <span className="rfq-category">{rfq.category}</span>
              <StatusBadge status={rfq.isExpired && rfq.status === 'OPEN' ? 'CLOSED' : rfq.status} />
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary-900)', marginBottom: '1rem', lineHeight: 1.25 }}>
              {rfq.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', color: 'var(--secondary-500)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} />
                Posted: {new Date(rfq.createdAt).toLocaleDateString()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={16} />
                Deadline: {new Date(rfq.deadline).toLocaleDateString()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={16} />
                {rfq.location}
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--secondary-200)', margin: '1.5rem 0' }} />

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary-800)', marginBottom: '0.75rem' }}>
              Detailed Requirements & Specifications
            </h3>
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7, color: 'var(--secondary-700)', fontSize: '0.975rem' }}>
              {rfq.description}
            </p>
          </div>

          {/* Supplier Quoting Card */}
          {isSupplier && (
            <div className="card" style={{ border: '2px solid var(--primary-100)', backgroundColor: 'var(--primary-50)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary-900)', marginBottom: '0.5rem' }}>
                {rfq.myQuotation ? 'Your Submitted Quotation' : 'Submit Quotation for this RFQ'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary-600)', marginBottom: '1.25rem' }}>
                {rfq.myQuotation
                  ? 'You have already placed a bid. You can revise it any time before the deadline.'
                  : 'Propose your competitive pricing, fulfillment lead times, and terms.'}
              </p>

              {rfq.myQuotation ? (
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary-500)' }}>Your Quoted Total</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                        ${Number(rfq.myQuotation.price).toLocaleString()}
                      </div>
                    </div>
                    <StatusBadge status={rfq.myQuotation.status} />
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--secondary-700)', marginBottom: '0.5rem' }}>
                    Estimated Delivery: <strong>{rfq.myQuotation.deliveryTime}</strong>
                  </div>

                  {rfq.myQuotation.notes && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary-600)', background: 'var(--secondary-50)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Your Notes:</strong> {rfq.myQuotation.notes}
                    </div>
                  )}

                  {!isClosed && (
                    <button
                      onClick={() => setShowQuoteModal(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '1rem' }}
                    >
                      Revise Quotation
                    </button>
                  )}
                </div>
              ) : isClosed ? (
                <div style={{ color: 'var(--danger-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} />
                  This RFQ is closed for new submissions.
                </div>
              ) : (
                <button
                  onClick={() => setShowQuoteModal(true)}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <Send size={16} />
                  Submit Quotation Now
                </button>
              )}
            </div>
          )}

          {/* Owner Buyer View */}
          {isOwner && (
            <div className="card" style={{ border: '2px solid #ddd6fe', backgroundColor: '#faf5ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#5b21b6' }}>
                    You own this RFQ
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary-600)' }}>
                    Total quotations received: <strong>{rfq.quotationCount || 0}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowComparisonModal(true)}
                  className="btn btn-primary"
                >
                  <FileCheck size={16} />
                  Review Quotes ({rfq.quotationCount || 0})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Specifications */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary-900)', marginBottom: '1rem' }}>
              Procurement Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--secondary-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--secondary-500)' }}>Volume Required:</span>
                <strong style={{ color: 'var(--secondary-900)' }}>
                  {Number(rfq.quantity).toLocaleString()} {rfq.unit}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--secondary-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--secondary-500)' }}>Target Budget:</span>
                <strong style={{ color: 'var(--secondary-900)' }}>
                  {rfq.targetBudget ? `$${Number(rfq.targetBudget).toLocaleString()}` : 'Negotiable'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--secondary-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--secondary-500)' }}>Destination:</span>
                <strong style={{ color: 'var(--secondary-900)', textAlign: 'right' }}>
                  {rfq.location}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--secondary-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--secondary-500)' }}>Status:</span>
                <StatusBadge status={rfq.status} />
              </div>
            </div>
          </div>

          {/* Buyer Card */}
          {rfq.buyer && (
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--secondary-900)', marginBottom: '0.85rem' }}>
                Buyer Organization
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--secondary-900)' }}>
                    {rfq.buyer.companyName || rfq.buyer.name}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--secondary-500)' }}>
                    {rfq.buyer.name}
                  </div>
                </div>
              </div>
              {rfq.buyer.location && (
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary-600)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} />
                  {rfq.buyer.location}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quote Submission Modal */}
      {showQuoteModal && (
        <QuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          rfq={rfq}
          existingQuote={rfq.myQuotation}
          onQuoteSubmitted={handleQuoteSubmitted}
        />
      )}

      {/* Quote Comparison Modal (for Buyer) */}
      {showComparisonModal && (
        <QuoteComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          rfq={rfq}
        />
      )}
    </div>
  );
};
