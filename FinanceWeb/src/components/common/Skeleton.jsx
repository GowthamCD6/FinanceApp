import React from 'react';

/**
 * Reusable Skeleton components for tables, cards, and KPI grids
 */

export const CardSkeleton = ({ count = 4, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton-shimmer ${className}`} style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          minHeight: 120,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="skeleton-bar" style={{ width: '45%', height: 14 }} />
            <div className="skeleton-circle" style={{ width: 34, height: 34 }} />
          </div>
          <div className="skeleton-bar" style={{ width: '60%', height: 28, margin: '4px 0' }} />
          <div className="skeleton-bar" style={{ width: '75%', height: 12 }} />
        </div>
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 6, cols = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} style={{ padding: '1rem 1.25rem' }}>
              {cIdx === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <div className="skeleton-bar" style={{ width: '70%', height: 14 }} />
                    <div className="skeleton-bar" style={{ width: '40%', height: 11 }} />
                  </div>
                </div>
              ) : cIdx === cols - 1 ? (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <div className="skeleton-pill" style={{ width: 64, height: 28 }} />
                  <div className="skeleton-circle" style={{ width: 28, height: 28 }} />
                </div>
              ) : (
                <div
                  className="skeleton-bar"
                  style={{
                    width: `${40 + ((rIdx * 17 + cIdx * 23) % 45)}%`,
                    height: 13,
                  }}
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
