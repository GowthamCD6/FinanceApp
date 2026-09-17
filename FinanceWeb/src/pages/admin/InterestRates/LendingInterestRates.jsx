import React, { useState, useEffect } from 'react';
import { useOrg } from '../../../context/OrgContext';
import { api } from '../../../services/api';
import {
  Percent,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Clock,
  Layers,
  Sliders,
  ShieldCheck,
  CalendarDays,
  Check,
  Info,
  Store,
  TrendingUp,
  Zap,
} from 'lucide-react';
import './LendingInterestRates.css';

const ALL_WEEKDAYS = [
  { key: 'MON', label: 'Mon', full: 'Monday' },
  { key: 'TUE', label: 'Tue', full: 'Tuesday' },
  { key: 'WED', label: 'Wed', full: 'Wednesday' },
  { key: 'THU', label: 'Thu', full: 'Thursday' },
  { key: 'FRI', label: 'Fri', full: 'Friday' },
  { key: 'SAT', label: 'Sat', full: 'Saturday' },
  { key: 'SUN', label: 'Sun', full: 'Sunday' },
];

export const LendingInterestRates = () => {
  const { activeOrg } = useOrg();
  const orgId = activeOrg?.id || 1;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for Lending Schemes, Collection Days & Rates
  const [config, setConfig] = useState({
    daily_loan_enabled: true,
    daily_interest_rate: 10.0,
    daily_tenure_days: 100,
    daily_min_amount: 2000,
    daily_max_amount: 100000,
    daily_operating_days: 'MON,TUE,WED,THU,FRI,SAT',

    weekly_loan_enabled: true,
    weekly_interest_rate: 10.0,
    weekly_tenure_weeks: 10,
    weekly_min_amount: 5000,
    weekly_max_amount: 150000,
    weekly_collection_days: 'MON,WED,FRI',
    weekly_collection_grace_days: 2,

    monthly_loan_enabled: true,
    monthly_interest_rate: 18.0,
    monthly_tenure_months: 12,
    monthly_min_amount: 10000,
    monthly_max_amount: 500000,
    monthly_collection_start_day: 1,
    monthly_collection_end_day: 5,
    monthly_collection_grace_days: 3,

    max_active_loans_per_customer: 1,
    auto_eligibility_check: true,
    grace_period_days: 0,
    currency_symbol: '₹',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const data = await api.getLendingConfig(orgId);
        if (data) {
          setConfig({
            daily_loan_enabled: Boolean(data.daily_loan_enabled ?? true),
            daily_interest_rate: Number(data.daily_interest_rate || 10.0),
            daily_tenure_days: Number(data.daily_tenure_days || 100),
            daily_min_amount: Number(data.daily_min_amount || 2000),
            daily_max_amount: Number(data.daily_max_amount || 100000),
            daily_operating_days: data.daily_operating_days || 'MON,TUE,WED,THU,FRI,SAT',

            weekly_loan_enabled: Boolean(data.weekly_loan_enabled ?? true),
            weekly_interest_rate: Number(data.weekly_interest_rate || 10.0),
            weekly_tenure_weeks: Number(data.weekly_tenure_weeks || 10),
            weekly_min_amount: Number(data.weekly_min_amount || 5000),
            weekly_max_amount: Number(data.weekly_max_amount || 150000),
            weekly_collection_days: data.weekly_collection_days || 'MON,WED,FRI',
            weekly_collection_grace_days: Number(data.weekly_collection_grace_days ?? 2),

            monthly_loan_enabled: Boolean(data.monthly_loan_enabled ?? true),
            monthly_interest_rate: Number(data.monthly_interest_rate || 18.0),
            monthly_tenure_months: Number(data.monthly_tenure_months || 12),
            monthly_min_amount: Number(data.monthly_min_amount || 10000),
            monthly_max_amount: Number(data.monthly_max_amount || 500000),
            monthly_collection_start_day: Number(data.monthly_collection_start_day || 1),
            monthly_collection_end_day: Number(data.monthly_collection_end_day || 5),
            monthly_collection_grace_days: Number(data.monthly_collection_grace_days ?? 3),

            max_active_loans_per_customer: Number(data.max_active_loans_per_customer || 1),
            auto_eligibility_check: Boolean(data.auto_eligibility_check ?? true),
            grace_period_days: Number(data.grace_period_days || 0),
            currency_symbol: data.currency_symbol || '₹',
          });
        }
      } catch (err) {
        console.warn('Could not load org lending config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [orgId]);

  const handleChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper for Weekly Collection Day Toggle (Multi-selection: 1 to 5 days)
  const toggleWeeklyDay = (dayKey) => {
    const currentDays = config.weekly_collection_days
      ? config.weekly_collection_days.split(',').map((d) => d.trim()).filter(Boolean)
      : [];

    if (currentDays.includes(dayKey)) {
      if (currentDays.length <= 1) {
        showToast('At least 1 weekly collection day must be selected.');
        return;
      }
      const updated = currentDays.filter((d) => d !== dayKey);
      handleChange('weekly_collection_days', updated.join(','));
    } else {
      if (currentDays.length >= 5) {
        showToast('Maximum 5 collection days allowed per week.');
        return;
      }
      const updated = [...currentDays, dayKey];
      const sorted = ALL_WEEKDAYS.filter((w) => updated.includes(w.key)).map((w) => w.key);
      handleChange('weekly_collection_days', sorted.join(','));
    }
  };

  // Helper for Daily Operating Days Toggle
  const toggleDailyDay = (dayKey) => {
    const currentDays = config.daily_operating_days
      ? config.daily_operating_days.split(',').map((d) => d.trim()).filter(Boolean)
      : [];

    if (currentDays.includes(dayKey)) {
      if (currentDays.length <= 1) {
        showToast('At least 1 operating day must be selected.');
        return;
      }
      const updated = currentDays.filter((d) => d !== dayKey);
      handleChange('daily_operating_days', updated.join(','));
    } else {
      const updated = [...currentDays, dayKey];
      const sorted = ALL_WEEKDAYS.filter((w) => updated.includes(w.key)).map((w) => w.key);
      handleChange('daily_operating_days', sorted.join(','));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateLendingConfig(orgId, config);
      showToast('Lending schemes and collection schedules saved successfully!');
    } catch (err) {
      showToast('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const parsedWeeklyDays = config.weekly_collection_days
    ? config.weekly_collection_days.split(',').map((d) => d.trim()).filter(Boolean)
    : [];

  const parsedDailyDays = config.daily_operating_days
    ? config.daily_operating_days.split(',').map((d) => d.trim()).filter(Boolean)
    : [];

  // ==========================================
  // SKELETON LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="lending-rates-page">
        {/* Header Skeleton */}
        <div className="directory-page-header">
          <div className="skeleton-bar" style={{ width: 340, height: 32, borderRadius: 8 }} />
          <div className="skeleton-bar" style={{ width: 170, height: 42, borderRadius: 6 }} />
        </div>

        {/* 3 KPI Summary Strip Skeletons */}
        <div className="directory-kpi-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="directory-kpi-card">
              <div className="directory-kpi-top">
                <div className="skeleton-bar" style={{ width: '50%', height: 13 }} />
                <div className="skeleton-circle" style={{ width: 32, height: 32, borderRadius: 6 }} />
              </div>
              <div className="skeleton-bar" style={{ width: '65%', height: 28, margin: '0.4rem 0' }} />
              <div className="skeleton-bar" style={{ width: '40%', height: 11 }} />
            </div>
          ))}
        </div>

        {/* 3 Scheme Cards Skeletons */}
        <div className="lir-schemes-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="lir-scheme-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem' }}>
                <div style={{ width: '60%' }}>
                  <div className="skeleton-bar" style={{ width: '80%', height: 18, marginBottom: 6 }} />
                  <div className="skeleton-bar" style={{ width: '60%', height: 12 }} />
                </div>
                <div className="skeleton-bar" style={{ width: 44, height: 24, borderRadius: 12 }} />
              </div>

              <div className="lir-form-grid">
                <div className="lir-field">
                  <div className="skeleton-bar" style={{ width: '70%', height: 12, marginBottom: 5 }} />
                  <div className="skeleton-bar" style={{ width: '100%', height: 42, borderRadius: 6 }} />
                </div>
                <div className="lir-field">
                  <div className="skeleton-bar" style={{ width: '70%', height: 12, marginBottom: 5 }} />
                  <div className="skeleton-bar" style={{ width: '100%', height: 42, borderRadius: 6 }} />
                </div>
                <div className="lir-field">
                  <div className="skeleton-bar" style={{ width: '70%', height: 12, marginBottom: 5 }} />
                  <div className="skeleton-bar" style={{ width: '100%', height: 42, borderRadius: 6 }} />
                </div>
                <div className="lir-field">
                  <div className="skeleton-bar" style={{ width: '70%', height: 12, marginBottom: 5 }} />
                  <div className="skeleton-bar" style={{ width: '100%', height: 42, borderRadius: 6 }} />
                </div>
                <div className="lir-field-full">
                  <div className="skeleton-bar" style={{ width: '50%', height: 14, marginBottom: 8 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                      <div key={k} className="skeleton-bar" style={{ height: 28, borderRadius: 6 }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="skeleton-bar" style={{ width: '100%', height: 38, borderRadius: 8, marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // REAL CONTENT STATE
  // ==========================================
  return (
    <div className="lending-rates-page">
      {/* 1. Header (Matching Shopkeeper & Manage Users Page Standard) */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">
              Lending Rates & Collection Schedule
            </h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="directory-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Toast / Feedback Banner */}
      {toastMessage && (
        <div className="directory-feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Three KPI Metric Cards (Solid #0F172A Numbers) */}
      <div className="directory-kpi-grid">
        {/* KPI 1: Daily Model */}
        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Daily Merchant Scheme</span>
            <div className="directory-kpi-icon emerald">
              <Store size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">
            {config.daily_tenure_days} Days <span className="directory-kpi-rate-tag">@{config.daily_interest_rate}%</span>
          </div>
          <div className="directory-kpi-desc">
            <span className={`directory-kpi-status-badge ${config.daily_loan_enabled ? 'active' : 'disabled'}`}>
              {config.daily_loan_enabled ? 'Active' : 'Disabled'}
            </span>
            <span>• {parsedDailyDays.length} operating days/week</span>
          </div>
        </div>

        {/* KPI 2: Weekly Model */}
        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Weekly Micro-Loan Scheme</span>
            <div className="directory-kpi-icon indigo">
              <Calendar size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">
            {config.weekly_tenure_weeks} Weeks <span className="directory-kpi-rate-tag">@{config.weekly_interest_rate}%</span>
          </div>
          <div className="directory-kpi-desc">
            <span className={`directory-kpi-status-badge ${config.weekly_loan_enabled ? 'active' : 'disabled'}`}>
              {config.weekly_loan_enabled ? 'Active' : 'Disabled'}
            </span>
            <span>• {parsedWeeklyDays.length} days/wk ({config.weekly_collection_grace_days}d grace)</span>
          </div>
        </div>

        {/* KPI 3: Monthly Model */}
        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Monthly Business Scheme</span>
            <div className="directory-kpi-icon purple">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">
            {config.monthly_tenure_months} Months <span className="directory-kpi-rate-tag">@{config.monthly_interest_rate}%</span>
          </div>
          <div className="directory-kpi-desc">
            <span className={`directory-kpi-status-badge ${config.monthly_loan_enabled ? 'active' : 'disabled'}`}>
              {config.monthly_loan_enabled ? 'Active' : 'Disabled'}
            </span>
            <span>• Day {config.monthly_collection_start_day}–{config.monthly_collection_end_day} ({config.monthly_collection_grace_days}d grace)</span>
          </div>
        </div>
      </div>

      {/* 3. Scheme Configuration Grid (3 Uniform Cards) */}
      <div className="lir-schemes-grid">
        {/* =========================================
            1. DAILY MERCHANT SCHEME CARD
            ========================================= */}
        <div className={`lir-scheme-card ${!config.daily_loan_enabled ? 'lir-scheme-disabled' : ''}`}>
          <div className="lir-sc-header">
            <div className="lir-sc-title-wrap">
              <div className="lir-sc-title-row">
                <h3>1. Daily Merchant Scheme</h3>
                <span className="lir-sc-badge badge-daily">Daily Cycle</span>
              </div>
              <p className="lir-sc-subtitle">Daily merchant loan & recovery cycle</p>
            </div>
            <label className="lir-switch" title="Toggle Daily Scheme Active/Disabled">
              <input
                type="checkbox"
                checked={config.daily_loan_enabled}
                onChange={(e) => handleChange('daily_loan_enabled', e.target.checked)}
              />
              <span className="lir-slider"></span>
            </label>
          </div>

          <div className="lir-form-grid">
            <div className="lir-field">
              <label>Default Tenure (Days)</label>
              <input
                type="number"
                className="lir-input"
                value={config.daily_tenure_days}
                onChange={(e) => handleChange('daily_tenure_days', Number(e.target.value))}
                min="1"
                placeholder="100"
              />
            </div>

            <div className="lir-field">
              <label>Interest Rate (% Flat)</label>
              <input
                type="number"
                step="0.1"
                className="lir-input"
                value={config.daily_interest_rate}
                onChange={(e) => handleChange('daily_interest_rate', Number(e.target.value))}
                min="0"
                placeholder="10.0"
              />
            </div>

            <div className="lir-field">
              <label>Min Loan Amount ({config.currency_symbol})</label>
              <input
                type="number"
                className="lir-input"
                value={config.daily_min_amount}
                onChange={(e) => handleChange('daily_min_amount', Number(e.target.value))}
              />
            </div>

            <div className="lir-field">
              <label>Max Loan Amount ({config.currency_symbol})</label>
              <input
                type="number"
                className="lir-input"
                value={config.daily_max_amount}
                onChange={(e) => handleChange('daily_max_amount', Number(e.target.value))}
              />
            </div>

            {/* Daily Operating Days Section */}
            <div className="lir-field-full">
              <div className="lir-section-label">
                <CalendarDays size={14} className="text-emerald-600" />
                <span>Operating Collection Days</span>
                <span className="lir-count-badge badge-daily">{parsedDailyDays.length} days</span>
              </div>
              <div className="lir-days-pills">
                {ALL_WEEKDAYS.map((day) => {
                  const isSelected = parsedDailyDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDailyDay(day.key)}
                      className={`lir-day-chip ${isSelected ? 'chip-active-daily' : ''}`}
                      title={day.full}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="lir-help-text">Field agents execute collections on these operating days.</p>
            </div>
          </div>

          <div className="lir-formula-box">
            <strong>Formula:</strong> Daily Due = [Principal + (Principal × {config.daily_interest_rate}%)] ÷ {config.daily_tenure_days} Days
          </div>
        </div>

        {/* =========================================
            2. WEEKLY MICRO-LOAN SCHEME CARD
            ========================================= */}
        <div className={`lir-scheme-card ${!config.weekly_loan_enabled ? 'lir-scheme-disabled' : ''}`}>
          <div className="lir-sc-header">
            <div className="lir-sc-title-wrap">
              <div className="lir-sc-title-row">
                <h3>2. Weekly Micro-Loan Scheme</h3>
                <span className="lir-sc-badge badge-weekly">Weekly Cycle</span>
              </div>
              <p className="lir-sc-subtitle">Weekly micro-lending & group loan cycle</p>
            </div>
            <label className="lir-switch" title="Toggle Weekly Scheme Active/Disabled">
              <input
                type="checkbox"
                checked={config.weekly_loan_enabled}
                onChange={(e) => handleChange('weekly_loan_enabled', e.target.checked)}
              />
              <span className="lir-slider"></span>
            </label>
          </div>

          <div className="lir-form-grid">
            <div className="lir-field">
              <label>Default Tenure (Weeks)</label>
              <input
                type="number"
                className="lir-input"
                value={config.weekly_tenure_weeks}
                onChange={(e) => handleChange('weekly_tenure_weeks', Number(e.target.value))}
                min="1"
                placeholder="10"
              />
            </div>

            <div className="lir-field">
              <label>Interest Rate (% Flat)</label>
              <input
                type="number"
                step="0.1"
                className="lir-input"
                value={config.weekly_interest_rate}
                onChange={(e) => handleChange('weekly_interest_rate', Number(e.target.value))}
                min="0"
                placeholder="10.0"
              />
            </div>

            <div className="lir-field">
              <label>Min Loan Amount ({config.currency_symbol})</label>
              <input
                type="number"
                className="lir-input"
                value={config.weekly_min_amount}
                onChange={(e) => handleChange('weekly_min_amount', Number(e.target.value))}
              />
            </div>

            <div className="lir-field">
              <label>Max Loan Amount ({config.currency_symbol})</label>
              <input
                type="number"
                className="lir-input"
                value={config.weekly_max_amount}
                onChange={(e) => handleChange('weekly_max_amount', Number(e.target.value))}
              />
            </div>

            {/* Weekly Collection Days Selector (1 to 5 Days) */}
            <div className="lir-field-full">
              <div className="lir-section-label">
                <CalendarDays size={14} className="text-blue-600" />
                <span>Collection Day(s) of Week</span>
                <span className="lir-count-badge badge-weekly">{parsedWeeklyDays.length} of 5 selected</span>
              </div>
              <div className="lir-days-pills">
                {ALL_WEEKDAYS.map((day) => {
                  const isSelected = parsedWeeklyDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleWeeklyDay(day.key)}
                      className={`lir-day-chip ${isSelected ? 'chip-active-weekly' : ''}`}
                      title={day.full}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              {/* Grace Period Buffer */}
              <div className="lir-grace-row">
                <span className="lir-grace-label">Grace Buffer (Days):</span>
                <div className="lir-grace-input-wrap">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="lir-input lir-input-sm"
                    value={config.weekly_collection_grace_days}
                    onChange={(e) =>
                      handleChange('weekly_collection_grace_days', Math.min(5, Math.max(1, Number(e.target.value))))
                    }
                  />
                  <span className="lir-grace-unit">Days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lir-formula-box">
            <strong>Formula:</strong> Weekly Due = [Principal + (Principal × {config.weekly_interest_rate}%)] ÷ {config.weekly_tenure_weeks} Weeks
          </div>
        </div>

        {/* =========================================
            3. MONTHLY BUSINESS SCHEME CARD
            ========================================= */}
        <div className={`lir-scheme-card ${!config.monthly_loan_enabled ? 'lir-scheme-disabled' : ''}`}>
          <div className="lir-sc-header">
            <div className="lir-sc-title-wrap">
              <div className="lir-sc-title-row">
                <h3>3. Monthly Business Scheme</h3>
                <span className="lir-sc-badge badge-monthly">Monthly Cycle</span>
              </div>
              <p className="lir-sc-subtitle">Monthly business EMI & commercial loans</p>
            </div>
            <label className="lir-switch" title="Toggle Monthly Scheme Active/Disabled">
              <input
                type="checkbox"
                checked={config.monthly_loan_enabled}
                onChange={(e) => handleChange('monthly_loan_enabled', e.target.checked)}
              />
              <span className="lir-slider"></span>
            </label>
          </div>

          <div className="lir-form-grid">
            <div className="lir-field">
              <label>Default Tenure (Months)</label>
              <input
                type="number"
                className="lir-input"
                value={config.monthly_tenure_months}
                onChange={(e) => handleChange('monthly_tenure_months', Number(e.target.value))}
                min="1"
                placeholder="12"
              />
            </div>

            <div className="lir-field">
              <label>Annual Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                className="lir-input"
                value={config.monthly_interest_rate}
                onChange={(e) => handleChange('monthly_interest_rate', Number(e.target.value))}
                min="0"
                placeholder="18.0"
              />
            </div>

            <div className="lir-field">
              <label>Min Loan Amount ({config.currency_symbol})</label>
              <input
                type="number"
                className="lir-input"
                value={config.monthly_min_amount}
                onChange={(e) => handleChange('monthly_min_amount', Number(e.target.value))}
              />
            </div>

            <div className="lir-field">
              <label>Max Loan Amount ({config.currency_symbol})</label>
              <input
                type="number"
                className="lir-input"
                value={config.monthly_max_amount}
                onChange={(e) => handleChange('monthly_max_amount', Number(e.target.value))}
              />
            </div>

            {/* Monthly Collection Window & Grace */}
            <div className="lir-field-full">
              <div className="lir-section-label">
                <CalendarDays size={14} className="text-purple-600" />
                <span>Monthly Collection Window & Grace</span>
                <span className="lir-count-badge badge-monthly">Day {config.monthly_collection_start_day}–{config.monthly_collection_end_day}</span>
              </div>

              {/* Start and End Day Inputs */}
              <div className="lir-monthly-window-row">
                <span className="lir-window-prefix">Billing Window:</span>
                <div className="lir-monthly-inputs">
                  <span className="lir-day-tag">Day</span>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    className="lir-input lir-input-sm"
                    value={config.monthly_collection_start_day}
                    onChange={(e) =>
                      handleChange('monthly_collection_start_day', Math.min(28, Math.max(1, Number(e.target.value))))
                    }
                  />
                  <span className="lir-window-divider">to</span>
                  <span className="lir-day-tag">Day</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="lir-input lir-input-sm"
                    value={config.monthly_collection_end_day}
                    onChange={(e) =>
                      handleChange('monthly_collection_end_day', Math.min(31, Math.max(1, Number(e.target.value))))
                    }
                  />
                </div>
              </div>

              {/* Monthly Grace Window */}
              <div className="lir-grace-row">
                <span className="lir-grace-label">EMI Grace Buffer:</span>
                <div className="lir-grace-input-wrap">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="lir-input lir-input-sm"
                    value={config.monthly_collection_grace_days}
                    onChange={(e) =>
                      handleChange('monthly_collection_grace_days', Math.min(5, Math.max(1, Number(e.target.value))))
                    }
                  />
                  <span className="lir-grace-unit">Days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lir-formula-box">
            <strong>Formula:</strong> Monthly EMI = [Principal + (Principal × {config.monthly_interest_rate}% × ({config.monthly_tenure_months}/12))] ÷ {config.monthly_tenure_months} Months
          </div>
        </div>
      </div>

      {/* 4. Save Action Footer */}
      <div className="lir-save-footer">
        <div className="lir-footer-info">
          <Info size={16} color="#4F46E5" style={{ flexShrink: 0 }} />
          <span>Configured interest rates and collection cycles automatically apply to newly disbursed micro-loans and field agent routes.</span>
        </div>
        <button
          type="button"
          className="directory-btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Lending Schemes'}</span>
        </button>
      </div>
    </div>
  );
};

export default LendingInterestRates;
