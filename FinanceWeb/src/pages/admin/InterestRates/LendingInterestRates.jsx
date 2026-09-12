import React, { useState, useEffect } from 'react';
import { useOrg } from '../../../context/OrgContext';
import { api } from '../../../services/api';
import {
  Percent,
  Calendar,
  DollarSign,
  TrendingUp,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building,
  Clock,
  Layers,
  Sliders,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import './LendingInterestRates.css';

export const LendingInterestRates = () => {
  const { activeOrg } = useOrg();
  const orgId = activeOrg?.id || 1;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for Lending Schemes & Rates
  const [config, setConfig] = useState({
    daily_loan_enabled: true,
    daily_interest_rate: 10.0,
    daily_tenure_days: 100,
    daily_min_amount: 2000,
    daily_max_amount: 100000,
    daily_grace_period_days: 0,

    weekly_loan_enabled: true,
    weekly_interest_rate: 10.0,
    weekly_tenure_weeks: 10,
    weekly_min_amount: 5000,
    weekly_max_amount: 150000,

    monthly_loan_enabled: true,
    monthly_interest_rate: 18.0,
    monthly_tenure_months: 12,
    monthly_min_amount: 10000,
    monthly_max_amount: 500000,

    max_active_loans_per_customer: 1,
    auto_eligibility_check: true,
    currency_symbol: '₹',
  });

  // Interactive Loan Calculator Test Principal
  const [calcPrincipal, setCalcPrincipal] = useState(20000);

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
            daily_grace_period_days: Number(data.grace_period_days || 0),

            weekly_loan_enabled: Boolean(data.weekly_loan_enabled ?? true),
            weekly_interest_rate: Number(data.weekly_interest_rate || 10.0),
            weekly_tenure_weeks: Number(data.weekly_tenure_weeks || 10),
            weekly_min_amount: Number(data.weekly_min_amount || 5000),
            weekly_max_amount: Number(data.weekly_max_amount || 150000),

            monthly_loan_enabled: Boolean(data.monthly_loan_enabled ?? true),
            monthly_interest_rate: Number(data.monthly_interest_rate || 18.0),
            monthly_tenure_months: Number(data.monthly_tenure_months || 12),
            monthly_min_amount: Number(data.monthly_min_amount || 10000),
            monthly_max_amount: Number(data.monthly_max_amount || 500000),

            max_active_loans_per_customer: Number(data.max_active_loans_per_customer || 1),
            auto_eligibility_check: Boolean(data.auto_eligibility_check ?? true),
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateLendingConfig(orgId, config);
      showToast('Lending schemes and interest rates updated successfully!');
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

  const formatCurrency = (amt) =>
    (config.currency_symbol || '₹') + Number(amt || 0).toLocaleString('en-IN');

  // Dynamic Calculation Formulas for the Live Calculator
  // 1. Daily Calculation (e.g. 100 days, 10% flat)
  const dailyTotalPayable = calcPrincipal * (1 + config.daily_interest_rate / 100);
  const dailyProfit = dailyTotalPayable - calcPrincipal;
  const dailyInstallment = config.daily_tenure_days > 0 ? dailyTotalPayable / config.daily_tenure_days : 0;

  // 2. Weekly Calculation (e.g. 10 weeks, 10% flat)
  const weeklyTotalPayable = calcPrincipal * (1 + config.weekly_interest_rate / 100);
  const weeklyProfit = weeklyTotalPayable - calcPrincipal;
  const weeklyInstallment = config.weekly_tenure_weeks > 0 ? weeklyTotalPayable / config.weekly_tenure_weeks : 0;

  // 3. Monthly Calculation (e.g. 12 months, 18% p.a.)
  const monthlyInterestFactor = (config.monthly_interest_rate / 100) * (config.monthly_tenure_months / 12);
  const monthlyTotalPayable = calcPrincipal * (1 + monthlyInterestFactor);
  const monthlyProfit = monthlyTotalPayable - calcPrincipal;
  const monthlyInstallment = config.monthly_tenure_months > 0 ? monthlyTotalPayable / config.monthly_tenure_months : 0;

  if (loading) {
    return <div className="page-loading">Loading Lending Scheme Engine...</div>;
  }

  return (
    <div className="lir-page">
      {/* Header */}
      <div className="lir-header">
        <div>
          <div className="lir-pill">
            <Building size={14} />
            <span>{activeOrg ? `${activeOrg.name} (${activeOrg.code})` : 'Apex Finance • Lending Schemes'}</span>
          </div>
          <h1 className="lir-title">Lending Models & Interest Rate Engine</h1>
          <p className="lir-subtitle">
            Configure dynamic interest rates, tenures (100-day daily, 10-week micro, monthly EMI), and repayment rules.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Banner */}
      <div className="lir-banner">
        <div className="lir-banner-text">
          <h3>
            <Percent size={20} color="#60a5fa" />
            Dynamic Interest & Tenures Applied Organization-Wide
          </h3>
          <p>
            Any new loan created for Shopkeepers, Weekly Borrowers, or General Customers will automatically compute installments, total interest profit, and maturity dates using these dynamic parameters.
          </p>
        </div>
      </div>

      {/* Live Interactive Loan Calculator */}
      <div className="lir-calculator-box">
        <div className="lir-calc-header">
          <div className="lir-calc-title">
            <Calculator size={20} color="#2563eb" />
            <span>Real-Time Model Simulation & Dues Engine</span>
          </div>
          <div className="font-bold text-slate-700">
            Selected Principal: <span className="text-blue-600 text-lg">{formatCurrency(calcPrincipal)}</span>
          </div>
        </div>

        <div className="lir-calc-slider-group">
          <div className="lir-calc-slider-label">
            <span>Slide to test loan amount</span>
            <span>{formatCurrency(calcPrincipal)}</span>
          </div>
          <input
            type="range"
            min="2000"
            max="100000"
            step="1000"
            value={calcPrincipal}
            onChange={(e) => setCalcPrincipal(Number(e.target.value))}
            className="lir-calc-slider-input"
          />
        </div>

        <div className="lir-calc-results">
          {/* Daily Card */}
          <div className="lir-calc-card card-daily">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-emerald-800 text-sm">DAILY MERCHANT MODEL</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  {config.daily_tenure_days} Days @ {config.daily_interest_rate}%
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {formatCurrency(Math.round(dailyInstallment))}/day
              </div>
              <div className="text-xs text-slate-500 mb-3">Daily recovery for {config.daily_tenure_days} continuous days</div>
            </div>

            <div className="border-t border-emerald-100 pt-2 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Total Repayment:</span>
                <span className="font-bold text-slate-900">{formatCurrency(Math.round(dailyTotalPayable))}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Net Profit Earned:</span>
                <span>+{formatCurrency(Math.round(dailyProfit))} ({config.daily_interest_rate}% ROI)</span>
              </div>
            </div>
          </div>

          {/* Weekly Card */}
          <div className="lir-calc-card card-weekly">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-800 text-sm">WEEKLY MICRO-LOAN MODEL</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                  {config.weekly_tenure_weeks} Weeks @ {config.weekly_interest_rate}%
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {formatCurrency(Math.round(weeklyInstallment))}/week
              </div>
              <div className="text-xs text-slate-500 mb-3">Weekly collection for {config.weekly_tenure_weeks} weeks</div>
            </div>

            <div className="border-t border-blue-100 pt-2 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Total Repayment:</span>
                <span className="font-bold text-slate-900">{formatCurrency(Math.round(weeklyTotalPayable))}</span>
              </div>
              <div className="flex justify-between text-blue-700 font-semibold">
                <span>Net Profit Earned:</span>
                <span>+{formatCurrency(Math.round(weeklyProfit))} ({config.weekly_interest_rate}% ROI)</span>
              </div>
            </div>
          </div>

          {/* Monthly Card */}
          <div className="lir-calc-card card-monthly">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-purple-800 text-sm">MONTHLY BUSINESS EMI</span>
                <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">
                  {config.monthly_tenure_months} Mo @ {config.monthly_interest_rate}% p.a.
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {formatCurrency(Math.round(monthlyInstallment))}/month
              </div>
              <div className="text-xs text-slate-500 mb-3">Monthly installment for {config.monthly_tenure_months} months</div>
            </div>

            <div className="border-t border-purple-100 pt-2 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Total Repayment:</span>
                <span className="font-bold text-slate-900">{formatCurrency(Math.round(monthlyTotalPayable))}</span>
              </div>
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>Net Profit Earned:</span>
                <span>+{formatCurrency(Math.round(monthlyProfit))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheme Configuration Grid */}
      <div className="lir-schemes-grid">
        {/* 1. Daily Scheme */}
        <div className="lir-scheme-card">
          <div className="lir-sc-header">
            <div>
              <h3 className="font-bold text-base text-slate-900">1. Daily Merchant Scheme</h3>
              <p className="text-xs text-slate-500">For daily shopkeepers, tea stalls, street vendors</p>
            </div>
            <span className="lir-sc-badge badge-daily">Daily Cycle</span>
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
              <label>Min Loan Amount (₹)</label>
              <input
                type="number"
                className="lir-input"
                value={config.daily_min_amount}
                onChange={(e) => handleChange('daily_min_amount', Number(e.target.value))}
              />
            </div>

            <div className="lir-field">
              <label>Max Loan Amount (₹)</label>
              <input
                type="number"
                className="lir-input"
                value={config.daily_max_amount}
                onChange={(e) => handleChange('daily_max_amount', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="lir-formula-box">
            <strong>Formula:</strong> Daily Due = [Principal + (Principal × {config.daily_interest_rate}%)] ÷ {config.daily_tenure_days} Days
          </div>
        </div>

        {/* 2. Weekly Scheme */}
        <div className="lir-scheme-card">
          <div className="lir-sc-header">
            <div>
              <h3 className="font-bold text-base text-slate-900">2. Weekly Micro-Loan Scheme</h3>
              <p className="text-xs text-slate-500">For weekly market traders, self-help groups, community</p>
            </div>
            <span className="lir-sc-badge badge-weekly">Weekly Cycle</span>
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
              <label>Min Loan Amount (₹)</label>
              <input
                type="number"
                className="lir-input"
                value={config.weekly_min_amount}
                onChange={(e) => handleChange('weekly_min_amount', Number(e.target.value))}
              />
            </div>

            <div className="lir-field">
              <label>Max Loan Amount (₹)</label>
              <input
                type="number"
                className="lir-input"
                value={config.weekly_max_amount}
                onChange={(e) => handleChange('weekly_max_amount', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="lir-formula-box">
            <strong>Formula:</strong> Weekly Installment = [Principal + (Principal × {config.weekly_interest_rate}%)] ÷ {config.weekly_tenure_weeks} Weeks
          </div>
        </div>

        {/* 3. Monthly Scheme */}
        <div className="lir-scheme-card">
          <div className="lir-sc-header">
            <div>
              <h3 className="font-bold text-base text-slate-900">3. Monthly Business Scheme</h3>
              <p className="text-xs text-slate-500">For enterprise loans, equipment finance, business expansion</p>
            </div>
            <span className="lir-sc-badge badge-monthly">Monthly Cycle</span>
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
              <label>Min Loan Amount (₹)</label>
              <input
                type="number"
                className="lir-input"
                value={config.monthly_min_amount}
                onChange={(e) => handleChange('monthly_min_amount', Number(e.target.value))}
              />
            </div>

            <div className="lir-field">
              <label>Max Loan Amount (₹)</label>
              <input
                type="number"
                className="lir-input"
                value={config.monthly_max_amount}
                onChange={(e) => handleChange('monthly_max_amount', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="lir-formula-box">
            <strong>Formula:</strong> Monthly EMI = [Principal + (Principal × {config.monthly_interest_rate}% × ({config.monthly_tenure_months}/12))] ÷ {config.monthly_tenure_months} Months
          </div>
        </div>
      </div>

      {/* Save Action Footer */}
      <div className="lir-save-footer">
        {toastMessage && <div className="lir-toast">{toastMessage}</div>}
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Lending Schemes'}</span>
        </button>
      </div>
    </div>
  );
};

export default LendingInterestRates;
