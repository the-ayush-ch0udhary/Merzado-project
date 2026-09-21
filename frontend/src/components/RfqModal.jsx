import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Tag, Layers, DollarSign } from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  'General Procurement',
  'Metals & Manufacturing',
  'Energy & Power',
  'Textiles & Apparel',
  'IT Services & Consulting',
  'Packaging & Paper',
  'Chemicals & Plastics',
  'Logistics & Warehousing',
];

export const RfqModal = ({ isOpen, onClose, onRfqSaved, editingRfq = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Metals & Manufacturing',
    description: '',
    quantity: '',
    unit: 'Units',
    location: '',
    deadline: '',
    targetBudget: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingRfq) {
      // Format deadline for datetime-local input
      const deadlineStr = editingRfq.deadline
        ? new Date(editingRfq.deadline).toISOString().slice(0, 16)
        : '';

      setFormData({
        title: editingRfq.title || '',
        category: editingRfq.category || 'General Procurement',
        description: editingRfq.description || '',
        quantity: editingRfq.quantity || '',
        unit: editingRfq.unit || 'Units',
        location: editingRfq.location || '',
        deadline: deadlineStr,
        targetBudget: editingRfq.targetBudget || '',
      });
    } else {
      // Default future deadline (14 days from now)
      const future = new Date();
      future.setDate(future.getDate() + 14);
      setFormData({
        title: '',
        category: 'Metals & Manufacturing',
        description: '',
        quantity: '',
        unit: 'Units',
        location: '',
        deadline: future.toISOString().slice(0, 16),
        targetBudget: '',
      });
    }
    setError('');
  }, [editingRfq, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim()) return setError('Please enter a product or service title.');
    if (!formData.description.trim()) return setError('Please describe your requirement.');
    if (!formData.quantity || Number(formData.quantity) <= 0) return setError('Quantity must be greater than 0.');
    if (!formData.location.trim()) return setError('Please specify delivery location.');
    if (!formData.deadline) return setError('Please select an RFQ submission deadline.');

    const selectedDate = new Date(formData.deadline);
    if (selectedDate <= new Date()) {
      return setError('Deadline must be in the future.');
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        location: formData.location,
        deadline: formData.deadline,
        targetBudget: formData.targetBudget ? Number(formData.targetBudget) : null,
      };

      let res;
      if (editingRfq) {
        res = await api.put(`/rfqs/${editingRfq._id}`, payload);
      } else {
        res = await api.post('/rfqs', payload);
      }

      if (res.data.success) {
        onRfqSaved(res.data.rfq);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save RFQ. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingRfq ? 'Edit RFQ Requirements' : 'Create New Request for Quotation (RFQ)'}
          </h2>
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

            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Product or Service Name <span style={{ color: 'var(--danger-accent)' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Grade 316L Stainless Steel Seamless Pipes"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category & Location */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Delivery Location <span style={{ color: 'var(--danger-accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Mumbai Port / Warehouse B"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Detailed Requirement Specifications <span style={{ color: 'var(--danger-accent)' }}>*</span>
              </label>
              <textarea
                name="description"
                rows="4"
                className="form-textarea"
                placeholder="Include specifications, required quality standards, certifications, packaging demands, and test reports..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Quantity & Unit */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Quantity Required <span style={{ color: 'var(--danger-accent)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 5000"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <input
                  type="text"
                  name="unit"
                  className="form-input"
                  placeholder="e.g. Units, Kg, Meters, Hours, Boxes"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Deadline & Target Budget */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Bidding Deadline <span style={{ color: 'var(--danger-accent)' }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  className="form-input"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Budget (Optional ₹ INR)</label>
                <input
                  type="number"
                  name="targetBudget"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 45000"
                  value={formData.targetBudget}
                  onChange={handleChange}
                />
              </div>
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
                ? 'Saving RFQ...'
                : editingRfq
                ? 'Save Changes'
                : 'Publish RFQ to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
