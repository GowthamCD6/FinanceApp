import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Phone,
  Briefcase,
  User,
  Users,
  MapPin,
  AlertCircle,
  Store,
  Calendar,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';

export const AddUser = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const orgId = activeOrg?.id || 1;

  // Dynamic Lending Config fetched from DB (interest rates page table)
  const [lendingConfig, setLendingConfig] = useState({
    daily_interest_rate: 12.5,
    daily_tenure_days: 25,
    daily_min_amount: 15000,
    daily_max_amount: 100000,

    weekly_interest_rate: 10.0,
    weekly_tenure_weeks: 10,
    weekly_min_amount: 10000,
    weekly_max_amount: 50000,

    monthly_interest_rate: 15.0,
    monthly_tenure_months: 12,
    monthly_min_amount: 25000,
    monthly_max_amount: 500000,
  });

  const [selectedCategoryCode, setSelectedCategoryCode] = useState('CAT-BORROWER-WK');

  // Streamlined Form State (Only essential fields)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Chennai',
    occupation: '',
    shop_name: '',
    work_profession: '',
    credit_limit: 50000,
    issue_initial_loan: true,
    initial_loan_amount: 10000,
    tenure: '10',
    frequency: 'WEEKLY',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically build the 3 core borrower categories from the DB lending config
  const categories = useMemo(() => {
    return [
      {
        category_code: 'CAT-BORROWER-WK',
        name: 'Borrower (Weekly Installment)',
        customer_type: 'COMMON_CUSTOMER',
        repayment_frequency: 'WEEKLY',
        default_min_loan: Number(lendingConfig.weekly_min_amount) || 10000,
        default_max_loan: Number(lendingConfig.weekly_max_amount) || 50000,
        default_interest_rate: Number(lendingConfig.weekly_interest_rate) || 10.0,
        tenure_installments: Number(lendingConfig.weekly_tenure_weeks) || 10,
        description: `Standard individual and worker micro-loans with ${lendingConfig.weekly_tenure_weeks || 10}-week recurring repayments.`,
        color: '#4F46E5',
      },
      {
        category_code: 'CAT-MERCHANT-DLY',
        name: 'Merchant (Daily Installment)',
        customer_type: 'SHOPKEEPER',
        repayment_frequency: 'DAILY',
        default_min_loan: Number(lendingConfig.daily_min_amount) || 15000,
        default_max_loan: Number(lendingConfig.daily_max_amount) || 100000,
        default_interest_rate: Number(lendingConfig.daily_interest_rate) || 12.5,
        tenure_installments: Number(lendingConfig.daily_tenure_days) || 25,
        description: `Retail shopkeepers and stall merchants with ${lendingConfig.daily_tenure_days || 25}-day rapid daily collections.`,
        color: '#7C3AED',
      },
      {
        category_code: 'CAT-BORROWER-MO',
        name: 'Monthly Salaried Borrower (EMI)',
        customer_type: 'COMMON_CUSTOMER',
        repayment_frequency: 'MONTHLY',
        default_min_loan: Number(lendingConfig.monthly_min_amount) || 25000,
        default_max_loan: Number(lendingConfig.monthly_max_amount) || 500000,
        default_interest_rate: Number(lendingConfig.monthly_interest_rate) || 15.0,
        tenure_installments: Number(lendingConfig.monthly_tenure_months) || 12,
        description: `${lendingConfig.monthly_tenure_months || 12}-Month structured EMI micro-loans for salaried individuals (${lendingConfig.monthly_interest_rate || 15}% flat interest).`,
        color: '#0891B2',
      },
    ];
  }, [lendingConfig]);

  // Fetch Live Interest Rates & Lending Config from DB on mount & org change
  useEffect(() => {
    const fetchLendingAndCategoryConfig = async () => {
      try {
        const configData = await api.getLendingConfig(orgId);
        if (configData) {
          setLendingConfig((prev) => ({
            ...prev,
            daily_interest_rate: Number(configData.daily_interest_rate ?? prev.daily_interest_rate),
            daily_tenure_days: Number(configData.daily_tenure_days ?? prev.daily_tenure_days),
            daily_min_amount: Number(configData.daily_min_amount ?? prev.daily_min_amount),
            daily_max_amount: Number(configData.daily_max_amount ?? prev.daily_max_amount),

            weekly_interest_rate: Number(configData.weekly_interest_rate ?? prev.weekly_interest_rate),
            weekly_tenure_weeks: Number(configData.weekly_tenure_weeks ?? prev.weekly_tenure_weeks),
            weekly_min_amount: Number(configData.weekly_min_amount ?? prev.weekly_min_amount),
            weekly_max_amount: Number(configData.weekly_max_amount ?? prev.weekly_max_amount),

            monthly_interest_rate: Number(configData.monthly_interest_rate ?? prev.monthly_interest_rate),
            monthly_tenure_months: Number(configData.monthly_tenure_months ?? prev.monthly_tenure_months),
            monthly_min_amount: Number(configData.monthly_min_amount ?? prev.monthly_min_amount),
            monthly_max_amount: Number(configData.monthly_max_amount ?? prev.monthly_max_amount),
          }));
        }
      } catch (err) {
        console.warn('Could not load live lending config from database:', err);
      }
    };

    fetchLendingAndCategoryConfig();
  }, [orgId]);

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Active Category Object
  const activeCategory = useMemo(() => {
    return (
      categories.find((c) => c.category_code === selectedCategoryCode) ||
      categories[0]
    );
  }, [categories, selectedCategoryCode]);

  const isShop = activeCategory?.customer_type === 'SHOPKEEPER' || activeCategory?.repayment_frequency === 'DAILY';
  const isWeekly = activeCategory?.repayment_frequency === 'WEEKLY';
  const isMonthly = activeCategory?.repayment_frequency === 'MONTHLY';

  // Synchronize form defaults when activeCategory or lendingConfig changes
  useEffect(() => {
    if (activeCategory) {
      setFormData((prev) => ({
        ...prev,
        frequency: activeCategory.repayment_frequency,
        tenure: String(activeCategory.tenure_installments),
        credit_limit: activeCategory.default_max_loan,
        initial_loan_amount: activeCategory.default_min_loan,
      }));
    }
  }, [selectedCategoryCode, lendingConfig]);

  // Handle Category Click
  const handleSelectCategory = (cat) => {
    setSelectedCategoryCode(cat.category_code);
  };

  // Live Loan Calculation Preview (Dynamically calculated from DB rates & days)
  const principalAmount = parseFloat(formData.initial_loan_amount) || 0;
  const flatRate = Number(activeCategory?.default_interest_rate) || (isShop ? 12.5 : isMonthly ? 15.0 : 10.0);
  const interestAmount = (principalAmount * flatRate) / 100;
  const totalRepayable = principalAmount + interestAmount;
  const installmentCount = parseInt(formData.tenure, 10) || activeCategory.tenure_installments || (isShop ? 25 : isMonthly ? 12 : 10);
  const installmentAmount = installmentCount > 0 ? Math.ceil(totalRepayable / installmentCount) : 0;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (isShop && !formData.shop_name.trim()) {
      errs.shop_name = 'Shop / Stall Name is required for daily merchants';
    }

    if (isWeekly && !formData.occupation.trim()) {
      errs.occupation = 'User Occupation / Trade is required for weekly borrowers';
    }

    if (isMonthly && !formData.work_profession.trim()) {
      errs.work_profession = 'Work / Profession is required for monthly salaried borrowers';
    }

    if (!formData.address.trim()) {
      errs.address = 'Address is required';
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
      const principal = parseFloat(formData.initial_loan_amount) || activeCategory.default_min_loan;
      const freq = activeCategory.repayment_frequency || (isShop ? 'DAILY' : isMonthly ? 'MONTHLY' : 'WEEKLY');

      // Resolve final occupation value cleanly based on category
      const resolvedOccupation = isShop
        ? 'Market Shopkeeper'
        : isMonthly
        ? formData.work_profession.trim()
        : formData.occupation.trim();

      await api.createUser({
        organizationId: activeOrg?.id || 1,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: isShop ? 'SHOPKEEPER' : 'COMMON_CUSTOMER',
        category_code: activeCategory.category_code,
        status: 'ACTIVE',
        address: formData.address.trim(),
        city: formData.city.trim() || 'Chennai',
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

      setSuccessMsg(`Borrower "${formData.name}" successfully onboarded!`);

      setTimeout(() => {
        if (isShop) navigate(getOrgPath('shopkeepers'));
        else if (isMonthly) navigate(getOrgPath('monthly-customers'));
        else navigate(getOrgPath('weekly-customers'));
      }, 900);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to onboard borrower. Please check mobile number or connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-user-page" style={{ width: '100%', maxWidth: '100%', padding: '0 0.5rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                background: '#EEF2FF',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Onboard New Borrower
              </h1>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(getOrgPath('staff'))}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <Users size={14} /> Manage Staff & Collectors →
          </button>
        </div>
      </div>

      {/* Feedback Banners */}
      {successMsg && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1.5px solid #A7F3D0',
            color: '#047857',
            padding: '0.85rem 1.25rem',
            borderRadius: 10,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 700,
            fontSize: '0.88rem',
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1.5px solid #FECACA',
            color: '#B91C1C',
            padding: '0.85rem 1.25rem',
            borderRadius: 10,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 700,
            fontSize: '0.88rem',
          }}
        >
          <AlertCircle size={18} color="#DC2626" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column: Form Card */}
        <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <form onSubmit={handleSubmit}>
            {/* 1. Borrower Category Selection Tabs (Live Rates & Tenures from DB) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                  Select Borrower Lending Division *
                </label>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Live Policy Configured in DB
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {categories.map((cat) => {
                  const isSelected = selectedCategoryCode === cat.category_code;
                  const isShopCategory = cat.repayment_frequency === 'DAILY' || cat.customer_type === 'SHOPKEEPER';
                  const isMonthlyCategory = cat.repayment_frequency === 'MONTHLY';
                  const Icon = isShopCategory ? Store : isMonthlyCategory ? Calendar : Users;
                  const themeColor = isShopCategory ? '#7C3AED' : isMonthlyCategory ? '#0891B2' : '#4F46E5';

                  return (
                    <div
                      key={cat.category_code}
                      onClick={() => handleSelectCategory(cat)}
                      style={{
                        padding: '0.95rem 1rem',
                        borderRadius: 10,
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${themeColor}` : '1.5px solid #E2E8F0',
                        background: isSelected ? '#F8FAFC' : '#FFFFFF',
                        boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.08)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 6 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            background: isSelected ? themeColor : '#F1F5F9',
                            color: isSelected ? '#FFFFFF' : themeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                          {cat.name.split('/')[0].trim()}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: themeColor,
                            background: isSelected ? '#EEF2FF' : '#F1F5F9',
                            padding: '1px 6px',
                            borderRadius: 4,
                            letterSpacing: '0.03em',
                          }}
                        >
                          {cat.repayment_frequency}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800 }}>
                          {cat.default_interest_rate}% Flat
                        </span>
                      </div>

                      <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                        {cat.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Simplified Borrower Contact & Profile Section */}
            <div style={{ borderTop: '1.5px solid #E2E8F0', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                1. Borrower Details
              </h4>

              {/* Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    Borrower Full Name *
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? 'input-error' : ''}`}
                    placeholder="e.g. Ramesh Krishnan"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    style={{ fontSize: '0.86rem', borderRadius: 8 }}
                    required
                  />
                  {errors.name && <span style={{ color: 'var(--red)', fontSize: '0.74rem', marginTop: 3, display: 'block' }}>{errors.name}</span>}
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    <Phone size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    Mobile Phone Number *
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
                    style={{ fontSize: '0.86rem', borderRadius: 8 }}
                    required
                  />
                  {errors.phone && <span style={{ color: 'var(--red)', fontSize: '0.74rem', marginTop: 3, display: 'block' }}>{errors.phone}</span>}
                </div>
              </div>

              {/* Dynamic Single Category Field: Weekly -> Occupation | Daily -> Shop Name | Monthly -> Work */}
              <div style={{ marginBottom: '1rem' }}>
                {isWeekly && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      <Briefcase size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                      User Occupation / Trade *
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.occupation ? 'input-error' : ''}`}
                      placeholder="e.g. Tailor, Fabrication Worker, Driver, Electrician"
                      value={formData.occupation}
                      onChange={(e) => {
                        setFormData({ ...formData, occupation: e.target.value });
                        if (errors.occupation) setErrors({ ...errors, occupation: null });
                      }}
                      style={{ fontSize: '0.86rem', borderRadius: 8 }}
                      required
                    />
                    {errors.occupation && <span style={{ color: 'var(--red)', fontSize: '0.74rem', marginTop: 3, display: 'block' }}>{errors.occupation}</span>}
                  </div>
                )}

                {isShop && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      <Store size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                      Shop / Stall Name *
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.shop_name ? 'input-error' : ''}`}
                      placeholder="e.g. Sri Balaji Sweets & Provisions"
                      value={formData.shop_name}
                      onChange={(e) => {
                        setFormData({ ...formData, shop_name: e.target.value });
                        if (errors.shop_name) setErrors({ ...errors, shop_name: null });
                      }}
                      style={{ fontSize: '0.86rem', borderRadius: 8 }}
                      required
                    />
                    {errors.shop_name && <span style={{ color: 'var(--red)', fontSize: '0.74rem', marginTop: 3, display: 'block' }}>{errors.shop_name}</span>}
                  </div>
                )}

                {isMonthly && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      <Briefcase size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                      User Work / Profession *
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.work_profession ? 'input-error' : ''}`}
                      placeholder="e.g. Software Engineer at Infosys / Store Manager / Corporate Executive"
                      value={formData.work_profession}
                      onChange={(e) => {
                        setFormData({ ...formData, work_profession: e.target.value });
                        if (errors.work_profession) setErrors({ ...errors, work_profession: null });
                      }}
                      style={{ fontSize: '0.86rem', borderRadius: 8 }}
                      required
                    />
                    {errors.work_profession && <span style={{ color: 'var(--red)', fontSize: '0.74rem', marginTop: 3, display: 'block' }}>{errors.work_profession}</span>}
                  </div>
                )}
              </div>

              {/* Address & City */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    <MapPin size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    Residential / Business Address *
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.address ? 'input-error' : ''}`}
                    placeholder="e.g. 42 Bazaar Road, Saidapet"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: null });
                    }}
                    style={{ fontSize: '0.86rem', borderRadius: 8 }}
                    required
                  />
                  {errors.address && <span style={{ color: 'var(--red)', fontSize: '0.74rem', marginTop: 3, display: 'block' }}>{errors.address}</span>}
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Chennai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ fontSize: '0.86rem', borderRadius: 8 }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Loan Origination & Credit Limit Card */}
            <div style={{ borderTop: '1.5px solid #E2E8F0', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                  2. Credit Policy & Loan Origination ({activeCategory.repayment_frequency} Cycle)
                </h4>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.issue_initial_loan}
                    onChange={(e) => setFormData({ ...formData, issue_initial_loan: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>Originate 1st Loan Immediately</span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Approved Credit Limit (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    step={1000}
                    min={activeCategory.default_min_loan}
                    style={{ fontSize: '0.9rem', fontWeight: 700, borderRadius: 8 }}
                  />
                </div>

                {formData.issue_initial_loan && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Initial Loan Principal (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.initial_loan_amount}
                      onChange={(e) => setFormData({ ...formData, initial_loan_amount: e.target.value })}
                      step={1000}
                      min={1000}
                      max={formData.credit_limit}
                      style={{ fontSize: '0.9rem', fontWeight: 700, borderRadius: 8 }}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                }}
              >
                <UserPlus size={16} />
                <span>{submitting ? 'Onboarding Borrower...' : `Save & Onboard ${activeCategory.name.split('/')[0].trim()}`}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(getOrgPath('users'))}
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.86rem', fontWeight: 600, borderRadius: 8 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Borrower Policy & Loan Obligation Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. Borrower Identity Live Card */}
          <div
            className="card"
            style={{
              padding: '1.35rem',
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 12,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live Borrower Card Preview
              </span>
              <span
                style={{
                  background: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                }}
              >
                ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: isShop ? '#F5F3FF' : isMonthly ? '#ECFEFF' : '#EEF2FF',
                  color: isShop ? '#7C3AED' : isMonthly ? '#0891B2' : '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', fontWeight: 800 }}>
                  {formData.name || 'Borrower Name'}
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {formData.phone ? `+91 ${formData.phone}` : '+91 9XXXXXXXXX'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: isShop ? '#F5F3FF' : isMonthly ? '#ECFEFF' : '#EEF2FF',
                  color: isShop ? '#7C3AED' : isMonthly ? '#0891B2' : '#4F46E5',
                  border: `1px solid ${isShop ? '#DDD6FE' : isMonthly ? '#A5F3FC' : '#C7D2FE'}`,
                }}
              >
                {activeCategory.name}
              </span>

              {isShop && formData.shop_name && (
                <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>
                  {formData.shop_name}
                </span>
              )}

              {isWeekly && formData.occupation && (
                <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}>
                  {formData.occupation}
                </span>
              )}

              {isMonthly && formData.work_profession && (
                <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: '#ECFEFF', color: '#0891B2', border: '1px solid #A5F3FC' }}>
                  {formData.work_profession}
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} color="var(--text-muted)" />
              <span>{formData.address ? `${formData.address}, ${formData.city}` : 'Address pending input'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Approved Credit Line:</span>
              <strong style={{ color: '#047857', fontWeight: 900, fontSize: '1.05rem' }}>{formatCurrency(formData.credit_limit)}</strong>
            </div>
          </div>

          {/* 2. Loan Breakdown Live Card */}
          {formData.issue_initial_loan && principalAmount > 0 && (
            <div
              className="card"
              style={{
                padding: '1.35rem',
                background: '#FFFFFF',
                border: '1.5px solid #C7D2FE',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Receipt size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Originated Loan Obligation
                  </span>
                </div>
                <span
                  style={{
                    background: '#EEF2FF',
                    color: 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  {activeCategory.repayment_frequency} #{installmentCount}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Principal Given</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 900 }}>{formatCurrency(principalAmount)}</strong>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Repayable ({flatRate}%)</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 900 }}>{formatCurrency(totalRepayable)}</strong>
                </div>

                <div style={{ background: '#EEF2FF', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #C7D2FE' }}>
                  <span style={{ color: 'var(--primary)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Installment Due</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.15rem', fontWeight: 900 }}>
                    {formatCurrency(installmentAmount)} / {isShop ? 'Day' : isMonthly ? 'Month' : 'Week'}
                  </strong>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Tenure Duration</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 900 }}>
                    {installmentCount} {isShop ? 'Days' : isMonthly ? 'Months' : 'Weeks'}
                  </strong>
                </div>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', background: '#F8FAFC', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={13} color="#059669" />
                <span>Contracted Lending Income: <strong>{formatCurrency(interestAmount)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUser;
