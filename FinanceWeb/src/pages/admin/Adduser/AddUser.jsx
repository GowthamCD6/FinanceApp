import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Phone,
  Briefcase,
  User,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  Store,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';

export const AddUser = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Chennai',
    role: 'COMMON_CUSTOMER',
    status: 'ACTIVE',
    dateJoined: new Date().toISOString().slice(0, 10),
    notes: '',
    occupation: '',
    shopName: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);

  const roles = [
    { id: 'COMMON_CUSTOMER', label: 'Borrower (Weekly)', desc: '10 to 30-Week recurring loans for individuals' },
    { id: 'SHOPKEEPER', label: 'Merchant (Daily)', desc: '25-Day rapid repayments for market shopkeepers' },
    { id: 'FIELD_AGENT', label: 'Field Agent', desc: 'Route collection field officer' },
    { id: 'ADMIN', label: 'Branch Staff / Admin', desc: 'Branch operational staff & ledger manager' },
  ];

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.role) errs.role = 'Role is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.createUser({
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        occupation: formData.occupation.trim(),
        shopName: formData.role === 'SHOPKEEPER' ? formData.shopName.trim() || `${formData.name} Store` : null,
      });

      setSuccessMsg(`User "${formData.name}" successfully enrolled into the database!`);
      setTimeout(() => {
        navigate(getOrgPath('users'));
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user. Please check phone number or connection.');
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
            <span>{activeOrg ? `${activeOrg.name} • ${activeOrg.code}` : 'Apex Finance Ltd • User & Borrower Management'}</span>
          </div>
          <h1 className="page-title">Onboard User / Borrower</h1>
          <p className="page-subtitle">
            Register a new borrower, merchant, or staff account directly into the centralized financial database.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="feedback-banner" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="feedback-banner" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'var(--red)', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} color="var(--red)" />
          <span style={{ color: '#fca5a5' }}>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Form Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <UserPlus size={20} color="var(--emerald)" />
              Borrower / User Details
            </h3>
            <span className="badge badge-emerald">Database Source of Truth</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Role / Category Grid */}
            <div className="form-group">
              <label className="form-label">Client Role / Category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {roles.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: formData.role === r.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: formData.role === r.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <ShieldCheck size={16} color={formData.role === r.id ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                      <strong style={{ fontSize: '0.9rem', color: formData.role === r.id ? '#fff' : 'var(--text-secondary)' }}>
                        {r.label}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Name & Phone Grid */}
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <User size={14} style={{ display: 'inline', marginRight: 4 }} /> Full Name *
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Suresh Kumar"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                />
                {errors.name && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Phone Number *
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="e.g. 9841238901"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                />
                {errors.phone && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.phone}</span>}
              </div>
            </div>

            {/* Conditional Shop Name or Occupation */}
            {formData.role === 'SHOPKEEPER' ? (
              <div className="form-group">
                <label className="form-label">
                  <Store size={14} style={{ display: 'inline', marginRight: 4 }} /> Shop / Business Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sri Venkatesh Groceries & Provisions"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  <Briefcase size={14} style={{ display: 'inline', marginRight: 4 }} /> Occupation / Trade
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Fabrication Technician / Tailor"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                />
              </div>
            )}

            {/* Address */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> Full Residential / Stall Address
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="e.g. 42, North Car Street, Triplicane, Chennai"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Date Joined & Status */}
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} /> Date Joined
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateJoined}
                  onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={14} style={{ display: 'inline', marginRight: 4 }} /> Notes / Guarantor Info
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="e.g. Recommended by Saidapet Merchant Association. Route 2 collector."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {submitting ? 'Creating Borrower in Database...' : 'Save & Create Borrower'}
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(getOrgPath('users'))}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Live Enrollment Preview Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Live Borrower Card Preview</h3>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{formData.name || 'Borrower Name'}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formData.phone || '+91 9XXXXXXXXX'}</p>
                </div>
                <span className="badge badge-emerald">{formData.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-blue">{activeRole ? activeRole.label : 'Borrower'}</span>
                {formData.role === 'SHOPKEEPER' && formData.shopName && (
                  <span className="badge badge-purple">{formData.shopName}</span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                📍 {formData.address || 'Address pending entry'}
              </p>
              {formData.notes && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 6 }}>
                  📝 {formData.notes}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
              💡 System Workflow
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Once saved, the user is stored in the database. You can immediately assign an active loan to generate weekly/daily payment obligations and track collections in the dynamic reports page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
