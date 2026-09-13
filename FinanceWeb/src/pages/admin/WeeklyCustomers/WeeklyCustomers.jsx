import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  Calendar,
  Search,
  DollarSign,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
  Printer,
  RefreshCw,
  TrendingUp,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Building,
  Check,
} from 'lucide-react';

export const WeeklyCustomers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();

  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = Current Week, -1 = Last Week, +1 = Next Week
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, PAID, OVERDUE

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Weekly Log Modal State
  const [selectedCustForModal, setSelectedCustForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL'); // ALL, PAID, PENDING

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Compute current week date range (Monday to Sunday)
  const getWeekRange = (offset = 0) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + offset * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatShort = (d) =>
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const yearStr = sunday.getFullYear();

    return {
      startDate: monday.toISOString().slice(0, 10),
      endDate: sunday.toISOString().slice(0, 10),
      label: `${formatShort(monday)} - ${formatShort(sunday)}, ${yearStr}`,
      weekNo: Math.ceil(((monday - new Date(monday.getFullYear(), 0, 1)) / 86400000 + 1) / 7),
    };
  };

  const currentWeekInfo = getWeekRange(selectedWeekOffset);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getWeeklyCustomers(activeOrg ? { organizationId: activeOrg.id } : {});
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading weekly customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOrg?.id]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedWeekOffset]);

  // Filter logic
  const filteredCustomers = customers.filter((cust) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      cust.name?.toLowerCase().includes(q) ||
      cust.customer_code?.toLowerCase().includes(q) ||
      cust.phone?.includes(q) ||
      cust.address?.toLowerCase().includes(q);

    let currentStatus = cust.current_week_status || 'UNPAID';
    if (currentStatus === 'UNPAID') currentStatus = 'PENDING';

    let matchStatus = true;
    if (statusFilter === 'PAID' || statusFilter === 'COLLECTED') {
      matchStatus = currentStatus === 'PAID' || currentStatus === 'COLLECTED';
    } else if (statusFilter === 'PENDING') {
      matchStatus = currentStatus === 'PENDING' || currentStatus === 'UNPAID';
    } else if (statusFilter === 'OVERDUE') {
      matchStatus = currentStatus === 'OVERDUE';
    }

    return matchSearch && matchStatus;
  });

  // Aggregations
  const totalBorrowers = customers.length;
  const totalWeeklyTarget = customers.reduce((s, c) => s + (c.current_week_due || 2200), 0);
  const paidBorrowers = customers.filter(
    (c) => c.current_week_status === 'PAID' || c.current_week_status === 'COLLECTED'
  );
  const collectedAmount = paidBorrowers.reduce((s, c) => s + (c.current_week_due || 2200), 0);
  const pendingCount = totalBorrowers - paidBorrowers.length;
  const pendingAmount = Math.max(0, totalWeeklyTarget - collectedAmount);
  const overdueCount = customers.filter((c) => c.current_week_status === 'OVERDUE').length;
  const collectionRate = totalWeeklyTarget > 0 ? Math.round((collectedAmount / totalWeeklyTarget) * 100) : 0;

  // Pagination Calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Helper to open Weekly Log Modal
  const handleOpenWeeklyLog = (cust) => {
    setSelectedCustForModal(cust);
    setModalFilterStatus('ALL');
  };

  // Helper to navigate to collect page
  const handleNavigateCollect = (cust) => {
    navigate(getOrgPath(`weekly-customers/${cust.id}/collect`), {
      state: { customer: cust },
    });
  };

  // Helper to generate full weekly schedule for a customer
  const getWeeklyInstallmentLogs = (cust) => {
    if (!cust) return [];
    if (Array.isArray(cust.schedule) && cust.schedule.length > 0) {
      return cust.schedule.map((s, idx) => ({
        week_number: s.installment_no || idx + 1,
        due_date: s.due_date,
        amount: s.amount || cust.current_week_due || 2200,
        paid_amount: s.status === 'PAID' ? s.amount || cust.current_week_due || 2200 : 0,
        status: s.status,
        paid_date: s.status === 'PAID' ? s.due_date : null,
        receipt_no: s.receipt_no || (s.status === 'PAID' ? `REC-WK-${cust.id}-${s.installment_no || idx + 1}` : null),
        payment_mode: (idx + 1) % 2 === 0 ? 'CASH' : 'UPI',
      }));
    }

    const totalWeeks = cust.total_installments || 10;
    const paidWeeks = cust.paid_installments || 4;
    const weeklyDue = cust.current_week_due || 2200;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - paidWeeks * 7);

    const list = [];
    for (let w = 1; w <= totalWeeks; w++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (w - 1) * 7);
      const isPaid = w <= paidWeeks;
      const isCurrent = w === paidWeeks + 1;
      list.push({
        week_number: w,
        due_date: d.toISOString().slice(0, 10),
        amount: weeklyDue,
        paid_amount: isPaid ? weeklyDue : 0,
        status: isPaid ? 'PAID' : isCurrent ? 'CURRENT_DUE' : 'PENDING',
        paid_date: isPaid ? d.toISOString().slice(0, 10) : null,
        receipt_no: isPaid ? `REC-WK-${cust.id}-${w}` : null,
        payment_mode: w % 2 === 0 ? 'CASH' : 'UPI',
      });
    }
    return list;
  };

  const modalSchedule = selectedCustForModal ? getWeeklyInstallmentLogs(selectedCustForModal) : [];
  const modalFilteredSchedule = modalSchedule.filter((inst) => {
    if (modalFilterStatus === 'PAID') return inst.status === 'PAID';
    if (modalFilterStatus === 'PENDING') return inst.status !== 'PAID';
    return true;
  });

  const modalTotalWeeks = selectedCustForModal?.total_installments || 10;
  const modalPaidWeeks = modalSchedule.filter((s) => s.status === 'PAID').length;
  const modalProgressPct = Math.min(100, Math.round((modalPaidWeeks / modalTotalWeeks) * 100));
  const modalRecoveredAmt = modalPaidWeeks * (selectedCustForModal?.current_week_due || 2200);
  const modalTotalRepayable = modalTotalWeeks * (selectedCustForModal?.current_week_due || 2200);
  const modalRemainingAmt = Math.max(0, modalTotalRepayable - modalRecoveredAmt);

  return (
    <div className="weekly-customers-page" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
      {/* 1. Page Header */}
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
            <Calendar size={22} />
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
              Weekly Customer Lending & Collections
            </h1>
            <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>
              10-Week tenure loan portfolio and installment recovery ledger
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
            title="Print Weekly Collection Sheet"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <Printer size={15} />
            <span>Print Sheet</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(getOrgPath('users'))}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 800 }}
          >
            <Users size={15} />
            <span>Borrower Directory</span>
          </button>
        </div>
      </div>

      {/* 2. Fast Week Navigation Stepper */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          borderRadius: 12,
          border: '1.5px solid #E2E8F0',
          background: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Collection Schedule
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Week {currentWeekInfo.weekNo} • {currentWeekInfo.label}
            </div>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedWeekOffset((o) => o - 1)}
            title="Previous Week"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '0.78rem' }}
          >
            <ChevronLeft size={15} />
            <span>Prev Week</span>
          </button>
          <button
            className={`btn btn-sm ${selectedWeekOffset === 0 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedWeekOffset(0)}
            style={{ fontWeight: 800, fontSize: '0.78rem', minWidth: 80 }}
          >
            This Week
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedWeekOffset((o) => o + 1)}
            title="Next Week"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '0.78rem' }}
          >
            <span>Next Week</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 3. Four KPI Metric Cards (With Skeleton Pulse) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: '1.15rem 1.25rem',
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div className="skeleton-bar" style={{ width: '45%', height: 12 }} />
                <div className="skeleton-circle" style={{ width: 34, height: 34, borderRadius: 8 }} />
              </div>
              <div className="skeleton-bar" style={{ width: '70%', height: 28, marginBottom: '0.5rem' }} />
              <div className="skeleton-bar" style={{ width: '50%', height: 12 }} />
            </div>
          ))
        ) : (
          <>
            {/* Stat 1: Total Borrowers */}
            <div
              className="card"
              style={{
                padding: '1.15rem 1.25rem',
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Weekly Borrowers
                </span>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color="var(--primary)" />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {totalBorrowers}
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                Active weekly installment schemes
              </div>
            </div>

            {/* Stat 2: Weekly Collection Target */}
            <div
              className="card"
              style={{
                padding: '1.15rem 1.25rem',
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Week Target Dues
                </span>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={16} color="#059669" />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {formatCurrency(totalWeeklyTarget)}
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                Scheduled for Week {currentWeekInfo.weekNo}
              </div>
            </div>

            {/* Stat 3: Collected This Week */}
            <div
              className="card"
              style={{
                padding: '1.15rem 1.25rem',
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Collected This Week
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 12, background: '#ECFDF5', color: '#059669' }}>
                  {collectionRate}%
                </span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#059669', letterSpacing: '-0.03em' }}>
                {formatCurrency(collectedAmount)}
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                {paidBorrowers.length} of {totalBorrowers} borrowers cleared
              </div>
            </div>

            {/* Stat 4: Pending Week Balance */}
            <div
              className="card"
              style={{
                padding: '1.15rem 1.25rem',
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: overdueCount > 0 ? '#DC2626' : '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pending Week Balance
                </span>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} color={overdueCount > 0 ? '#DC2626' : '#64748B'} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 900, color: overdueCount > 0 ? '#DC2626' : 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {formatCurrency(pendingAmount)}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>({pendingCount} Unpaid)</span>
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: overdueCount > 0 ? '#DC2626' : '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                {overdueCount > 0 ? (
                  <>
                    <AlertTriangle size={13} color="#DC2626" />
                    <span>{overdueCount} Overdue accounts</span>
                  </>
                ) : (
                  'All accounts on track'
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. Controls: Search & Status Filters */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          borderRadius: 12,
          border: '1.5px solid #E2E8F0',
          background: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        {/* Search */}
        <div className="search-box" style={{ flex: '1 1 280px', minWidth: 240, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 8 }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Search borrower name, code, phone, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.85rem', fontWeight: 600 }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#64748B' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#F8FAFC', padding: 3, borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, border: 'none' }}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({customers.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, border: 'none' }}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'PAID' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, border: 'none' }}
              onClick={() => setStatusFilter('PAID')}
            >
              Paid ({paidBorrowers.length})
            </button>
            {overdueCount > 0 && (
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'OVERDUE' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, border: 'none' }}
                onClick={() => setStatusFilter('OVERDUE')}
              >
                Overdue ({overdueCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Main Content: Professional Data Table Function */}
      {loading ? (
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            borderRadius: 14,
            border: '1.5px solid #E2E8F0',
            background: '#FFFFFF',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                  <th style={{ padding: '0.95rem 1.15rem' }}><div className="skeleton-bar" style={{ width: 100, height: 12 }} /></th>
                  <th style={{ padding: '0.95rem 1.15rem' }}><div className="skeleton-bar" style={{ width: 80, height: 12 }} /></th>
                  <th style={{ padding: '0.95rem 1.15rem' }}><div className="skeleton-bar" style={{ width: 110, height: 12 }} /></th>
                  <th style={{ padding: '0.95rem 1.15rem' }}><div className="skeleton-bar" style={{ width: 90, height: 12 }} /></th>
                  <th style={{ padding: '0.95rem 1.15rem' }}><div className="skeleton-bar" style={{ width: 80, height: 12 }} /></th>
                  <th style={{ padding: '0.95rem 1.15rem' }}><div className="skeleton-bar" style={{ width: 70, height: 12 }} /></th>
                  <th style={{ padding: '0.95rem 1.15rem' }}><div className="skeleton-bar" style={{ width: 90, height: 12, marginLeft: 'auto' }} /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="skeleton-circle" style={{ width: 36, height: 36, borderRadius: 10 }} />
                        <div>
                          <div className="skeleton-bar" style={{ width: 130, height: 14, marginBottom: '0.3rem' }} />
                          <div className="skeleton-bar" style={{ width: 85, height: 10 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div className="skeleton-bar" style={{ width: 90, height: 14, marginBottom: '0.25rem' }} />
                      <div className="skeleton-bar" style={{ width: 65, height: 10 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div className="skeleton-bar" style={{ width: 80, height: 14, marginBottom: '0.35rem' }} />
                      <div className="skeleton-bar" style={{ width: 100, height: 6, borderRadius: 3 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div className="skeleton-bar" style={{ width: 75, height: 16 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div className="skeleton-bar" style={{ width: 80, height: 16 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div className="skeleton-pill" style={{ width: 70, height: 22 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <div className="skeleton-bar" style={{ width: 65, height: 30, borderRadius: 6 }} />
                        <div className="skeleton-bar" style={{ width: 75, height: 30, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            borderRadius: 14,
            border: '1.5px solid #E2E8F0',
            background: '#FFFFFF',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <Search size={24} color="#94A3B8" />
          </div>
          <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No Weekly Borrowers Found
          </h3>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>
            No borrower records match your search criteria or filter for Week {currentWeekInfo.weekNo}.
          </p>
          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              style={{ marginTop: '1rem', fontWeight: 700 }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            borderRadius: 14,
            border: '1.5px solid #E2E8F0',
            background: '#FFFFFF',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div className="table-responsive">
            <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                  <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Borrower / Client
                  </th>
                  <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Loan Reference
                  </th>
                  <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Scheme Tenure
                  </th>
                  <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Week Due
                  </th>
                  <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Outstanding
                  </th>
                  <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((cust) => {
                  const isPaid = cust.current_week_status === 'PAID' || cust.current_week_status === 'COLLECTED';
                  const isOverdue = cust.current_week_status === 'OVERDUE';
                  const totalWeeks = cust.total_installments || 10;
                  const paidWeeks = cust.paid_installments || (isPaid ? 4 : 3);
                  const weeklyDue = cust.current_week_due || 2200;
                  const progressPct = Math.min(100, Math.round((paidWeeks / totalWeeks) * 100));

                  return (
                    <tr
                      key={cust.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Borrower Info */}
                      <td style={{ padding: '0.95rem 1.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: isPaid ? '#ECFDF5' : '#EEF2FF',
                              color: isPaid ? '#059669' : 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.95rem',
                              flexShrink: 0,
                              border: isPaid ? '1.5px solid #A7F3D0' : '1.5px solid #C7D2FE',
                            }}
                          >
                            {cust.name?.charAt(0) || 'W'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                              {cust.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: '#F1F5F9',
                                  color: '#475569',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                }}
                              >
                                {cust.customer_code}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                • {cust.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Loan Reference */}
                      <td style={{ padding: '0.95rem 1.15rem' }}>
                        <div style={{ fontWeight: 800, color: '#334155', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          {cust.active_loan?.loan_code || `LN-WK-${cust.customer_code}`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem', fontWeight: 600 }}>
                          Principal: {formatCurrency(cust.active_loan?.principal || 20000)}
                        </div>
                      </td>

                      {/* Scheme Tenure & Progress */}
                      <td style={{ padding: '0.95rem 1.15rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', width: 120 }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Wk {paidWeeks} / {totalWeeks}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isPaid ? '#059669' : '#64748B' }}>
                            {progressPct}%
                          </span>
                        </div>
                        <div style={{ width: 120, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${progressPct}%`,
                              height: '100%',
                              background: isPaid ? '#059669' : 'var(--primary)',
                              borderRadius: 3,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </td>

                      {/* Week Due */}
                      <td style={{ padding: '0.95rem 1.15rem' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: isPaid ? '#059669' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                          {formatCurrency(weeklyDue)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem', fontWeight: 600 }}>
                          {isPaid ? 'Settled this week' : 'Due this week'}
                        </div>
                      </td>

                      {/* Outstanding */}
                      <td style={{ padding: '0.95rem 1.15rem' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#DC2626', letterSpacing: '-0.02em' }}>
                          {formatCurrency(cust.outstanding_balance || 14000)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem', fontWeight: 600 }}>
                          Total Remaining
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.95rem 1.15rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '4px 10px',
                            borderRadius: 16,
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: isPaid ? '#ECFDF5' : isOverdue ? '#FEF2F2' : '#FFFBEB',
                            color: isPaid ? '#059669' : isOverdue ? '#DC2626' : '#D97706',
                            border: isPaid ? '1px solid #A7F3D0' : isOverdue ? '1px solid #FECACA' : '1px solid #FDE68A',
                          }}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>PAID</span>
                            </>
                          ) : isOverdue ? (
                            <>
                              <AlertTriangle size={12} />
                              <span>OVERDUE</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              <span>PENDING</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: '0.95rem 1.15rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '0.35rem 0.65rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                            onClick={() => handleOpenWeeklyLog(cust)}
                            title="View 10-Week Installment Log"
                          >
                            <FileText size={14} />
                            <span>Log</span>
                          </button>

                          {isPaid ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.65rem',
                                borderRadius: 6,
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                background: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                              }}
                            >
                              <Check size={14} /> Settled
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                padding: '0.35rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                              onClick={() => handleNavigateCollect(cust)}
                            >
                              <span>Collect</span>
                              <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Clean Numbered Pagination Component */}
      {totalPages > 1 && (
        <div
          className="card"
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: 12,
            border: '1.5px solid #E2E8F0',
            background: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{startIndex + 1}</strong> to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{endIndex}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> borrowers
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              className="btn btn-sm btn-secondary"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage(1)}
              style={{ padding: '0.3rem 0.5rem', borderRadius: 6 }}
              title="First Page"
            >
              <ChevronsLeft size={15} />
            </button>
            <button
              className="btn btn-sm btn-secondary"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ padding: '0.3rem 0.5rem', borderRadius: 6 }}
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
              .map((pageNum, idx, arr) => {
                const showEllipsisBefore = idx > 0 && pageNum - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsisBefore && (
                      <span style={{ padding: '0 4px', color: '#94A3B8', fontSize: '0.8rem' }}>…</span>
                    )}
                    <button
                      className={`btn btn-sm ${pageNum === validCurrentPage ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        minWidth: 32,
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        borderRadius: 6,
                      }}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              className="btn btn-sm btn-secondary"
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: '0.3rem 0.5rem', borderRadius: 6 }}
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
            <button
              className="btn btn-sm btn-secondary"
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              style={{ padding: '0.3rem 0.5rem', borderRadius: 6 }}
              title="Last Page"
            >
              <ChevronsRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Rows per page:</span>
            <select
              className="form-input"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, width: 70, borderRadius: 6 }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* 7. Weekly Log Modal Dialog */}
      {selectedCustForModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedCustForModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 780,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1.5px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                    fontWeight: 900,
                    fontSize: '1.1rem',
                  }}
                >
                  {selectedCustForModal.name?.charAt(0) || 'W'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {selectedCustForModal.name} — Weekly Ledger Log
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                    {selectedCustForModal.customer_code} • {selectedCustForModal.phone} • {selectedCustForModal.address || 'Chennai'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustForModal(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.4rem',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Financial Progress Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Scheme Tenure</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {modalPaidWeeks} / {modalTotalWeeks} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Weeks</span>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Weekly Installment</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {formatCurrency(selectedCustForModal.current_week_due || 2200)}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>Total Recovered</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669', marginTop: '0.2rem' }}>
                    {formatCurrency(modalRecoveredAmt)}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.68rem', color: '#DC2626', fontWeight: 700, textTransform: 'uppercase' }}>Balance Due</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#DC2626', marginTop: '0.2rem' }}>
                    {formatCurrency(modalRemainingAmt)}
                  </div>
                </div>
              </div>

              {/* Ledger Schedule Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  10-Week Installment Breakdown
                </span>

                <div style={{ display: 'flex', background: '#F8FAFC', padding: 2, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${modalFilterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, border: 'none' }}
                    onClick={() => setModalFilterStatus('ALL')}
                  >
                    All ({modalSchedule.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${modalFilterStatus === 'PAID' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, border: 'none' }}
                    onClick={() => setModalFilterStatus('PAID')}
                  >
                    Paid ({modalPaidWeeks})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${modalFilterStatus === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, border: 'none' }}
                    onClick={() => setModalFilterStatus('PENDING')}
                  >
                    Pending ({modalTotalWeeks - modalPaidWeeks})
                  </button>
                </div>
              </div>

              <div style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                      <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>WEEK #</th>
                      <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>DUE DATE</th>
                      <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>AMOUNT</th>
                      <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>PAID DATE</th>
                      <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>PAYMENT DETAILS</th>
                      <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>STATUS</th>
                      <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalFilteredSchedule.map((inst) => {
                      const isPaid = inst.status === 'PAID';
                      const isCurrent = inst.status === 'CURRENT_DUE';
                      return (
                        <tr key={inst.week_number} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                            Week {inst.week_number}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                            {inst.due_date}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.88rem', fontWeight: 900, color: isPaid ? '#059669' : 'var(--text-primary)' }}>
                            {formatCurrency(inst.amount)}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: isPaid ? '#059669' : '#94A3B8', fontWeight: isPaid ? 700 : 500 }}>
                            {isPaid ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={12} color="#059669" />
                                <span>{inst.paid_date || inst.due_date}</span>
                              </span>
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.78rem', color: '#64748B' }}>
                            {isPaid ? (
                              <span>
                                {inst.receipt_no} • <strong style={{ color: 'var(--primary)' }}>{inst.payment_mode}</strong>
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Uncollected</span>
                            )}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: 12,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: isPaid ? '#ECFDF5' : isCurrent ? '#EFF6FF' : '#FFFBEB',
                                color: isPaid ? '#059669' : isCurrent ? '#2563EB' : '#D97706',
                                border: isPaid ? '1px solid #A7F3D0' : isCurrent ? '1px solid #BFDBFE' : '1px solid #FDE68A',
                              }}
                            >
                              {isPaid ? 'PAID' : isCurrent ? 'DUE NOW' : 'PENDING'}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                            {isPaid ? (
                              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Settled</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const custId = selectedCustForModal.id;
                                  setSelectedCustForModal(null);
                                  navigate(getOrgPath(`weekly-customers/collect/${custId}`));
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

            {/* Modal Footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1.5px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700 }}
              >
                <Printer size={15} />
                <span>Print Borrower Statement</span>
              </button>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCustForModal(null)}
                  style={{ fontSize: '0.82rem', fontWeight: 700 }}
                >
                  Close Log
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const custId = selectedCustForModal.id;
                    setSelectedCustForModal(null);
                    navigate(getOrgPath(`weekly-customers/collect/${custId}`));
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 800 }}
                >
                  <span>Collect Weekly Payment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCustomers;
