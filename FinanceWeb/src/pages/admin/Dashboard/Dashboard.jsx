import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import {
  Users,
  UserPlus,
  Receipt,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Store,
  DollarSign,
  Percent,
  PieChart,
  Activity,
} from 'lucide-react';

import { useOrg } from '../../../context/OrgContext';
import { useAuth } from '../../../context/AuthContext';
import { BranchAdminDashboard } from '../../BranchAdmin/BranchAdminDashboard';
import './Dashboard.css';

/**
 * Fintech-Grade Shimmer Skeleton Loader for Admin Dashboard
 */
const DashboardSkeleton = () => {
  return (
    <div className="admin-dash-page">
      {/* 1. Header Skeleton */}
      <div className="dash-page-header">
        <div className="dash-title-area">
          <div className="dash-skeleton" style={{ width: '360px', height: '28px' }} />
        </div>
        <div className="skeleton-header-actions">
          <div className="dash-skeleton skeleton-btn" />
          <div className="dash-skeleton skeleton-btn" />
          <div className="dash-skeleton skeleton-btn" />
          <div className="dash-skeleton skeleton-btn" style={{ background: '#bfdbfe' }} />
        </div>
      </div>

      {/* 2. Capital Engine Card Skeleton */}
      <div className="capital-engine-card">
        <div className="cec-header">
          <div className="cec-title-group">
            <div className="dash-skeleton" style={{ width: '42px', height: '42px', borderRadius: '0.65rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="dash-skeleton" style={{ width: '280px', height: '20px' }} />
              <div className="dash-skeleton" style={{ width: '380px', height: '14px' }} />
            </div>
          </div>
          <div className="dash-skeleton" style={{ width: '180px', height: '32px', borderRadius: '0.5rem' }} />
        </div>

        {/* 4 Stat Boxes Shimmer */}
        <div className="cec-stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="dash-skeleton" style={{ width: '110px', height: '14px' }} />
                <div className="dash-skeleton" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
              </div>
              <div className="dash-skeleton" style={{ width: '140px', height: '28px' }} />
              <div className="dash-skeleton" style={{ width: '180px', height: '12px' }} />
            </div>
          ))}
        </div>

        {/* Secondary Strip Shimmer */}
        <div className="skeleton-sub-row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="dash-skeleton" style={{ width: '90px', height: '12px' }} />
              <div className="dash-skeleton" style={{ width: '120px', height: '18px' }} />
            </div>
          ))}
        </div>

        {/* Dual-Progress Shimmer */}
        <div className="dash-skeleton" style={{ width: '100%', height: '42px', borderRadius: '0.65rem' }} />
      </div>

      {/* 3. Analytics Grid Skeleton */}
      <div className="dash-analytics-grid">
        {/* Left Chart Skeleton */}
        <div className="skeleton-chart-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="dash-skeleton" style={{ width: '220px', height: '18px' }} />
              <div className="dash-skeleton" style={{ width: '280px', height: '12px' }} />
            </div>
            <div className="dash-skeleton" style={{ width: '140px', height: '20px' }} />
          </div>
          <div className="dash-skeleton" style={{ width: '100%', height: '150px', borderRadius: '0.5rem' }} />
        </div>

        {/* Right Chart Skeleton */}
        <div className="skeleton-chart-box">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="dash-skeleton" style={{ width: '180px', height: '18px' }} />
            <div className="dash-skeleton" style={{ width: '240px', height: '12px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div className="dash-skeleton" style={{ width: '130px', height: '130px', borderRadius: '50%' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div className="dash-skeleton" style={{ width: '100%', height: '32px' }} />
              <div className="dash-skeleton" style={{ width: '100%', height: '32px' }} />
              <div className="dash-skeleton" style={{ width: '100%', height: '32px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Target Trackers Skeleton */}
      <div className="dash-targets-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-stat-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dash-skeleton" style={{ width: '38px', height: '38px', borderRadius: '0.55rem' }} />
              <div className="dash-skeleton" style={{ width: '70px', height: '20px', borderRadius: '9999px' }} />
            </div>
            <div className="dash-skeleton" style={{ width: '130px', height: '26px' }} />
            <div className="dash-skeleton" style={{ width: '110px', height: '12px' }} />
            <div className="dash-skeleton" style={{ width: '140px', height: '12px' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Minimal Pure SVG Donut Chart for Capital Yield Realization
 */
const CapitalYieldDonut = ({ recovered, profit, outstanding, totalRepayable, recoveryPercent }) => {
  const size = 140;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const total = Math.max(totalRepayable || 0, (recovered + profit + outstanding), 1);
  const recRatio = Math.min(recovered / total, 1);
  const profRatio = Math.min(profit / total, 1 - recRatio);
  const outRatio = Math.max(0, 1 - recRatio - profRatio);

  const recDash = recRatio * circumference;
  const profDash = profRatio * circumference;
  const outDash = outRatio * circumference;

  const recOffset = 0;
  const profOffset = -recDash;
  const outOffset = -(recDash + profDash);

  return (
    <div className="donut-svg-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        {outRatio > 0.001 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth={strokeWidth}
            strokeDasharray={`${outDash} ${circumference}`}
            strokeDashoffset={outOffset}
            strokeLinecap="round"
          />
        )}
        {recRatio > 0.001 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#2563EB"
            strokeWidth={strokeWidth}
            strokeDasharray={`${recDash} ${circumference}`}
            strokeDashoffset={recOffset}
            strokeLinecap="round"
          />
        )}
        {profRatio > 0.001 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#059669"
            strokeWidth={strokeWidth}
            strokeDasharray={`${profDash} ${circumference}`}
            strokeDashoffset={profOffset}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="donut-center-text">
        <div className="donut-center-val">{recoveryPercent}%</div>
        <div className="donut-center-lbl">Recovered</div>
      </div>
    </div>
  );
};

/**
 * Minimal Pure SVG 7-Day Collection Velocity Trend Chart
 */
const CollectionVelocityChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.825rem' }}>
        No collection activity logged in the past 7 days.
      </div>
    );
  }

  const width = 520;
  const height = 150;
  const paddingX = 35;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(
    ...data.map((d) => Math.max(Number(d.expected || 0), Number(d.collected || 0))),
    1000
  );

  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  const getX = (index) => paddingX + index * stepX;
  const getY = (val) => paddingTop + chartHeight - (Number(val || 0) / maxVal) * chartHeight;

  const collectedPoints = data.map((d, i) => `${getX(i)},${getY(d.collected)}`);
  const collectedLinePath = `M ${collectedPoints.join(' L ')}`;
  const collectedAreaPath = `${collectedLinePath} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  const expectedPoints = data.map((d, i) => `${getX(i)},${getY(d.expected)}`);
  const expectedLinePath = `M ${expectedPoints.join(' L ')}`;

  const formatShortAmt = (val) => (val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${val}`);

  return (
    <div className="svg-chart-container">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="collAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={paddingX - 6}
                y={y + 3}
                fill="#94A3B8"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
                fontFamily="Plus Jakarta Sans"
              >
                {formatShortAmt(Math.round(maxVal * ratio))}
              </text>
            </g>
          );
        })}

        <path d={collectedAreaPath} fill="url(#collAreaGrad)" />

        <path
          d={expectedLinePath}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.75"
          strokeDasharray="4 4"
        />

        <path
          d={collectedLinePath}
          fill="none"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.collected);
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="3.5"
                fill="#FFFFFF"
                stroke="#059669"
                strokeWidth="2"
              >
                <title>{`${d.label}: ₹${d.collected.toLocaleString('en-IN')} collected (Due: ₹${d.expected.toLocaleString('en-IN')})`}</title>
              </circle>
              <text
                x={cx}
                y={height - 8}
                fill="#64748B"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="Plus Jakarta Sans"
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isBranchAdmin } = useAuth();
  const { activeOrg, activeBranchId } = useOrg();
  const [metrics, setMetrics] = useState(null);
  const [weeklyDues, setWeeklyDues] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrgPath = (subpath) => {
    if (activeOrg?.id) {
      return `/org/${activeOrg.id}/${subpath}`;
    }
    return `/admin/${subpath}`;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashData, duesData] = await Promise.all([
        api.getAdminDashboardMetrics({
          organizationId: activeOrg?.id || undefined,
          branchId: activeBranchId || undefined,
        }).catch(() => null),
        api.getWeeklyDues().catch(() => []),
      ]);

      setMetrics(dashData || null);
      setWeeklyDues(Array.isArray(duesData) ? duesData : (duesData?.records || []));
    } catch (err) {
      console.error('Failed to load dashboard metrics from live API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeOrg?.id, activeBranchId]);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  if (isBranchAdmin) {
    return <BranchAdminDashboard />;
  }

  if (loading || !metrics) {
    return <DashboardSkeleton />;
  }

  const profitSummary = metrics.profitSummary || {
    totalCapitalInvested: 0,
    totalContractedIncome: 0,
    totalRepayableAmount: 0,
    totalAmountCollected: 0,
    totalPrincipalRecovered: 0,
    realizedNetProfit: 0,
    outstandingPrincipalInMarket: 0,
    outstandingInterestInMarket: 0,
    totalOutstandingBalance: 0,
    projectedTotalReturn: 0,
    projectedTotalNetProfit: 0,
    realizedRoiPercent: 0,
    projectedRoiPercent: 0,
    recoveryProgressPercent: 0,
    totalLoansCount: 0,
    activeBorrowersCount: 0,
  };

  const schemeDist = metrics.schemeDistribution || {
    WEEKLY: { count: 0, principal: 0, collected: 0, repayable: 0 },
    DAILY: { count: 0, principal: 0, collected: 0, repayable: 0 },
    MONTHLY: { count: 0, principal: 0, collected: 0, repayable: 0 },
  };

  const totalSchemePrincipal = (schemeDist.WEEKLY?.principal || 0) + (schemeDist.DAILY?.principal || 0) + (schemeDist.MONTHLY?.principal || 0) || 1;

  const dailyProgress = metrics.todayDailyTarget > 0 ? Math.round((metrics.todayDailyCollected / metrics.todayDailyTarget) * 100) : 0;
  const weeklyProgress = metrics.todayWeeklyTarget > 0 ? Math.round((metrics.weeklyCollected / metrics.todayWeeklyTarget) * 100) : 0;

  return (
    <div className="admin-dash-page">
      {/* 1. Header (Standard Clean Fintech Style) */}
      <div className="dash-page-header">
        <div className="dash-title-area">
          <h1 className="dash-page-title">Financial Accounting & Capital Performance</h1>
        </div>

        <div className="dash-header-actions">
          <button className="directory-btn-secondary" onClick={() => navigate(getOrgPath('shopkeepers'))}>
            <Store size={16} />
            <span>Shopkeepers</span>
          </button>
          <button className="directory-btn-secondary" onClick={() => navigate(getOrgPath('weekly-customers'))}>
            <Calendar size={16} />
            <span>Weekly Borrowers</span>
          </button>
          <button className="directory-btn-secondary" onClick={() => navigate(getOrgPath('loans'))}>
            <CreditCard size={16} />
            <span>Loan Portfolio</span>
          </button>
          <button className="directory-btn-primary" onClick={() => navigate(getOrgPath('users/add'))}>
            <UserPlus size={16} />
            <span>Onboard Borrower</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. CORE FINANCIAL CAPITAL & NET PROFIT ENGINE (PRINCIPAL VS INTEREST) */}
      {/* ==================================================================== */}
      <div className="capital-engine-card">
        <div className="cec-header">
          <div className="cec-title-group">
            <div className="cec-title-icon">
              <TrendingUp size={22} />
            </div>
            <div className="cec-title-text">
              <h2>Capital Yield & Profit Realization Engine</h2>
              <p>Breakdown of Net Principal Disbursed vs. Contracted Interest Profit & Realized Cash</p>
            </div>
          </div>

          <div className="cec-roi-badge">
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Capital Recovery:</span>
            <span className="cec-roi-pill">{profitSummary.recoveryProgressPercent}% Principal Recovered</span>
          </div>
        </div>

        {/* 4 Primary Financial Cards */}
        <div className="cec-stats-grid">
          {/* Card 1: Net Principal Given */}
          <div className="cec-stat-box">
            <div className="cec-sb-top">
              <span className="cec-sb-label">NET PRINCIPAL GIVEN</span>
              <DollarSign size={17} color="#2563eb" />
            </div>
            <div className="cec-sb-val">{formatCurrency(profitSummary.totalCapitalInvested)}</div>
            <div className="cec-sb-desc">
              Exact net capital lent across {profitSummary.totalLoansCount || 0} active loans
            </div>
          </div>

          {/* Card 2: Contracted Interest (Profit Amount) */}
          <div className="cec-stat-box">
            <div className="cec-sb-top">
              <span className="cec-sb-label">CONTRACTED INTEREST (PROFIT)</span>
              <Percent size={17} color="#7c3aed" />
            </div>
            <div className="cec-sb-val">{formatCurrency(profitSummary.totalContractedIncome)}</div>
            <div className="cec-sb-desc">
              Total interest scheduled to be earned ({profitSummary.projectedRoiPercent}% yield)
            </div>
          </div>

          {/* Card 3: Principal Capital Recovered */}
          <div className="cec-stat-box">
            <div className="cec-sb-top">
              <span className="cec-sb-label">PRINCIPAL RECOVERED</span>
              <Receipt size={17} color="#059669" />
            </div>
            <div className="cec-sb-val">{formatCurrency(profitSummary.totalPrincipalRecovered)}</div>
            <div className="cec-sb-desc">
              Net capital returned to vault ({profitSummary.recoveryProgressPercent}% of disbursed funds)
            </div>
          </div>

          {/* Card 4: Realized Net Profit */}
          <div className="cec-stat-box">
            <div className="cec-sb-top">
              <span className="cec-sb-label">REALIZED NET PROFIT (IN-HAND)</span>
              <CheckCircle2 size={17} color="#059669" />
            </div>
            <div className="cec-sb-val">{formatCurrency(profitSummary.realizedNetProfit)}</div>
            <div className="cec-sb-desc">
              Pure interest earnings collected in hand (+{profitSummary.realizedRoiPercent}% ROI)
            </div>
          </div>
        </div>

        {/* Secondary Auxiliary Accounting Strip */}
        <div className="cec-sub-grid">
          <div className="cec-sub-item">
            <span className="cec-sub-label">Outstanding Principal at Risk</span>
            <span className="cec-sub-val" style={{ color: '#0f172a' }}>
              {formatCurrency(profitSummary.outstandingPrincipalInMarket)}
            </span>
          </div>

          <div className="cec-sub-item">
            <span className="cec-sub-label">Unrealized Interest Pending</span>
            <span className="cec-sub-val" style={{ color: '#0f172a' }}>
              {formatCurrency(profitSummary.outstandingInterestInMarket)}
            </span>
          </div>

          <div className="cec-sub-item">
            <span className="cec-sub-label">Total Market Collection Due</span>
            <span className="cec-sub-val" style={{ color: '#0f172a' }}>
              {formatCurrency(profitSummary.totalOutstandingBalance)}
            </span>
          </div>

          <div className="cec-sub-item">
            <span className="cec-sub-label">Total Collections Inflow</span>
            <span className="cec-sub-val" style={{ color: '#0f172a' }}>
              {formatCurrency(profitSummary.totalAmountCollected)}
            </span>
          </div>
        </div>

        {/* Capital Recovery Dual Progress Bar */}
        <div className="cec-progress-wrap">
          <div className="cec-pw-header">
            <span>Capital Recovery & Profit Realization Stream</span>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>
              {profitSummary.recoveryProgressPercent}% Principal Recovered
            </span>
          </div>
          <div className="cec-pw-track">
            <div
              className="cec-pw-fill-principal"
              style={{
                width: `${profitSummary.totalCapitalInvested > 0 ? Math.min(100, Math.round((profitSummary.totalPrincipalRecovered / profitSummary.totalCapitalInvested) * 100)) : 0}%`,
              }}
              title="Principal Recovered"
            />
            <div
              className="cec-pw-fill-profit"
              style={{
                width: `${profitSummary.totalCapitalInvested > 0 ? Math.min(100, Math.round((profitSummary.realizedNetProfit / profitSummary.totalCapitalInvested) * 100)) : 0}%`,
              }}
              title="Realized Net Profit"
            />
          </div>
          <div className="cec-pw-legend">
            <div className="cec-leg-item">
              <span className="cec-leg-dot dot-blue" />
              <span>Principal Recovered: {formatCurrency(profitSummary.totalPrincipalRecovered)}</span>
            </div>
            <div className="cec-leg-item">
              <span className="cec-leg-dot dot-green" />
              <span>Realized Net Profit: {formatCurrency(profitSummary.realizedNetProfit)}</span>
            </div>
            <div className="cec-leg-item">
              <span className="cec-leg-dot dot-slate" />
              <span>Remaining Balance: {formatCurrency(profitSummary.totalOutstandingBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MINIMAL VISUAL ANALYTICS & GRAPH SECTION                          */}
      {/* ==================================================================== */}
      <div className="dash-analytics-grid">
        {/* Left Chart: 7-Day Collection Velocity Trend */}
        <div className="dash-chart-card">
          <div className="dcc-header">
            <div>
              <h3 className="dcc-title" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Activity size={17} color="#059669" />
                <span>Collection Velocity & Inflow Trend</span>
              </h3>
              <p className="dcc-subtitle">Past 7 days scheduled obligations vs. actual realized cash inflows</p>
            </div>
            <div className="dcc-badge-group">
              <div className="cec-leg-item" style={{ fontSize: '0.75rem' }}>
                <span className="cec-leg-dot dot-green" />
                <span>Collected</span>
              </div>
              <div className="cec-leg-item" style={{ fontSize: '0.75rem' }}>
                <span className="cec-leg-dot dot-slate" />
                <span>Scheduled</span>
              </div>
            </div>
          </div>

          <CollectionVelocityChart data={metrics.collectionTrend || []} />
        </div>

        {/* Right Chart: Capital Yield Realization Donut & Scheme Exposure */}
        <div className="dash-chart-card">
          <div className="dcc-header">
            <div>
              <h3 className="dcc-title" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <PieChart size={17} color="#2563eb" />
                <span>Capital Yield Allocation</span>
              </h3>
              <p className="dcc-subtitle">Portfolio recovery vs. in-hand profits & risk exposure</p>
            </div>
          </div>

          <div className="donut-layout-wrap">
            <CapitalYieldDonut
              recovered={profitSummary.totalPrincipalRecovered}
              profit={profitSummary.realizedNetProfit}
              outstanding={profitSummary.totalOutstandingBalance}
              totalRepayable={profitSummary.totalRepayableAmount}
              recoveryPercent={profitSummary.recoveryProgressPercent}
            />

            <div className="donut-legend-list">
              <div className="donut-legend-row">
                <div className="dlr-left">
                  <span className="cec-leg-dot dot-blue" />
                  <span>Principal Back</span>
                </div>
                <div className="dlr-val">{formatCurrency(profitSummary.totalPrincipalRecovered)}</div>
              </div>

              <div className="donut-legend-row">
                <div className="dlr-left">
                  <span className="cec-leg-dot dot-green" />
                  <span>Net Profit (Yield)</span>
                </div>
                <div className="dlr-val">{formatCurrency(profitSummary.realizedNetProfit)}</div>
              </div>

              <div className="donut-legend-row">
                <div className="dlr-left">
                  <span className="cec-leg-dot dot-slate" />
                  <span>Market Balance</span>
                </div>
                <div className="dlr-val">{formatCurrency(profitSummary.totalOutstandingBalance)}</div>
              </div>
            </div>
          </div>

          {/* Scheme Exposure Breakdown */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Lending Division Volume Breakdown
            </div>
            <div className="scheme-breakdown-list">
              <div className="scheme-row">
                <div className="sr-header">
                  <span className="sr-title">
                    <Calendar size={13} color="#2563eb" />
                    <span>Weekly Micro-loans ({schemeDist.WEEKLY?.count || 0})</span>
                  </span>
                  <span className="sr-amt">{formatCurrency(schemeDist.WEEKLY?.principal)}</span>
                </div>
                <div className="sr-progress-track">
                  <div
                    className="sr-progress-fill"
                    style={{
                      width: `${Math.round(((schemeDist.WEEKLY?.principal || 0) / totalSchemePrincipal) * 100)}%`,
                      background: '#2563eb',
                    }}
                  />
                </div>
              </div>

              <div className="scheme-row">
                <div className="sr-header">
                  <span className="sr-title">
                    <Store size={13} color="#059669" />
                    <span>Daily Merchant Ledger ({schemeDist.DAILY?.count || 0})</span>
                  </span>
                  <span className="sr-amt">{formatCurrency(schemeDist.DAILY?.principal)}</span>
                </div>
                <div className="sr-progress-track">
                  <div
                    className="sr-progress-fill"
                    style={{
                      width: `${Math.round(((schemeDist.DAILY?.principal || 0) / totalSchemePrincipal) * 100)}%`,
                      background: '#059669',
                    }}
                  />
                </div>
              </div>

              <div className="scheme-row">
                <div className="sr-header">
                  <span className="sr-title">
                    <Clock size={13} color="#7c3aed" />
                    <span>Monthly Business EMI ({schemeDist.MONTHLY?.count || 0})</span>
                  </span>
                  <span className="sr-amt">{formatCurrency(schemeDist.MONTHLY?.principal)}</span>
                </div>
                <div className="sr-progress-track">
                  <div
                    className="sr-progress-fill"
                    style={{
                      width: `${Math.round(((schemeDist.MONTHLY?.principal || 0) / totalSchemePrincipal) * 100)}%`,
                      background: '#7c3aed',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. 3-TIER RECOVERY TARGET TRACKERS (DAILY, WEEKLY, MONTHLY)          */}
      {/* ==================================================================== */}
      <div className="dash-targets-grid">
        <div className="dash-target-card">
          <div className="dtc-header">
            <div className="dtc-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Receipt size={18} />
            </div>
            <span className="dtc-badge">{dailyProgress}% Realized</span>
          </div>
          <div className="dtc-val">{formatCurrency(metrics.todayDailyTarget)}</div>
          <div className="dtc-label">TODAY'S DAILY TARGET</div>
          <div className="dtc-meta">Collected Today: {formatCurrency(metrics.todayDailyCollected)}</div>
        </div>

        <div className="dash-target-card">
          <div className="dtc-header">
            <div className="dtc-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Calendar size={18} />
            </div>
            <span className="dtc-badge">{weeklyProgress}% Realized</span>
          </div>
          <div className="dtc-val">{formatCurrency(metrics.todayWeeklyTarget)}</div>
          <div className="dtc-label">THIS WEEK'S TARGET</div>
          <div className="dtc-meta">Collected This Week: {formatCurrency(metrics.weeklyCollected)}</div>
        </div>

        <div className="dash-target-card">
          <div className="dtc-header">
            <div className="dtc-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <TrendingUp size={18} />
            </div>
            <span className="dtc-badge">Active Deployment</span>
          </div>
          <div className="dtc-val">{formatCurrency(metrics.netDisbursedThisMonth)}</div>
          <div className="dtc-label">DISBURSED THIS MONTH</div>
          <div className="dtc-meta">New capital lent in active month</div>
        </div>

        <div className="dash-target-card">
          <div className="dtc-header">
            <div className="dtc-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Users size={18} />
            </div>
            <span className="dtc-badge">{metrics.totalActiveLoans || 0} Loans</span>
          </div>
          <div className="dtc-val">{metrics.totalActiveUsers || 0} Borrowers</div>
          <div className="dtc-label">ACTIVE BORROWER BASE</div>
          <div className="dtc-meta">Outstanding: {formatCurrency(metrics.activePrincipalOutstanding)}</div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. TWO-COLUMN SECTION: OPERATIONAL MODULES & URGENT DUES             */}
      {/* ==================================================================== */}
      <div className="dash-columns-grid">
        {/* Left: Operational Modules & Portals */}
        <div className="dash-sec-card">
          <div className="dash-sec-header">
            <h3 className="dash-sec-title">
              <CheckCircle2 size={18} color="#059669" />
              <span>Operational Management Modules</span>
            </h3>
            <span className="dtc-badge" style={{ background: '#ecfdf5', color: '#059669' }}>Active</span>
          </div>

          <div className="modules-list">
            <div className="module-item" onClick={() => navigate(getOrgPath('shopkeepers'))}>
              <div className="mod-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Store size={18} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Daily Merchant & Shopkeeper Ledger</span>
                <span className="mod-desc">Track 25-day / 100-day merchant collections and rapid daily routes</span>
              </div>
              <ArrowRight size={15} className="mod-arrow" />
            </div>

            <div className="module-item" onClick={() => navigate(getOrgPath('weekly-customers'))}>
              <div className="mod-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Calendar size={18} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Weekly Borrower Installment Ledger</span>
                <span className="mod-desc">10-week micro-loans, recurring repayments, and field collections</span>
              </div>
              <ArrowRight size={15} className="mod-arrow" />
            </div>

            <div className="module-item" onClick={() => navigate(getOrgPath('monthly-customers'))}>
              <div className="mod-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                <Clock size={18} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Monthly Business & EMI Borrowers</span>
                <span className="mod-desc">12-month structured EMI loans for businesses and salaried borrowers</span>
              </div>
              <ArrowRight size={15} className="mod-arrow" />
            </div>

            <div className="module-item" onClick={() => navigate(getOrgPath('reports'))}>
              <div className="mod-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <Receipt size={18} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Financial Reports & Recovery Audit</span>
                <span className="mod-desc">Comprehensive repayment obligations, unpaid-first ledgers, and receipts</span>
              </div>
              <ArrowRight size={15} className="mod-arrow" />
            </div>
          </div>
        </div>

        {/* Right: Urgent Field Follow-ups Today */}
        <div className="dash-sec-card">
          <div className="dash-sec-header">
            <div>
              <h3 className="dash-sec-title">
                <Clock size={18} color="#2563eb" />
                <span>Scheduled Repayment Follow-ups</span>
              </h3>
            </div>
            <button className="directory-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => navigate(getOrgPath('reports'))}>
              View Ledger
            </button>
          </div>

          <div className="urgent-list">
            {weeklyDues && weeklyDues.length > 0 ? (
              weeklyDues.filter((d) => d.status !== 'PAID').slice(0, 4).map((due) => (
                <div key={due.scheduleId || due.id} className="urgent-item">
                  <div className="urgent-left">
                    <span className="urgent-name">{due.customerName || due.customer_name}</span>
                    <span className="urgent-sub">
                      Loan: {due.loanNumber || due.loan_number} • Due: {due.dueDate || due.due_date}
                    </span>
                  </div>
                  <div className="urgent-right">
                    <span className="urgent-amt">{formatCurrency(due.expectedAmount || due.due_amount)}</span>
                    <StatusBadge status={due.status} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                <CheckCircle2 size={24} color="#059669" style={{ margin: '0 auto 0.5rem auto' }} />
                <div>All scheduled dues for current cycle are up to date.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
