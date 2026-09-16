import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, footer, maxWidth = '540px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth, fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.28rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: '#0f172a', letterSpacing: '-0.02em' }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon btn-sm"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
