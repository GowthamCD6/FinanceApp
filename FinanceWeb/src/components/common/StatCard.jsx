import React from 'react';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  meta,
  accentColor = 'var(--primary)',
  accentBg = 'rgba(99, 102, 241, 0.15)',
  onClick,
}) => {
  return (
    <div
      className="card stat-card"
      style={{
        '--accent-light': accentBg,
        '--icon-bg': accentBg,
        '--icon-color': accentColor,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      {(trend || meta) && (
        <div className="stat-meta">
          {trend && (
            <span className={`trend-badge ${trendDirection === 'up' ? 'trend-up' : 'trend-down'}`}>
              {trendDirection === 'up' ? '↑' : '↓'} {trend}
            </span>
          )}
          {meta && <span>{meta}</span>}
        </div>
      )}
    </div>
  );
};
