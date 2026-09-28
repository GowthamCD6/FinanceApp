import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import {
  Users,
  Building,
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
  Wallet,
  Landmark,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  X,
  RefreshCw,
  Search,
  Send,
  RotateCcw,
  Sparkles,
  Phone,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

import { useOrg } from '../../../context/OrgContext';
import { useAuth } from '../../../context/AuthContext';
import { BranchAdminDashboard } from './BranchAdminDashboard';
export { BranchAdminDashboard };
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
  const { user, isBranchAdmin, userOrgName } = useAuth();
  const { activeOrg, activeBranchId, branches, activeBranch } = useOrg();
  const [metrics, setMetrics] = useState(null);

  const currentOrgName = activeOrg?.name || user?.organization_name || userOrgName || 'Apex Finance Organization';
  const currentOrgCode = activeOrg?.code || user?.organization_code || '';
  const currentBranchName = activeBranch?.name || branches?.find(b => String(b.id) === String(activeBranchId))?.name || '';
  const [weeklyDues, setWeeklyDues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Central Vault Fund State
  const [fundSummary, setFundSummary] = useState({
    availableCash: 345000,
    totalCapital: 1200000,
    outstandingPrincipal: 330000,
    lendingIncome: 85000,
    operatingExpenses: 25000,
    netProfit: 60000,
    availableProfitPool: 60000,
    totalProfitWithdrawn: 0,
    totalProfitReinvested: 0,
  });

  // Modal States
  const [capitalModalOpen, setCapitalModalOpen] = useState(false);
  const [capitalAmount, setCapitalAmount] = useState('100000');
  const [capitalSource, setCapitalSource] = useState('BANK'); // 'BANK' | 'CASH'
  const [capitalDescription, setCapitalDescription] = useState('Initial branch vault float');
  const [submittingCapital, setSubmittingCapital] = useState(false);

  const [profitModalOpen, setProfitModalOpen] = useState(false);
  const [profitActionMode, setProfitActionMode] = useState('REINVEST'); // 'REINVEST' | 'WITHDRAW'
  const [profitAmount, setProfitAmount] = useState('');
  const [profitWithdrawMethod, setProfitWithdrawMethod] = useState('BANK_TRANSFER');
  const [profitDescription, setProfitDescription] = useState('');
  const [submittingProfit, setSubmittingProfit] = useState(false);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Office');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const [actionAlert, setActionAlert] = useState(null);

  // Profit Distribution & Dispatch Modal States
  const [distributionModalOpen, setDistributionModalOpen] = useState(false);
  const [distributionType, setDistributionType] = useState('REALIZED_PROFIT'); // 'REALIZED_PROFIT' | 'CONTRACTED_PROFIT'
  const [distSearch, setDistSearch] = useState('');
  const [distSchemeFilter, setDistSchemeFilter] = useState('ALL'); // 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY'

  const handleOpenDispatch = (initialAmount) => {
    setDistributionModalOpen(false);
    setProfitActionMode('WITHDRAW');
    const availablePool = fundSummary.availableProfitPool || profitSummary.realizedNetProfit || 0;
    setProfitAmount(initialAmount ? String(initialAmount) : (availablePool > 0 ? String(availablePool) : ''));
    setProfitDescription('Net profit payout distribution to admin/partner');
    setProfitModalOpen(true);
  };

  const handleOpenRenew = (initialAmount) => {
    setDistributionModalOpen(false);
    setProfitActionMode('REINVEST');
    const availablePool = fundSummary.availableProfitPool || profitSummary.realizedNetProfit || 0;
    setProfitAmount(initialAmount ? String(initialAmount) : (availablePool > 0 ? String(availablePool) : ''));
    setProfitDescription('Renew net profit into circulating working capital & vault');
    setProfitModalOpen(true);
  };

  const getOrgPath = (subpath) => {
    if (activeOrg?.id) {
      return `/org/${activeOrg.id}/${subpath}`;
    }
    return `/admin/${subpath}`;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashData, duesData, fundData] = await Promise.all([
        api.getAdminDashboardMetrics({
          organizationId: activeOrg?.id || undefined,
          branchId: activeBranchId || undefined,
        }).catch(() => null),
        api.getWeeklyDues().catch(() => []),
        api.funds.getSummary().catch(() => null),
      ]);

      setMetrics(dashData || null);
      setWeeklyDues(Array.isArray(duesData) ? duesData : (duesData?.records || []));
      if (fundData) {
        setFundSummary({
          availableCash: Number(fundData.availableCash || 0),
          totalCapital: Number(fundData.totalCapital || 0),
          outstandingPrincipal: Number(fundData.outstandingPrincipal || 0),
          lendingIncome: Number(fundData.lendingIncome || 0),
          operatingExpenses: Number(fundData.operatingExpenses || 0),
          netProfit: Number(fundData.netProfit || 0),
          availableProfitPool: Number(fundData.availableProfitPool ?? (fundData.netProfit || 0)),
          totalProfitWithdrawn: Number(fundData.totalProfitWithdrawn || 0),
          totalProfitReinvested: Number(fundData.totalProfitReinvested || 0),
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics from live API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeOrg?.id, activeBranchId]);

  // Handle Capital Injection
  const handleInjectCapital = async (e) => {
    if (e) e.preventDefault();
    const amt = parseFloat(capitalAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid capital injection amount.');
      return;
    }

    setSubmittingCapital(true);
    try {
      const desc = `${capitalDescription.trim() || 'Admin capital injection'} (${capitalSource === 'BANK' ? 'Bank Account' : 'Physical Cash Float'})`;
      await api.funds.injectCapital(amt, desc);
      setActionAlert({ type: 'success', message: `Successfully added ₹${amt.toLocaleString('en-IN')} to the Branch Vault!` });
      setCapitalModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error('Capital injection failed:', err);
      alert(err.message || 'Failed to inject capital.');
    } finally {
      setSubmittingCapital(false);
    }
  };

  // Handle Profit Action
  const handleProfitAction = async (e) => {
    if (e) e.preventDefault();
    const amt = parseFloat(profitAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    if (amt > fundSummary.availableProfitPool) {
      alert(`Amount cannot exceed available realized profit pool of ₹${fundSummary.availableProfitPool.toLocaleString('en-IN')}.`);
      return;
    }

    setSubmittingProfit(true);
    try {
      if (profitActionMode === 'REINVEST') {
        const desc = profitDescription.trim() || 'Reinvest profit back into circulating net capital';
        await api.funds.transferProfitToNetCapital(amt, desc);
        setActionAlert({
          type: 'success',
          message: `Successfully transferred ₹${amt.toLocaleString('en-IN')} of profit into circulating Net Capital / Vault!`,
        });
      } else {
        const desc = `${profitDescription.trim() || 'Admin realized profit withdrawal'} (${profitWithdrawMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash Payout'})`;
        await api.funds.withdrawProfit(amt, desc);
        setActionAlert({
          type: 'success',
          message: `Successfully recorded withdrawal of ₹${amt.toLocaleString('en-IN')} to Admin!`,
        });
      }
      setProfitModalOpen(false);
      setProfitAmount('');
      await loadDashboardData();
    } catch (err) {
      console.error('Profit action failed:', err);
      alert(err.message || 'Failed to process profit action.');
    } finally {
      setSubmittingProfit(false);
    }
  };

  // Handle Record Expense
  const handleRecordExpense = async (e) => {
    if (e) e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    setSubmittingExpense(true);
    try {
      await api.funds.recordExpense(amt, expenseCategory, expenseDescription.trim() || 'Operating expense');
      setActionAlert({ type: 'success', message: `Logged expense of ₹${amt.toLocaleString('en-IN')}!` });
      setExpenseModalOpen(false);
      setExpenseAmount('');
      setExpenseDescription('');
      await loadDashboardData();
    } catch (err) {
      console.error('Record expense failed:', err);
      alert(err.message || 'Failed to record expense.');
    } finally {
      setSubmittingExpense(false);
    }
  };

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
    userProfitDistributions: [],
  };

  const userDistributions = profitSummary.userProfitDistributions || [];
  const filteredUsers = userDistributions.filter((u) => {
    const matchesSearch =
      !distSearch ||
      (u.customerName && u.customerName.toLowerCase().includes(distSearch.toLowerCase())) ||
      (u.customerPhone && u.customerPhone.includes(distSearch)) ||
      (u.customerCode && u.customerCode.toLowerCase().includes(distSearch.toLowerCase())) ||
      (u.shopName && u.shopName.toLowerCase().includes(distSearch.toLowerCase())) ||
      (u.loanNumber && u.loanNumber.toLowerCase().includes(distSearch.toLowerCase()));

    const matchesScheme = distSchemeFilter === 'ALL' || u.scheme === distSchemeFilter;
    return matchesSearch && matchesScheme;
  });

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
          <div className="dash-org-badge-strip">
            <span className="dash-org-pill">
              <Building size={14} className="dash-org-pill-icon" />
              <span className="dash-org-pill-name">{currentOrgName}</span>
              {currentOrgCode && <span className="dash-org-pill-code">{currentOrgCode}</span>}
            </span>
            {currentBranchName && (
              <span className="dash-branch-pill">
                <span className="dash-branch-dot" />
                <span>{currentBranchName}</span>
              </span>
            )}
          </div>
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

      {/* Action Notification Toast / Alert */}
      {actionAlert && (
        <div style={{
          background: actionAlert.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${actionAlert.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: actionAlert.type === 'success' ? '#166534' : '#991b1b',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}>
          <span>{actionAlert.message}</span>
          <button
            type="button"
            onClick={() => setActionAlert(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 0. BRANCH VAULT & REALIZED PROFIT POOL (CAPITAL FLOAT & ACTIONS)     */}
      {/* ==================================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #047857 100%)',
        color: '#ffffff',
        borderRadius: '0.85rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.22), 0 4px 12px rgba(6, 78, 59, 0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '0.65rem',
              background: 'rgba(255, 255, 255, 0.16)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
              <Wallet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Branch Central Vault & Profit Pool
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#a7f3d0', margin: 0, fontWeight: 500 }}>
                Live cash float, active circulating capital, and realized lending profits
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setCapitalModalOpen(true)}
              style={{
                background: '#ffffff',
                color: '#047857',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.55rem 0.95rem',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              }}
            >
              <PlusCircle size={15} />
              <span>+ Inject Capital Float</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProfitActionMode('REINVEST');
                setProfitAmount('');
                setProfitModalOpen(true);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '0.5rem',
                padding: '0.55rem 0.95rem',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <TrendingUp size={15} />
              <span>Manage Profit (Reinvest / Withdraw)</span>
            </button>

            <button
              type="button"
              onClick={() => setExpenseModalOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '0.5rem',
                padding: '0.55rem 0.95rem',
                fontWeight: 600,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <FileText size={15} />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.65rem', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Available Vault Cash
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
              {formatCurrency(fundSummary.availableCash)}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#d1fae5', marginTop: '0.25rem', opacity: 0.9 }}>
              Ready for immediate loan disbursements
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.65rem', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#e9d5ff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Total Net Capital Base
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
              {formatCurrency(fundSummary.totalCapital)}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#d1fae5', marginTop: '0.25rem', opacity: 0.9 }}>
              Injected admin equity + reinvested profits
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.14)',
              borderRadius: '0.65rem',
              padding: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="vault-profit-interactive"
            onClick={() => {
              setDistributionType('REALIZED_PROFIT');
              setDistributionModalOpen(true);
            }}
            title="Click to view user profit distribution & dispatch/renew"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Realized Profit Pool (Available)
              </div>
              <span style={{ fontSize: '0.68rem', color: '#047857', background: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                Dispatch / Renew <ArrowRight size={11} />
              </span>
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#6ee7b7' }}>
              {formatCurrency(fundSummary.availableProfitPool)}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#d1fae5', marginTop: '0.25rem', opacity: 0.9 }}>
              Collected interest profit after expenses (Click to view breakdown)
            </div>
          </div>
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

          {/* Card 2: Contracted Interest (Profit Amount) - Interactive */}
          <div
            className="cec-stat-box cec-stat-box-interactive"
            onClick={() => {
              setDistributionType('CONTRACTED_PROFIT');
              setDistributionModalOpen(true);
            }}
            title="Click to view user yield distribution & holding amounts"
          >
            <div className="cec-sb-top">
              <span className="cec-sb-label">CONTRACTED INTEREST (PROFIT)</span>
              <Percent size={17} color="#7c3aed" />
            </div>
            <div className="cec-sb-val" style={{ color: '#7c3aed' }}>
              {formatCurrency(profitSummary.totalContractedIncome)}
            </div>
            <div className="cec-sb-desc">
              Total interest scheduled to be earned ({profitSummary.projectedRoiPercent}% yield)
            </div>
            <div className="cec-click-hint">
              <span>View User Distribution</span>
              <ArrowRight size={13} />
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

          {/* Card 4: Realized Net Profit - Interactive */}
          <div
            className="cec-stat-box cec-stat-box-interactive cec-box-profit"
            onClick={() => {
              setDistributionType('REALIZED_PROFIT');
              setDistributionModalOpen(true);
            }}
            title="Click to view user profit distribution, holding amounts & dispatch/renew"
          >
            <div className="cec-sb-top">
              <span className="cec-sb-label">REALIZED NET PROFIT (IN-HAND)</span>
              <CheckCircle2 size={17} color="#059669" />
            </div>
            <div className="cec-sb-val" style={{ color: '#059669' }}>
              {formatCurrency(profitSummary.realizedNetProfit)}
            </div>
            <div className="cec-sb-desc">
              Pure interest earnings collected in hand (+{profitSummary.realizedRoiPercent}% ROI)
            </div>
            <div className="cec-click-hint cec-hint-profit">
              <span>View Distribution & Dispatch</span>
              <ArrowRight size={13} />
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

      {/* ==================================================================== */}
      {/* MODAL 1: CAPITAL INJECTION (INJECT INTO VAULT)                       */}
      {/* ==================================================================== */}
      {capitalModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '0.85rem',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Wallet size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Inject Capital / Vault Float
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCapitalModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInjectCapital} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Injection Amount (₹) *
                </label>
                <input
                  type="number"
                  value={capitalAmount}
                  onChange={(e) => setCapitalAmount(e.target.value)}
                  placeholder="e.g. 100000"
                  step={5000}
                  min={1000}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Funding Channel *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setCapitalSource('BANK')}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '0.5rem',
                      border: capitalSource === 'BANK' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: capitalSource === 'BANK' ? '#eff6ff' : '#ffffff',
                      color: capitalSource === 'BANK' ? '#1e40af' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                    }}
                  >
                    🏦 Bank Deposit / RTGS
                  </button>

                  <button
                    type="button"
                    onClick={() => setCapitalSource('CASH')}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '0.5rem',
                      border: capitalSource === 'CASH' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: capitalSource === 'CASH' ? '#eff6ff' : '#ffffff',
                      color: capitalSource === 'CASH' ? '#1e40af' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                    }}
                  >
                    💵 Physical Cash Float
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Description / Audit Memo
                </label>
                <input
                  type="text"
                  value={capitalDescription}
                  onChange={(e) => setCapitalDescription(e.target.value)}
                  placeholder="e.g. Initial branch capital injection from admin bank"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setCapitalModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingCapital}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {submittingCapital ? 'Injecting Funds...' : 'Confirm Injection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: PROFIT CONTROL (REINVEST OR WITHDRAW)                       */}
      {/* ==================================================================== */}
      {profitModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '0.85rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Realized Profit Management
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProfitModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProfitAction} style={{ padding: '1.5rem' }}>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.25rem',
              }}>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>AVAILABLE PROFIT POOL:</div>
                <div style={{ fontSize: '1.25rem', color: '#15803d', fontWeight: 800 }}>
                  {formatCurrency(fundSummary.availableProfitPool)}
                </div>
              </div>

              {/* Action Mode Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setProfitActionMode('REINVEST')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: profitActionMode === 'REINVEST' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: profitActionMode === 'REINVEST' ? '#eff6ff' : '#ffffff',
                    color: profitActionMode === 'REINVEST' ? '#1e40af' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                  }}
                >
                  🔄 Reinvest into Net Capital
                </button>

                <button
                  type="button"
                  onClick={() => setProfitActionMode('WITHDRAW')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: profitActionMode === 'WITHDRAW' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: profitActionMode === 'WITHDRAW' ? '#f0fdf4' : '#ffffff',
                    color: profitActionMode === 'WITHDRAW' ? '#065f46' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                  }}
                >
                  💳 Withdraw to Admin
                </button>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  {profitActionMode === 'REINVEST' ? 'Reinvestment Amount (₹) *' : 'Withdrawal Amount (₹) *'}
                </label>
                <input
                  type="number"
                  value={profitAmount}
                  onChange={(e) => setProfitAmount(e.target.value)}
                  placeholder={`Max ₹${fundSummary.availableProfitPool}`}
                  max={fundSummary.availableProfitPool}
                  min={1}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Audit Note / Remarks
                </label>
                <input
                  type="text"
                  value={profitDescription}
                  onChange={(e) => setProfitDescription(e.target.value)}
                  placeholder={profitActionMode === 'REINVEST' ? 'e.g. Reinvesting Q1 profit for new loan expansion' : 'e.g. Monthly dividend payout to Admin bank'}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setProfitModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingProfit}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: profitActionMode === 'REINVEST' ? '#2563eb' : '#059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {submittingProfit
                    ? 'Processing...'
                    : profitActionMode === 'REINVEST'
                    ? 'Confirm Reinvestment'
                    : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: RECORD EXPENSE                                             */}
      {/* ==================================================================== */}
      {expenseModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '0.85rem',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={20} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Record Operational Expense
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExpenseModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Expense Amount (₹) *
                </label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  min={1}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Category *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="Office">Office & Supplies</option>
                  <option value="Travel">Field Collection Travel / Petrol</option>
                  <option value="Salary">Staff Salary / Incentive</option>
                  <option value="Rent">Branch Rent & Utilities</option>
                  <option value="Other">Other Operational Cost</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="e.g. Monthly office internet and printer papers"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingExpense}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {submittingExpense ? 'Logging...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: USER PROFIT & YIELD DISTRIBUTION / DISPATCH / RENEW MODAL   */}
      {/* ==================================================================== */}
      {distributionModalOpen && (
        <div
          className="dist-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDistributionModalOpen(false);
          }}
        >
          <div className="dist-modal-card">
            {/* Modal Header */}
            <div className="dist-modal-header">
              <div className="dist-modal-header-left">
                <div
                  className="dist-modal-icon"
                  style={{
                    background: distributionType === 'REALIZED_PROFIT' ? '#ecfdf5' : '#f5f3ff',
                    color: distributionType === 'REALIZED_PROFIT' ? '#059669' : '#7c3aed',
                  }}
                >
                  {distributionType === 'REALIZED_PROFIT' ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <Percent size={24} />
                  )}
                </div>
                <div>
                  <h3 className="dist-modal-title">
                    {distributionType === 'REALIZED_PROFIT'
                      ? 'Realized Net Profit Distribution & Dispatch Engine'
                      : 'Contracted Interest Profit & User Yield Distribution'}
                  </h3>
                  <p className="dist-modal-subtitle">
                    {distributionType === 'REALIZED_PROFIT'
                      ? 'Breakdown of net interest profits collected per borrower, net capital held by users, and profit dispatch/renewal'
                      : 'Scheduled contract profit yield per borrower, net principal lent, and total active balance held in market'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() =>
                    setDistributionType((prev) =>
                      prev === 'REALIZED_PROFIT' ? 'CONTRACTED_PROFIT' : 'REALIZED_PROFIT'
                    )
                  }
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  {distributionType === 'REALIZED_PROFIT'
                    ? 'Switch to Contracted Yield →'
                    : 'Switch to Realized Profit →'}
                </button>
                <button
                  type="button"
                  onClick={() => setDistributionModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="dist-modal-body">
              {/* Summary KPIs */}
              <div className="dist-summary-grid">
                <div
                  className={`dist-summary-card ${
                    distributionType === 'REALIZED_PROFIT' ? 'accent-green' : 'accent-purple'
                  }`}
                >
                  <div className="dist-sc-label">
                    {distributionType === 'REALIZED_PROFIT'
                      ? 'Total Realized Net Profit'
                      : 'Total Contracted Profit'}
                  </div>
                  <div
                    className="dist-sc-value"
                    style={{
                      color: distributionType === 'REALIZED_PROFIT' ? '#059669' : '#7c3aed',
                    }}
                  >
                    {distributionType === 'REALIZED_PROFIT'
                      ? formatCurrency(profitSummary.realizedNetProfit)
                      : formatCurrency(profitSummary.totalContractedIncome)}
                  </div>
                  <div className="dist-sc-sub">
                    {distributionType === 'REALIZED_PROFIT'
                      ? `Available Pool: ${formatCurrency(fundSummary.availableProfitPool)}`
                      : `Average Scheduled Yield: ${profitSummary.projectedRoiPercent}%`}
                  </div>
                </div>

                <div className="dist-summary-card">
                  <div className="dist-sc-label">Total Capital Held by Users</div>
                  <div className="dist-sc-value" style={{ color: '#b45309' }}>
                    {formatCurrency(profitSummary.totalOutstandingBalance)}
                  </div>
                  <div className="dist-sc-sub">
                    Principal at Risk: {formatCurrency(profitSummary.outstandingPrincipalInMarket)}
                  </div>
                </div>

                <div className="dist-summary-card">
                  <div className="dist-sc-label">Total Net Principal Lent</div>
                  <div className="dist-sc-value" style={{ color: '#2563eb' }}>
                    {formatCurrency(profitSummary.totalCapitalInvested)}
                  </div>
                  <div className="dist-sc-sub">
                    Principal Recovered: {formatCurrency(profitSummary.totalPrincipalRecovered)}
                  </div>
                </div>

                <div className="dist-summary-card">
                  <div className="dist-sc-label">Active Borrowers Holding</div>
                  <div className="dist-sc-value">
                    {profitSummary.activeBorrowersCount || filteredUsers.length} Users
                  </div>
                  <div className="dist-sc-sub">
                    Across {profitSummary.totalLoansCount || filteredUsers.length} active lending contracts
                  </div>
                </div>
              </div>

              {/* Dispatch & Renewal Action Banner */}
              <div
                className={`dist-action-banner ${
                  distributionType === 'CONTRACTED_PROFIT' ? 'banner-purple' : ''
                }`}
              >
                <div className="dist-ab-left">
                  <div className="dist-ab-title">
                    <Sparkles size={18} />
                    <span>
                      {distributionType === 'REALIZED_PROFIT'
                        ? 'Net Profit Dispatch & Central Vault Renewal Engine'
                        : 'Contracted Profit Optimization & Vault Capital Renewal'}
                    </span>
                  </div>
                  <p className="dist-ab-desc">
                    {distributionType === 'REALIZED_PROFIT'
                      ? `You have ${formatCurrency(fundSummary.availableProfitPool)} in unallocated realized profits. You can dispatch profits out as admin/partner payouts, or renew/reinvest them directly into the central vault float to fuel new borrower loans.`
                      : `Total of ${formatCurrency(profitSummary.totalContractedIncome)} is scheduled across active borrowers with ${formatCurrency(profitSummary.realizedNetProfit)} collected in hand so far. You can dispatch collected profits or renew capital lines into vault float.`}
                  </p>
                </div>
                <div className="dist-ab-buttons">
                  <button
                    type="button"
                    className="btn-dist-action btn-dist-dispatch"
                    onClick={() => handleOpenDispatch(fundSummary.availableProfitPool || profitSummary.realizedNetProfit)}
                  >
                    <Send size={15} />
                    <span>Dispatch Profit (Payout)</span>
                  </button>
                  <button
                    type="button"
                    className="btn-dist-action btn-dist-renew"
                    onClick={() => handleOpenRenew(fundSummary.availableProfitPool || profitSummary.realizedNetProfit)}
                  >
                    <RotateCcw size={15} />
                    <span>Renew / Reinvest to Vault</span>
                  </button>
                </div>
              </div>

              {/* Search & Scheme Filter Bar */}
              <div className="dist-filter-row">
                <div className="dist-search-box">
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    value={distSearch}
                    onChange={(e) => setDistSearch(e.target.value)}
                    placeholder="Search borrower name, phone, code or shop..."
                  />
                  {distSearch && (
                    <button
                      type="button"
                      onClick={() => setDistSearch('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="dist-pill-group">
                  {['ALL', 'DAILY', 'WEEKLY', 'MONTHLY'].map((scheme) => (
                    <button
                      key={scheme}
                      type="button"
                      className={`dist-filter-pill ${distSchemeFilter === scheme ? 'active' : ''}`}
                      onClick={() => setDistSchemeFilter(scheme)}
                    >
                      {scheme === 'ALL' ? 'All Schemes' : scheme}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Distribution Table */}
              <div className="dist-table-container">
                <table className="dist-table">
                  <thead>
                    <tr>
                      <th>User / Borrower</th>
                      <th>Scheme & Loan</th>
                      <th>Net Principal Given</th>
                      <th>Contracted Profit</th>
                      <th>Realized Profit (In-Hand)</th>
                      <th>Net Amount User is Holding</th>
                      <th>Collection Progress</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u, idx) => (
                        <tr key={u.loanId || idx}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-circle">
                                {(u.customerName || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="user-meta-name">{u.customerName}</div>
                                <div className="user-meta-sub">
                                  <span>{u.customerCode}</span>
                                  <span>•</span>
                                  <Phone size={11} />
                                  <span>{u.customerPhone}</span>
                                </div>
                                {u.shopName && (
                                  <span style={{ fontSize: '0.7rem', color: '#0369a1', background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>
                                    🏬 {u.shopName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  color: u.scheme === 'DAILY' ? '#059669' : u.scheme === 'WEEKLY' ? '#2563eb' : '#7c3aed',
                                  background: u.scheme === 'DAILY' ? '#ecfdf5' : u.scheme === 'WEEKLY' ? '#eff6ff' : '#f5f3ff',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                  width: 'fit-content',
                                }}
                              >
                                {u.scheme}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                                {u.loanNumber}
                              </span>
                            </div>
                          </td>

                          <td style={{ fontWeight: 700 }}>
                            {formatCurrency(u.principalDisbursed)}
                          </td>

                          <td style={{ fontWeight: 700, color: '#7c3aed' }}>
                            {formatCurrency(u.contractedProfit)}
                          </td>

                          <td>
                            {u.realizedProfit > 0 ? (
                              <span className="profit-badge">
                                <CheckCircle2 size={12} />
                                {formatCurrency(u.realizedProfit)}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>₹0</span>
                            )}
                          </td>

                          <td>
                            <span className="holding-badge">
                              {formatCurrency(u.netHoldingAmount)}
                            </span>
                          </td>

                          <td style={{ minWidth: '130px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                                <span>Paid: {formatCurrency(u.totalPaid)}</span>
                                <span>{u.progressPercent}%</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${u.progressPercent}%`,
                                    height: '100%',
                                    background: u.realizedProfit > 0 ? '#059669' : '#2563eb',
                                    borderRadius: '9999px',
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setDistributionModalOpen(false);
                                  if (u.scheme === 'DAILY') {
                                    navigate(getOrgPath('shopkeepers'));
                                  } else if (u.scheme === 'WEEKLY') {
                                    navigate(getOrgPath('weekly-customers'));
                                  } else {
                                    navigate(getOrgPath('users'));
                                  }
                                }}
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  borderRadius: '0.45rem',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#0f172a',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                                title="View Borrower Ledger & Collections"
                              >
                                <span>Ledger</span>
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                          No borrowers match the current search or scheme filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
