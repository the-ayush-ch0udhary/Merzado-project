import React from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  Award,
  AlertCircle,
} from 'lucide-react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'OPEN':
      return (
        <span className="badge badge-open">
          <span className="badge-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
          Active / Open
        </span>
      );
    case 'CLOSED':
      return (
        <span className="badge badge-closed">
          <Clock size={12} />
          Closed
        </span>
      );
    case 'AWARDED':
      return (
        <span className="badge badge-awarded">
          <Award size={12} />
          Awarded
        </span>
      );
    case 'PENDING':
      return (
        <span className="badge badge-pending">
          <Clock size={12} />
          Under Review
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className="badge badge-accepted">
          <CheckCircle size={12} />
          Accepted
        </span>
      );
    case 'REJECTED':
      return (
        <span className="badge badge-rejected">
          <XCircle size={12} />
          Declined
        </span>
      );
    default:
      return <span className="badge badge-closed">{status}</span>;
  }
};

export const RoleBadge = ({ role }) => {
  if (!role) return null;
  const isBuyer = role.toUpperCase() === 'BUYER';
  return (
    <span className={`badge ${isBuyer ? 'badge-buyer' : 'badge-supplier'}`}>
      {isBuyer ? '🏢 Buyer' : '🏭 Supplier'}
    </span>
  );
};
