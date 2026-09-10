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

import { useOrg } from '../../context/OrgContext';

export const AddUser = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'COMMON_CUSTOMER',
    occupation: '',
  });

  const getOrgPath = (sub) => activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`;

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
        navigate(getOrgPath('users'));
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
            <span>{activeOrg ? `${activeOrg.name} • ${activeOrg.code}` : 'Apex Finance Ltd • User Onboarding Center'}</span>
          </div>
          <h1 className="page-title">Onboard User / Borrower</h1>
          <p className="page-subtitle">
            Register a new borrower or merchant with credit category setup and instant route enrollment.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="feedback-banner">
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Onboarding Form Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <UserPlus size={20} color="var(--emerald)" />
              Borrower Information
            </h3>
            <span className="badge badge-emerald">Instant Enrollment</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Category / Role Selector Grid */}
            <div className="form-group">
              <label className="form-label">Client Category / Role *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {roles.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: formData.role === r.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: formData.role === r.id ? '#EEF2FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: formData.role === r.id ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.88rem' }}>
                        {r.label}
                      </strong>
                      {formData.role === r.id && <CheckCircle2 size={15} color="var(--primary)" />}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Name */}
            <div className="form-group">
              <label className="form-label">Borrower Full Name *</label>
              <div className="input-with-icon">
                <User size={15} className="input-icon" />
                <input
                  type="text"
                  className="form-input has-icon"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div className="form-group">
              <label className="form-label">Mobile Phone Number (10 Digits) *</label>
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

            {/* Occupation */}
            <div className="form-group">
              <label className="form-label">Occupation / Trade</label>
              <div className="input-with-icon">
                <Briefcase size={15} className="input-icon" />
                <input
                  type="text"
                  className="form-input has-icon"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="e.g. Tea Stall Owner, Tailor, Electrician"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-emerald btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={submitting || !formData.name.trim() || !formData.phone.trim()}
            >
              {submitting ? 'Enrolling Client...' : 'Enroll Borrower into Organization'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
          <div className="card-header" style={{ width: '100%' }}>
            <h3 className="card-title">
              <ShieldCheck size={20} color="var(--primary)" />
              Enrollment Summary
            </h3>
          </div>

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.6rem',
              margin: '0.5rem 0 1rem',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
            }}
          >
            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
          </div>

          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{formData.name || 'Borrower Full Name'}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {formData.phone ? `+91 ${formData.phone}` : 'Mobile Number Not Provided'}
          </span>

          <div style={{ marginTop: '0.75rem' }}>
            <span className="badge badge-primary">
              {activeRole ? activeRole.label : 'Borrower'}
            </span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid #E2E8F0', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Occupation:</span>
              <strong>{formData.occupation || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <span className="badge badge-emerald">ACTIVE UPON ENROLLMENT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Territory Node:</span>
              <strong>Triplicane & Saidapet</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
