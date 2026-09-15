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

  // Streamlined Form State (Previous content preserved)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    occupation: '',
    shop_name: '',
    work_profession: '',
    branch_id: '',
    credit_limit: 5000,
    issue_initial_loan: true,
    initial_loan_amount: 2000,
    tenure: '10',
    frequency: 'WEEKLY',
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

  const handleSelectCategory = (cat) => {
    setSelectedCategoryCode(cat.category_code);
    setFormData((prev) => ({
      ...prev,
      credit_limit: cat.default_max_loan,
      initial_loan_amount: cat.default_min_loan,
      tenure: String(cat.tenure_installments),
      frequency: cat.repayment_frequency,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      occupation: '',
      shop_name: '',
      work_profession: '',
      branch_id: branches[0]?.id || '',
      credit_limit: activeCategory.default_max_loan,
      issue_initial_loan: true,
      initial_loan_amount: activeCategory.default_min_loan,
      tenure: String(activeCategory.tenure_installments),
      frequency: activeCategory.repayment_frequency,
    });
    setErrors({});
    setErrorMsg('');
    setCreatedBorrower(null);
  };

  // Financial Calculations
  const principalAmount = parseFloat(formData.initial_loan_amount) || 0;
  const flatRate = parseFloat(activeCategory.default_interest_rate) || 25.0;
  const installmentCount = parseInt(formData.tenure) || activeCategory.tenure_installments || 10;
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

    if (isShop && (!formData.shop_name || !formData.shop_name.trim())) {
      errs.shop_name = 'Shop / Stall name is required for daily merchants';
    }

    if (isWeekly && (!formData.occupation || !formData.occupation.trim())) {
      errs.occupation = 'User Occupation / Trade is required for weekly borrowers';
    }

    if (isMonthly && (!formData.work_profession || !formData.work_profession.trim())) {
      errs.work_profession = 'Work / Profession is required for monthly salaried borrowers';
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

      const resolvedOccupation = isShop
        ? (formData.shop_name?.trim() || 'Market Shopkeeper')
        : isMonthly
        ? (formData.work_profession?.trim() || 'Salaried Employee')
        : (formData.occupation?.trim() || 'Self-Employed Worker');

      const res = await api.createUser({
        organizationId: activeOrg?.id || 1,
        branchId: formData.branch_id || (branches[0]?.id || null),
        name: formData.name.trim(),
        phone: formData.phone.trim().replace(/\D/g, ''),
        role: isShop ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
        category_code: activeCategory.category_code,
        status: 'ACTIVE',
        address: null,
        city: null,
        occupation: resolvedOccupation,
        shop_name: isShop ? formData.shop_name.trim() : null,
        credit_limit: parseFloat(formData.credit_limit) || activeCategory.default_max_loan,
        initial_loan: formData.issue_initial_loan
          ? {
              principal,
              total_installments: installmentCount,
              frequency: freq,
              interest_rate: flatRate,
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
        occupation: '',
        shop_name: '',
        work_profession: '',
      }));
    } catch (err) {
      console.error('Failed to onboard borrower:', err);
      setErrorMsg(err.message || 'Failed to onboard borrower. Please check mobile number or connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBranchObj = branches.find((b) => String(b.id) === String(formData.branch_id)) || branches[0];

  return (
    <div className="onboard-page-container">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <header className="onboard-page-header">
        <div className="onboard-page-title-wrap">
          <div className="onboard-page-title-icon">
            <UserPlus size={20} />
          </div>
          <h1 className="onboard-page-title">Onboard New Borrower</h1>
        </div>

        <button
          type="button"
          className="onboard-header-action-btn"
          onClick={() => navigate(getOrgPath('staff'))}
        >
          Manage Staff & Collectors <ArrowRight size={14} />
        </button>
      </header>

      {/* ── Global Alert Banners ───────────────────────────────────── */}
      {successMsg && (
        <div className="onboard-alert success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

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
                {/* Occupation / Trade / Shop Name */}
                <div className="onboard-field">
                  <label className="onboard-label">
                    {isShop ? 'Shop / Stall Name' : isMonthly ? 'Work / Profession' : 'User Occupation / Trade'}{' '}
                    <span className="req">*</span>
                  </label>
                  {isShop ? (
                    <input
                      type="text"
                      className={`onboard-input ${errors.shop_name ? 'error' : ''}`}
                      placeholder="e.g. Sri Balaji General Store"
                      value={formData.shop_name}
                      onChange={(e) => {
                        setFormData({ ...formData, shop_name: e.target.value });
                        if (errors.shop_name) setErrors({ ...errors, shop_name: null });
                      }}
                      required
                    />
                  ) : isMonthly ? (
                    <input
                      type="text"
                      className={`onboard-input ${errors.work_profession ? 'error' : ''}`}
                      placeholder="e.g. Software Engineer / Retail Manager"
                      value={formData.work_profession}
                      onChange={(e) => {
                        setFormData({ ...formData, work_profession: e.target.value });
                        if (errors.work_profession) setErrors({ ...errors, work_profession: null });
                      }}
                      required
                    />
                  ) : (
                    <input
                      type="text"
                      className={`onboard-input ${errors.occupation ? 'error' : ''}`}
                      placeholder="e.g. Tailor, Fabrication Worker, Driver, Electrician"
                      value={formData.occupation}
                      onChange={(e) => {
                        setFormData({ ...formData, occupation: e.target.value });
                        if (errors.occupation) setErrors({ ...errors, occupation: null });
                      }}
                      required
                    />
                  )}
                  {(errors.occupation || errors.shop_name || errors.work_profession) && (
                    <span className="onboard-input-error-text">
                      {errors.occupation || errors.shop_name || errors.work_profession}
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
                      className="onboard-input"
                      value={formData.initial_loan_amount}
                      onChange={(e) => setFormData({ ...formData, initial_loan_amount: e.target.value })}
                      step={500}
                      min={1000}
                      required
                    />
                  </div>
                )}
              </div>
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

      {/* ── Top-Right Green Time-Reducing Countdown Toast ──────────── */}
      {showSuccessToast && createdBorrower && (
        <div className="onboard-toast-success">
          <div className="onboard-toast-head">
            <div className="onboard-toast-head-title">
              <Check size={16} strokeWidth={3} />
              <span>Borrower Onboarded Successfully</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="onboard-toast-timer">{toastCountdown}s</span>
              <button
                type="button"
                className="onboard-toast-close"
                onClick={() => setShowSuccessToast(false)}
                title="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="onboard-toast-body">
            <div className="onboard-toast-user">{createdBorrower.name}</div>
            <div className="onboard-toast-meta">
              {createdBorrower.phone} • {createdBorrower.branchName} • ID:{' '}
              <strong>{createdBorrower.customerCode}</strong>
            </div>

            <div className="onboard-toast-stat-row">
              <span>{createdBorrower.categoryName}</span>
              <strong style={{ color: '#059669' }}>{formatCurrency(createdBorrower.principal)}</strong>
            </div>

            <div className="onboard-toast-actions">
              <button
                type="button"
                className="onboard-toast-btn-view"
                onClick={() => {
                  setShowSuccessToast(false);
                  if (createdBorrower.isShop) navigate(getOrgPath('shopkeepers'));
                  else if (createdBorrower.isMonthly) navigate(getOrgPath('monthly-customers'));
                  else navigate(getOrgPath('weekly-customers'));
                }}
              >
                <span>View in Ledger</span>
                <ExternalLink size={12} />
              </button>

              <button
                type="button"
                className="onboard-toast-btn-dir"
                onClick={() => {
                  setShowSuccessToast(false);
                  navigate(getOrgPath('users'));
                }}
              >
                Directory
              </button>
            </div>
          </div>

          <div className="onboard-toast-progress-track">
            <div
              className="onboard-toast-progress-bar"
              style={{ width: `${(toastCountdown / 6) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
