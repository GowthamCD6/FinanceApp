import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
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
  Clock,
  Layers,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';

const DEFAULT_FALLBACK_ROLES = [
  {
    category_code: 'CAT-BORROWER-WK',
    name: 'Weekly Customer / Borrower',
    customer_type: 'COMMON_CUSTOMER',
    repayment_frequency: 'WEEKLY',
    default_min_loan: 10000,
    default_max_loan: 50000,
    default_interest_rate: 10.0,
    tenure_installments: 10,
    description: '10-Week personal & trade loan cycles with weekly installments (10% flat interest)',
    status: 'ACTIVE',
  },
  {
    category_code: 'CAT-MERCHANT-DLY',
    name: 'Shopkeeper / Daily Merchant',
    customer_type: 'SHOPKEEPER',
    repayment_frequency: 'DAILY',
    default_min_loan: 15000,
    default_max_loan: 100000,
    default_interest_rate: 12.5,
    tenure_installments: 25,
    description: '25-Day daily market collections for stall owners & shopkeepers (12.5% flat interest)',
    status: 'ACTIVE',
  },
  {
    category_code: 'CAT-LENDER-MO',
    name: 'Monthly Lender / Borrower',
    customer_type: 'COMMON_CUSTOMER',
    repayment_frequency: 'MONTHLY',
    default_min_loan: 25000,
    default_max_loan: 500000,
    default_interest_rate: 15.0,
    tenure_installments: 12,
    description: 'Long term monthly installment loans over 12 months (15% flat interest)',
    status: 'ACTIVE',
  },
  {
    category_code: 'CAT-FIELD-COLLECTOR',
    name: 'Collector from Users (Field Agent)',
    customer_type: 'FIELD_AGENT',
    repayment_frequency: 'N/A',
    default_min_loan: 0,
    default_max_loan: 0,
    default_interest_rate: 0,
    tenure_installments: 0,
    description: 'Field collection officer assigned to market routes and daily cash recovery',
    status: 'ACTIVE',
  },
  {
    category_code: 'CAT-BRANCH-ADMIN',
    name: 'Admin (Branch Staff)',
    customer_type: 'ADMIN',
    repayment_frequency: 'N/A',
    default_min_loan: 0,
    default_max_loan: 0,
    default_interest_rate: 0,
    tenure_installments: 0,
    description: 'Branch operational staff, loan underwriter, cashier, or administrative officer',
    status: 'ACTIVE',
  },
];

export const AddUser = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();

  // Dynamic Categories from Super Admin
  const [categories, setCategories] = useState(DEFAULT_FALLBACK_ROLES);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('CAT-BORROWER-WK');

  // Form State
  const [formData, setFormData] = useState({
    role: 'COMMON_CUSTOMER',
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
    frequency: 'WEEKLY',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Super Admin Categories
  useEffect(() => {
    const fetchSuperAdminCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await api.governance.getDefaultCategories();
        if (Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter((c) => c.status === 'ACTIVE');
          const catsToUse = activeOnly.length > 0 ? activeOnly : data;
          setCategories(catsToUse);
          // Set initial selected category
          if (catsToUse.length > 0) {
            handleSelectCategory(catsToUse[0]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch Super Admin categories, using presets:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchSuperAdminCategories();
  }, []);

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Active Category Object
  const activeCategory = useMemo(() => {
    return (
      categories.find((c) => c.category_code === selectedCategoryCode) ||
      categories[0] ||
      DEFAULT_FALLBACK_ROLES[0]
    );
  }, [categories, selectedCategoryCode]);

  const isShop = activeCategory?.customer_type === 'SHOPKEEPER';
  const isFieldMan = activeCategory?.customer_type === 'FIELD_AGENT';
  const isAdmin = activeCategory?.customer_type === 'ADMIN';
  const isLending = activeCategory?.repayment_frequency && activeCategory.repayment_frequency !== 'N/A';
  const isWeekly = activeCategory?.repayment_frequency === 'WEEKLY';
  const isDaily = activeCategory?.repayment_frequency === 'DAILY';
  const isMonthly = activeCategory?.repayment_frequency === 'MONTHLY';

  // Handle Category Click
  const handleSelectCategory = (cat) => {
    setSelectedCategoryCode(cat.category_code);
    const hasLoanTerms = cat.repayment_frequency && cat.repayment_frequency !== 'N/A';
    const minLoan = Number(cat.default_min_loan) || 10000;
    const maxLoan = Number(cat.default_max_loan) || 50000;
    const tenure = String(cat.tenure_installments || (cat.customer_type === 'SHOPKEEPER' ? 25 : 10));

    setFormData((prev) => ({
      ...prev,
      role: cat.customer_type || 'COMMON_CUSTOMER',
      frequency: cat.repayment_frequency || (cat.customer_type === 'SHOPKEEPER' ? 'DAILY' : 'WEEKLY'),
      tenure,
      credit_limit: maxLoan > 0 ? maxLoan : 50000,
      initial_loan_amount: minLoan > 0 ? minLoan : 20000,
      issue_initial_loan: hasLoanTerms,
    }));
  };

  // Live Loan Calculation Preview
  const principalAmount = parseFloat(formData.initial_loan_amount) || 0;
  const flatRate = Number(activeCategory?.default_interest_rate) || (isShop ? 12.5 : isMonthly ? 15.0 : 10.0);
  const interestAmount = (principalAmount * flatRate) / 100;
  const totalRepayable = principalAmount + interestAmount;
  const installmentCount = parseInt(formData.tenure, 10) || (isShop ? 25 : isMonthly ? 12 : 10);
  const installmentAmount = installmentCount > 0 ? Math.ceil(totalRepayable / installmentCount) : 0;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (isAdmin && (!formData.email || !formData.email.includes('@'))) {
      errs.email = 'Valid official email address is required for admin staff';
    }

    if ((isWeekly || isShop || isMonthly) && !formData.address.trim()) {
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
      const principal = parseFloat(formData.initial_loan_amount) || 20000;
      const freq = activeCategory.repayment_frequency !== 'N/A'
        ? activeCategory.repayment_frequency
        : isShop
        ? 'DAILY'
        : 'WEEKLY';

      await api.createUser({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        role: activeCategory.customer_type || formData.role,
        category_code: activeCategory.category_code,
        status: 'ACTIVE',
        address: formData.address.trim(),
        occupation: isShop
          ? 'Market Shopkeeper'
          : isFieldMan
          ? 'Route Field Collector'
          : isAdmin
          ? formData.designation
          : (formData.occupation.trim() || 'Self Employed'),
        shopName: isShop ? (formData.shop_name.trim() || `${formData.name}'s Store`) : null,
        assigned_route: isFieldMan ? formData.assigned_route : null,
        daily_target: isFieldMan ? parseFloat(formData.daily_quota) : null,
        designation: isAdmin ? formData.designation : null,
        credit_limit: isLending ? (parseFloat(formData.credit_limit) || 50000) : 0,
        initial_loan: isLending && formData.issue_initial_loan
          ? {
              principal,
              total_installments: installmentCount,
              frequency: freq,
              interest_rate: flatRate,
            }
          : null,
      });

      setSuccessMsg(`User "${formData.name}" successfully onboarded under category "${activeCategory.name}"!`);

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

  // Get icon for category
  const getCategoryIcon = (cat) => {
    if (cat.customer_type === 'FIELD_AGENT') return Navigation;
    if (cat.customer_type === 'ADMIN') return ShieldCheck;
    if (cat.repayment_frequency === 'DAILY' || cat.customer_type === 'SHOPKEEPER') return Store;
    if (cat.repayment_frequency === 'MONTHLY') return Calendar;
    return Users;
  };

  const getCategoryColor = (cat) => {
    if (cat.customer_type === 'FIELD_AGENT') return 'var(--emerald)';
    if (cat.customer_type === 'ADMIN') return '#fbbf24';
    if (cat.repayment_frequency === 'DAILY' || cat.customer_type === 'SHOPKEEPER') return 'var(--purple)';
    if (cat.repayment_frequency === 'MONTHLY') return '#06b6d4';
    return 'var(--accent-primary)';
  };

  return (
    <div className="add-user-page">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(getOrgPath('users'))}
            style={{ marginBottom: '0.75rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <ArrowLeft size={14} /> Back to User Directory
          </button>
          <div className="welcome-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} /> DYNAMIC CATEGORY & POLICY ENROLMENT
          </div>
          <h1 className="page-title">Onboard New Customer / Staff</h1>
          <p className="page-subtitle">
            Register weekly customers, daily lenders, monthly borrowers, or field collectors governed by Super Admin categories.
          </p>
        </div>
      </div>

      {/* Feedback Messages */}
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
            {/* 1. Dynamic Category Selector from Super Admin */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>
                  Select Onboarding Category & Policy *
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {categories.length} Super Admin Categories Available
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat);
                  const color = getCategoryColor(cat);
                  const isSelected = selectedCategoryCode === cat.category_code;
                  return (
                    <div
                      key={cat.id || cat.category_code}
                      onClick={() => handleSelectCategory(cat)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 10,
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${color}` : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Icon size={17} color={isSelected ? color : 'var(--text-muted)'} />
                          <strong style={{ fontSize: '0.88rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                            {cat.name}
                          </strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: color, background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 3 }}>
                          {cat.repayment_frequency !== 'N/A' ? `${cat.repayment_frequency} CYCLE` : cat.customer_type}
                        </span>
                        {Number(cat.default_interest_rate) > 0 && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--emerald)' }}>
                            {cat.default_interest_rate}% Flat
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cat.description}
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

              {/* Conditional Field: Occupation (For Borrowers) */}
              {(isWeekly || isMonthly) && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <Briefcase size={14} style={{ display: 'inline', marginRight: 4 }} /> Trade / Occupation
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Fabrication Technician / Tailor / Wholesale Trader"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>
              )}

              {/* Conditional Field: Assigned Route & Quota (For Field Collector) */}
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

              {/* Address (For Borrowers & Shopkeepers) */}
              {(isWeekly || isShop || isMonthly) && (
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

            {/* 3. Credit Limit & Optional Initial Loan (For Lending Categories) */}
            {isLending && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Credit Limit & Loan Origination ({activeCategory.repayment_frequency} Policy)
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
                      min={activeCategory.default_min_loan || 10000}
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
                        min={activeCategory.default_min_loan || 2000}
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
                <span>{submitting ? 'Onboarding User...' : `Save & Onboard ${activeCategory.name}`}</span>
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
                Live User Policy Card
              </span>
              <span className="badge badge-emerald">STATUS: ACTIVE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: `${getCategoryColor(activeCategory)}22`,
                  color: getCategoryColor(activeCategory),
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
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: `${getCategoryColor(activeCategory)}22`,
                  color: getCategoryColor(activeCategory),
                }}
              >
                {activeCategory.name}
              </span>
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

            {(isWeekly || isShop || isMonthly) && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                📍 {formData.address || 'Address pending input'}
              </div>
            )}

            {isLending && (
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

          {/* Loan Breakdown Preview (For Lending Categories) */}
          {isLending && formData.issue_initial_loan && principalAmount > 0 && (
            <div className="card" style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  Super Admin Configured Loan Obligation
                </span>
                <span className="badge badge-emerald">{activeCategory.repayment_frequency} #{installmentCount}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Principal:</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{formatCurrency(principalAmount)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Total Repayable ({flatRate}%):</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{formatCurrency(totalRepayable)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Installment:</span>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                    {formatCurrency(installmentAmount)} / {activeCategory.repayment_frequency?.toLowerCase() === 'daily' ? 'Day' : activeCategory.repayment_frequency?.toLowerCase() === 'monthly' ? 'Month' : 'Week'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Tenure:</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                    {installmentCount} {activeCategory.repayment_frequency?.toLowerCase() === 'daily' ? 'Days' : activeCategory.repayment_frequency?.toLowerCase() === 'monthly' ? 'Months' : 'Weeks'}
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
