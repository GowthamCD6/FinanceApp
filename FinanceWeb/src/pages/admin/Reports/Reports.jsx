import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Calendar,
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  DollarSign,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';
import './Reports.css';

// Helper: Format Date to YYYY-MM-DD in local time
const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Get Monday to Sunday of a reference date
const getWeekRange = (refDate = new Date()) => {
  const d = new Date(refDate);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDateStr(monday),
    end: formatDateStr(sunday),
  };
};

export const AdminReports = () => {
  const { activeOrg, activeBranchId } = useOrg();

  // Active anchor date for week navigation
  const [currentAnchorDate, setCurrentAnchorDate] = useState(new Date());

  // Date Filtering State (Default: 'ALL' so all backend records are visible immediately)
  const [datePreset, setDatePreset] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filters & Tabs
  const [frequencyFilter, setFrequencyFilter] = useState('ALL'); // 'ALL' | 'WEEKLY' | 'DAILY' | 'MONTHLY'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Report Data State
  const [report, setReport] = useState({
    period: { start: '', end: '' },
    summary: { expected: 0, collected: 0, outstanding: 0, paid_count: 0, unpaid_count: 0, partial_count: 0, overdue_count: 0 },
    records: [],
  });
  const [loading, setLoading] = useState(true);

  // Payment Recording Modal State
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectTarget, setCollectTarget] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: formatDateStr(new Date()),
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: '',
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Payment Receipt Success Modal
  const [receiptSuccess, setReceiptSuccess] = useState(null);

  // Load Live Report Data from backend API
  const fetchReport = async (from, to, freq, stat) => {
    setLoading(true);
    try {
      const data = await api.getPaymentReport({
        startDate: from && from !== 'ALL' ? from : '',
        endDate: to && to !== 'ALL' ? to : '',
        frequency: freq,
        status: stat,
        organizationId: activeOrg?.id,
        branchId: activeBranchId,
      });
      setReport(data || { summary: {}, records: [] });
    } catch (err) {
      console.error('Failed to load payment report from API:', err);
      setReport({ summary: {}, records: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(startDate, endDate, frequencyFilter, statusFilter);
  }, [startDate, endDate, frequencyFilter, statusFilter, activeOrg?.id, activeBranchId]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, frequencyFilter, statusFilter, startDate, endDate, activeOrg?.id, activeBranchId]);

  // Handle Preset Changes
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'TODAY') {
      const t = formatDateStr(today);
      setStartDate(t);
      setEndDate(t);
    } else if (preset === 'THIS_WEEK') {
      const w = getWeekRange(today);
      setCurrentAnchorDate(today);
      setStartDate(w.start);
      setEndDate(w.end);
    } else if (preset === 'LAST_WEEK') {
      const lastWk = new Date(today);
      lastWk.setDate(today.getDate() - 7);
      const w = getWeekRange(lastWk);
      setCurrentAnchorDate(lastWk);
      setStartDate(w.start);
      setEndDate(w.end);
    } else if (preset === 'THIS_MONTH') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(formatDateStr(first));
      setEndDate(formatDateStr(last));
    } else if (preset === 'LAST_MONTH') {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      setStartDate(formatDateStr(first));
      setEndDate(formatDateStr(last));
    }
  };

  // Week Navigator: Shift by +/- 7 days
  const handleShiftWeek = (offsetWeeks) => {
    const nextAnchor = new Date(currentAnchorDate);
    nextAnchor.setDate(nextAnchor.getDate() + offsetWeeks * 7);
    setCurrentAnchorDate(nextAnchor);
    const range = getWeekRange(nextAnchor);
    setDatePreset('CUSTOM');
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const handleCurrentWeek = () => {
    handlePresetChange('THIS_WEEK');
  };

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const formatDateDisplay = (dStr) => {
    if (!dStr) return '';
    const date = new Date(dStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Open Collect Modal
  const openCollectModal = (record) => {
    setCollectTarget(record);
    setPaymentError('');
    setPaymentForm({
      amount: String(record.balance || record.expectedAmount),
      paymentDate: formatDateStr(new Date()),
      paymentMethod: 'CASH',
      referenceNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `Collection for ${record.customerName}`,
    });
    setIsCollectModalOpen(true);
  };

  // Confirm Payment Submission
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');
    if (!collectTarget) return;

    const parsedAmt = parseFloat(paymentForm.amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setPaymentError('Please enter a valid positive payment amount.');
      return;
    }

    if (parsedAmt > (collectTarget.balance || collectTarget.expectedAmount) + 0.01) {
      setPaymentError(`Payment cannot exceed current outstanding balance of ${formatCurrency(collectTarget.balance || collectTarget.expectedAmount)}.`);
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await api.recordPayment({
        scheduleId: collectTarget.scheduleId,
        loanId: collectTarget.loanId,
        userId: collectTarget.userId,
        customerId: collectTarget.customerId,
        loanNumber: collectTarget.loanNumber,
        amount: parsedAmt,
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber,
        notes: paymentForm.notes,
      });

      setIsCollectModalOpen(false);

      // Instant in-place state update
      const updatedBalance = Math.max(0, (collectTarget.balance || collectTarget.expectedAmount) - parsedAmt);
      const nextStatus = updatedBalance === 0 ? 'PAID' : 'PARTIAL';
      const nextSortPriority = nextStatus === 'PAID' ? 4 : 3;

      setReport((prev) => {
        const updatedRecords = prev.records.map((r) => {
          if (r.scheduleId === collectTarget.scheduleId) {
            return {
              ...r,
              paidAmount: (r.paidAmount || 0) + parsedAmt,
              balance: updatedBalance,
              status: nextStatus,
              sortPriority: nextSortPriority,
            };
          }
          return r;
        });

        updatedRecords.sort((a, b) => {
          if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });

        const newCollected = (prev.summary.collected || 0) + parsedAmt;
        const newOutstanding = Math.max(0, (prev.summary.outstanding || 0) - parsedAmt);
        const wasUnpaid = collectTarget.status === 'UNPAID' || collectTarget.status === 'OVERDUE';

        return {
          ...prev,
          summary: {
            ...prev.summary,
            collected: newCollected,
            outstanding: newOutstanding,
            paid_count: nextStatus === 'PAID' ? (prev.summary.paid_count || 0) + 1 : (prev.summary.paid_count || 0),
            unpaid_count: wasUnpaid && nextStatus === 'PAID' ? Math.max(0, (prev.summary.unpaid_count || 0) - 1) : (prev.summary.unpaid_count || 0),
            partial_count: nextStatus === 'PARTIAL' ? (prev.summary.partial_count || 0) + 1 : (prev.summary.partial_count || 0),
          },
          records: updatedRecords,
        };
      });

      // Show instant receipt confirmation modal
      setReceiptSuccess({
        receiptNo: res?.data?.referenceNumber || paymentForm.referenceNumber,
        borrower: collectTarget.customerName,
        phone: collectTarget.customerPhone,
        amount: parsedAmt,
        balance: updatedBalance,
        loanNumber: collectTarget.loanNumber,
        mode: paymentForm.paymentMethod,
        date: paymentForm.paymentDate,
        status: nextStatus,
      });

    } catch (err) {
      setPaymentError(err.message || 'Payment submission failed.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!displayRecords.length) return;
    const headers = ['Schedule ID', 'Borrower Name', 'Phone', 'Shop Name', 'Loan Number', 'Frequency', 'Installment', 'Due Date', 'Expected (INR)', 'Paid (INR)', 'Balance (INR)', 'Status'];
    const rows = displayRecords.map((r) => [
      r.scheduleId,
      `"${r.customerName || ''}"`,
      `"${r.customerPhone || ''}"`,
      `"${r.shopName || ''}"`,
      r.loanNumber,
      r.frequency,
      r.installmentNumber,
      r.dueDate,
      r.expectedAmount,
      r.paidAmount,
      r.balance,
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `collections_report_${startDate || 'all'}_to_${endDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered records by search query
  const displayRecords = useMemo(() => {
    if (!searchTerm.trim()) return report.records || [];
    const q = searchTerm.toLowerCase();
    return (report.records || []).filter(
      (r) =>
        r.customerName?.toLowerCase().includes(q) ||
        r.customerPhone?.includes(q) ||
        r.loanNumber?.toLowerCase().includes(q) ||
        r.shopName?.toLowerCase().includes(q)
    );
  }, [report.records, searchTerm]);

  // Paginated records
  const totalPages = Math.ceil(displayRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayRecords.slice(start, start + pageSize);
  }, [displayRecords, currentPage, pageSize]);

  const summary = report.summary || {};
  const recoveryRate = summary.expected > 0 ? Math.round((summary.collected / summary.expected) * 100) : (summary.recovery_rate || 0);

  // Grouped for Card View
  const overdueOrUnpaid = displayRecords.filter((r) => r.status === 'OVERDUE' || r.status === 'UNPAID');
  const partialRecords = displayRecords.filter((r) => r.status === 'PARTIAL');
  const paidRecords = displayRecords.filter((r) => r.status === 'PAID');

  return (
    <div className="admin-reports-page">
      {/* 1. Page Header (Strictly Standardized Header without verbose subtitles) */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <h1 className="directory-page-title">Reports & Recovery Audit</h1>
        </div>

        <div className="directory-header-actions">
          <button className="directory-btn-secondary" onClick={handleExportCSV} title="Export Filtered Report to CSV">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="directory-btn-secondary" onClick={() => window.print()} title="Print Audit Ledger">
            <Printer size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Date Range Navigator Bar */}
      <div className="rep-nav-card">
        <div className="rep-nav-left">
          <button className="directory-btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => handleShiftWeek(-1)}>
            <ChevronLeft size={15} />
            <span>Prev Week</span>
          </button>

          <div className="rep-nav-badge">
            <Calendar size={15} />
            <span>{startDate && endDate ? `${formatDateDisplay(startDate)} – ${formatDateDisplay(endDate)}` : 'All Dates & Cycles'}</span>
          </div>

          <button className="directory-btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => handleShiftWeek(1)}>
            <span>Next Week</span>
            <ChevronRight size={15} />
          </button>

          <button
            className={datePreset === 'THIS_WEEK' ? 'directory-btn-primary' : 'directory-btn-secondary'}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            onClick={handleCurrentWeek}
          >
            Current Week
          </button>
        </div>

        <div className="rep-presets">
          {['ALL', 'TODAY', 'THIS_WEEK', 'LAST_WEEK', 'THIS_MONTH', 'LAST_MONTH'].map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={`rep-preset-chip ${datePreset === p ? 'active' : ''}`}
            >
              {p === 'ALL' ? 'ALL TIME' : p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Four KPI Financial Overview Strip (Solid #0F172A Metric Numbers - Strictly no green/amber numbers) */}
      <div className="directory-kpi-grid">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="directory-kpi-card" style={{ minHeight: 110 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div className="skeleton-circle" style={{ width: 36, height: 36, borderRadius: 8 }} />
                <div className="skeleton-bar" style={{ width: '40%', height: 14 }} />
              </div>
              <div className="skeleton-bar" style={{ width: '70%', height: 26, marginBottom: '0.4rem' }} />
              <div className="skeleton-bar" style={{ width: '50%', height: 12 }} />
            </div>
          ))
        ) : (
          <>
            <div className="directory-kpi-card">
              <div className="directory-kpi-header">
                <div className="directory-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <DollarSign size={20} />
                </div>
                <span className="directory-kpi-badge">Total Scheduled</span>
              </div>
              <div className="directory-kpi-value">{formatCurrency(summary.expected)}</div>
              <div className="directory-kpi-label">TOTAL EXPECTED DUE</div>
              <div className="directory-kpi-meta">Across active loan schedules</div>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-header">
                <div className="directory-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <TrendingUp size={20} />
                </div>
                <span className="directory-kpi-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                  {recoveryRate}% Realized
                </span>
              </div>
              <div className="directory-kpi-value">{formatCurrency(summary.collected)}</div>
              <div className="directory-kpi-label">REALIZED COLLECTIONS</div>
              <div className="directory-kpi-meta">{summary.paid_count || 0} installments collected</div>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-header">
                <div className="directory-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                  <Clock size={20} />
                </div>
                <span className="directory-kpi-badge" style={{ background: '#fffbeb', color: '#d97706' }}>
                  {summary.overdue_count || 0} Overdue
                </span>
              </div>
              <div className="directory-kpi-value">{formatCurrency(summary.outstanding)}</div>
              <div className="directory-kpi-label">REMAINING BALANCE</div>
              <div className="directory-kpi-meta">{summary.unpaid_count || 0} pending dues</div>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-header">
                <div className="directory-kpi-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                  <CheckCircle2 size={20} />
                </div>
                <span className="directory-kpi-badge" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                  Efficiency
                </span>
              </div>
              <div className="directory-kpi-value">{recoveryRate}%</div>
              <div className="directory-kpi-label">RECOVERY RATE</div>
              <div className="directory-kpi-meta">{summary.paid_count || 0} Settled • {summary.partial_count || 0} Partial</div>
            </div>
          </>
        )}
      </div>

      {/* 4. Filter, Search & View Switcher Bar */}
      <div className="rep-toolbar">
        <div className="rep-search-wrap">
          <Search size={16} className="rep-search-icon" />
          <input
            type="text"
            className="rep-search-input"
            placeholder="Search borrower by name, phone, shop, or loan number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rep-filters-group">
          <select
            className="rep-select"
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
          >
            <option value="ALL">All Schemes</option>
            <option value="WEEKLY">Weekly Micro-Loans</option>
            <option value="DAILY">Daily Merchants</option>
            <option value="MONTHLY">Monthly Business</option>
          </select>

          <select
            className="rep-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="UNPAID">Pending / Unpaid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PARTIAL">Partial Payment</option>
            <option value="PAID">Fully Settled</option>
          </select>

          <div className="rep-view-toggle">
            <button
              className={`rep-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table Ledger View"
            >
              <List size={16} />
            </button>
            <button
              className={`rep-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main Content: Table View or Card View */}
      {loading ? (
        <div className="directory-table-card">
          <div className="directory-table-responsive">
            <table className="directory-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Borrower & Shop</th>
                  <th style={{ textAlign: 'center' }}>Loan & Scheme</th>
                  <th style={{ textAlign: 'center' }}>Due Date & Installment</th>
                  <th style={{ textAlign: 'center' }}>Expected (₹)</th>
                  <th style={{ textAlign: 'center' }}>Paid (₹)</th>
                  <th style={{ textAlign: 'center' }}>Balance (₹)</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="rep-skeleton-row">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="skeleton-circle" style={{ width: 34, height: 34, borderRadius: 8 }} />
                        <div style={{ width: 120 }}>
                          <div className="skeleton-bar" style={{ height: 14, marginBottom: 4 }} />
                          <div className="skeleton-bar" style={{ height: 10, width: '60%' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}><div className="skeleton-bar" style={{ width: 80, height: 14, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}><div className="skeleton-bar" style={{ width: 100, height: 14, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}><div className="skeleton-bar" style={{ width: 65, height: 14, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}><div className="skeleton-bar" style={{ width: 65, height: 14, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}><div className="skeleton-bar" style={{ width: 65, height: 14, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}><div className="skeleton-pill" style={{ width: 70, height: 22, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'right' }}><div className="skeleton-bar" style={{ width: 80, height: 28, marginLeft: 'auto', borderRadius: 6 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : displayRecords.length === 0 ? (
        <div className="rep-empty-state">
          <div className="rep-empty-icon">
            <Calendar size={26} />
          </div>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>No payment records found</h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Try selecting <strong>ALL TIME</strong>, adjusting your search query, or switching schemes.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* ========================
           TABLE LEDGER VIEW
           ======================== */
        <div className="directory-table-card">
          <div className="directory-table-responsive">
            <table className="directory-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Borrower & Shop</th>
                  <th style={{ textAlign: 'center' }}>Loan & Scheme</th>
                  <th style={{ textAlign: 'center' }}>Due Date & Installment</th>
                  <th style={{ textAlign: 'center' }}>Expected (₹)</th>
                  <th style={{ textAlign: 'center' }}>Paid (₹)</th>
                  <th style={{ textAlign: 'center' }}>Balance (₹)</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((rec) => {
                  const isPaid = rec.status === 'PAID';
                  const isOverdue = rec.status === 'OVERDUE';
                  const initials = rec.customerName
                    ? rec.customerName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'CU';

                  return (
                    <tr key={rec.scheduleId}>
                      {/* Borrower & Shop */}
                      <td>
                        <div className="rep-borrower-cell">
                          <div className="rep-avatar">{initials}</div>
                          <div>
                            <div className="rep-borrower-name">{rec.customerName}</div>
                            <div className="rep-borrower-sub">
                              <Phone size={12} />
                              <span>{rec.customerPhone} {rec.shopName ? `• ${rec.shopName}` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Loan & Scheme */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.loanNumber}</div>
                        <span className={`rep-scheme-badge ${rec.frequency === 'DAILY' ? 'scheme-daily' : rec.frequency === 'MONTHLY' ? 'scheme-monthly' : 'scheme-weekly'}`}>
                          {rec.frequency}
                        </span>
                      </td>

                      {/* Installment & Due Date */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, color: isOverdue ? '#dc2626' : '#0f172a' }}>
                          {rec.dueDate}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Installment #{rec.installmentNumber}
                        </div>
                      </td>

                      {/* Expected Amount */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {formatCurrency(rec.expectedAmount)}
                        </div>
                      </td>

                      {/* Paid Amount */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, color: isPaid ? '#059669' : rec.paidAmount > 0 ? '#2563eb' : '#64748b' }}>
                          {formatCurrency(rec.paidAmount || 0)}
                        </div>
                      </td>

                      {/* Balance */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, color: rec.balance <= 0 ? '#059669' : '#0f172a' }}>
                          {formatCurrency(rec.balance || 0)}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <StatusBadge status={rec.status} />
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="rep-action-cell">
                          {isPaid ? (
                            <button
                              className="rep-btn-receipt"
                              onClick={() =>
                                setReceiptSuccess({
                                  receiptNo: `REC-${rec.scheduleId}`,
                                  borrower: rec.customerName,
                                  phone: rec.customerPhone,
                                  amount: rec.paidAmount,
                                  balance: 0,
                                  loanNumber: rec.loanNumber,
                                  mode: 'CASH',
                                  date: rec.dueDate,
                                  status: 'PAID',
                                })
                              }
                            >
                              <Receipt size={13} />
                              <span>Receipt</span>
                            </button>
                          ) : (
                            <button className="rep-btn-collect" onClick={() => openCollectModal(rec)}>
                              <DollarSign size={13} />
                              <span>Collect</span>
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

          {/* Pagination Controls */}
          <div className="rep-pagination">
            <div className="rep-pag-info">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayRecords.length)} of {displayRecords.length} records
            </div>

            <div className="rep-pag-controls">
              <select
                className="rep-select"
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>

              <button
                className="rep-pag-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 0.5rem' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="rep-pag-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================
           CARD GRID VIEW
           ======================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Overdue & Unpaid Cards */}
          {overdueOrUnpaid.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>
                  Action Required: Overdue & Unpaid ({overdueOrUnpaid.length})
                </h3>
              </div>
              <div className="rep-cards-grid">
                {overdueOrUnpaid.map((rec) => (
                  <PaymentCardItem key={rec.scheduleId} record={rec} onRecordPayment={openCollectModal} formatCurrency={formatCurrency} />
                ))}
              </div>
            </div>
          )}

          {/* Partial Payment Cards */}
          {partialRecords.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Clock size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>
                  Partial Payments in Progress ({partialRecords.length})
                </h3>
              </div>
              <div className="rep-cards-grid">
                {partialRecords.map((rec) => (
                  <PaymentCardItem key={rec.scheduleId} record={rec} onRecordPayment={openCollectModal} formatCurrency={formatCurrency} />
                ))}
              </div>
            </div>
          )}

          {/* Settled Cards */}
          {paidRecords.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={18} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#059669' }}>
                  Settled Obligations ({paidRecords.length})
                </h3>
              </div>
              <div className="rep-cards-grid">
                {paidRecords.map((rec) => (
                  <PaymentCardItem key={rec.scheduleId} record={rec} onRecordPayment={openCollectModal} formatCurrency={formatCurrency} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* RECORD PAYMENT ENTRY MODAL                 */}
      {/* ========================================== */}
      {isCollectModalOpen && collectTarget && (
        <Modal
          isOpen={isCollectModalOpen}
          onClose={() => setIsCollectModalOpen(false)}
          title={`Record Payment: ${collectTarget.customerName}`}
        >
          <form onSubmit={handleConfirmPayment}>
            {paymentError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={16} color="#dc2626" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Obligation Snapshot */}
            <div
              style={{
                padding: '0.85rem 1rem',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <strong style={{ color: '#0f172a' }}>{collectTarget.customerName}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 6 }}>
                    ({collectTarget.customerPhone})
                  </span>
                </div>
                <StatusBadge status={collectTarget.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.825rem', color: '#475569' }}>
                <div>Loan: <strong>{collectTarget.loanNumber}</strong></div>
                <div>Expected: <strong>{formatCurrency(collectTarget.expectedAmount)}</strong></div>
                <div>
                  Remaining: <strong style={{ color: '#0f172a' }}>{formatCurrency(collectTarget.balance || collectTarget.expectedAmount)}</strong>
                </div>
              </div>
            </div>

            {/* Payment Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                  Payment Amount (₹) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  className="rep-search-input"
                  style={{ padding: '0.55rem 0.75rem', height: 42 }}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                  Payment Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  className="rep-search-input"
                  style={{ padding: '0.55rem 0.75rem', height: 42 }}
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                  Payment Mode
                </label>
                <select
                  className="rep-select"
                  style={{ width: '100%', height: 42 }}
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                >
                  <option value="CASH">CASH (Physical Handover)</option>
                  <option value="UPI">UPI (QR / GooglePay / PhonePe)</option>
                  <option value="BANK_TRANSFER">Bank Transfer (IMPS/NEFT)</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                  Receipt / Ref Number
                </label>
                <input
                  type="text"
                  className="rep-search-input"
                  style={{ padding: '0.55rem 0.75rem', height: 42 }}
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                Collection Notes
              </label>
              <input
                type="text"
                className="rep-search-input"
                style={{ padding: '0.55rem 0.75rem', height: 42 }}
                placeholder="e.g. Full installment collected on route"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="directory-btn-secondary" onClick={() => setIsCollectModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" disabled={submittingPayment} className="directory-btn-primary">
                {submittingPayment ? 'Recording...' : 'Record Payment & Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* INSTANT RECEIPT SUCCESS MODAL              */}
      {/* ========================================== */}
      {receiptSuccess && (
        <Modal isOpen={!!receiptSuccess} onClose={() => setReceiptSuccess(null)} title="Payment Receipt">
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
              }}
            >
              <CheckCircle2 size={30} />
            </div>

            <h3 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
              {formatCurrency(receiptSuccess.amount)} Collected
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.825rem' }}>
              Receipt Ref: <strong>{receiptSuccess.receiptNo}</strong>
            </p>

            <div
              style={{
                background: '#f8fafc',
                padding: '0.95rem',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                margin: '1.15rem 0',
                textAlign: 'left',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                fontSize: '0.825rem',
              }}
            >
              <div>Borrower: <strong>{receiptSuccess.borrower}</strong></div>
              <div>Mode: <span className="rep-scheme-badge scheme-weekly">{receiptSuccess.mode}</span></div>
              <div>Date: {receiptSuccess.date}</div>
              <div>
                Remaining: <strong style={{ color: '#0f172a' }}>{formatCurrency(receiptSuccess.balance)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="directory-btn-secondary" onClick={() => window.print()}>
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
              <button className="directory-btn-primary" onClick={() => setReceiptSuccess(null)}>
                <span>Done</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: CARD GRID ITEM
// ==========================================
const PaymentCardItem = ({ record, onRecordPayment, formatCurrency }) => {
  const isPaid = record.status === 'PAID';
  const isOverdue = record.status === 'OVERDUE';

  return (
    <div className={`rep-card-item ${isOverdue ? 'card-overdue' : isPaid ? 'card-paid' : ''}`}>
      <div className="rep-card-header">
        <div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{record.customerName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Phone size={12} />
            <span>{record.customerPhone} {record.shopName ? `• ${record.shopName}` : ''}</span>
          </div>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <div className="rep-card-info-strip">
        <span>{record.loanNumber}</span>
        <span>{record.frequency} • Due: {record.dueDate}</span>
      </div>

      <div className="rep-card-matrix">
        <div>
          <div className="rep-matrix-label">Expected</div>
          <div className="rep-matrix-val">{formatCurrency(record.expectedAmount)}</div>
        </div>
        <div>
          <div className="rep-matrix-label">Paid</div>
          <div className="rep-matrix-val" style={{ color: isPaid ? '#059669' : '#0f172a' }}>
            {formatCurrency(record.paidAmount || 0)}
          </div>
        </div>
        <div>
          <div className="rep-matrix-label">Balance</div>
          <div className="rep-matrix-val" style={{ color: '#0f172a' }}>
            {formatCurrency(record.balance || 0)}
          </div>
        </div>
      </div>

      <div className="rep-card-action">
        {isPaid ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.8rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            <span>Settled</span>
          </div>
        ) : (
          <button className="rep-btn-collect" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onRecordPayment(record)}>
            <DollarSign size={14} />
            <span>Record Payment</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
