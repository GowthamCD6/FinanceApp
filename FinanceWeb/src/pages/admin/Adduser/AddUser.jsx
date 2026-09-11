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
  AlertCircle,
  Store,
  CreditCard,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowLeft,
  Navigation,
  Mail,
  Shield,
  Award,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';

const PROGRAM_ROLES = [
  {
    id: 'COMMON_CUSTOMER',
    label: 'Borrower (Weekly)',
    badge: 'badge-blue',
    icon: Calendar,
    color: 'var(--accent-primary)',
    desc: '10-Week personal & trade loan cycles with weekly installments (10% flat interest)',
  },
  {
    id: 'SHOPKEEPER',
    label: 'Shopkeeper (Daily)',
    badge: 'badge-purple',
    icon: Store,
    color: 'var(--purple)',
    desc: '25-Day daily market collections for stall owners & shopkeepers (12.5% flat interest)',
  },
  {
    id: 'FIELD_AGENT',
    label: 'Field Man (Collector)',
    badge: 'badge-emerald',
    icon: Navigation,
    color: 'var(--emerald)',
    desc: 'Field collection officer assigned to specific market routes and daily cash recovery',
  },
  {
    id: 'ADMIN',
    label: 'Admin (Branch Staff)',
    badge: 'badge-yellow',
    icon: ShieldCheck,
    color: '#fbbf24',
    desc: 'Branch operational staff, loan underwriter, cashier, or administrative officer',
  },
];

export const AddUser = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();

  // Form State
  const [formData, setFormData] = useState({
    role: 'COMMON_CUSTOMER', // 'COMMON_CUSTOMER' | 'SHOPKEEPER' | 'FIELD_AGENT' | 'ADMIN'
    name: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    shop_name: '',
    assigned_route: 'Saidapet Bazaar Route',
    daily_quota: 25000,
    designation: 'Operations Officer',
    credit_limit: 50000,
    issue_initial_loan: true,
    initial_loan_amount: 20000,
    tenure: '10',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.role === 'ADMIN' && (!formData.email || !formData.email.includes('@'))) {
      errs.email = 'Valid official email address is required for admin staff';
    }

    if ((formData.role === 'COMMON_CUSTOMER' || formData.role === 'SHOPKEEPER') && !formData.address.trim()) {
      errs.address = 'Residential or stall address is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const isShop = formData.role === 'SHOPKEEPER';
      const isWeekly = formData.role === 'COMMON_CUSTOMER';
      const isFieldMan = formData.role === 'FIELD_AGENT';
      const isAdmin = formData.role === 'ADMIN';
      const principal = parseFloat(formData.initial_loan_amount) || 20000;

      await api.createUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: 'ACTIVE',
        address: formData.address.trim(),
        occupation: isShop ? 'Market Shopkeeper' : isFieldMan ? 'Route Field Collector' : isAdmin ? formData.designation : (formData.occupation.trim() || 'Self Employed'),
        shopName: isShop ? (formData.shop_name.trim() || `${formData.name}'s Store`) : null,
        assigned_route: isFieldMan ? formData.assigned_route : null,
        daily_target: isFieldMan ? parseFloat(formData.daily_quota) : null,
        designation: isAdmin ? formData.designation : null,
        credit_limit: (isWeekly || isShop) ? (parseFloat(formData.credit_limit) || 50000) : 0,
        initial_loan: (isWeekly || isShop) && formData.issue_initial_loan
          ? {
              principal,
              total_installments: isShop ? 25 : parseInt(formData.tenure, 10) || 10,
              frequency: isShop ? 'DAILY' : 'WEEKLY',
            }
          : null,
      });

      const roleObj = PROGRAM_ROLES.find((r) => r.id === formData.role);
      setSuccessMsg(`${roleObj ? roleObj.label : 'User'} "${formData.name}" successfully onboarded!`);

      setTimeout(() => {
        if (isShop) navigate(getOrgPath('shopkeepers'));
        else if (isWeekly) navigate(getOrgPath('weekly-customers'));
        else navigate(getOrgPath('users'));
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to onboard user. Please check phone number or connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const isShop = formData.role === 'SHOPKEEPER';
  const isWeekly = formData.role === 'COMMON_CUSTOMER';
  const isFieldMan = formData.role === 'FIELD_AGENT';
  const isAdmin = formData.role === 'ADMIN';

  const principalAmount = parseFloat(formData.initial_loan_amount) || 0;
  const interestRate = isShop ? 0.125 : 0.10;
  const totalRepayable = Math.round(principalAmount * (1 + interestRate));
  const installmentCount = isShop ? 25 : parseInt(formData.tenure, 10) || 10;
  const installmentAmount = installmentCount > 0 ? Math.round(totalRepayable / installmentCount) : 0;
  const activeRole = PROGRAM_ROLES.find((r) => r.id === formData.role) || PROGRAM_ROLES[0];

  return (
    <div className="onboard-user-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="welcome-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <UserPlus size={14} />
            USER ONBOARDING & ORIGINATION DESK
          </div>
          <h1 className="page-title">Onboard User / Borrower</h1>
          <p className="page-subtitle">
            Enrol weekly borrowers, daily market shopkeepers, field collectors, or branch staff with clean required fields.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate(getOrgPath('users'))}>
            <ArrowLeft size={16} />
            <span>Back to Directory</span>
          </button>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Streamlined Form Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            {/* 1. Category Selector (4 Clean Roles) */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.6rem' }}>
                Select Role / Onboarding Category *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {PROGRAM_ROLES.map((prog) => {
                  const Icon = prog.icon;
                  const isSelected = formData.role === prog.id;
                  return (
                    <div
                      key={prog.id}
                      onClick={() => setFormData({ ...formData, role: prog.id })}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 10,
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${prog.color}` : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                        <Icon size={17} color={isSelected ? prog.color : 'var(--text-muted)'} />
                        <strong style={{ fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                          {prog.label}
                        </strong>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {prog.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Common Required Identity */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Personal Identification
              </h4>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
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
                    required
                  />
                  {errors.name && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.name}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    className={`form-input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
                      if (errors.phone) setErrors({ ...errors, phone: null });
                    }}
                    required
                  />
                  {errors.phone && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.phone}</span>}
                </div>
              </div>

              {/* Conditional Field: Admin Email */}
              {isAdmin && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <Mail size={14} style={{ display: 'inline', marginRight: 4 }} /> Official Email Address *
                  </label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="e.g. suresh.ops@apexfinance.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    required
                  />
                  {errors.email && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.email}</span>}
                </div>
              )}

              {/* Conditional Field: Shop Name (For Shopkeeper) */}
              {isShop && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <Store size={14} style={{ display: 'inline', marginRight: 4 }} /> Shop / Stall Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sri Balaji Sweets & Provisions (Stall #12)"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Conditional Field: Occupation (For Weekly Borrower) */}
              {isWeekly && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <Briefcase size={14} style={{ display: 'inline', marginRight: 4 }} /> Trade / Occupation
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

              {/* Conditional Field: Assigned Route & Quota (For Field Man) */}
              {isFieldMan && (
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      <Navigation size={14} style={{ display: 'inline', marginRight: 4 }} /> Assigned Collection Route
                    </label>
                    <select
                      className="form-input"
                      value={formData.assigned_route}
                      onChange={(e) => setFormData({ ...formData, assigned_route: e.target.value })}
                    >
                      <option value="Saidapet Bazaar Route">Saidapet Bazaar Route</option>
                      <option value="T. Nagar Market Corridor">T. Nagar Market Corridor</option>
                      <option value="Triplicane High Road">Triplicane High Road</option>
                      <option value="Mylapore Tank Area">Mylapore Tank Area</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Daily Target Quota (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.daily_quota}
                      onChange={(e) => setFormData({ ...formData, daily_quota: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Conditional Field: Designation (For Admin) */}
              {isAdmin && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Branch Designation / Role</label>
                  <select
                    className="form-input"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  >
                    <option value="Branch Operations Manager">Branch Operations Manager</option>
                    <option value="Credit & Underwriting Officer">Credit & Underwriting Officer</option>
                    <option value="Head Cashier & Vault Auditor">Head Cashier & Vault Auditor</option>
                    <option value="Borrower KYC Verifier">Borrower KYC Verifier</option>
                  </select>
                </div>
              )}

              {/* Address (Only for Borrowers & Shopkeepers) */}
              {(isWeekly || isShop) && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> Residential / Stall Address *
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.address ? 'input-error' : ''}`}
                    placeholder="e.g. 42 Bazaar Road, Saidapet, Chennai"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: null });
                    }}
                    required
                  />
                  {errors.address && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.address}</span>}
                </div>
              )}
            </div>

            {/* 3. Credit Limit & Optional Initial Loan (For Borrowers & Shopkeepers only) */}
            {(isWeekly || isShop) && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Credit Limit & Loan Origination
                  </h4>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                    <input
                      type="checkbox"
                      checked={formData.issue_initial_loan}
                      onChange={(e) => setFormData({ ...formData, issue_initial_loan: e.target.checked })}
                      style={{ accentColor: 'var(--emerald)', width: 16, height: 16 }}
                    />
                    <span>Originate 1st Loan Now</span>
                  </label>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Credit Limit (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                      step={5000}
                      min={10000}
                    />
                  </div>

                  {formData.issue_initial_loan && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Initial Loan Principal (₹) *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.initial_loan_amount}
                        onChange={(e) => setFormData({ ...formData, initial_loan_amount: e.target.value })}
                        step={1000}
                        min={2000}
                        max={formData.credit_limit}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: (isFieldMan || isAdmin) ? '1.5rem' : 0 }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
              >
                <UserPlus size={17} />
                <span>{submitting ? 'Onboarding User...' : `Save & Onboard ${activeRole.label}`}</span>
                <ArrowRight size={17} />
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

        {/* Live Profile Card Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Live User Card Preview
              </span>
              <span className="badge badge-emerald">STATUS: ACTIVE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: activeRole.color ? `${activeRole.color}22` : 'rgba(99, 102, 241, 0.2)',
                  color: activeRole.color || 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                }}
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block' }}>
                  {formData.name || 'Full Name'}
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {formData.phone ? `+91 ${formData.phone}` : '+91 9XXXXXXXXX'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <span className={`badge ${activeRole.badge}`}>{activeRole.label}</span>
              {isShop && formData.shop_name && (
                <span className="badge badge-yellow">{formData.shop_name}</span>
              )}
              {isFieldMan && (
                <span className="badge badge-blue">Route: {formData.assigned_route.split(' ')[0]}</span>
              )}
              {isAdmin && (
                <span className="badge badge-purple">{formData.designation}</span>
              )}
            </div>

            {(isWeekly || isShop) && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                📍 {formData.address || 'Address pending input'}
              </div>
            )}

            {(isWeekly || isShop) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Approved Credit Limit:</span>
                <strong style={{ color: 'var(--emerald)' }}>{formatCurrency(formData.credit_limit)}</strong>
              </div>
            )}

            {isFieldMan && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Daily Recovery Quota:</span>
                <strong style={{ color: 'var(--emerald)' }}>{formatCurrency(formData.daily_quota)}</strong>
              </div>
            )}
          </div>

          {/* Loan Breakdown Preview (For Borrowers & Shopkeepers) */}
          {(isWeekly || isShop) && formData.issue_initial_loan && principalAmount > 0 && (
            <div className="card" style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  Originated Loan Obligation
                </span>
                <span className="badge badge-emerald">CYCLE #1</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Principal:</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{formatCurrency(principalAmount)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Total Repayable:</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{formatCurrency(totalRepayable)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Installment:</span>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                    {formatCurrency(installmentAmount)} / {isShop ? 'Day' : 'Week'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Tenure:</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                    {installmentCount} {isShop ? 'Days' : 'Weeks'}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUser;
