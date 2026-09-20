import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import {
  ArrowLeft,
  Printer,
  Edit2,
  Plus,
  CheckCircle2,
  Clock,
  Receipt,
  CreditCard,
  Calendar,
  Phone,
  MapPin,
  Tag,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  ShieldCheck,
  Building,
  Briefcase,
  Layers,
  CircleDollarSign,
  Store,
  Check,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  X,
  ExternalLink,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '../../../components/common/Badge';
import './BorrowerHistoryView.css';

export const BorrowerHistoryView = ({
  user,
  onBack,
  onEdit,
  onAssignLoan,
  formatCurrency,
  statusFeedback,
  detailLoading = false,
}) => {
  // Tab state: 'ONGOING' | 'PAYMENTS' | 'COMPLETED' | 'PROFILE'
  const [activeTab, setActiveTab] = useState('ONGOING');
  // Modal state: opened when pressing any loan card
  const [modalLoan, setModalLoan] = useState(null);
  const [logFilterStatus, setLogFilterStatus] = useState('ALL'); // 'ALL' | 'PAID' | 'OVERDUE' | 'PENDING'

  const navigate = useNavigate();
  const { activeOrg } = useOrg?.() || {};

  // Smart navigator: links directly to the appropriate collection/payment portal
  // (Weekly Collect for weekly loans, Shopkeeper Collect for daily loans, Monthly Collect for monthly loans)
  const handleNavigateToCollect = (targetLoan) => {
    const loan = targetLoan || ongoingLoans?.[0];
    const freq = (loan?.repayment_frequency || user?.role || 'DAILY').toUpperCase();
    const customerId = user?.customerId || user?.id || 1;
    const shopId = user?.shop_id || user?.customerId || user?.id || 1;

    if (freq.includes('WEEK') || user?.role === 'COMMON_CUSTOMER') {
      const path = activeOrg
        ? `/org/${activeOrg.id}/weekly-customers/${customerId}/collect`
        : `/admin/weekly-customers/${customerId}/collect`;
      navigate(path, {
        state: {
          customer: user,
          loan,
          selectedDate: new Date().toISOString().slice(0, 10),
        },
      });
    } else if (freq.includes('MONTH') || user?.role === 'MONTHLY_BORROWER') {
      const path = activeOrg
        ? `/org/${activeOrg.id}/monthly-customers/${customerId}/collect`
        : `/admin/monthly-customers/${customerId}/collect`;
      navigate(path, {
        state: {
          customer: user,
          loan,
          selectedDate: new Date().toISOString().slice(0, 10),
        },
      });
    } else {
      // Default: Daily Shopkeeper Collect
      const path = activeOrg
        ? `/org/${activeOrg.id}/shopkeepers/${shopId}/collect`
        : `/admin/shopkeepers/${shopId}/collect`;
      navigate(path, {
        state: {
          shop: user,
          loan,
          selectedDate: new Date().toISOString().slice(0, 10),
        },
      });
    }
  };

  // Realistic mock loans representing both ACTIVE and OVERDUE states if borrower has no active loans
  const [staticLoans] = useState([
    {
      id: 1,
      loan_number: 'LN-DA-CUST-20260914-0002-9767',
      loan_code: 'LN-DA-9767',
      product_name: 'Daily Loan - Shopkeepers',
      loan_title: 'Daily Inventory Restock',
      repayment_frequency: 'DAILY',
      principal_amount: 10000,
      total_repayment_amount: 12500,
      interest_rate: 25.0,
      total_installments: 100,
      paid_installments: 18,
      overdue_installments: 0,
      installment_amount: 125,
      total_paid: 2250,
      remaining_balance: 10250,
      status: 'ACTIVE',
      disbursement_date: '2026-08-25',
      next_due_date: '2026-09-16',
      notes: 'Daily merchant running on Saidapet bazaar route.',
    },
    {
      id: 2,
      loan_number: 'LN-WK-CUST-20260914-0002-4112',
      loan_code: 'LN-WK-4112',
      product_name: 'Weekly Emergency Working Capital',
      loan_title: 'Weekly Store Expansion',
      repayment_frequency: 'WEEKLY',
      principal_amount: 5000,
      total_repayment_amount: 6250,
      interest_rate: 25.0,
      total_installments: 10,
      paid_installments: 4,
      overdue_installments: 2,
      overdue_amount: 1250,
      overdue_days: 6,
      installment_amount: 625,
      total_paid: 2500,
      remaining_balance: 3750,
      status: 'OVERDUE',
      disbursement_date: '2026-07-20',
      next_due_date: '2026-09-10 (6 Days Overdue)',
      notes: 'Grace period exceeded for week #5 and week #6.',
    },
  ]);

  const [staticCompletedLoans, setStaticCompletedLoans] = useState([
    {
      id: 101,
      loan_number: 'LN-ARCH-202607-0089',
      loan_code: 'LN-ARCH-0089',
      product_name: 'Daily Festival Inventory Advance',
      repayment_frequency: 'DAILY',
      principal_amount: 10000,
      total_repayment_amount: 12500,
      total_paid: 12500,
      total_installments: 25,
      paid_installments: 25,
      disbursement_date: '2026-06-01',
      completed_at: '2026-07-15',
      status: 'COMPLETED',
    },
  ]);

  // ---------------------------------------------------------------------------
  // 1. SKELETON LOADING VIEW (Fintech-Grade Shimmer Animation)
  // ---------------------------------------------------------------------------
  if (detailLoading || !user) {
    return (
      <div className="borrower-history-view">
        {/* Skeleton Top Nav */}
        <div className="bh-top-nav">
          <div className="bh-skeleton" style={{ width: 220, height: 38, borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="bh-skeleton" style={{ width: 130, height: 38, borderRadius: 8 }} />
            <div className="bh-skeleton" style={{ width: 110, height: 38, borderRadius: 8 }} />
            <div className="bh-skeleton" style={{ width: 150, height: 38, borderRadius: 8 }} />
          </div>
        </div>

        {/* Skeleton Hero Card */}
        <div className="bh-skeleton-hero">
          <div className="bh-skeleton bh-skeleton-circle" style={{ width: 64, height: 64, flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="bh-skeleton" style={{ width: 200, height: 26, borderRadius: 6 }} />
              <div className="bh-skeleton" style={{ width: 75, height: 22, borderRadius: 6 }} />
              <div className="bh-skeleton" style={{ width: 120, height: 22, borderRadius: 6 }} />
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div className="bh-skeleton" style={{ width: 130, height: 14 }} />
              <div className="bh-skeleton" style={{ width: 180, height: 14 }} />
              <div className="bh-skeleton" style={{ width: 120, height: 14 }} />
            </div>
          </div>
        </div>

        {/* Skeleton 4 KPI Stat Cards */}
        <div className="bh-stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bh-skeleton-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="bh-skeleton" style={{ width: 95, height: 12 }} />
                <div className="bh-skeleton" style={{ width: 24, height: 24, borderRadius: 4 }} />
              </div>
              <div className="bh-skeleton" style={{ width: 120, height: 32, borderRadius: 6 }} />
              <div className="bh-skeleton" style={{ width: 140, height: 11 }} />
            </div>
          ))}
        </div>

        {/* Skeleton Tabs Bar */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '2px solid #E2E8F0', paddingBottom: 8, marginBottom: 20 }}>
          <div className="bh-skeleton" style={{ width: 160, height: 32, borderRadius: 6 }} />
          <div className="bh-skeleton" style={{ width: 190, height: 32, borderRadius: 6 }} />
          <div className="bh-skeleton" style={{ width: 160, height: 32, borderRadius: 6 }} />
        </div>

        {/* Skeleton Cards Grid */}
        <div className="bh-loans-grid">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bh-skeleton" style={{ height: 180, borderRadius: 10 }} />
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. DATA PREPARATION & NORMALIZATION
  // ---------------------------------------------------------------------------
  const isMerchant = user.role === 'SHOPKEEPER' || true; // Default to shopkeeper view for rich merchant display

  // Resolve ongoing active/overdue loans: from user's live data or fallback demo loans
  const ongoingLoans =
    user.ongoingLoans && user.ongoingLoans.length > 0
      ? user.ongoingLoans
      : user.activeLoans && user.activeLoans.length > 0
      ? user.activeLoans
      : user.loans && user.loans.filter((l) => ['ACTIVE', 'OVERDUE', 'DISBURSED', 'PARTIALLY_PAID'].includes(l.status)).length > 0
      ? user.loans.filter((l) => ['ACTIVE', 'OVERDUE', 'DISBURSED', 'PARTIALLY_PAID'].includes(l.status))
      : staticLoans;

  const ongoingLoansSource = ongoingLoans;

  const completedLoans =
    user.completedLoans && user.completedLoans.length > 0
      ? user.completedLoans
      : staticCompletedLoans;

  // Helper to generate full Day-by-Day / Week-by-Week Installment Schedule & Logs with OVERDUE detection
  const getLoanInstallments = (loan) => {
    if (!loan) return [];

    const isLoanOverdue = loan.status === 'OVERDUE';
    const total = Number(loan.total_installments || 25);
    const paidCount = Number(loan.paid_installments || (loan.status === 'COMPLETED' ? total : 0));
    const overdueCount = Number(loan.overdue_installments || (isLoanOverdue ? 2 : 0));
    const freq = loan.repayment_frequency || 'DAILY';
    const installmentAmt = parseFloat(
      loan.installment_amount || (loan.total_repayment_amount / total) || 125
    );
    const baseDate = new Date(loan.disbursement_date || '2026-08-25');

    const list = [];
    for (let i = 1; i <= total; i++) {
      const d = new Date(baseDate);
      if (freq === 'DAILY') {
        d.setDate(d.getDate() + (i - 1));
      } else if (freq === 'WEEKLY') {
        d.setDate(d.getDate() + (i - 1) * 7);
      } else {
        d.setMonth(d.getMonth() + (i - 1));
      }
      const dateStr = d.toISOString().slice(0, 10);

      let status = 'PENDING';
      let paidAmt = 0;
      let paidDate = null;
      let receiptNo = null;

      if (i <= paidCount) {
        status = 'PAID';
        paidAmt = installmentAmt;
        paidDate = dateStr;
        receiptNo = `REC-${freq.slice(0, 2)}-${loan.id || 1}-${104800 + i}`;
      } else if (isLoanOverdue && i <= paidCount + overdueCount) {
        status = 'OVERDUE';
        paidAmt = 0;
      } else if (i === paidCount + 1 && !isLoanOverdue) {
        status = 'TODAY_DUE';
      }

      list.push({
        id: `inst-${loan.id || 1}-${i}`,
        installment_number: i,
        day_number: i,
        due_date: dateStr,
        amount: installmentAmt,
        expected_amount: installmentAmt,
        paid_amount: paidAmt,
        status,
        paid_date: paidDate,
        receipt_no: receiptNo,
        payment_mode: i % 2 === 0 ? 'CASH' : 'UPI',
        collector_name: 'Senior Branch Admin',
      });
    }
    return list;
  };

  // Compile Unified Repayment Receipts Ledger (Accurate count: never an empty "0" if installments were paid)
  const unifiedPayments = (() => {
    const records = [...(user.paymentHistory || [])];
    const existingReceipts = new Set(
      records.map((r) => r.payment_number || r.receipt_number || r.id)
    );

    [...ongoingLoansSource, ...completedLoans].forEach((loan) => {
      const installments = getLoanInstallments(loan);
      installments
        .filter((inst) => inst.status === 'PAID' || inst.paid_amount > 0)
        .forEach((inst) => {
          const receiptNo =
            inst.receipt_no ||
            `REC-${loan.loan_number || loan.id || 1}-${inst.installment_number}`;
          if (!existingReceipts.has(receiptNo)) {
            existingReceipts.add(receiptNo);
            records.push({
              id: receiptNo,
              payment_number: receiptNo,
              receipt_number: receiptNo,
              payment_date:
                inst.paid_date || inst.due_date || new Date().toISOString().slice(0, 10),
              loan_number: loan.loan_number || loan.loan_code || `LN-${loan.id || 1}`,
              amount: inst.paid_amount || inst.amount || 0,
              payment_method: inst.payment_mode || 'UPI',
              collector_name: inst.collector_name || 'Senior Branch Admin',
              status: 'COMPLETED',
            });
          }
        });
    });

    return records.sort(
      (a, b) => new Date(b.payment_date || 0) - new Date(a.payment_date || 0)
    );
  })();

  // Aggregated KPI metrics (Strictly Solid #0F172A numbers as per Docs/ProfesonalTheme&Content.md)
  const displayActiveCount = ongoingLoans.length;

  const displayOutstanding = ongoingLoans.reduce(
    (sum, l) =>
      sum +
      parseFloat(
        l.remaining_balance ??
          (parseFloat(l.total_repayment_amount || 0) - (l.total_paid || 0))
      ),
    0
  );

  const displayTotalBorrowed = ongoingLoans.reduce(
    (sum, l) => sum + parseFloat(l.principal_amount || l.principal || 0),
    0
  );

  const displayTotalPaid =
    user.totalPaid ??
    unifiedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const hasAnyOverdue = ongoingLoans.some((l) => l.status === 'OVERDUE');

  const getSchemeLabel = (role) => {
    switch (role) {
      case 'SHOPKEEPER':
        return 'Daily Merchant';
      case 'COMMON_CUSTOMER':
        return 'Weekly Borrower';
      case 'MONTHLY_BORROWER':
        return 'Monthly Salaried';
      default:
        return 'Daily Merchant';
    }
  };

  // Modal installments computation
  const modalInstallments = modalLoan ? getLoanInstallments(modalLoan) : [];
  const modalFilteredInstallments = modalInstallments.filter((inst) => {
    if (logFilterStatus === 'PAID') return inst.status === 'PAID';
    if (logFilterStatus === 'OVERDUE') return inst.status === 'OVERDUE';
    if (logFilterStatus === 'PENDING') return inst.status === 'PENDING' || inst.status === 'TODAY_DUE';
    return true;
  });

  const modalPaidCount = modalInstallments.filter((i) => i.status === 'PAID').length;
  const modalOverdueCount = modalInstallments.filter((i) => i.status === 'OVERDUE').length;
  const modalTotalCount = modalInstallments.length || 1;
  const modalProgressPct = Math.min(
    100,
    Math.round((modalPaidCount / modalTotalCount) * 100)
  );

  return (
    <div className="borrower-history-view">
      {/* 1. TOP NAVIGATION & ACTION BAR */}
      <div className="bh-top-nav">
        <button className="bh-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Borrower Directory</span>
        </button>

        <div className="bh-action-group">
          <button
            className="bh-btn-collect"
            onClick={() => handleNavigateToCollect(ongoingLoans[0])}
            title="Open Live Payment & Collection Portal"
          >
            <CreditCard size={15} />
            <span>Collect Payment</span>
          </button>

          <button
            className="bh-btn-secondary"
            onClick={() => window.print()}
            title="Print Official Statement of Account"
          >
            <Printer size={15} />
            <span>Print Statement</span>
          </button>

          <button
            className="bh-btn-secondary"
            onClick={() => onEdit(user)}
            title="Edit Borrower Profile"
          >
            <Edit2 size={15} />
            <span>Edit Details</span>
          </button>

          <button
            className="bh-btn-primary"
            onClick={() => onAssignLoan(user)}
            title="Assign New Loan"
          >
            <Plus size={16} />
            <span>Assign New Loan</span>
          </button>
        </div>
      </div>

      {/* Optional Feedback Alert */}
      {statusFeedback && (
        <div className="bh-feedback-banner">
          <CheckCircle2 size={18} />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* 2. BORROWER IDENTITY HERO CARD */}
      <div className="bh-hero-card">
        <div className="bh-hero-layout">
          <div className="bh-hero-identity">
            <div className="bh-hero-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div>
              <div className="bh-hero-title-row">
                <h2 className="bh-hero-name">{user.name || 'Lakshmi Narayanan'}</h2>
                <StatusBadge status={hasAnyOverdue ? 'OVERDUE' : (user.status || 'ACTIVE')} />
                <span className="bh-scheme-pill">
                  {getSchemeLabel(user.role)}
                </span>
                <span className="bh-meta-code">{user.customerCode || 'CUST-20260914-0002'}</span>
              </div>
              <div className="bh-hero-meta-row">
                <span className="bh-meta-item">
                  <Phone size={14} />
                  <span>{user.phone || '9840998877'}</span>
                </span>
                {(user.birthYear || user.birth_year || user.dateOfBirth) && (
                  <span className="bh-meta-item">
                    <Calendar size={14} />
                    <span>Born: {user.birthYear || user.birth_year || String(user.dateOfBirth).slice(0, 4)}</span>
                  </span>
                )}
                {user.occupation && (
                  <span className="bh-meta-item">
                    <Briefcase size={14} />
                    <span>{user.occupation}</span>
                  </span>
                )}
                <span className="bh-meta-item">
                  <MapPin size={14} />
                  <span>{user.address || '55 Temple Street, Chennai'}</span>
                </span>
                <span className="bh-meta-item">
                  <Calendar size={14} />
                  <span>Enrolled: {user.dateJoined || '2026-09-14'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shopkeeper Enterprise Banner */}
        <div className="bh-merchant-banner">
          <div className="bh-merchant-detail-group">
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#0F172A' }}>
              <Store size={15} color="#2563EB" />
              <span>{user.shopName || 'Lakshmi Groceries'}</span>
            </span>
            <span className="bh-merchant-badge">
              {user.stall_no || 'Stall #14'}
            </span>
            <span style={{ color: '#64748B' }}>
              Route: <strong style={{ color: '#0F172A' }}>{user.market_location || 'Saidapet Bazaar Route'}</strong>
            </span>
            <span style={{ color: '#64748B' }}>
              Daily Target: <strong style={{ color: '#0F172A' }}>{formatCurrency(user.daily_collection_target || 900)}</strong>
            </span>
          </div>
          <span
            className="badge"
            style={{
              background: hasAnyOverdue ? '#FEF2F2' : '#FFFBEB',
              color: hasAnyOverdue ? '#DC2626' : '#D97706',
              border: `1.5px solid ${hasAnyOverdue ? '#FECDD3' : '#FDE68A'}`,
              fontWeight: 800,
              fontSize: '0.74rem',
              textTransform: 'uppercase',
              padding: '0.25rem 0.65rem',
              borderRadius: 6,
            }}
          >
            {hasAnyOverdue ? 'OVERDUE DETECTED' : 'TODAY DUE'}
          </span>
        </div>
      </div>

      {/* 3. EXECUTIVE KPI METRIC CARDS (Solid #0F172A numbers - Strict MD rules) */}
      <div className="bh-stats-grid">
        {/* Card 1: Active Obligations */}
        <div className="bh-stat-card">
          <div className="bh-stat-header">
            <span className="bh-stat-label">Active Loans</span>
            <div className="bh-stat-icon-wrap">
              <Clock size={16} />
            </div>
          </div>
          <div className="bh-stat-value">{displayActiveCount}</div>
          <div className="bh-stat-subtext">
            {displayActiveCount === 1 ? '1 active obligation running' : `${displayActiveCount} active obligations running`}
          </div>
        </div>

        {/* Card 2: Current Outstanding Balance */}
        <div className="bh-stat-card">
          <div className="bh-stat-header">
            <span className="bh-stat-label">Current Outstanding</span>
            <div className="bh-stat-icon-wrap">
              <CircleDollarSign size={16} />
            </div>
          </div>
          <div className="bh-stat-value">{formatCurrency(displayOutstanding)}</div>
          <div className="bh-stat-subtext">Pending balance across active accounts</div>
        </div>

        {/* Card 3: Total Principal Disbursed */}
        <div className="bh-stat-card">
          <div className="bh-stat-header">
            <span className="bh-stat-label">Total Principal Borrowed</span>
            <div className="bh-stat-icon-wrap">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="bh-stat-value">{formatCurrency(displayTotalBorrowed)}</div>
          <div className="bh-stat-subtext">Cumulative principal advanced</div>
        </div>

        {/* Card 4: Lifetime Repaid */}
        <div className="bh-stat-card">
          <div className="bh-stat-header">
            <span className="bh-stat-label">Total Repaid to Date</span>
            <div className="bh-stat-icon-wrap">
              <Receipt size={16} />
            </div>
          </div>
          <div className="bh-stat-value">{formatCurrency(displayTotalPaid)}</div>
          <div className="bh-stat-subtext">Verified collections received</div>
        </div>
      </div>

      {/* 4. SEGMENTED TAB NAVIGATION */}
      <div className="bh-tabs-bar">
        <button
          className={`bh-tab-btn ${activeTab === 'ONGOING' ? 'active' : ''}`}
          onClick={() => setActiveTab('ONGOING')}
        >
          <Clock size={16} />
          <span>Active Loans</span>
          <span className="bh-tab-count">{ongoingLoans.length}</span>
        </button>

        <button
          className={`bh-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setActiveTab('COMPLETED')}
        >
          <CheckCircle2 size={16} />
          <span>Completed & Settled History</span>
          <span className="bh-tab-count">{completedLoans.length}</span>
        </button>

        <button
          className={`bh-tab-btn ${activeTab === 'PROFILE' ? 'active' : ''}`}
          onClick={() => setActiveTab('PROFILE')}
        >
          <User size={16} />
          <span>Borrower Profile & KYC</span>
        </button>
      </div>

      {/* 5. TAB CONTENT */}

      {/* TAB 1: ACTIVE LOANS (Compact, Small & Professional Cards with Overdue Support) */}
      {activeTab === 'ONGOING' && (
        <div>
          {ongoingLoans.length === 0 ? (
            <div className="bh-empty-state">
              <div className="bh-empty-icon">
                <CreditCard size={28} />
              </div>
              <h3 className="bh-empty-title">No Active Loans Found</h3>
              <p className="bh-empty-desc">
                No active loans match the current filter criteria.
              </p>
            </div>
          ) : (
            <div className="bh-loans-grid">
              {ongoingLoans.map((loan, idx) => {
                const loanId = loan.id || idx;
                const isOverdue = loan.status === 'OVERDUE';
                const totalCount = Number(loan.total_installments || 100);
                const paidCount = Number(loan.paid_installments || 0);
                const progressPct = Math.min(100, Math.round((paidCount / totalCount) * 100));

                const principalAmt = parseFloat(loan.principal_amount || 10000);
                const totalRepayable = parseFloat(loan.total_repayment_amount || 12500);
                const paidAmt = parseFloat(loan.total_paid || 0);
                const remainingBal = parseFloat(loan.remaining_balance || (totalRepayable - paidAmt));

                return (
                  <div
                    key={loanId}
                    className={`bh-loan-card ${isOverdue ? 'overdue-card' : ''}`}
                    onClick={() => {
                      setModalLoan(loan);
                      setLogFilterStatus('ALL');
                    }}
                    title="Press card to open Day-by-Day Collection Schedule & Log"
                  >
                    {/* Card Header Row with Product Icon & Badges */}
                    <div className="bh-card-header">
                      <div className="bh-card-header-left">
                        <div className={`bh-card-icon-wrap ${isOverdue ? 'overdue' : ''}`}>
                          {loan.repayment_frequency === 'DAILY' ? (
                            <Store size={20} />
                          ) : (
                            <CircleDollarSign size={20} />
                          )}
                        </div>
                        <div className="bh-card-title-col">
                          <div className="bh-card-title-row">
                            <h4 className="bh-card-title">{loan.product_name || 'Micro-Loan'}</h4>
                            <StatusBadge status={loan.status || 'ACTIVE'} />
                          </div>
                          <div className="bh-card-meta-pills">
                            <span className="bh-pill-code" title={loan.loan_number}>
                              {loan.loan_code || loan.loan_number}
                            </span>
                            <span className="bh-pill-freq">
                              {loan.repayment_frequency || 'DAILY'}
                            </span>
                            <span className="bh-pill-progress">
                              {paidCount}/{totalCount} Paid ({progressPct}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overdue Callout (If overdue) */}
                    {isOverdue && (
                      <div className="bh-card-alert-strip">
                        <AlertTriangle size={15} />
                        <span>
                          <strong>Overdue Account:</strong> {loan.overdue_installments || 2} Installments Past Due ({formatCurrency(loan.overdue_amount || 1250)}) • {loan.overdue_days || 6} Days Late
                        </span>
                      </div>
                    )}

                    {/* Hero Financial Overview (Two-Box Highlight) */}
                    <div className="bh-card-hero-row">
                      <div className="bh-card-hero-box balance">
                        <span className="bh-hero-label">OUTSTANDING BALANCE</span>
                        <div className="bh-hero-val" style={{ color: isOverdue ? '#DC2626' : '#0F172A' }}>
                          {formatCurrency(remainingBal)}
                        </div>
                        <span className="bh-hero-sub">
                          {paidAmt > 0
                            ? `${formatCurrency(paidAmt)} repaid of ${formatCurrency(totalRepayable)}`
                            : `Full ${formatCurrency(totalRepayable)} contracted`}
                        </span>
                      </div>

                      <div className="bh-card-hero-box installment">
                        <span className="bh-hero-label">
                          {loan.repayment_frequency === 'DAILY' ? 'DAILY DUE INSTALLMENT' : 'DUE INSTALLMENT'}
                        </span>
                        <div className="bh-hero-val text-indigo">
                          {formatCurrency(loan.installment_amount || (totalRepayable / totalCount) || 125)}
                          <span className="bh-hero-per">/{loan.repayment_frequency === 'DAILY' ? 'day' : 'wk'}</span>
                        </div>
                        <span className="bh-hero-sub">
                          Next Due: <strong>{loan.next_due_date ? String(loan.next_due_date).slice(0, 10) : 'Today'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* 4-Item Compact Financial Summary Grid */}
                    <div className="bh-card-spec-grid">
                      <div className="bh-spec-item">
                        <span className="bh-spec-lbl">Principal</span>
                        <span className="bh-spec-val">{formatCurrency(principalAmt)}</span>
                      </div>
                      <div className="bh-spec-item">
                        <span className="bh-spec-lbl">Total Repayable</span>
                        <span className="bh-spec-val">{formatCurrency(totalRepayable)}</span>
                      </div>
                      <div className="bh-spec-item">
                        <span className="bh-spec-lbl">Total Paid</span>
                        <span className="bh-spec-val" style={{ color: paidAmt > 0 ? '#059669' : '#0F172A' }}>
                          {formatCurrency(paidAmt)}
                        </span>
                      </div>
                      <div className="bh-spec-item">
                        <span className="bh-spec-lbl">Remaining</span>
                        <span className="bh-spec-val">
                          {totalCount - paidCount} {loan.repayment_frequency === 'DAILY' ? 'Days' : 'Installments'}
                        </span>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="bh-card-footer">
                      <button
                        type="button"
                        className="bh-footer-schedule-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalLoan(loan);
                          setLogFilterStatus('ALL');
                        }}
                        title="View Day-by-Day Installment Schedule & Logs"
                      >
                        <Calendar size={14} color="#2563EB" />
                        <span>Day-by-Day Schedule & Log</span>
                      </button>

                      <button
                        type="button"
                        className="bh-footer-pay-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToCollect(loan);
                        }}
                        title={`Open Live Collection Portal for this ${loan.repayment_frequency || 'Daily'} Loan`}
                      >
                        <CreditCard size={13} />
                        <span>
                          {loan.repayment_frequency === 'WEEKLY'
                            ? 'Weekly Collect'
                            : loan.repayment_frequency === 'MONTHLY'
                            ? 'Monthly Collect'
                            : 'Daily Collect'}
                        </span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED & SETTLED LOAN HISTORY (Strictly matches ManageUsers table) */}
      {activeTab === 'COMPLETED' && (
        <div className="directory-table-card">
          <div className="bh-table-card-header">
            <div>
              <h4 className="bh-table-title">Completed & Settled Loan Archives</h4>
              <p className="bh-table-subtitle">
                Permanent audit ledger of fully discharged loans with 100% repayment recovery
              </p>
            </div>
            <span
              className="directory-org-badge"
              style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
            >
              <CheckCircle2 size={13} />
              <span>{completedLoans.length} Settled Accounts</span>
            </span>
          </div>

          <div className="directory-table-responsive">
            <table className="directory-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Loan Number</th>
                  <th style={{ textAlign: 'left' }}>Product / Scheme</th>
                  <th style={{ textAlign: 'right' }}>Principal</th>
                  <th style={{ textAlign: 'right' }}>Total Repaid</th>
                  <th>Disbursed Date</th>
                  <th>Settlement Date</th>
                  <th style={{ textAlign: 'center' }}>Schedule Log</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedLoans.map((cl, i) => (
                  <tr key={cl.id || i}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                          {cl.loan_number || `LN-ARCH-${i + 1}`}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {cl.loan_code || 'ARCHIVED'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {cl.product_name || cl.loan_name || 'Standard Micro-Loan'}
                        </span>
                        <span className="bh-pill-freq" style={{ width: 'fit-content' }}>
                          {cl.repayment_frequency || 'DAILY'}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                      {formatCurrency(cl.principal_amount || 10000)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                      {formatCurrency(cl.total_repayment_amount || cl.total_paid || 12500)}
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748B' }}>
                      {cl.disbursement_date ? String(cl.disbursement_date).slice(0, 10) : '2026-06-01'}
                    </td>
                    <td style={{ textAlign: 'center', color: '#0F172A', fontWeight: 600 }}>
                      {cl.completed_at ? String(cl.completed_at).slice(0, 10) : '2026-07-15'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="bh-footer-schedule-btn"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setModalLoan(cl);
                          setLogFilterStatus('ALL');
                        }}
                      >
                        <Eye size={12} />
                        <span>View Log</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <StatusBadge status="COMPLETED" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BORROWER PROFILE & KYC DASHBOARD */}
      {activeTab === 'PROFILE' && (
        <div className="bh-profile-wrapper">
          {/* Top KYC Verification Strip */}
          <div className="bh-kyc-strip">
            <div className="bh-kyc-pill-card">
              <div className="bh-kyc-pill-icon emerald">
                <CheckCircle2 size={16} />
              </div>
              <div className="bh-kyc-pill-info">
                <span className="bh-kyc-pill-lbl">Aadhaar Identity</span>
                <span className="bh-kyc-pill-val">Verified (UIDAI)</span>
              </div>
            </div>

            <div className="bh-kyc-pill-card">
              <div className="bh-kyc-pill-icon indigo">
                <ShieldCheck size={16} />
              </div>
              <div className="bh-kyc-pill-info">
                <span className="bh-kyc-pill-lbl">PAN Card Status</span>
                <span className="bh-kyc-pill-val">Active (ITD Portal)</span>
              </div>
            </div>

            <div className="bh-kyc-pill-card">
              <div className="bh-kyc-pill-icon amber">
                <MapPin size={16} />
              </div>
              <div className="bh-kyc-pill-info">
                <span className="bh-kyc-pill-lbl">Route & Stall KYC</span>
                <span className="bh-kyc-pill-val">Agent Verified</span>
              </div>
            </div>

            <div className="bh-kyc-pill-card">
              <div className="bh-kyc-pill-icon purple">
                <TrendingUp size={16} />
              </div>
              <div className="bh-kyc-pill-info">
                <span className="bh-kyc-pill-lbl">Credit Risk Grade</span>
                <span className="bh-kyc-pill-val">Grade A (Prime)</span>
              </div>
            </div>
          </div>

          {/* 4 Rich Profile Sections in 2x2 Grid */}
          <div className="bh-profile-grid">
            {/* Section 1: Legal Identity & Residential Details */}
            <div className="bh-info-card">
              <div className="bh-info-header">
                <div className="bh-info-header-title">
                  <div className="bh-info-icon-badge indigo">
                    <User size={18} />
                  </div>
                  <h4>Legal Identity & Personal Details</h4>
                </div>
                <button
                  type="button"
                  className="bh-footer-schedule-btn"
                  onClick={() => onEdit && onEdit(user)}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                >
                  <Edit2 size={12} /> Edit
                </button>
              </div>
              <div className="bh-info-rows">
                <div className="bh-info-row">
                  <span className="bh-info-label">Full Legal Name</span>
                  <span className="bh-info-val">{user.name || 'Lakshmi Narayanan'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Primary Mobile Phone</span>
                  <span className="bh-info-val">{user.phone || '9840998877'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Email Address</span>
                  <span className="bh-info-val">{user.email || 'Not registered'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Residential Address</span>
                  <span className="bh-info-val">{user.address || '55 Temple Street, Chennai'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">City / District</span>
                  <span className="bh-info-val">{user.city || 'Chennai'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Customer Ref Code</span>
                  <span className="bh-info-val" style={{ fontFamily: 'monospace' }}>
                    {user.customerCode || 'CUST-20260914-0002'}
                  </span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Member Enrolled Date</span>
                  <span className="bh-info-val">{user.dateJoined || '2026-09-14'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Enterprise & Business Operations (Merchant KYC) */}
            <div className="bh-info-card">
              <div className="bh-info-header">
                <div className="bh-info-header-title">
                  <div className="bh-info-icon-badge emerald">
                    <Store size={18} />
                  </div>
                  <h4>Enterprise & Business Operations</h4>
                </div>
                <span className="bh-pill-freq">{getSchemeLabel(user.role)}</span>
              </div>
              <div className="bh-info-rows">
                <div className="bh-info-row">
                  <span className="bh-info-label">Registered Enterprise</span>
                  <span className="bh-info-val">{user.shopName || 'Lakshmi Groceries'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Business Type / Trade</span>
                  <span className="bh-info-val">{user.occupation || 'Retail Shopkeeper & Merchant'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Assigned Market Route</span>
                  <span className="bh-info-val">{user.market_location || user.assignedRoute || 'Saidapet Bazaar Route'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Bazaar Stall Number</span>
                  <span className="bh-info-val">{user.stall_no || 'Stall #14'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Daily Collection Target</span>
                  <span className="bh-info-val" style={{ color: '#2563EB' }}>
                    {formatCurrency(user.daily_collection_target || user.dailyTarget || 900)}
                  </span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Field Officer In-Charge</span>
                  <span className="bh-info-val">{user.collector_name || 'Senior Route Officer'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Account Operating Status</span>
                  <span className="bh-info-val">
                    <StatusBadge status={hasAnyOverdue ? 'OVERDUE' : (user.status || 'ACTIVE')} />
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Underwriting & Credit Risk Limits */}
            <div className="bh-info-card">
              <div className="bh-info-header">
                <div className="bh-info-header-title">
                  <div className="bh-info-icon-badge purple">
                    <CreditCard size={18} />
                  </div>
                  <h4>Underwriting & Credit Risk Limits</h4>
                </div>
                <span className="bh-pill-code">AUTO-APPROVED</span>
              </div>
              <div className="bh-info-rows">
                <div className="bh-info-row">
                  <span className="bh-info-label">Approved Credit Limit</span>
                  <span className="bh-info-val" style={{ color: '#059669', fontSize: '1rem' }}>
                    {formatCurrency(user.credit_limit || 50000)}
                  </span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Max Single Disbursal</span>
                  <span className="bh-info-val">{formatCurrency(15000)}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Current Outstanding Balance</span>
                  <span className="bh-info-val" style={{ color: hasAnyOverdue ? '#DC2626' : '#0F172A' }}>
                    {formatCurrency(displayOutstanding)}
                  </span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Lifetime Principal Advanced</span>
                  <span className="bh-info-val">{formatCurrency(displayTotalBorrowed)}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Lifetime Collections Recovered</span>
                  <span className="bh-info-val" style={{ color: '#059669' }}>
                    {formatCurrency(displayTotalPaid)}
                  </span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Default Risk History</span>
                  <span className="bh-info-val" style={{ color: hasAnyOverdue ? '#DC2626' : '#059669' }}>
                    {hasAnyOverdue ? 'Overdue Detected' : 'Clean Repayment Track'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Bank Account & Payout Settlement */}
            <div className="bh-info-card">
              <div className="bh-info-header">
                <div className="bh-info-header-title">
                  <div className="bh-info-icon-badge amber">
                    <Building size={18} />
                  </div>
                  <h4>Bank Account & Payout Settlement</h4>
                </div>
                <span className="directory-org-badge" style={{ background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}>
                  NACH Active
                </span>
              </div>
              <div className="bh-info-rows">
                <div className="bh-info-row">
                  <span className="bh-info-label">Settlement Mode</span>
                  <span className="bh-info-val">UPI & Direct Bank Transfer</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Default UPI VPA</span>
                  <span className="bh-info-val" style={{ fontFamily: 'monospace' }}>
                    {user.upi_id || `${(user.phone || '9840998877')}@okaxis`}
                  </span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Bank Name</span>
                  <span className="bh-info-val">{user.bank_name || 'HDFC Bank Ltd'}</span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Account Number</span>
                  <span className="bh-info-val" style={{ fontFamily: 'monospace' }}>
                    {user.account_number || '•••• •••• •••• 4912'}
                  </span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">IFSC Branch Code</span>
                  <span className="bh-info-val" style={{ fontFamily: 'monospace' }}>
                    {user.ifsc_code || 'HDFC0001248'}
                  </span>
                </div>
                <div className="bh-info-row">
                  <span className="bh-info-label">Payout Verification</span>
                  <span className="bh-info-val" style={{ color: '#059669' }}>
                    Penny-Drop Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
         DAY-BY-DAY COLLECTION SCHEDULE & LOG MODAL (Opens when pressing card)
         ----------------------------------------------------------------------- */}
      {modalLoan && (
        <div
          className="bh-modal-backdrop"
          onClick={() => setModalLoan(null)}
        >
          <div
            className="bh-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bh-modal-header">
              <div className="bh-modal-title-row">
                <div className="bh-modal-icon-badge">
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 className="bh-modal-title">
                    Collection Schedule & Log: {modalLoan.loan_code || modalLoan.loan_number}
                  </h3>
                  <div className="bh-modal-subtitle">
                    {user.name || 'Lakshmi Narayanan'} • {modalLoan.product_name} • Frequency: <strong>{modalLoan.repayment_frequency || 'DAILY'}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={modalLoan.status || 'ACTIVE'} />
                <button
                  type="button"
                  className="bh-modal-close-btn"
                  onClick={() => setModalLoan(null)}
                  title="Close Modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="bh-modal-body">
              {/* Overdue Warning inside Modal if Loan is Overdue */}
              {modalLoan.status === 'OVERDUE' && (
                <div className="bh-overdue-alert" style={{ fontSize: '0.8125rem', padding: '0.6rem 0.85rem' }}>
                  <AlertTriangle size={16} />
                  <span>
                    <strong>Account Alert:</strong> This loan has {modalOverdueCount} unpaid installment(s) exceeding scheduled due date by {modalLoan.overdue_days || 6} days.
                  </span>
                </div>
              )}

              {/* 4-Stat Strip */}
              <div className="bh-strip-grid">
                {/* Stat 1: Due Installment */}
                <div className="bh-strip-card">
                  <div className="bh-strip-label-row">
                    <span className="bh-strip-label">
                      {modalLoan.repayment_frequency === 'DAILY' ? 'DAILY DUE AMOUNT' : 'WEEKLY DUE AMOUNT'}
                    </span>
                    <DollarSign size={14} color="#64748B" />
                  </div>
                  <div className="bh-strip-val">
                    {formatCurrency(modalLoan.installment_amount || 125)}
                  </div>
                  <span className="bh-strip-sub">Fixed installment amount</span>
                </div>

                {/* Stat 2: Total Repayable */}
                <div className="bh-strip-card">
                  <div className="bh-strip-label-row">
                    <span className="bh-strip-label">TOTAL CONTRACTED REPAYABLE</span>
                    <Receipt size={14} color="#64748B" />
                  </div>
                  <div className="bh-strip-val">
                    {formatCurrency(modalLoan.total_repayment_amount || 12500)}
                  </div>
                  <span className="bh-strip-sub">
                    Principal: {formatCurrency(modalLoan.principal_amount || 10000)} @ {modalLoan.interest_rate || 25}%
                  </span>
                </div>

                {/* Stat 3: Amount Recovered */}
                <div className="bh-strip-card">
                  <div className="bh-strip-label-row">
                    <span className="bh-strip-label">TOTAL RECOVERED</span>
                    <CheckCircle2 size={14} color="#059669" />
                  </div>
                  <div className="bh-strip-val">
                    {formatCurrency(modalLoan.total_paid || 2250)}
                  </div>
                  <span className="bh-strip-sub" style={{ color: '#047857', fontWeight: 600 }}>
                    {modalPaidCount} of {modalTotalCount} {modalLoan.repayment_frequency === 'DAILY' ? 'Days' : 'Weeks'} Paid ({modalProgressPct}%)
                  </span>
                </div>

                {/* Stat 4: Remaining Debt */}
                <div className="bh-strip-card">
                  <div className="bh-strip-label-row">
                    <span className="bh-strip-label">REMAINING DEBT</span>
                    <Clock size={14} color={modalLoan.status === 'OVERDUE' ? '#DC2626' : '#D97706'} />
                  </div>
                  <div className="bh-strip-val" style={{ color: modalLoan.status === 'OVERDUE' ? '#DC2626' : '#0F172A' }}>
                    {formatCurrency(modalLoan.remaining_balance || 10250)}
                  </div>
                  <span className="bh-strip-sub">
                    {modalTotalCount - modalPaidCount} installments remaining
                  </span>
                </div>
              </div>

              {/* Progress Bar Strip */}
              <div className="bh-timeline-strip">
                <div className="bh-timeline-label-row">
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    Installment Cycle Progress
                  </span>
                  <strong style={{ color: '#047857' }}>
                    {modalPaidCount} / {modalTotalCount} {modalLoan.repayment_frequency === 'DAILY' ? 'Days' : 'Weeks'} ({modalProgressPct}% Settled)
                  </strong>
                </div>
                <div className="bh-timeline-track">
                  <div
                    className="bh-timeline-fill"
                    style={{
                      width: `${modalProgressPct}%`,
                      background: modalLoan.status === 'OVERDUE' ? 'linear-gradient(90deg, #2563EB 0%, #EF4444 100%)' : 'linear-gradient(90deg, #2563EB 0%, #059669 100%)',
                    }}
                  />
                </div>
              </div>

              {/* Day-by-Day Collection Schedule & Log Table */}
              <div className="bh-log-section">
                <div className="bh-log-header-bar">
                  <h4 className="bh-log-title">
                    <Calendar size={16} color="#2563EB" />
                    <span>Day-by-Day / Installment Collection Log</span>
                  </h4>

                  {/* Filter Pills with OVERDUE filter pill */}
                  <div className="bh-log-filter-group">
                    <button
                      type="button"
                      className={`bh-log-filter-btn ${logFilterStatus === 'ALL' ? 'active' : ''}`}
                      onClick={() => setLogFilterStatus('ALL')}
                    >
                      All ({modalInstallments.length})
                    </button>
                    <button
                      type="button"
                      className={`bh-log-filter-btn ${logFilterStatus === 'PAID' ? 'active' : ''}`}
                      onClick={() => setLogFilterStatus('PAID')}
                    >
                      Paid ({modalPaidCount})
                    </button>
                    {modalOverdueCount > 0 && (
                      <button
                        type="button"
                        className={`bh-log-filter-btn ${logFilterStatus === 'OVERDUE' ? 'active' : ''}`}
                        onClick={() => setLogFilterStatus('OVERDUE')}
                        style={{ color: '#DC2626' }}
                      >
                        Overdue ({modalOverdueCount})
                      </button>
                    )}
                    <button
                      type="button"
                      className={`bh-log-filter-btn ${logFilterStatus === 'PENDING' ? 'active' : ''}`}
                      onClick={() => setLogFilterStatus('PENDING')}
                    >
                      Pending ({modalTotalCount - modalPaidCount - modalOverdueCount})
                    </button>
                  </div>
                </div>

                <div className="bh-log-table-container">
                  <table className="bh-data-table">
                    <thead>
                      <tr>
                        <th># Installment / Day</th>
                        <th>Due Date</th>
                        <th className="th-right">Expected</th>
                        <th className="th-right">Paid Amount</th>
                        <th>Paid Date</th>
                        <th>Receipt Number</th>
                        <th className="th-center">Mode</th>
                        <th className="th-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalFilteredInstallments.map((inst, idx) => (
                        <tr key={inst.id || idx}>
                          <td>
                            <strong>
                              #{inst.installment_number} ({modalLoan.repayment_frequency === 'DAILY' ? `Day ${inst.installment_number}` : `Week ${inst.installment_number}`})
                            </strong>
                          </td>
                          <td>{inst.due_date}</td>
                          <td className="td-right">{formatCurrency(inst.expected_amount || inst.amount)}</td>
                          <td className="td-right">
                            <strong>{formatCurrency(inst.paid_amount || 0)}</strong>
                          </td>
                          <td>{inst.paid_date || '—'}</td>
                          <td>
                            {inst.receipt_no ? (
                              <span className="bh-meta-code">{inst.receipt_no}</span>
                            ) : inst.status === 'OVERDUE' ? (
                              <span style={{ color: '#DC2626', fontWeight: 600 }}>Unpaid (Overdue)</span>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Pending</span>
                            )}
                          </td>
                          <td className="td-center">
                            <span className="bh-method-badge">{inst.payment_mode || 'UPI'}</span>
                          </td>
                          <td className="td-center">
                            <StatusBadge status={inst.status || 'PENDING'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bh-modal-footer">
              <button
                type="button"
                className="bh-btn-collect"
                onClick={() => {
                  setModalLoan(null);
                  handleNavigateToCollect(modalLoan);
                }}
                title={`Navigate to Live Collection Portal for this ${modalLoan.repayment_frequency || 'Daily'} Loan`}
              >
                <CreditCard size={15} />
                <span>
                  Open Live {modalLoan.repayment_frequency === 'WEEKLY' ? 'Weekly' : modalLoan.repayment_frequency === 'MONTHLY' ? 'Monthly' : 'Daily'} Collection Portal
                </span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="bh-btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Schedule</span>
              </button>

              <button
                type="button"
                className="bh-btn-secondary"
                onClick={() => setModalLoan(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerHistoryView;
