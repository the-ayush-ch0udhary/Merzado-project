import React, { useState, useEffect } from 'react';
import { X, DollarSign, Clock, FileText } from 'lucide-react';
import api from '../services/api';

export const QuoteModal = ({
  isOpen,
  onClose,
  rfq,
  existingQuote = null,
  onQuoteSubmitted,
}) => {
  const [formData, setFormData] = useState({
    price: '',
    deliveryTime: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingQuote) {
      setFormData({
        price: existingQuote.price || '',
        deliveryTime: existingQuote.deliveryTime || '',
        notes: existingQuote.notes || '',
      });
    } else {
      setFormData({
        price: '',
        deliveryTime: '7 business days',
        notes: '',
      });
    }
    setError('');
  }, [existingQuote, isOpen]);

  if (!isOpen || !rfq) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.price || Number(formData.price) <= 0) {
      return setError('Please enter a valid quoted price greater than $0.');
    }
    if (!formData.deliveryTime.trim()) {
      return setError('Please provide an estimated delivery timeline.');
    }

    try {
      setLoading(true);
      const res = await api.post(`/quotations/rfq/${rfq._id || rfq.id}`, {
        price: Number(formData.price),
        deliveryTime: formData.deliveryTime.trim(),
        notes: formData.notes.trim(),
      });

      if (res.data.success) {
        onQuoteSubmitted(res.data.quotation);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit quotation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {existingQuote ? 'Revise Your Quotation' : 'Submit Commercial Quotation'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-500)', marginTop: '0.2rem' }}>
              For: <strong>{rfq.title}</strong> ({rfq.quantity} {rfq.unit})
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Total Quoted Price ($ USD) <span style={{ color: 'var(--danger-accent)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--secondary-500)',
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  style={{ paddingLeft: '2.2rem' }}
                  placeholder="e.g. 42500"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              {rfq.targetBudget && (
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-500)', marginTop: '0.3rem' }}>
                  Buyer's target budget: <strong>${Number(rfq.targetBudget).toLocaleString()}</strong>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Estimated Delivery Time <span style={{ color: 'var(--danger-accent)' }}>*</span>
              </label>
              <input
                type="text"
                name="deliveryTime"
                className="form-input"
                placeholder="e.g. 7 business days, 2 weeks from PO"
                value={formData.deliveryTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message & Commercial Notes</label>
              <textarea
                name="notes"
                rows="4"
                className="form-textarea"
                placeholder="Detail payment terms, incoterms, quality assurances, transit insurance, or included certifications..."
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Submitting...'
                : existingQuote
                ? 'Update Quotation'
                : 'Send Quotation to Buyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
