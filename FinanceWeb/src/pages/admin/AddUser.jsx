import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Phone,
  Briefcase,
  User,
} from 'lucide-react';

export const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'COMMON_CUSTOMER',
    occupation: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const roles = [
    { id: 'COMMON_CUSTOMER', label: 'Borrower (Weekly)', desc: '10-Week installment loans for common borrowers' },
    { id: 'SHOPKEEPER', label: 'Merchant (Daily)', desc: '25-Day rapid installments for retail shopkeepers' },
    { id: 'FIELD_AGENT', label: 'Field Agent', desc: 'Route collection field officer' },
    { id: 'ADMIN', label: 'Branch Staff', desc: 'Administrative staff access' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    try {
      await api.addUser(formData);
      setSuccessMsg(`User "${formData.name}" successfully enrolled into the organization!`);
      setTimeout(() => {
        navigate('/users');
      }, 1400);
    } finally {
      setSubmitting(false);
    }
  };

  const activeRole = roles.find((r) => r.id === formData.role);

  return (
    <div className="add-user-page">
      <div className="page-header">
        <div>
          <div className="org-pill">
            <Building size={14} />
            <span>Apex Finance Ltd • User Onboarding Center</span>
          </div>
          <h1 className="page-title">Onboard User / Borrower</h1>
          <p className="page-subtitle">
            Register new client, retail merchant, or field officer with assigned category and identification.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="success-banner">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="onboard-grid">
        {/* Registration Form Card */}
        <div className="card form-card">
          <div className="card-header">
            <h3 className="card-title">
              <UserPlus size={20} color="var(--emerald)" />
              Client Profile & Identification
            </h3>
            <span className="badge badge-emerald">Instant Enrollment</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Role / Segment Selector */}
            <div className="form-group">
              <label className="form-label">Client Category / Role *</label>
              <div className="role-selector-grid">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className={`role-choice-box ${formData.role === r.id ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, role: r.id })}
                  >
                    <div className="rc-header">
                      <span className="rc-title">{r.label}</span>
                      {formData.role === r.id && <CheckCircle2 size={15} color="var(--primary)" />}
                    </div>
                    <span className="rc-desc">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Name & Phone */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Legal Name *</label>
                <div className="input-with-icon">
                  <User size={15} className="input-icon" />
                  <input
                    type="text"
                    className="form-input has-icon"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh K"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Mobile Phone *</label>
                <div className="input-with-icon">
                  <Phone size={15} className="input-icon" />
                  <input
                    type="tel"
                    className="form-input has-icon"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    required
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Occupation */}
            <div className="form-group">
              <label className="form-label">Occupation / Trade Business</label>
              <div className="input-with-icon">
                <Briefcase size={15} className="input-icon" />
                <input
                  type="text"
                  className="form-input has-icon"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="e.g. Retail Grocery Store Owner"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-emerald btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={submitting || !formData.name.trim() || !formData.phone.trim()}
            >
              {submitting ? 'Enrolling Client...' : 'Enroll User & Complete Registration'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Live Enrollment Preview Card */}
        <div className="card preview-card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck size={20} color="var(--primary)" />
              Enrollment Summary Card
            </h3>
          </div>

          <div className="preview-body">
            <div className="preview-avatar">
              {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
            </div>

            <h3 className="preview-name">{formData.name || 'Client Name'}</h3>
            <span className="preview-role">
              {activeRole?.label || 'Borrower'}
            </span>

            <div className="preview-meta-list">
              <div className="pm-row">
                <span>Phone:</span>
                <strong>{formData.phone || '—'}</strong>
              </div>
              <div className="pm-row">
                <span>Trade / Occupation:</span>
                <strong>{formData.occupation || 'General Trade / Self-Employed'}</strong>
              </div>
              <div className="pm-row">
                <span>Status:</span>
                <span className="badge badge-emerald">ACTIVE UPON SAVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .add-user-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .org-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.4rem;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 600;
        }

        .onboard-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 960px) {
          .onboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .role-selector-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        @media (max-width: 600px) {
          .role-selector-grid {
            grid-template-columns: 1fr;
          }
        }

        .role-choice-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .role-choice-box:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .role-choice-box.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--primary);
        }

        .rc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rc-title {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .rc-desc {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .form-input.has-icon {
          padding-left: 2.3rem;
        }

        .preview-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem 0;
        }

        .preview-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.5rem;
          color: #ffffff;
          margin-bottom: 0.75rem;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
        }

        .preview-name {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .preview-role {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
        }

        .preview-meta-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.25rem;
          margin-top: 1.25rem;
        }

        .pm-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
        }

        .pm-row span {
          color: var(--text-secondary);
        }

        .pm-row strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default AddUser;
