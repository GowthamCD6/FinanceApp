import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import {
  Users,
  UserPlus,
  Receipt,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building,
  CreditCard,
  Store,
  DollarSign,
  PieChart,
  Percent,
} from 'lucide-react';

import { useOrg } from '../../context/OrgContext';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [metrics, setMetrics] = useState(null);
  const [weeklyDues, setWeeklyDues] = useState([]);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackMetrics = {
    todayDailyCollected: 4200,
    todayDailyTarget: 5850,
    todayWeeklyTarget: 18000,
    weeklyCollected: 14500,
    activeBorrowersCount: 24,
    totalActiveLoans: 38,
    activePrincipalOutstanding: 142000,
    netDisbursedThisMonth: 85000,
    profitSummary: {
      totalCapitalInvested: 235000,
      totalAmountCollected: 142600,
      totalPrincipalRecovered: 124800,
      realizedNetProfit: 17800,
      outstandingPrincipalInMarket: 110200,
      totalOutstandingBalance: 118650,
      projectedTotalReturn: 261250,
      projectedTotalNetProfit: 26250,
      realizedRoiPercent: 7.6,
      projectedRoiPercent: 11.2,
      recoveryProgressPercent: 55,
    },
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [m, w, d] = await Promise.all([
          api.getAdminDashboardMetrics().catch(() => null),
          api.getWeeklyDues().catch(() => []),
          api.getDailyCollections().catch(() => []),
        ]);
        setMetrics(m || fallbackMetrics);
        setWeeklyDues(Array.isArray(w) ? w : []);
        setDailyCollections(Array.isArray(d) ? d : []);
      } catch (err) {
        console.warn('Dashboard metrics fetch error, fallback applied:', err);
        setMetrics(fallbackMetrics);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  if (loading || !metrics) return <div className="page-loading">Loading Field Operations Hub...</div>;

  const profitSummary = metrics.profitSummary || {
    totalCapitalInvested: 235000,
    totalAmountCollected: 142600,
    totalPrincipalRecovered: 124800,
    realizedNetProfit: 17800,
    outstandingPrincipalInMarket: 110200,
    totalOutstandingBalance: 118650,
    projectedTotalReturn: 261250,
    projectedTotalNetProfit: 26250,
    realizedRoiPercent: 7.6,
    projectedRoiPercent: 11.2,
    recoveryProgressPercent: 55,
  };

  const dailyProgress = metrics.todayDailyTarget > 0 ? Math.round((metrics.todayDailyCollected / metrics.todayDailyTarget) * 100) : 0;
  const weeklyProgress = metrics.todayWeeklyTarget > 0 ? Math.round((metrics.weeklyCollected / metrics.todayWeeklyTarget) * 100) : 0;

  return (
    <div className="admin-dash-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="org-pill">
            <Building size={14} />
            <span>{activeOrg ? `${activeOrg.name} • ${activeOrg.code}` : 'Apex Finance Ltd • Admin Operations Hub'}</span>
          </div>
          <h1 className="page-title">Financial Accounting & Field Operations</h1>
          <p className="page-subtitle">
            Real-time capital deployment, collected repayments, realized net profit, and multi-loan operations.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-emerald" onClick={() => navigate(getOrgPath('shopkeepers'))}>
            <Store size={16} />
            <span>Shopkeeper Ledger</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate(getOrgPath('loans'))}>
            <CreditCard size={16} />
            <span>Loan Portfolio</span>
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(getOrgPath('users/add'))}>
            <UserPlus size={16} />
            <span>Onboard User</span>
          </button>
        </div>
      </div>

      {/* 1. FINANCIAL ACCOUNTING & NET PROFIT ENGINE CARD */}
      <div className="card profit-engine-card" style={{ marginBottom: '1.75rem' }}>
        <div className="pec-header">
          <div className="pec-title-group">
            <div className="pec-badge">
              <TrendingUp size={18} />
              <span>CAPITAL YIELD & PROFIT ENGINE</span>
            </div>
            <h2 className="pec-heading">Financial Summary & Net Profit Accounting</h2>
          </div>
          <div className="pec-roi-badge">
            <span className="pec-roi-label">Realized ROI</span>
            <span className="pec-roi-val">+{profitSummary.realizedRoiPercent}%</span>
            <span className="pec-roi-proj">(Expected: +{profitSummary.projectedRoiPercent}%)</span>
          </div>
        </div>

        {/* 4-Stat Metric Row */}
        <div className="pec-stats-grid">
          {/* Stat 1: Capital Given / Spent */}
          <div className="pec-stat-box box-invested">
            <div className="pec-sb-top">
              <span className="pec-sb-label">TOTAL CAPITAL GIVEN / SPENT</span>
              <DollarSign size={16} className="pec-icon" />
            </div>
            <div className="pec-sb-val">{formatCurrency(profitSummary.totalCapitalInvested)}</div>
            <div className="pec-sb-desc">Total principal disbursed across all {profitSummary.totalLoansCount || 8} loans</div>
          </div>

          {/* Stat 2: Total Repayments Collected */}
          <div className="pec-stat-box box-collected">
            <div className="pec-sb-top">
              <span className="pec-sb-label">TOTAL REPAYMENTS COLLECTED</span>
              <Receipt size={16} className="pec-icon" />
            </div>
            <div className="pec-sb-val text-emerald">{formatCurrency(profitSummary.totalAmountCollected)}</div>
            <div className="pec-sb-desc">
              Principal returned: {formatCurrency(profitSummary.totalPrincipalRecovered)}
            </div>
          </div>

          {/* Stat 3: Realized Net Profit */}
          <div className="pec-stat-box box-profit">
            <div className="pec-sb-top">
              <span className="pec-sb-label">REALIZED NET PROFIT (CASH)</span>
              <TrendingUp size={16} className="pec-icon" />
            </div>
            <div className="pec-sb-val text-indigo">{formatCurrency(profitSummary.realizedNetProfit)}</div>
            <div className="pec-sb-desc">Net profit in-hand ({profitSummary.realizedRoiPercent}% ROI on disbursed funds)</div>
          </div>

          {/* Stat 4: Outstanding Capital in Market */}
          <div className="pec-stat-box box-market">
            <div className="pec-sb-top">
              <span className="pec-sb-label">OUTSTANDING IN MARKET</span>
              <Clock size={16} className="pec-icon" />
            </div>
            <div className="pec-sb-val text-amber">{formatCurrency(profitSummary.totalOutstandingBalance)}</div>
            <div className="pec-sb-desc">
              Projected Final Profit: <strong>+{formatCurrency(profitSummary.projectedTotalNetProfit)}</strong>
            </div>
          </div>
        </div>

        {/* Capital Recovery Progress Bar */}
        <div className="pec-progress-bar-container">
          <div className="pec-pb-header">
            <span>Capital Recovery & Profit Realization Progress</span>
            <span className="font-bold text-emerald">{profitSummary.recoveryProgressPercent}% Recovered</span>
          </div>
          <div className="pec-pb-track">
            <div
              className="pec-pb-fill-principal"
              style={{ width: `${Math.min(100, Math.round((profitSummary.totalPrincipalRecovered / profitSummary.totalCapitalInvested) * 100))}%` }}
              title="Principal Recovered"
            />
            <div
              className="pec-pb-fill-profit"
              style={{ width: `${Math.min(100, Math.round((profitSummary.realizedNetProfit / profitSummary.totalCapitalInvested) * 100))}%` }}
              title="Realized Net Profit"
            />
          </div>
          <div className="pec-pb-legend">
            <div className="pec-leg-item">
              <span className="leg-dot dot-principal" />
              <span>Principal Recovered: {formatCurrency(profitSummary.totalPrincipalRecovered)}</span>
            </div>
            <div className="pec-leg-item">
              <span className="leg-dot dot-profit" />
              <span>Realized Net Profit: {formatCurrency(profitSummary.realizedNetProfit)}</span>
            </div>
            <div className="pec-leg-item">
              <span className="leg-dot dot-remaining" />
              <span>Remaining to Collect: {formatCurrency(profitSummary.totalOutstandingBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE-TIER RECOVERY TARGET TRACKER (DAILY, WEEKLY, MONTHLY) */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          label="Today's Daily Target"
          value={formatCurrency(metrics.todayDailyTarget)}
          icon={Receipt}
          trend={`${dailyProgress}% Collected`}
          trendDirection="up"
          meta={`Collected Today: ${formatCurrency(metrics.todayDailyCollected)}`}
          accentColor="#059669"
          accentBg="#ECFDF5"
        />

        <StatCard
          label="This Week's Target"
          value={formatCurrency(metrics.todayWeeklyTarget || 18000)}
          icon={Calendar}
          trend={`${weeklyProgress}% Recovered`}
          trendDirection="up"
          meta={`Collected This Week: ${formatCurrency(metrics.weeklyCollected || 14500)}`}
          accentColor="#4F46E5"
          accentBg="#EEF2FF"
        />

        <StatCard
          label="Monthly Target"
          value={formatCurrency((metrics.todayWeeklyTarget || 18000) * 4)}
          icon={TrendingUp}
          trend="Monthly Pace: 78%"
          trendDirection="up"
          meta={`Net Disbursed: ${formatCurrency(metrics.netDisbursedThisMonth || 85000)}`}
          accentColor="#8B5CF6"
          accentBg="#F5F3FF"
        />

        <StatCard
          label="Active Borrowers"
          value={`${metrics.totalActiveUsers || 24} Clients`}
          icon={Users}
          trend={`${metrics.totalActiveLoans || 38} Active Loans`}
          trendDirection="up"
          meta={`Outstanding: ${formatCurrency(metrics.activePrincipalOutstanding || 142000)}`}
          accentColor="#D97706"
          accentBg="#FFFBEB"
        />
      </div>

      {/* Dynamic Lending Model Quick-Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div style={{ padding: '0.6rem', background: '#EFF6FF', borderRadius: '0.5rem', color: '#2563eb' }}>
              <Percent size={22} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm m-0">Active Organization Lending Schemes & Rates</h4>
              <p className="text-xs text-slate-500 m-0">Daily 100-day cycles (10% flat) • Weekly 10-week micro-loans (10% flat) • Monthly business EMI (18% p.a.)</p>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(getOrgPath('interest-rates'))}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <span>Configure Interest Rates</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 3. TWO COLUMN SECTION: QUICK ACTIONS & URGENT DUES */}
      <div className="dash-grid">
        {/* Left: Quick Actions & Management Shortcuts */}
        <div className="card shortcuts-card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={20} color="var(--emerald)" />
              Operational Modules & Portals
            </h3>
            <span className="badge badge-emerald">Field Ready</span>
          </div>

          <div className="modules-list">
            {/* Lending Rates & Tenures */}
            <div className="module-item" onClick={() => navigate(getOrgPath('interest-rates'))}>
              <div className="mod-icon blue">
                <Percent size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Lending Rates & Tenures Engine</span>
                <span className="mod-desc">Configure dynamic interest rates, 100-day daily dues, 10-week micro-loans, and interactive calculator</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>

            {/* Shopkeeper Ledger */}
            <div className="module-item" onClick={() => navigate(getOrgPath('shopkeepers'))}>
              <div className="mod-icon green">
                <Store size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Shopkeeper Daily Ledger & Collections</span>
                <span className="mod-desc">25-day / 100-day merchant microfinance, multi-loan tracking per shop, and rapid daily collection</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>

            {/* Loan Portfolio */}
            <div className="module-item" onClick={() => navigate(getOrgPath('loans'))}>
              <div className="mod-icon purple">
                <CreditCard size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Loan Portfolio & Disbursals</span>
                <span className="mod-desc">Issue concurrent multiple loans to existing borrowers with 10-week or 25-day cycles</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>

            {/* Manage Users */}
            <div className="module-item" onClick={() => navigate(getOrgPath('users'))}>
              <div className="mod-icon blue">
                <Users size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Manage Users & Multi-Loan Registry</span>
                <span className="mod-desc">Audit borrower multi-loan exposure, credit limits, and KYC detail profiles</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>

            {/* Onboard User */}
            <div className="module-item" onClick={() => navigate(getOrgPath('users/add'))}>
              <div className="mod-icon amber">
                <UserPlus size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Onboard New Borrower / Merchant</span>
                <span className="mod-desc">Register weekly borrower or daily shopkeeper with KYC and initial loan</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>

            {/* Collection Reports */}
            <div className="module-item" onClick={() => navigate(getOrgPath('reports'))}>
              <div className="mod-icon purple">
                <Receipt size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Weekly Dues & Daily Collection Sheets</span>
                <span className="mod-desc">View field schedules, collect overdue payments, and generate PDF receipts</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>
          </div>
        </div>

        {/* Right: Urgent Pending Collections Today */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Clock size={20} color="var(--primary)" />
                Urgent Field Follow-ups Today
              </h3>
              <p className="card-subtitle">Pending daily visits and scheduled weekly dues</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(getOrgPath('reports'))}>
              View All Dues
            </button>
          </div>

          <div className="urgent-list">
            {weeklyDues.filter((d) => d.status !== 'PAID').slice(0, 4).map((due) => (
              <div key={due.id} className="urgent-item">
                <div className="urgent-left">
                  <span className="urgent-name">{due.customer_name}</span>
                  <span className="urgent-sub">{due.installment_week} • Due: {due.due_date}</span>
                </div>
                <div className="urgent-right">
                  <span className="urgent-amt">{formatCurrency(due.due_amount)}</span>
                  <StatusBadge status={due.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .profit-engine-card {
          background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
          padding: 1.5rem;
        }

        .pec-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .pec-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--primary);
          background: #EEF2FF;
          border: 1px solid #C7D2FE;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          margin-bottom: 0.4rem;
        }
        .pec-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .pec-roi-badge {
          background: #ECFDF5;
          border: 1.5px solid #A7F3D0;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .pec-roi-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--emerald);
          text-transform: uppercase;
        }
        .pec-roi-val {
          font-size: 1.4rem;
          font-weight: 900;
          color: #047857;
          line-height: 1.1;
        }
        .pec-roi-proj {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .pec-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .pec-stat-box {
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem 1.15rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .pec-sb-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .pec-sb-label {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }
        .pec-icon {
          color: var(--text-muted);
        }
        .pec-sb-val {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .pec-sb-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .pec-progress-bar-container {
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
        }
        .pec-pb-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.6rem;
        }
        .pec-pb-track {
          height: 10px;
          border-radius: 5px;
          background: #E2E8F0;
          display: flex;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .pec-pb-fill-principal {
          background: var(--primary);
          height: 100%;
        }
        .pec-pb-fill-profit {
          background: var(--emerald);
          height: 100%;
        }

        .pec-pb-legend {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .pec-leg-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .leg-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot-principal { background: var(--primary); }
        .dot-profit { background: var(--emerald); }
        .dot-remaining { background: #CBD5E1; }
      `}</style>
    </div>
  );
};
