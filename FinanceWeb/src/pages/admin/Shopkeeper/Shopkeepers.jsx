import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  Store,
  Search,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowRight,
  Clock,
  Calendar,
  Layers,
  CreditCard,
  Printer,
  RefreshCw,
  TrendingUp,
  X,
  LayoutGrid,
  List,
  Wallet,
  Building2,
  DollarSign,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export const Shopkeepers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();

  // State
  const [shopkeepers, setShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, COLLECTED
  const [tenureFilter, setTenureFilter] = useState('ALL'); // ALL, 25_DAYS, 50_DAYS, MULTI_CARD
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Daily Log Modal State
  const [selectedShopForModal, setSelectedShopForModal] = useState(null);
  const [activeLoanIdForModal, setActiveLoanIdForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL'); // ALL, PAID, PENDING

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const loadData = async (dateStr = selectedDate) => {
    setLoading(true);
    try {
      const params = {
        date: dateStr,
        ...(activeOrg ? { organizationId: activeOrg.id } : {}),
      };
      const data = await api.getShopkeepers(params);
      setShopkeepers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching shopkeepers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [activeOrg?.id, selectedDate]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tenureFilter, selectedDate]);

  // Handler to open Daily Log Modal
  const handleOpenDailyLog = (shop) => {
    setSelectedShopForModal(shop);
    const loans = shop.loans || shop.active_loans || [];
    if (loans.length > 0) {
      setActiveLoanIdForModal(loans[0].id);
    } else {
      setActiveLoanIdForModal('default-loan');
    }
    setModalFilterStatus('ALL');
  };

  // Helper to generate or fetch day-wise installment logs for the selected loan
  const getLoanInstallments = (loan, shop) => {
    if (!loan) {
      return Array.from({ length: 25 }, (_, idx) => {
        const dayNum = idx + 1;
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - (9 - dayNum));
        const dateStr = d.toISOString().slice(0, 10);
        const isPaid = dayNum <= 9;
        return {
          day_number: dayNum,
          due_date: dateStr,
          amount: shop?.daily_collection_target || 900,
          paid_amount: isPaid ? (shop?.daily_collection_target || 900) : 0,
          status: isPaid ? 'PAID' : (dateStr === selectedDate ? 'TODAY_DUE' : 'PENDING'),
          paid_date: isPaid ? dateStr : null,
          receipt_no: isPaid ? `REC-DLY-${104800 + dayNum}` : null,
          payment_mode: dayNum % 2 === 0 ? 'CASH' : 'UPI',
        };
      });
    }

    if (Array.isArray(loan.installments) && loan.installments.length > 0) {
      return loan.installments;
    }

    const total = loan.total_installments || 25;
    const paidCount = loan.paid_installments || (shop?.today_collection_status === 'COLLECTED' ? 10 : 9);
    const dailyAmt = loan.installment_amount || loan.daily_due || 900;
    const baseDate = new Date(loan.issue_date || '2026-09-01');

    const list = [];
    for (let i = 1; i <= total; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (i - 1));
      const dateStr = d.toISOString().slice(0, 10);
      const isDateToday = dateStr === selectedDate;

      let status = 'PENDING';
      let paidAmt = 0;
      let paidAt = null;
      let receiptNo = null;
      let mode = 'UPI';

      if (i <= paidCount) {
        status = 'PAID';
        paidAmt = dailyAmt;
        paidAt = dateStr;
        receiptNo = `REC-DLY-${104800 + i}`;
        mode = i % 2 === 0 ? 'CASH' : 'UPI';
      } else if (isDateToday && shop?.today_collection_status === 'COLLECTED') {
        status = 'PAID';
        paidAmt = dailyAmt;
        paidAt = dateStr;
        receiptNo = `REC-DLY-TODAY-${i}`;
        mode = 'UPI';
      } else if (isDateToday) {
        status = 'TODAY_DUE';
      }

      list.push({
        day_number: i,
        due_date: dateStr,
        amount: dailyAmt,
        paid_amount: paidAmt,
        status,
        paid_date: paidAt,
        receipt_no: receiptNo,
        payment_mode: mode,
      });
    }
    return list;
  };

  // Date Quick Selectors
  const setQuickDate = (offsetDays) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    setSelectedDate(target.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const isYesterday = (() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return selectedDate === y.toISOString().slice(0, 10);
  })();
  const isTomorrow = (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return selectedDate === t.toISOString().slice(0, 10);
  })();

  const formatDisplayDate = (dStr) => {
    try {
      const [year, month, day] = dStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  // Filter logic
  const filteredShops = shopkeepers.filter((shop) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      shop.name?.toLowerCase().includes(q) ||
      shop.shop_name?.toLowerCase().includes(q) ||
      shop.phone?.includes(q) ||
      shop.stall_no?.toLowerCase().includes(q) ||
      shop.market_location?.toLowerCase().includes(q) ||
      shop.customer_code?.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === 'ALL' || shop.today_collection_status === statusFilter;

    const activeLoans = shop.loans || shop.active_loans || [];
    const matchTenure =
      tenureFilter === 'ALL' ||
      (tenureFilter === 'MULTI_CARD' && activeLoans.length > 1) ||
      (tenureFilter === '25_DAYS' && activeLoans.some((l) => l.total_installments === 25)) ||
      (tenureFilter === '50_DAYS' && activeLoans.some((l) => l.total_installments === 50));

    return matchSearch && matchStatus && matchTenure;
  });

  // Aggregations
  const totalShops = shopkeepers.length;
  const totalDailyTarget = shopkeepers.reduce((s, sh) => s + (sh.daily_collection_target || 0), 0);
  const collectedShops = shopkeepers.filter((s) => s.today_collection_status === 'COLLECTED');
  const collectedCount = collectedShops.length;
  const collectedAmount = collectedShops.reduce((s, sh) => s + (sh.daily_collection_target || 0), 0);
  const pendingCount = totalShops - collectedCount;
  const pendingAmount = Math.max(0, totalDailyTarget - collectedAmount);
  const totalPortfolioOutstanding = shopkeepers.reduce((s, sh) => s + (sh.total_outstanding || 0), 0);
  const collectionRate = totalDailyTarget > 0 ? Math.round((collectedAmount / totalDailyTarget) * 100) : 0;

  // Pagination Calculations
  const totalItems = filteredShops.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedShops = filteredShops.slice(startIndex, endIndex);

  // Active Loan inside Daily Log Modal
  const modalActiveLoans = selectedShopForModal?.loans || selectedShopForModal?.active_loans || [];
  const modalCurrentLoan =
    modalActiveLoans.find((l) => l.id === activeLoanIdForModal) ||
    modalActiveLoans[0] || {
      id: 'default-loan',
      loan_code: selectedShopForModal ? `LN-DLY-${selectedShopForModal.customer_code || '001'}` : 'LN-DLY-001',
      loan_name: 'Daily Inventory Restock',
      principal: 20000,
      interest_rate: 12.5,
      total_installments: 25,
      paid_installments: selectedShopForModal?.today_collection_status === 'COLLECTED' ? 10 : 9,
      installment_amount: selectedShopForModal?.daily_collection_target || 900,
      daily_due: selectedShopForModal?.daily_collection_target || 900,
      remaining_balance: selectedShopForModal?.total_outstanding || 14400,
      issue_date: '2026-09-01',
      maturity_date: '2026-09-26',
    };

  const modalInstallments = getLoanInstallments(modalCurrentLoan, selectedShopForModal);
  const modalFilteredInstallments = modalInstallments.filter((inst) => {
    if (modalFilterStatus === 'PAID') return inst.status === 'PAID';
    if (modalFilterStatus === 'PENDING') return inst.status !== 'PAID';
    return true;
  });

  const modalTotalDays = modalCurrentLoan.total_installments || 25;
  const modalPaidDays = modalInstallments.filter((i) => i.status === 'PAID').length;
  const modalProgressPct = Math.min(100, Math.round((modalPaidDays / modalTotalDays) * 100));
  const modalRecoveredAmt = modalPaidDays * (modalCurrentLoan.installment_amount || 900);
  const modalTotalRepayable = modalTotalDays * (modalCurrentLoan.installment_amount || 900);
  const modalRemainingAmt = Math.max(0, modalTotalRepayable - modalRecoveredAmt);

  return (
    <div className="shopkeepers-page" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
      {/* 1. Header & Navigation Controls */}
      <div
        className="page-header"
        style={{
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              background: '#EEF2FF',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={22} />
          </div>
          <div>
            <h1
              className="page-title"
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Shopkeeper Daily Collections
            </h1>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
            title="Print Today's Collection Sheet"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 600 }}
          >
            <Printer size={15} />
            <span>Print Sheet</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate(getOrgPath('users'))}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 600 }}
          >
            <Users size={15} />
            <span>Manage Borrowers</span>
          </button>
        </div>
      </div>

      {/* 2. Clean Day-Wise Calendar Bar */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderRadius: 12,
          border: '1.5px solid #E2E8F0',
          background: '#FFFFFF',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.88rem',
            }}
          >
            <Calendar size={18} color="var(--primary)" />
            <span>Collection Date:</span>
          </div>

          <div
            style={{
              display: 'flex',
              background: '#F8FAFC',
              padding: 3,
              borderRadius: 8,
              border: '1px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${isYesterday ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, border: 'none' }}
              onClick={() => setQuickDate(-1)}
            >
              Yesterday
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isToday ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, border: 'none' }}
              onClick={() => setQuickDate(0)}
            >
              Today
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isTomorrow ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, border: 'none' }}
              onClick={() => setQuickDate(1)}
            >
              Tomorrow
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', fontWeight: 600, width: 155, borderRadius: 8, border: '1.5px solid #E2E8F0' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
              {formatDisplayDate(selectedDate)}
            </span>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => loadData(selectedDate)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 8, border: '1.5px solid #E2E8F0' }}
          title="Refresh live collection statuses"
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Sync Statuses</span>
        </button>
      </div>

      {/* 3. Financial KPI 4-Card Strip (Matching Screenshot & Admin Dashboard Style) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
          width: '100%',
        }}
      >
        {/* Stat 1: Total Route Target */}
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 12,
            padding: '1.15rem 1.35rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TOTAL ROUTE TARGET / SCHEDULED
            </span>
            <DollarSign size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0.25rem 0', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {loading ? <div className="skeleton-box" style={{ width: 90, height: 26, borderRadius: 4 }} /> : formatCurrency(totalDailyTarget)}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {loading ? <div className="skeleton-box" style={{ width: 140, height: 11, borderRadius: 3 }} /> : `Total principal due across ${totalShops} merchants on route`}
          </div>
        </div>

        {/* Stat 2: Total Repayments Collected */}
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 12,
            padding: '1.15rem 1.35rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TOTAL REPAYMENTS COLLECTED
            </span>
            <Receipt size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#047857', margin: '0.2rem 0 0.25rem 0', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {loading ? <div className="skeleton-box" style={{ width: 85, height: 26, borderRadius: 4 }} /> : formatCurrency(collectedAmount)}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {loading ? <div className="skeleton-box" style={{ width: 130, height: 11, borderRadius: 3 }} /> : <>Collected from <strong>{collectedCount}</strong> of <strong>{totalShops}</strong> shops ({collectionRate}% recovery)</>}
          </div>
        </div>

        {/* Stat 3: Pending Route Balance */}
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 12,
            padding: '1.15rem 1.35rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              PENDING ROUTE BALANCE (DUE)
            </span>
            <Clock size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#D97706', margin: '0.2rem 0 0.25rem 0', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {loading ? <div className="skeleton-box" style={{ width: 85, height: 26, borderRadius: 4 }} /> : formatCurrency(pendingAmount)}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {loading ? <div className="skeleton-box" style={{ width: 120, height: 11, borderRadius: 3 }} /> : <>Pending recovery from <strong>{pendingCount}</strong> shopkeepers</>}
          </div>
        </div>

        {/* Stat 4: Outstanding in Market */}
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 12,
            padding: '1.15rem 1.35rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              OUTSTANDING IN MARKET
            </span>
            <TrendingUp size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0.25rem 0', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {loading ? <div className="skeleton-box" style={{ width: 100, height: 26, borderRadius: 4 }} /> : formatCurrency(totalPortfolioOutstanding)}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {loading ? <div className="skeleton-box" style={{ width: 130, height: 11, borderRadius: 3 }} /> : `Total merchant exposure across all active loan cards`}
          </div>
        </div>
      </div>

      {/* 4. Sleek Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.85rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            flex: '1 1 300px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: 14, pointerEvents: 'none' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by shop name, proprietor, phone, stall #, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 40,
              paddingRight: searchTerm ? 36 : 14,
              height: 40,
              fontSize: '0.85rem',
              fontWeight: 500,
              borderRadius: 8,
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls & View Switcher */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Pills */}
          <div
            style={{
              display: 'flex',
              background: '#FFFFFF',
              padding: '0.15rem',
              borderRadius: 8,
              border: '1.5px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.35rem 0.75rem', border: 'none', borderRadius: 6 }}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({shopkeepers.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.35rem 0.75rem', border: 'none', borderRadius: 6 }}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'COLLECTED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.35rem 0.75rem', border: 'none', borderRadius: 6 }}
              onClick={() => setStatusFilter('COLLECTED')}
            >
              Collected ({collectedCount})
            </button>
          </div>

          {/* Category Filter */}
          <select
            className="form-input"
            style={{ width: 165, height: 40, fontSize: '0.82rem', fontWeight: 600, borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#FFFFFF' }}
            value={tenureFilter}
            onChange={(e) => setTenureFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="MULTI_CARD">2+ Active Cards</option>
            <option value="25_DAYS">25-Day Restock</option>
            <option value="50_DAYS">50-Day Capital</option>
          </select>

          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#FFFFFF',
              padding: '0.15rem',
              borderRadius: 8,
              border: '1.5px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem', border: 'none', borderRadius: 6 }}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem', border: 'none', borderRadius: 6 }}
              onClick={() => setViewMode('table')}
              title="Ledger Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Realistic Shimmer Skeleton Loading State */}
      {loading ? (
        viewMode === 'table' ? (
          /* Table View Shimmer Skeleton */
          <div
            className="card"
            style={{
              padding: 0,
              borderRadius: 12,
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
              overflow: 'hidden',
              width: '100%',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr
                    style={{
                      background: '#F8FAFC',
                      borderBottom: '1.5px solid #E2E8F0',
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <th style={{ padding: '0.95rem 1.25rem' }}>Shop & Merchant</th>
                    <th style={{ padding: '0.95rem 1rem' }}>Contact</th>
                    <th style={{ padding: '0.95rem 1rem' }}>Stall & Route</th>
                    <th style={{ padding: '0.95rem 1rem' }}>Active Cards</th>
                    <th style={{ padding: '0.95rem 1rem' }}>Daily Target</th>
                    <th style={{ padding: '0.95rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="skeleton-box" style={{ width: 38, height: 38, borderRadius: 8 }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className="skeleton-box" style={{ width: 140, height: 14, borderRadius: 4 }} />
                            <div className="skeleton-box" style={{ width: 90, height: 11, borderRadius: 4 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div className="skeleton-box" style={{ width: 100, height: 14, borderRadius: 4 }} />
                      </td>
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div className="skeleton-box" style={{ width: 130, height: 14, borderRadius: 4, marginBottom: 4 }} />
                        <div className="skeleton-box" style={{ width: 60, height: 10, borderRadius: 3 }} />
                      </td>
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div className="skeleton-box" style={{ width: 75, height: 22, borderRadius: 6 }} />
                      </td>
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div className="skeleton-box" style={{ width: 80, height: 18, borderRadius: 4 }} />
                      </td>
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div className="skeleton-box" style={{ width: 65, height: 22, borderRadius: 6 }} />
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                        <div className="skeleton-box" style={{ width: 85, height: 30, borderRadius: 6, marginLeft: 'auto' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card Grid Shimmer Skeleton */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.25rem',
              width: '100%',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: '1.35rem',
                  borderRadius: 12,
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div>
                  {/* Top: Avatar, Name & Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div className="skeleton-box" style={{ width: 42, height: 42, borderRadius: 10 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="skeleton-box" style={{ width: 130, height: 16, borderRadius: 4 }} />
                        <div className="skeleton-box" style={{ width: 85, height: 12, borderRadius: 4 }} />
                      </div>
                    </div>
                    <div className="skeleton-box" style={{ width: 60, height: 22, borderRadius: 6 }} />
                  </div>

                  {/* Contact & Location Strip */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 8,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="skeleton-box" style={{ width: 110, height: 13, borderRadius: 4 }} />
                      <div className="skeleton-box" style={{ width: 45, height: 13, borderRadius: 4 }} />
                    </div>
                    <div className="skeleton-box" style={{ width: '80%', height: 13, borderRadius: 4 }} />
                    <div style={{ paddingTop: 4, borderTop: '1px dashed #E2E8F0' }}>
                      <div className="skeleton-box" style={{ width: '60%', height: 13, borderRadius: 4 }} />
                    </div>
                  </div>
                </div>

                {/* Bottom: Due & Collect Button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.8rem',
                    borderTop: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className="skeleton-box" style={{ width: 50, height: 11, borderRadius: 3 }} />
                    <div className="skeleton-box" style={{ width: 80, height: 22, borderRadius: 4 }} />
                  </div>
                  <div className="skeleton-box" style={{ width: 95, height: 34, borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        )
      ) : totalItems === 0 ? (
        <div
          className="card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            borderRadius: 12,
            border: '1.5px solid #E2E8F0',
            background: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <Store size={38} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Merchants Found</h3>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem' }}>
            No shopkeeper records match your search or filter parameters for {selectedDate}.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* 6. Professional Ledger Table View */
        <div
          className="card"
          style={{
            padding: 0,
            borderRadius: 12,
            border: '1.5px solid #E2E8F0',
            background: '#FFFFFF',
            overflow: 'hidden',
            width: '100%',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr
                  style={{
                    background: '#F8FAFC',
                    borderBottom: '1.5px solid #E2E8F0',
                    color: 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '0.95rem 1.25rem' }}>Shop & Merchant</th>
                  <th style={{ padding: '0.95rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.95rem 1rem' }}>Stall & Route</th>
                  <th style={{ padding: '0.95rem 1rem' }}>Active Cards</th>
                  <th style={{ padding: '0.95rem 1rem' }}>Daily Target</th>
                  <th style={{ padding: '0.95rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShops.map((shop) => {
                  const isCollected = shop.today_collection_status === 'COLLECTED';
                  const activeLoans = shop.loans || shop.active_loans || [];
                  const loanCount = activeLoans.length || 1;

                  return (
                    <tr
                      key={shop.id}
                      onClick={() => handleOpenDailyLog(shop)}
                      style={{
                        borderBottom: '1px solid #E2E8F0',
                        transition: 'background-color 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      title="Click to view full Day-by-Day ledger log"
                    >
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 8,
                              background: '#EEF2FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--primary)',
                              fontWeight: 800,
                              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.12)',
                            }}
                          >
                            <Store size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                              {shop.shop_name || shop.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {shop.owner_name || shop.name} • <span style={{ color: 'var(--text-muted)' }}>{shop.customer_code}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.95rem 1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={13} color="var(--text-muted)" />
                          <span>{shop.phone}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem' }}>
                          <MapPin size={13} color="var(--text-muted)" />
                          <span>{shop.market_location || 'Saidapet Bazaar Route'}</span>
                        </div>
                        {shop.stall_no && (
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: 4,
                              color: '#4338CA',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: '#EEF2FF',
                              border: '1px solid #C7D2FE',
                              padding: '1px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {shop.stall_no}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            color: 'var(--primary)',
                            background: '#EEF2FF',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 6,
                            border: '1px solid #C7D2FE',
                          }}
                        >
                          <Layers size={12} />
                          {loanCount} Card{loanCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '0.95rem 1rem', fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        {formatCurrency(shop.daily_collection_target)}
                      </td>
                      <td style={{ padding: '0.95rem 1rem' }}>
                        <span
                          className="badge"
                          style={{
                            background: isCollected ? '#ECFDF5' : '#FFFBEB',
                            color: isCollected ? '#047857' : '#D97706',
                            border: `1.5px solid ${isCollected ? '#A7F3D0' : '#FDE68A'}`,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            padding: '0.28rem 0.65rem',
                            borderRadius: 6,
                          }}
                        >
                          {isCollected ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDailyLog(shop);
                            }}
                            title="Open Day-by-Day Log Modal"
                            style={{ padding: '0.45rem 0.65rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            <span>Daily Log</span>
                          </button>
                          <button
                            className={`btn ${isCollected ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(getOrgPath(`shopkeepers/${shop.id}/collect`), {
                                state: { shop, selectedDate },
                              });
                            }}
                            style={{
                              padding: '0.45rem 0.95rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: isCollected ? 'none' : '0 2px 8px rgba(79, 70, 229, 0.25)',
                            }}
                          >
                            <span>{isCollected ? 'View Details' : 'Collect'}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 7. Professional Shopkeeper Cards Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem',
            width: '100%',
          }}
        >
          {paginatedShops.map((shop) => {
            const isCollected = shop.today_collection_status === 'COLLECTED';
            const activeLoans = shop.loans || shop.active_loans || [];
            const loanCount = activeLoans.length || 1;

            return (
              <div
                key={shop.id}
                className="card"
                onClick={() => handleOpenDailyLog(shop)}
                style={{
                  padding: '1.35rem 1.4rem',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 12,
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.02)';
                }}
              >
                <div>
                  {/* Top: Store Name & Status Badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: '#EEF2FF',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                          boxShadow: '0 2px 6px rgba(79, 70, 229, 0.12)',
                          flexShrink: 0,
                        }}
                      >
                        <Store size={22} color="var(--primary)" />
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1.08rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {shop.shop_name || shop.name}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {shop.owner_name || shop.name} • <span style={{ color: 'var(--text-muted)' }}>{shop.customer_code}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className="badge"
                      style={{
                        background: isCollected ? '#ECFDF5' : '#FFFBEB',
                        color: isCollected ? '#047857' : '#D97706',
                        border: `1.5px solid ${isCollected ? '#A7F3D0' : '#FDE68A'}`,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        padding: '0.28rem 0.65rem',
                        borderRadius: 6,
                      }}
                    >
                      {isCollected ? 'PAID' : 'PENDING'}
                    </span>
                  </div>

                  {/* Contact & Location Box */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      background: '#F8FAFC',
                      padding: '0.85rem 1rem',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Phone size={13} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.88rem' }}>{shop.phone}</span>
                      {shop.stall_no && (
                        <span
                          style={{
                            color: '#4338CA',
                            marginLeft: 'auto',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.03em',
                            background: '#EEF2FF',
                            border: '1px solid #C7D2FE',
                            padding: '2px 8px',
                            borderRadius: 4,
                          }}
                        >
                          {shop.stall_no}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {shop.market_location || 'Saidapet Bazaar Route'}
                      </span>
                    </div>

                    {/* Active Cards Count Indicator */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        marginTop: 2,
                        paddingTop: 6,
                        borderTop: '1px dashed #E2E8F0',
                      }}
                    >
                      <Layers size={13} color="var(--primary)" />
                      <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.78rem' }}>
                        {loanCount} Active Loan Card{loanCount > 1 ? 's' : ''} Scheduled
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Click card to view daily log →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Daily Due & Collect Button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.8rem',
                    borderTop: '1px solid #E2E8F0',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Daily Due
                    </div>
                    <div
                      style={{
                        fontSize: '1.55rem',
                        fontWeight: 900,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                      }}
                    >
                      {formatCurrency(shop.daily_collection_target)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDailyLog(shop);
                      }}
                      title="View Day-by-Day Log"
                      style={{
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        borderRadius: 8,
                      }}
                    >
                      <span>Daily Log</span>
                    </button>
                    <button
                      className={`btn ${isCollected ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(getOrgPath(`shopkeepers/${shop.id}/collect`), {
                          state: { shop, selectedDate },
                        });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 1.15rem',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        borderRadius: 8,
                        boxShadow: isCollected ? 'none' : '0 2px 8px rgba(79, 70, 229, 0.25)',
                      }}
                    >
                      <span>{isCollected ? 'View Details' : 'Collect'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 8. Professional Pagination & Summary Bar */}
      {!loading && totalItems > 0 && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.9rem 1.4rem',
            borderRadius: 12,
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Left: Info Text */}
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Showing <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> -{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{endIndex}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{totalItems}</strong> merchants
          </div>

          {/* Center: Page Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {/* First Page */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                title="First Page"
                style={{ padding: '0.4rem 0.55rem', borderRadius: 8, fontSize: '0.8rem', border: '1.5px solid #E2E8F0' }}
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Previous Page */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                title="Previous Page"
                style={{ padding: '0.4rem 0.65rem', borderRadius: 8, fontSize: '0.8rem', border: '1.5px solid #E2E8F0' }}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let start = Math.max(1, validCurrentPage - 2);
                let end = Math.min(totalPages, start + maxVisible - 1);
                if (end - start < maxVisible - 1) {
                  start = Math.max(1, end - maxVisible + 1);
                }

                for (let p = start; p <= end; p++) {
                  pages.push(
                    <button
                      key={p}
                      type="button"
                      className={`btn ${p === validCurrentPage ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        width: 36,
                        height: 36,
                        padding: 0,
                        borderRadius: 8,
                        fontSize: '0.84rem',
                        fontWeight: p === validCurrentPage ? 800 : 600,
                        border: p === validCurrentPage ? 'none' : '1.5px solid #E2E8F0',
                        boxShadow: p === validCurrentPage ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
                      }}
                    >
                      {p}
                    </button>
                  );
                }
                return pages;
              })()}

              {/* Next Page */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                title="Next Page"
                style={{ padding: '0.4rem 0.65rem', borderRadius: 8, fontSize: '0.8rem', border: '1.5px solid #E2E8F0' }}
              >
                <ChevronRight size={16} />
              </button>

              {/* Last Page */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                title="Last Page"
                style={{ padding: '0.4rem 0.55rem', borderRadius: 8, fontSize: '0.8rem', border: '1.5px solid #E2E8F0' }}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          )}

          {/* Right: Page Size Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Per page:</span>
            <select
              className="form-input"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                width: 75,
                height: 34,
                padding: '0 0.5rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: 8,
                border: '1.5px solid #E2E8F0',
                background: '#FFFFFF',
              }}
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MERCHANT DAILY LOG & CARD LEDGER MODAL (EASY-TO-USE FOR BASIC ADMINS)  */}
      {/* ========================================================================= */}
      {selectedShopForModal && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedShopForModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            zIndex: 1200,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              width: 860,
              maxWidth: '96vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              overflow: 'hidden',
              border: '1.5px solid #E2E8F0',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.65rem',
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
                borderBottom: '1.5px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    background: '#FFFFFF',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.15)',
                    border: '1.5px solid #C7D2FE',
                  }}
                >
                  <Store size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      {selectedShopForModal.shop_name || selectedShopForModal.name}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 6,
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        color: 'var(--primary)',
                      }}
                    >
                      {modalActiveLoans.length} Active Card{modalActiveLoans.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 3, fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span>Proprietor: <strong style={{ color: 'var(--text-primary)' }}>{selectedShopForModal.owner_name || selectedShopForModal.name}</strong> ({selectedShopForModal.customer_code})</span>
                    {selectedShopForModal.stall_no && (
                      <span style={{ color: '#4338CA', fontWeight: 800, background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '1px 6px', borderRadius: 4, fontSize: '0.72rem' }}>
                        {selectedShopForModal.stall_no}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>• <MapPin size={13} color="#64748B" /> {selectedShopForModal.market_location || 'Saidapet Bazaar Route'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>• <Phone size={13} color="#64748B" /> <strong style={{ color: 'var(--text-primary)' }}>{selectedShopForModal.phone}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span
                  className="badge"
                  style={{
                    background: selectedShopForModal.today_collection_status === 'COLLECTED' ? '#ECFDF5' : '#FFFBEB',
                    color: selectedShopForModal.today_collection_status === 'COLLECTED' ? '#047857' : '#D97706',
                    border: `1.5px solid ${selectedShopForModal.today_collection_status === 'COLLECTED' ? '#A7F3D0' : '#FDE68A'}`,
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 6,
                  }}
                >
                  {selectedShopForModal.today_collection_status === 'COLLECTED' ? 'TODAY PAID' : 'TODAY DUE'}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedShopForModal(null)}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.65rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Active Loan Switcher Tabs */}
              {modalActiveLoans.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Active Loan Card:</span>
                  {modalActiveLoans.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={`btn btn-sm ${modalCurrentLoan?.id === l.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setActiveLoanIdForModal(l.id)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        borderRadius: 8,
                        border: modalCurrentLoan?.id === l.id ? 'none' : '1.5px solid #E2E8F0',
                      }}
                    >
                      <CreditCard size={13} />
                      <span>{l.loan_code} ({l.loan_name})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 4-Stat Box Strip (Matching Screenshot Aesthetic) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {/* Stat 1: Daily Installment Due */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '0.9rem 1.15rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      DAILY DUE AMOUNT
                    </span>
                    <DollarSign size={15} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                    {formatCurrency(modalCurrentLoan.installment_amount || modalCurrentLoan.daily_due)}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Fixed daily repayment
                  </span>
                </div>

                {/* Stat 2: Total Loan Value */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '0.9rem 1.15rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      TOTAL LOAN REPAYABLE
                    </span>
                    <Receipt size={15} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {formatCurrency(modalTotalRepayable)}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Principal: {formatCurrency(modalCurrentLoan.principal)} @ {modalCurrentLoan.interest_rate || 12.5}%
                  </span>
                </div>

                {/* Stat 3: Amount Recovered */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '0.9rem 1.15rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      TOTAL RECOVERED
                    </span>
                    <CheckCircle2 size={15} color="var(--emerald)" />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#047857', letterSpacing: '-0.02em' }}>
                    {formatCurrency(modalRecoveredAmt)}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600 }}>
                    {modalPaidDays} of {modalTotalDays} Days Paid ({modalProgressPct}%)
                  </span>
                </div>

                {/* Stat 4: Remaining Balance */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '0.9rem 1.15rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      REMAINING BALANCE
                    </span>
                    <Clock size={15} color="#D97706" />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#D97706', letterSpacing: '-0.02em' }}>
                    {formatCurrency(modalRemainingAmt)}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {modalTotalDays - modalPaidDays} Daily Installments left
                  </span>
                </div>
              </div>

              {/* Progress Timeline Bar */}
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 10,
                  border: '1.5px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    Installment Recovery Cycle Progress: <span style={{ color: 'var(--primary)' }}>{modalCurrentLoan.loan_code}</span>
                  </span>
                  <strong style={{ color: '#047857', fontWeight: 800 }}>
                    {modalPaidDays} / {modalTotalDays} Days ({modalProgressPct}% Completed)
                  </strong>
                </div>
                <div style={{ width: '100%', height: 9, background: '#E2E8F0', borderRadius: 5, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${modalProgressPct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #4F46E5 0%, #059669 100%)',
                      borderRadius: 5,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              {/* Day-Wise Repayment History Table & Log */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={16} color="var(--primary)" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Day-by-Day Collection Schedule & Log
                    </h4>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: 2, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${modalFilterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setModalFilterStatus('ALL')}
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem', fontWeight: 700, border: 'none' }}
                    >
                      All ({modalInstallments.length})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${modalFilterStatus === 'PAID' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setModalFilterStatus('PAID')}
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem', fontWeight: 700, border: 'none' }}
                    >
                      Paid ({modalPaidDays})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${modalFilterStatus === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setModalFilterStatus('PENDING')}
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem', fontWeight: 700, border: 'none' }}
                    >
                      Pending ({modalTotalDays - modalPaidDays})
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 10,
                    overflow: 'hidden',
                    maxHeight: 280,
                    overflowY: 'auto',
                    background: '#FFFFFF',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr
                        style={{
                          background: '#F8FAFC',
                          borderBottom: '1.5px solid #E2E8F0',
                          color: 'var(--text-secondary)',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          position: 'sticky',
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        <th style={{ padding: '0.65rem 1rem' }}>Day #</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Due Date</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Target</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Amount Paid</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Paid Date</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Mode</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.65rem 1rem' }}>Receipt Ref</th>
                        <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalFilteredInstallments.map((inst, idx) => {
                        const isPaid = inst.status === 'PAID';
                        const isTodayDue = inst.status === 'TODAY_DUE';

                        return (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: '1px solid #E2E8F0',
                              background: isTodayDue ? '#EEF2FF' : idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              Day {inst.day_number}
                            </td>
                            <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {inst.due_date}
                              {inst.due_date === selectedDate && (
                                <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, background: '#EEF2FF', padding: '1px 5px', borderRadius: 4 }}>
                                  Selected Date
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {formatCurrency(inst.amount)}
                            </td>
                            <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: isPaid ? '#047857' : 'var(--text-muted)' }}>
                              {isPaid ? formatCurrency(inst.paid_amount) : '₹0'}
                            </td>
                            <td style={{ padding: '0.65rem 1rem' }}>
                              {isPaid ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ECFDF5', color: '#047857', padding: '2px 7px', borderRadius: 6, fontWeight: 700, border: '1px solid #A7F3D0', fontSize: '0.75rem' }}>
                                  <CheckCircle2 size={12} color="#059669" />
                                  <span>{inst.paid_date || inst.due_date}</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '0.65rem 1rem' }}>
                              {isPaid ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4338CA', background: '#EEF2FF', padding: '1px 6px', borderRadius: 4 }}>
                                  {inst.payment_mode}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '0.65rem 1rem' }}>
                              <span
                                className="badge"
                                style={{
                                  background: isPaid ? '#ECFDF5' : isTodayDue ? '#EEF2FF' : '#FFFBEB',
                                  color: isPaid ? '#047857' : isTodayDue ? 'var(--primary)' : '#D97706',
                                  border: `1px solid ${isPaid ? '#A7F3D0' : isTodayDue ? '#C7D2FE' : '#FDE68A'}`,
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  letterSpacing: '0.04em',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: 4,
                                }}
                              >
                                {isPaid ? 'PAID' : isTodayDue ? "TODAY'S DUE" : 'PENDING'}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 1rem', color: isPaid ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 600 }}>
                              {inst.receipt_no || 'Uncollected'}
                            </td>
                            <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                              {isPaid ? (
                                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Settled</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const shopId = selectedShopForModal.id;
                                    setSelectedShopForModal(null);
                                    navigate(getOrgPath(`shopkeepers/collect/${shopId}`));
                                  }}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    background: 'var(--primary)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
                                  }}
                                >
                                  <span>Pay</span>
                                  <ArrowRight size={11} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1rem 1.65rem',
                background: '#F8FAFC',
                borderTop: '1.5px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 600, borderRadius: 8 }}
              >
                <Printer size={15} />
                <span>Print Ledger Statement</span>
              </button>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedShopForModal(null)}
                  style={{ fontSize: '0.84rem', fontWeight: 600, borderRadius: 8 }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const shopToCollect = selectedShopForModal;
                    setSelectedShopForModal(null);
                    navigate(getOrgPath(`shopkeepers/${shopToCollect.id}/collect`), {
                      state: { shop: shopToCollect, selectedDate },
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: '0.55rem 1.25rem',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  <DollarSign size={16} />
                  <span>Collect Due for {formatDisplayDate(selectedDate)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmerPulse {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .skeleton-box {
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 200% 100%;
          animation: shimmerPulse 1.6s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default Shopkeepers;

