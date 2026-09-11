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
  Filter,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  User,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';

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
  const { activeOrg } = useOrg();

  // Active anchor date for week navigation
  const [currentAnchorDate, setCurrentAnchorDate] = useState(new Date());

  // Date Filtering State
  const [datePreset, setDatePreset] = useState('THIS_WEEK');
  const [startDate, setStartDate] = useState(getWeekRange().start);
  const [endDate, setEndDate] = useState(getWeekRange().end);

  // Filters & Tabs
  const [frequencyFilter, setFrequencyFilter] = useState('ALL'); // 'ALL' | 'WEEKLY' | 'DAILY'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  const [searchTerm, setSearchTerm] = useState('');

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

  // Load Dynamic Report Data from backend / API
  const fetchReport = async (from, to, freq, stat) => {
    setLoading(true);
    try {
      const data = await api.getPaymentReport({
        startDate: from,
        endDate: to,
        frequency: freq,
        status: stat,
      });
      setReport(data || { summary: {}, records: [] });
    } catch (err) {
      console.error('Failed to load payment report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(startDate, endDate, frequencyFilter, statusFilter);
  }, [startDate, endDate, frequencyFilter, statusFilter]);

  // Handle Preset Changes
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();

    if (preset === 'TODAY') {
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

  // Reset to Current Week
  const handleCurrentWeek = () => {
    handlePresetChange('THIS_WEEK');
  };

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const formatDateDisplay = (dStr) => {
    if (!dStr) return '';
    const date = new Date(dStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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
      notes: `Weekly collection for ${record.customerName}`,
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

      // Instant In-Place State Update: Transition card & recalculate summary
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

        // Re-sort so PAID items move down to the bottom
        updatedRecords.sort((a, b) => {
          if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });

        const newCollected = prev.summary.collected + parsedAmt;
        const newOutstanding = Math.max(0, prev.summary.outstanding - parsedAmt);
        const wasUnpaid = collectTarget.status === 'UNPAID' || collectTarget.status === 'OVERDUE';

        return {
          ...prev,
          summary: {
            ...prev.summary,
            collected: newCollected,
            outstanding: newOutstanding,
            paid_count: nextStatus === 'PAID' ? prev.summary.paid_count + 1 : prev.summary.paid_count,
            unpaid_count: wasUnpaid && nextStatus === 'PAID' ? Math.max(0, prev.summary.unpaid_count - 1) : prev.summary.unpaid_count,
            partial_count: nextStatus === 'PARTIAL' ? prev.summary.partial_count + 1 : prev.summary.partial_count,
          },
          records: updatedRecords,
        };
      });

      // Show instant receipt confirmation
      setReceiptSuccess({
        receiptNo: res.paymentNumber || paymentForm.referenceNumber,
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

  // Filtered records by search query
  const displayRecords = useMemo(() => {
    if (!searchTerm.trim()) return report.records;
    const q = searchTerm.toLowerCase();
    return report.records.filter(
      (r) =>
        r.customerName?.toLowerCase().includes(q) ||
        r.customerPhone?.includes(q) ||
        r.loanNumber?.toLowerCase().includes(q) ||
        r.shopName?.toLowerCase().includes(q)
    );
  }, [report.records, searchTerm]);

  // Grouped for clear visual distinction: Unpaid/Overdue -> Partial -> Paid
  const overdueOrUnpaid = displayRecords.filter((r) => r.status === 'OVERDUE' || r.status === 'UNPAID');
  const partialRecords = displayRecords.filter((r) => r.status === 'PARTIAL');
  const paidRecords = displayRecords.filter((r) => r.status === 'PAID');

  const summary = report.summary || {};

  return (
    <div className="admin-reports-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">DYNAMIC PAYMENT OBLIGATION HUB</div>
          <h1 className="page-title">Weekly Collections & Monitoring</h1>
          <p className="page-subtitle">
            Track borrower payment obligations, record collections in real time, and monitor outstanding balances.
          </p>
        </div>
      </div>

      {/* Week Navigation & Date Preset Controls Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        {/* Interactive Week Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleShiftWeek(-1)}
            title="Navigate to Previous Week"
            style={{ padding: '0.5rem 0.85rem' }}
          >
            <ChevronLeft size={16} />
            Previous Week
          </button>

          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              color: '#fff',
              fontSize: '0.95rem',
            }}
          >
            <Calendar size={16} color="var(--accent-primary)" />
            <span>
              {formatDateDisplay(startDate)} – {formatDateDisplay(endDate)}
            </span>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => handleShiftWeek(1)}
            title="Navigate to Next Week"
            style={{ padding: '0.5rem 0.85rem' }}
          >
            Next Week
            <ChevronRight size={16} />
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleCurrentWeek}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
          >
            Current Week
          </button>
        </div>

        {/* Date Presets Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {['TODAY', 'THIS_WEEK', 'LAST_WEEK', 'THIS_MONTH', 'LAST_MONTH'].map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 6,
                border: datePreset === p ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: datePreset === p ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: datePreset === p ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: datePreset === p ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Financial Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Expected</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.35rem', color: '#fff' }}>
            {formatCurrency(summary.expected)}
          </h3>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Collected</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.35rem', color: 'var(--emerald)' }}>
            {formatCurrency(summary.collected)}
          </h3>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Due</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.35rem', color: '#fbbf24' }}>
            {formatCurrency(summary.outstanding)}
          </h3>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paid Borrowers</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.35rem', color: 'var(--emerald)' }}>
            {summary.paid_count || 0}
          </h3>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unpaid Pending</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.35rem', color: '#f87171' }}>
            {summary.unpaid_count || 0}
          </h3>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Partial Payments</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.35rem', color: '#60a5fa' }}>
            {summary.partial_count || 0}
          </h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search borrower by name, phone, shop, or loan number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-input"
            style={{ width: 160 }}
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
          >
            <option value="ALL">All Frequencies</option>
            <option value="WEEKLY">Weekly Borrowers</option>
            <option value="DAILY">Daily Merchants</option>
          </select>

          <select
            className="form-input"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="UNPAID">UNPAID (Pending)</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="PAID">PAID</option>
          </select>
        </div>
      </div>

      {/* Dynamic Payment Cards Section */}
      {loading ? (
        <div className="page-loading">Querying Period Payment Schedules...</div>
      ) : displayRecords.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
          <h3>No payment obligations scheduled for this period</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Try shifting to the previous/next week or choose a broader date range.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. OVERDUE & UNPAID CARDS (PRIORITY TOP) */}
          {overdueOrUnpaid.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} color="var(--red)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f87171' }}>
                  Action Required: Overdue & Unpaid Borrowers ({overdueOrUnpaid.length})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {overdueOrUnpaid.map((rec) => (
                  <PaymentCard
                    key={rec.scheduleId}
                    record={rec}
                    onRecordPayment={openCollectModal}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. PARTIAL PAYMENT CARDS (MIDDLE) */}
          {partialRecords.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Clock size={18} color="#60a5fa" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#60a5fa' }}>
                  Partial Payments in Progress ({partialRecords.length})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {partialRecords.map((rec) => (
                  <PaymentCard
                    key={rec.scheduleId}
                    record={rec}
                    onRecordPayment={openCollectModal}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. PAID CARDS (BOTTOM) */}
          {paidRecords.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={18} color="var(--emerald)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--emerald)' }}>
                  Settled & Paid Obligations ({paidRecords.length})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {paidRecords.map((rec) => (
                  <PaymentCard
                    key={rec.scheduleId}
                    record={rec}
                    onRecordPayment={openCollectModal}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* PAYMENT ENTRY MODAL                        */}
      {/* ========================================== */}
      {isCollectModalOpen && collectTarget && (
        <Modal
          isOpen={isCollectModalOpen}
          onClose={() => setIsCollectModalOpen(false)}
          title={`Record Collection: ${collectTarget.customerName}`}
        >
          <form onSubmit={handleConfirmPayment}>
            {paymentError && (
              <div
                className="feedback-banner"
                style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'var(--red)', marginBottom: '1rem' }}
              >
                <AlertCircle size={16} color="var(--red)" />
                <span style={{ color: '#fca5a5' }}>{paymentError}</span>
              </div>
            )}

            {/* Obligation Snapshot */}
            <div
              style={{
                padding: '0.85rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <strong style={{ color: '#fff' }}>{collectTarget.customerName}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                    ({collectTarget.customerPhone})
                  </span>
                </div>
                <StatusBadge status={collectTarget.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>Loan: {collectTarget.loanNumber}</div>
                <div>Expected: {formatCurrency(collectTarget.expectedAmount)}</div>
                <div>
                  Outstanding Balance: <strong style={{ color: '#fbbf24' }}>{formatCurrency(collectTarget.balance || collectTarget.expectedAmount)}</strong>
                </div>
              </div>
            </div>

            {/* Payment Fields */}
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} /> Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Default is remaining due. Supports partial collection.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} /> Payment Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-input"
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                >
                  <option value="CASH">CASH (Physical Handover)</option>
                  <option value="UPI">UPI (QR / GooglePay / PhonePe)</option>
                  <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Receipt size={14} style={{ display: 'inline', marginRight: 4 }} /> Receipt / Ref Number
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={14} style={{ display: 'inline', marginRight: 4 }} /> Collection Notes
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Collected at stall #12. Full weekly installment."
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCollectModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPayment}
                className="btn btn-primary"
                style={{ minWidth: 160, justifyContent: 'center' }}
              >
                {submittingPayment ? 'Storing Payment in DB...' : 'Record Payment & Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* INSTANT RECEIPT SUCCESS MODAL              */}
      {/* ========================================== */}
      {receiptSuccess && (
        <Modal
          isOpen={!!receiptSuccess}
          onClose={() => setReceiptSuccess(null)}
          title="Payment Collected Successfully"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.3rem' }}>
              {formatCurrency(receiptSuccess.amount)} Received
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Immutable transaction stored with receipt number <code>{receiptSuccess.receiptNo}</code>
            </p>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '1rem',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                margin: '1.25rem 0',
                textAlign: 'left',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <div>Borrower: <strong>{receiptSuccess.borrower}</strong></div>
              <div>Mode: <span className="badge badge-blue">{receiptSuccess.mode}</span></div>
              <div>Date: {receiptSuccess.date}</div>
              <div>Remaining Balance: <strong style={{ color: receiptSuccess.balance === 0 ? 'var(--emerald)' : '#fbbf24' }}>{formatCurrency(receiptSuccess.balance)}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                Print Receipt
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setReceiptSuccess(null)}
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: DYNAMIC PAYMENT CARD
// ==========================================
const PaymentCard = ({ record, onRecordPayment, formatCurrency }) => {
  const isPaid = record.status === 'PAID';
  const isPartial = record.status === 'PARTIAL';
  const isOverdue = record.status === 'OVERDUE';

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        borderRadius: 12,
        border: isOverdue
          ? '1px solid rgba(239, 68, 68, 0.4)'
          : isPaid
          ? '1px solid rgba(16, 185, 129, 0.25)'
          : isPartial
          ? '1px solid rgba(96, 165, 250, 0.35)'
          : '1px solid var(--border-color)',
        background: isPaid
          ? 'rgba(16, 185, 129, 0.03)'
          : isOverdue
          ? 'rgba(239, 68, 68, 0.03)'
          : 'var(--bg-card)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{record.customerName}</h4>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            📞 {record.customerPhone} {record.shopName ? `• ${record.shopName}` : ''}
          </div>
        </div>
        <StatusBadge status={record.status} />
      </div>

      {/* Loan & Week Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          background: 'rgba(0,0,0,0.2)',
          padding: '0.45rem 0.65rem',
          borderRadius: 6,
          marginBottom: '0.85rem',
        }}
      >
        <span>{record.loanNumber}</span>
        <span>
          {record.frequency === 'DAILY' ? `Day ${record.installmentNumber}` : `Week ${record.installmentNumber}`} • Due: {record.dueDate}
        </span>
      </div>

      {/* Financial Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          textAlign: 'center',
          padding: '0.65rem 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '0.85rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Expected</span>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
            {formatCurrency(record.expectedAmount)}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Paid</span>
          <div style={{ fontWeight: 600, color: isPaid ? 'var(--emerald)' : (record.paidAmount > 0 ? '#60a5fa' : 'var(--text-muted)'), fontSize: '0.95rem' }}>
            {formatCurrency(record.paidAmount || 0)}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balance</span>
          <div style={{ fontWeight: 600, color: record.balance === 0 ? 'var(--emerald)' : '#fbbf24', fontSize: '0.95rem' }}>
            {formatCurrency(record.balance || 0)}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isPaid ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Fully Paid</span>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.55rem' }}
            onClick={() => onRecordPayment(record)}
          >
            <DollarSign size={15} />
            Record Payment
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
