import React from 'react';

export const Badge = ({ children, variant = 'secondary', className = '' }) => {
  const variantClass = `badge-${variant}`;
  return <span className={`badge ${variantClass} ${className}`}>{children}</span>;
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
    case 'BALANCED':
    case 'COMPLETED':
    case 'PAID':
      return <Badge variant="emerald">{status}</Badge>;
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'DUE':
      return <Badge variant="amber">{status.replace('_', ' ')}</Badge>;
    case 'APPROVED':
      return <Badge variant="primary">APPROVED</Badge>;
    case 'SUSPENDED':
    case 'DEFAULTER':
    case 'VARIANCE_DETECTED':
    case 'OVERDUE':
      return <Badge variant="rose">{status.replace('_', ' ')}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
