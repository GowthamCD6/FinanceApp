import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
  RefreshCw,
  X,
  ChevronDown,
  Building,
  CreditCard,
  Receipt,
  TrendingUp,
  Store,
  Calendar,
  Users,
  ExternalLink,
  Wallet,
  Landmark,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';
import './AddUser.css';

export const AddUser = () => {
  const navigate = useNavigate();
  const { activeOrg, branches } = useOrg();
  const orgId = activeOrg?.id || 1;

  // Dynamic Lending Config fetched from DB (interest rates page table)
  const [lendingConfig, setLendingConfig] = useState({
    daily_interest_rate: 25.0,
    daily_tenure_days: 100,
    daily_min_amount: 10000,
    daily_max_amount: 15000,

    weekly_interest_rate: 25.0,
    weekly_tenure_weeks: 10,
    weekly_min_amount: 2000,
    weekly_max_amount: 5000,

    monthly_interest_rate: 25.0,
    monthly_tenure_months: 12,
    monthly_min_amount: 25000,
    monthly_max_amount: 500000,
  });

  const [selectedCategoryCode, setSelectedCategoryCode] = useState('CAT-BORROWER-WK');

  // Streamlined Form State (Dynamic Interest Rate & Custom Tenure per customer)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birth_year: '',
    branch_id: '',
    credit_limit: 5000,
    issue_initial_loan: true,
    initial_loan_amount: 2000,
    interest_rate: '25',
    tenure: '10',
    frequency: 'WEEKLY',
    funding_source: 'VAULT', // 'VAULT' | 'HANDS_ON'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdBorrower, setCreatedBorrower] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastCountdown, setToastCountdown] = useState(6);

  // Auto-countdown timer for top-right success notification
  useEffect(() => {
    if (!showSuccessToast) return;
    const interval = setInterval(() => {
      setToastCountdown((prev) => {
        if (prev <= 1) {
          setShowSuccessToast(false);
          return 6;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showSuccessToast]);

  // Load configured rates from database
  useEffect(() => {
    const fetchLendingConfig = async () => {
      try {
        const res = await api.getRates();
        const rateRows = res?.data || res || [];
        if (Array.isArray(rateRows) && rateRows.length > 0) {
          const cfg = { ...lendingConfig };
          rateRows.forEach((r) => {
            const freq = (r.repayment_frequency || r.frequency || '').toUpperCase();
            if (freq === 'DAILY') {
              cfg.daily_interest_rate = parseFloat(r.flat_rate_pct ?? r.interest_rate) || 25.0;
              cfg.daily_tenure_days = parseInt(r.tenure_days ?? r.tenure_installments) || 100;
              cfg.daily_min_amount = parseFloat(r.min_amount) || 10000;
              cfg.daily_max_amount = parseFloat(r.max_amount) || 15000;
            } else if (freq === 'WEEKLY') {
              cfg.weekly_interest_rate = parseFloat(r.flat_rate_pct ?? r.interest_rate) || 25.0;
              cfg.weekly_tenure_weeks = parseInt(r.tenure_weeks ?? r.tenure_installments) || 10;
              cfg.weekly_min_amount = parseFloat(r.min_amount) || 2000;
              cfg.weekly_max_amount = parseFloat(r.max_amount) || 5000;
            } else if (freq === 'MONTHLY') {
              cfg.monthly_interest_rate = parseFloat(r.flat_rate_pct ?? r.interest_rate) || 25.0;
              cfg.monthly_tenure_months = parseInt(r.tenure_months ?? r.tenure_installments) || 12;
              cfg.monthly_min_amount = parseFloat(r.min_amount) || 25000;
              cfg.monthly_max_amount = parseFloat(r.max_amount) || 500000;
            }
          });
          setLendingConfig(cfg);
        }
      } catch (err) {
        console.warn('Using default DB lending config:', err);
      }
    };
    fetchLendingConfig();
  }, []);

  // Update branch_id when branches are loaded
  useEffect(() => {
    if (branches && branches.length > 0 && !formData.branch_id) {
      setFormData((prev) => ({ ...prev, branch_id: branches[0].id }));
    }
  }, [branches]);

  // Dynamically build the 3 core borrower categories from DB lending config
  const categories = useMemo(() => {
    return [
      {
        category_code: 'CAT-BORROWER-WK',
        name: 'Borrower (Weekly Installment)',
        customer_type: 'COMMON_CUSTOMER',
        repayment_frequency: 'WEEKLY',
        default_min_loan: Number(lendingConfig.weekly_min_amount) || 2000,
        default_max_loan: Number(lendingConfig.weekly_max_amount) || 5000,
        default_interest_rate: Number(lendingConfig.weekly_interest_rate) || 25.0,
        tenure_installments: Number(lendingConfig.weekly_tenure_weeks) || 10,
        description: `Standard individual and worker micro-loans with ${lendingConfig.weekly_tenure_weeks || 10}-week recurring repayments.`,
        tenure_label: `${lendingConfig.weekly_tenure_weeks || 10} Weeks`,
      },
      {
        category_code: 'CAT-MERCHANT-DLY',
        name: 'Merchant (Daily Installment)',
        customer_type: 'SHOPKEEPER',
        repayment_frequency: 'DAILY',
        default_min_loan: Number(lendingConfig.daily_min_amount) || 10000,
        default_max_loan: Number(lendingConfig.daily_max_amount) || 15000,
        default_interest_rate: Number(lendingConfig.daily_interest_rate) || 25.0,
        tenure_installments: Number(lendingConfig.daily_tenure_days) || 100,
        description: `Retail shopkeepers and stall merchants with ${lendingConfig.daily_tenure_days || 100}-day rapid daily collections.`,
        tenure_label: `${lendingConfig.daily_tenure_days || 100} Days`,
      },
      {
        category_code: 'CAT-BORROWER-MO',
        name: 'Monthly Salaried Borrower (EMI)',
        customer_type: 'COMMON_CUSTOMER',
        repayment_frequency: 'MONTHLY',
        default_min_loan: Number(lendingConfig.monthly_min_amount) || 25000,
        default_max_loan: Number(lendingConfig.monthly_max_amount) || 500000,
        default_interest_rate: Number(lendingConfig.monthly_interest_rate) || 25.0,
        tenure_installments: Number(lendingConfig.monthly_tenure_months) || 12,
        description: `12-Month structured EMI micro-loans for salaried individuals (25% flat interest).`,
        tenure_label: `${lendingConfig.monthly_tenure_months || 12} Months`,
      },
    ];
  }, [lendingConfig]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.category_code === selectedCategoryCode) || categories[0];
  }, [categories, selectedCategoryCode]);

  const isShop = activeCategory.repayment_frequency === 'DAILY' || activeCategory.customer_type === 'SHOPKEEPER';
  const isMonthly = activeCategory.repayment_frequency === 'MONTHLY';
  const isWeekly = !isShop && !isMonthly;

  const calculatedAge = useMemo(() => {
    const y = parseInt(formData.birth_year, 10);
    const currentYear = new Date().getFullYear();
    if (!isNaN(y) && y >= 1920 && y <= currentYear) {
      return currentYear - y;
    }
    return null;
  }, [formData.birth_year]);

  const handleSelectCategory = (cat) => {
    setSelectedCategoryCode(cat.category_code);
    setFormData((prev) => ({
      ...prev,
      credit_limit: cat.default_max_loan,
      initial_loan_amount: cat.default_min_loan,
      interest_rate: String(cat.default_interest_rate),
      tenure: String(cat.tenure_installments),
      frequency: cat.repayment_frequency,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      birth_year: '',
      branch_id: branches[0]?.id || '',
      credit_limit: activeCategory.default_max_loan,
      issue_initial_loan: true,
      initial_loan_amount: activeCategory.default_min_loan,
      interest_rate: String(activeCategory.default_interest_rate),
      tenure: String(activeCategory.tenure_installments),
      frequency: activeCategory.repayment_frequency,
    });
    setErrors({});
    setErrorMsg('');
    setCreatedBorrower(null);
  };

  // Units
  const tenureUnit = isShop ? 'Days' : isMonthly ? 'Months' : 'Weeks';
  const tenureUnitSingular = isShop ? 'Day' : isMonthly ? 'Month' : 'Week';

  // Dynamic Financial Calculations (Real-time recalculation based on admin-defined rate and tenure)
  const principalAmount = parseFloat(formData.initial_loan_amount) || 0;
  const flatRate = parseFloat(formData.interest_rate !== undefined && formData.interest_rate !== '' ? formData.interest_rate : activeCategory.default_interest_rate) || 0;
  const installmentCount = parseInt(formData.tenure !== undefined && formData.tenure !== '' ? formData.tenure : activeCategory.tenure_installments, 10) || 1;
  const interestAmount = Math.round((principalAmount * flatRate) / 100);
  const totalRepayable = principalAmount + interestAmount;
  const installmentAmount = installmentCount > 0 ? Math.round(totalRepayable / installmentCount) : 0;

  const formatCurrency = (num) => {
    return `₹${Number(num || 0).toLocaleString('en-IN')}`;
  };

  const getOrgPath = (sub) => {
    const p = window.location.pathname;
    const m = p.match(/^\/admin\/org\/([^/]+)/);
    if (m) return `/admin/org/${m[1]}/${sub}`;
    return `/admin/${sub}`;
  };

  const validate = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Borrower full name is required';
    }

    const cleanPhone = (formData.phone || '').trim().replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Mobile phone number is required';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.birth_year) {
      const yearNum = parseInt(formData.birth_year, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1920 || yearNum > currentYear) {
        errs.birth_year = 'Please enter a valid 4-digit birth year';
      }
    }

    if (formData.issue_initial_loan) {
      if (!formData.initial_loan_amount || parseFloat(formData.initial_loan_amount) <= 0) {
        errs.initial_loan_amount = 'Initial loan principal must be greater than 0';
      }
      if (formData.interest_rate === '' || isNaN(Number(formData.interest_rate)) || Number(formData.interest_rate) < 0) {
        errs.interest_rate = 'Interest rate must be 0 or greater';
      }
      if (!formData.tenure || parseInt(formData.tenure, 10) <= 0) {
        errs.tenure = `Tenure must be at least 1 ${tenureUnitSingular.toLowerCase()}`;
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstErr = Object.values(errs)[0];
      setErrorMsg(firstErr);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const principal = parseFloat(formData.initial_loan_amount) || activeCategory.default_min_loan;
      const freq = activeCategory.repayment_frequency || (isShop ? 'DAILY' : isMonthly ? 'MONTHLY' : 'WEEKLY');
      const birthYearNum = formData.birth_year ? parseInt(formData.birth_year, 10) : null;

      const res = await api.createUser({
        organizationId: activeOrg?.id || 1,
        branchId: formData.branch_id || (branches[0]?.id || null),
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/\D/g, ''),
        birth_year: birthYearNum,
        date_of_birth: birthYearNum ? `${birthYearNum}-01-01` : null,
        role: isShop ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
        category_code: activeCategory.category_code,
        status: 'ACTIVE',
        credit_limit: parseFloat(formData.credit_limit) || activeCategory.default_max_loan,
        initial_loan: formData.issue_initial_loan
          ? {
              principal,
              total_installments: installmentCount,
              frequency: freq,
              interest_rate: flatRate,
              funding_source: formData.funding_source || 'VAULT',
            }
          : null,
      });

      const customerCode = res?.customerCode || res?.data?.customerCode || res?.data?.customer_code || 'CUST-ONBOARDED';
      const createdInfo = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        customerCode,
        categoryName: activeCategory.name,
        principal,
        interestRate: flatRate,
        installmentAmount,
        installmentCount,
        frequency: freq,
        isShop,
        isMonthly,
        branchName: branches.find((b) => String(b.id) === String(formData.branch_id))?.branch_name || branches[0]?.branch_name || 'Main Branch',
      };

      setCreatedBorrower(createdInfo);
      setShowSuccessToast(true);
      setToastCountdown(6);
      setSuccessMsg(`Borrower "${formData.name}" successfully onboarded with ID: ${customerCode}!`);

      // Reset input fields for subsequent entries
      setFormData((prev) => ({
        ...prev,
        name: '',
        phone: '',
        birth_year: '',
      }));
    } catch (err) {
      console.error('Error onboarding user:', err);
      setErrorMsg(err.message || 'Failed to onboard borrower. Please verify details.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBranchObj = branches.find((b) => String(b.id) === String(formData.branch_id)) || branches[0];

  return (
    <div className="onboard-page-container">
      {/* ── Page Header (Exact Match to Monthly Borrowers Header) ─── */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">
              Onboard New Borrower
            </h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="directory-btn-secondary"
            onClick={() => navigate(getOrgPath('staff'))}
            title="Manage Staff & Field Collectors"
          >
            <Users size={15} />
            <span>Manage Staff & Collectors</span>
          </button>
          <button
            type="button"
            className="directory-btn-primary"
            onClick={() => navigate(getOrgPath('users'))}
            title="View Borrower Directory"
          >
            <Users size={16} />
            <span>Borrower Directory</span>
          </button>
        </div>
      </div>

      {/* ── Global Alert Banners ───────────────────────────────────── */}
      {errorMsg && (
        <div className="onboard-alert error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Main Layout: Form (Left) & Preview Cards (Right) ───────── */}
      <div className="onboard-layout-grid">
        {/* Left Column: Form Card */}
        <div className="onboard-main-card">
          <form onSubmit={handleSubmit} noValidate>
            {/* Division Selection Section */}
            <div className="onboard-section-block">
              <div className="onboard-section-header">
                <h3 className="onboard-section-heading">Select Borrower Lending Division *</h3>
              </div>

              <div className="onboard-division-grid">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryCode === cat.category_code;
                  const isShopCat = cat.repayment_frequency === 'DAILY';
                  const isMonthlyCat = cat.repayment_frequency === 'MONTHLY';
                  const Icon = isShopCat ? Store : isMonthlyCat ? Calendar : Users;

                  return (
                    <div
                      key={cat.category_code}
                      className={`onboard-division-item ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectCategory(cat)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="onboard-division-top">
                        <div className="onboard-division-icon">
                          <Icon size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 className="onboard-division-title">{cat.name}</h4>
                          <div className="onboard-division-tags">
                            <span className="onboard-division-badge freq">{cat.repayment_frequency}</span>
                            <span className="onboard-division-badge rate">{cat.default_interest_rate}% Flat</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 1: Borrower Details */}
            <div className="onboard-section-block">
              <div className="onboard-section-header">
                <h3 className="onboard-section-heading">Borrower Details</h3>
              </div>

              <div className="onboard-fields-row">
                {/* Borrower Full Name */}
                <div className="onboard-field">
                  <label className="onboard-label">
                    Borrower Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className={`onboard-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g. Ramesh Krishnan"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    required
                  />
                  {errors.name && <span className="onboard-input-error-text">{errors.name}</span>}
                </div>

                {/* Mobile Phone Number */}
                <div className="onboard-field">
                  <label className="onboard-label">
                    Mobile Phone Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`onboard-input ${errors.phone ? 'error' : ''}`}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
                      if (errors.phone) setErrors({ ...errors, phone: null });
                    }}
                    required
                  />
                  {errors.phone && <span className="onboard-input-error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="onboard-fields-row">
                {/* Year of Birth / Date of Birth */}
                <div className="onboard-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className="onboard-label" style={{ marginBottom: 0 }}>
                      Date / Year of Birth
                    </label>
                    {calculatedAge !== null && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary, #3b82f6)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                        Age: {calculatedAge} Yrs
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    className={`onboard-input ${errors.birth_year ? 'error' : ''}`}
                    placeholder="e.g. 1990 (YYYY)"
                    maxLength={4}
                    value={formData.birth_year}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 4);
                      setFormData({ ...formData, birth_year: val });
                      if (errors.birth_year) setErrors({ ...errors, birth_year: null });
                    }}
                  />
                  {errors.birth_year && (
                    <span className="onboard-input-error-text">
                      {errors.birth_year}
                    </span>
                  )}
                </div>

                {/* Operating Branch */}
                <div className="onboard-field">
                  <label className="onboard-label">
                    Operating Branch <span className="req">*</span>
                  </label>
                  <div className="onboard-select-wrap">
                    <select
                      className="onboard-select"
                      value={formData.branch_id || (branches[0]?.id || '')}
                      onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    >
                      {branches.length === 0 ? (
                        <option value="">Main Branch</option>
                      ) : (
                        branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.branch_name || b.name} ({b.branch_code || b.code || 'MAIN'})
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown size={16} className="onboard-select-chevron" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Credit Policy & Loan Origination */}
            <div className="onboard-section-block">
              <div className="onboard-section-header">
                <h3 className="onboard-section-heading">
                  Credit Policy & Loan Origination ({activeCategory.repayment_frequency} Cycle)
                </h3>
                <label className="onboard-checkbox-row">
                  <input
                    type="checkbox"
                    checked={formData.issue_initial_loan}
                    onChange={(e) => setFormData({ ...formData, issue_initial_loan: e.target.checked })}
                  />
                  <span className="onboard-checkbox-label">Originate 1st Loan Immediately</span>
                </label>
              </div>

              <div className="onboard-fields-row">
                {/* Approved Credit Limit */}
                <div className="onboard-field">
                  <label className="onboard-label">
                    Approved Credit Limit (₹) <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    className="onboard-input"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    step={1000}
                    min={1000}
                    required
                  />
                </div>

                {/* Initial Loan Principal */}
                {formData.issue_initial_loan && (
                  <div className="onboard-field">
                    <label className="onboard-label">
                      Initial Loan Principal (₹) <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      className={`onboard-input ${errors.initial_loan_amount ? 'error' : ''}`}
                      value={formData.initial_loan_amount}
                      onChange={(e) => {
                        setFormData({ ...formData, initial_loan_amount: e.target.value });
                        if (errors.initial_loan_amount) setErrors({ ...errors, initial_loan_amount: null });
                      }}
                      step={500}
                      min={500}
                      required
                    />
                    {errors.initial_loan_amount && (
                      <span className="onboard-input-error-text">{errors.initial_loan_amount}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Interest Rate & Custom Tenure Inputs */}
              {formData.issue_initial_loan && (
                <div className="onboard-fields-row" style={{ marginTop: '0.85rem' }}>
                  {/* Dynamic Interest Rate (editable by admin with custom rate difference) */}
                  <div className="onboard-field">
                    <label className="onboard-label">
                      Interest Rate (%) <span className="req">*</span>
                      <span className="onboard-field-hint">
                        (Default: {activeCategory.default_interest_rate}% Flat)
                      </span>
                    </label>
                    <input
                      type="number"
                      className={`onboard-input ${errors.interest_rate ? 'error' : ''}`}
                      placeholder={`e.g. ${activeCategory.default_interest_rate}`}
                      value={formData.interest_rate}
                      onChange={(e) => {
                        setFormData({ ...formData, interest_rate: e.target.value });
                        if (errors.interest_rate) setErrors({ ...errors, interest_rate: null });
                      }}
                      step={0.5}
                      min={0}
                      max={100}
                      required
                    />
                    {errors.interest_rate && (
                      <span className="onboard-input-error-text">{errors.interest_rate}</span>
                    )}
                  </div>

                  {/* Dynamic Default Tenure (editable by admin for custom duration) */}
                  <div className="onboard-field">
                    <label className="onboard-label">
                      Tenure Duration ({tenureUnit}) <span className="req">*</span>
                      <span className="onboard-field-hint">
                        (Default: {activeCategory.tenure_installments} {tenureUnit})
                      </span>
                    </label>
                    <input
                      type="number"
                      className={`onboard-input ${errors.tenure ? 'error' : ''}`}
                      placeholder={`e.g. ${activeCategory.tenure_installments}`}
                      value={formData.tenure}
                      onChange={(e) => {
                        setFormData({ ...formData, tenure: e.target.value });
                        if (errors.tenure) setErrors({ ...errors, tenure: null });
                      }}
                      step={1}
                      min={1}
                      max={365}
                      required
                    />
                    {errors.tenure && (
                      <span className="onboard-input-error-text">{errors.tenure}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Disbursement Funding Source Selection */}
              {formData.issue_initial_loan && (
                <div className="onboard-field" style={{ marginTop: '0.85rem' }}>
                  <label className="onboard-label">
                    Disbursement Funding Source <span className="req">*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, funding_source: 'VAULT' })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: formData.funding_source === 'VAULT' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        background: formData.funding_source === 'VAULT' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Wallet size={20} color={formData.funding_source === 'VAULT' ? '#2563eb' : '#64748b'} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: formData.funding_source === 'VAULT' ? '#1e40af' : '#1e293b' }}>
                          From Branch Vault
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                          Deducts from active branch cash float
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, funding_source: 'HANDS_ON' })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: formData.funding_source === 'HANDS_ON' ? '2px solid #059669' : '1px solid #e2e8f0',
                        background: formData.funding_source === 'HANDS_ON' ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Landmark size={20} color={formData.funding_source === 'HANDS_ON' ? '#059669' : '#64748b'} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: formData.funding_source === 'HANDS_ON' ? '#065f46' : '#1e293b' }}>
                          Hands-on Money (Admin)
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                          Auto-injects to Net Capital & disburses
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="onboard-form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="onboard-btn-primary"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>Saving to DB...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Save & Onboard Borrower ({activeCategory.name.split('/')[0].trim()})</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="onboard-btn-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Smart Preview & Obligation Cards */}
        <div className="onboard-preview-column">
          {/* Live Borrower Card Preview */}
          <div className="onboard-preview-card">
            <div className="onboard-preview-header">
              <span className="onboard-preview-title">
                <CreditCard size={14} /> Live Borrower Card Preview
              </span>
              <span className="onboard-preview-badge active">ACTIVE</span>
            </div>

            <div className="onboard-borrower-info">
              <div className="onboard-borrower-avatar">
                {formData.name ? formData.name.trim().charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <h4 className="onboard-borrower-name">
                  {formData.name.trim() || 'Borrower Name'}
                </h4>
                <p className="onboard-borrower-phone">
                  {formData.phone ? `+91 ${formData.phone}` : '+91 9XXXXXXXXX'}
                </p>
              </div>
            </div>

            <div>
              <span className="onboard-borrower-division-pill">
                {activeCategory.name}
              </span>
            </div>

            <div className="onboard-borrower-branch">
              <Building size={14} />
              <span>{selectedBranchObj?.branch_name || selectedBranchObj?.name || 'Main Regional Branch'}</span>
            </div>

            <div className="onboard-borrower-credit-line">
              <span className="onboard-borrower-credit-lbl">Approved Credit Line:</span>
              <span className="onboard-borrower-credit-val">
                {formatCurrency(formData.credit_limit)}
              </span>
            </div>
          </div>

          {/* Originated Loan Obligation Card */}
          {formData.issue_initial_loan && principalAmount > 0 && (
            <div className="onboard-preview-card">
              <div className="onboard-preview-header">
                <span className="onboard-preview-title">
                  <Receipt size={14} /> Originated Loan Obligation
                </span>
                <span className="onboard-preview-badge cycle">
                  {activeCategory.repayment_frequency} #{installmentCount}
                </span>
              </div>

              <div className="onboard-metrics-2x2">
                <div className="onboard-metric-tile">
                  <span className="onboard-metric-lbl">Principal Given</span>
                  <div className="onboard-metric-val">{formatCurrency(principalAmount)}</div>
                </div>

                <div className="onboard-metric-tile">
                  <span className="onboard-metric-lbl">Repayable ({flatRate}%)</span>
                  <div className="onboard-metric-val">{formatCurrency(totalRepayable)}</div>
                </div>

                <div className="onboard-metric-tile highlight">
                  <span className="onboard-metric-lbl">Installment Due</span>
                  <div className="onboard-metric-val">
                    {formatCurrency(installmentAmount)} /{' '}
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {isShop ? 'Day' : isMonthly ? 'Month' : 'Week'}
                    </span>
                  </div>
                </div>

                <div className="onboard-metric-tile">
                  <span className="onboard-metric-lbl">Tenure Duration</span>
                  <div className="onboard-metric-val">
                    {installmentCount}{' '}
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {isShop ? 'Days' : isMonthly ? 'Months' : 'Weeks'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="onboard-income-note">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <TrendingUp size={13} color="#059669" />
                  Contracted Lending Income:
                </span>
                <span className="onboard-income-val">+{formatCurrency(interestAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Cool Top-Right Success Notification ─────────────────────── */}
      {showSuccessToast && (
        <div className="onboard-toast-cool">
          <div className="onboard-toast-cool-icon">
            <Check size={18} strokeWidth={3} />
          </div>
          <div className="onboard-toast-cool-content">
            <h4 className="onboard-toast-cool-title">User added successfully!</h4>
            {createdBorrower?.name && (
              <p className="onboard-toast-cool-sub">
                {createdBorrower.name} • {createdBorrower.customerCode}
              </p>
            )}
          </div>
          <button
            type="button"
            className="onboard-toast-cool-close"
            onClick={() => setShowSuccessToast(false)}
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
