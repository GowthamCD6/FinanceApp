import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Calendar,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Receipt,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  Share2,
} from 'lucide-react';

export const WeeklyCustomers = () => {
  const { activeOrg } = useOrg();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');

  // Week offset state (0 = current week, -1 = last week, 1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Modals state
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [receiptData, setReceiptData] = useState(null);

  // Schedule Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleCustomer, setScheduleCustomer] = useState(null);

  // New Weekly Borrower Modal
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    phone: '',
    address: 'Triplicane, Chennai',
    occupation: '',
    credit_limit: 50000,
    loan_principal: 20000,
    total_installments: 10,
  });
  const [onboardErrors, setOnboardErrors] = useState({});
  const [submittingOnboard, setSubmittingOnboard] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getWeeklyCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading weekly customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Calculate current week date range based on weekOffset
  const getWeekRange = (offset) => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + offset * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d) =>
      d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

    return {
      label: `${fmt(monday)} - ${fmt(sunday)}`,
      isCurrent: offset === 0,
      monday,
      sunday,
    };
  };

  const weekInfo = getWeekRange(weekOffset);

  // Filter customers
  const filteredCustomers = customers.filter((cust) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      cust.name?.toLowerCase().includes(q) ||
      cust.customer_code?.toLowerCase().includes(q) ||
      cust.phone?.includes(q) ||
      cust.address?.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === 'ALL' || cust.current_week_status === statusFilter;

    const matchArea =
      areaFilter === 'ALL' || (cust.address && cust.address.toLowerCase().includes(areaFilter.toLowerCase()));

    return matchSearch && matchStatus && matchArea;
  });

  // Aggregated KPIs
  const totalWeeklyBorrowers = customers.length;
  const totalWeeklyExpected = customers.reduce((sum, c) => sum + (c.current_week_due || 0), 0);
  const totalWeeklyCollected = customers
    .filter((c) => c.current_week_status === 'PAID')
    .reduce((sum, c) => sum + (c.current_week_due || 0), 0);
  const totalWeeklyPending = Math.max(0, totalWeeklyExpected - totalWeeklyCollected);
  const overdueCount = customers.filter((c) => c.current_week_status === 'OVERDUE').length;
  const collectionRate = totalWeeklyExpected > 0 ? Math.round((totalWeeklyCollected / totalWeeklyExpected) * 100) : 0;

  // Handlers
  const handleOpenCollect = (cust) => {
    setSelectedCustomer(cust);
    setPaymentAmount(String(cust.current_week_due || 2200));
    setPaymentMode('UPI');
    setIsCollectModalOpen(true);
  };

  const handleConfirmWeeklyPayment = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const activeLoanCode = selectedCustomer.active_loan?.loan_code || 'LN-2026-004';
      const res = await api.recordWeeklyCollection(
        selectedCustomer.id,
        activeLoanCode,
        paymentMode,
        paymentAmount
      );

      setReceiptData({
        ...res,
        customer_name: selectedCustomer.name,
        customer_code: selectedCustomer.customer_code,
        phone: selectedCustomer.phone,
        loan_code: activeLoanCode,
        amount: parseFloat(paymentAmount),
        payment_mode: paymentMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      setIsCollectModalOpen(false);
      setFeedbackMsg(`Weekly collection of ${formatCurrency(paymentAmount)} recorded for ${selectedCustomer.name}!`);
      setTimeout(() => setFeedbackMsg(''), 3500);
      loadData();
    } catch (err) {
      alert('Failed to record weekly collection: ' + err.message);
    }
  };

  const handleOpenSchedule = (cust) => {
    setScheduleCustomer(cust);
    setIsScheduleModalOpen(true);
  };

  const handleCreateWeeklyBorrower = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!onboardForm.name.trim()) errs.name = 'Full name is required';
    if (!onboardForm.phone.trim()) errs.phone = 'Phone number is required';
    if (Object.keys(errs).length > 0) {
      setOnboardErrors(errs);
      return;
    }

    setSubmittingOnboard(true);
    try {
      await api.createUser({
        name: onboardForm.name.trim(),
        phone: onboardForm.phone.trim(),
        address: onboardForm.address,
        occupation: onboardForm.occupation,
        role: 'COMMON_CUSTOMER',
        credit_limit: onboardForm.credit_limit,
        initial_loan: {
          principal: parseFloat(onboardForm.loan_principal),
          total_installments: parseInt(onboardForm.total_installments, 10) || 10,
          frequency: 'WEEKLY',
        },
      });

      setIsOnboardModalOpen(false);
      setOnboardForm({
        name: '',
        phone: '',
        address: 'Triplicane, Chennai',
        occupation: '',
        credit_limit: 50000,
        loan_principal: 20000,
        total_installments: 10,
      });
      setFeedbackMsg(`New weekly borrower "${onboardForm.name}" onboarded successfully!`);
      setTimeout(() => setFeedbackMsg(''), 3500);
      loadData();
    } catch (err) {
      setOnboardErrors({ form: err.message || 'Failed to onboard borrower' });
    } finally {
      setSubmittingOnboard(false);
    }
  };

  return (
    <div className="weekly-customers-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">
            <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
            ADMIN WEEKLY CYCLE LEDGER
          </div>
          <h1 className="page-title">Weekly Customers & Installments</h1>
          <p className="page-subtitle">
            Track weekly borrowers, navigate week-by-week schedules, monitor overdue installments, and record payments instantly.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsOnboardModalOpen(true)}>
            <Plus size={16} />
            <span>Onboard Weekly Borrower</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Week Navigation Strip */}
      <div className="week-nav-bar card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            title="Previous Week"
          >
            <ChevronLeft size={16} />
            <span>Previous Week</span>
          </button>
          <button
            className={`btn btn-sm ${weekOffset === 0 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setWeekOffset(0)}
          >
            Current Week
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            title="Next Week"
          >
            <span>Next Week</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={16} color="var(--accent-primary)" />
          <strong style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>{weekInfo.label}</strong>
          {weekInfo.isCurrent && (
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>ACTIVE CYCLE</span>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly Borrowers</span>
            <User size={18} color="var(--accent-primary)" />
          </div>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', color: '#fff' }}>{totalWeeklyBorrowers}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Active in weekly program</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Week Target Expected</span>
            <DollarSign size={18} color="var(--purple)" />
          </div>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', color: 'var(--purple)' }}>{formatCurrency(totalWeeklyExpected)}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Installment obligations</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Collected This Week</span>
            <CheckCircle2 size={18} color="var(--emerald)" />
          </div>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', color: 'var(--emerald)' }}>{formatCurrency(totalWeeklyCollected)}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>{collectionRate}% efficiency</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending / Overdue</span>
            <AlertTriangle size={18} color={overdueCount > 0 ? 'var(--red)' : '#fbbf24'} />
          </div>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', color: overdueCount > 0 ? 'var(--red)' : '#fbbf24' }}>
            {formatCurrency(totalWeeklyPending)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: overdueCount > 0 ? 'var(--red)' : 'var(--text-muted)' }}>
            {overdueCount} borrowers delayed
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="table-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by customer name, code (CUST-001), phone, or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-input"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="UNPAID">UNPAID</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="PAID">PAID</option>
          </select>

          <select
            className="form-input"
            style={{ width: 170 }}
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="ALL">All Areas</option>
            <option value="Triplicane">Triplicane</option>
            <option value="Saidapet">Saidapet</option>
            <option value="Mylapore">Mylapore</option>
            <option value="T. Nagar">T. Nagar</option>
          </select>
        </div>
      </div>

      {/* Customer Ledger Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer & Code</th>
                <th>Phone & Contact</th>
                <th>Area / Address</th>
                <th>Active Loan</th>
                <th>Repayment Progress</th>
                <th>Current Week Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No weekly customers match your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isPaid = cust.current_week_status === 'PAID';
                  const isOverdue = cust.current_week_status === 'OVERDUE';
                  const progressPct = cust.total_installments > 0 ? Math.round((cust.paid_installments / cust.total_installments) * 100) : 0;

                  return (
                    <tr key={cust.id} style={{ background: isOverdue ? 'rgba(239, 68, 68, 0.04)' : undefined }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: 'var(--accent-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{cust.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cust.customer_code}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <Phone size={13} color="var(--text-muted)" />
                          <span>{cust.phone}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <MapPin size={13} color="var(--text-muted)" />
                          <span>{cust.address?.split(',')[0] || 'Chennai'}</span>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.85rem' }}>
                            {cust.active_loan?.loan_code || 'LN-2026-004'}
                          </strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatCurrency(cust.active_loan?.principal || 20000)} • 10 Wks
                          </div>
                        </div>
                      </td>

                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                          <span style={{ color: '#fff', fontWeight: 600 }}>
                            {cust.paid_installments} / {cust.total_installments} Wks
                          </span>
                          <span style={{ color: 'var(--emerald)' }}>{progressPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--emerald)', borderRadius: 3 }} />
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong style={{ color: isPaid ? 'var(--emerald)' : isOverdue ? 'var(--red)' : '#fbbf24', fontSize: '0.95rem' }}>
                            {formatCurrency(cust.current_week_due)}
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Due: {cust.current_week_due_date || '2026-09-15'}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            isPaid
                              ? 'badge-emerald'
                              : isOverdue
                              ? 'badge-red'
                              : cust.current_week_status === 'PARTIAL'
                              ? 'badge-purple'
                              : 'badge-yellow'
                          }`}
                        >
                          {cust.current_week_status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {/* Collect Installment Button */}
                          <button
                            className={`btn btn-sm ${isPaid ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => handleOpenCollect(cust)}
                          >
                            <DollarSign size={14} />
                            <span>{isPaid ? 'Paid (Add Extra)' : 'Collect'}</span>
                          </button>

                          {/* View 10-Week Schedule */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View 10-Week Repayment Schedule"
                            onClick={() => handleOpenSchedule(cust)}
                          >
                            <Calendar size={14} />
                            <span>Schedule</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* 1. COLLECT WEEKLY INSTALLMENT MODAL        */}
      {/* ========================================== */}
      {isCollectModalOpen && selectedCustomer && (
        <Modal
          isOpen={isCollectModalOpen}
          onClose={() => setIsCollectModalOpen(false)}
          title={`Collect Weekly Installment • ${selectedCustomer.name}`}
        >
          <form onSubmit={handleConfirmWeeklyPayment}>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: 8, marginBottom: '1.25rem', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer:</span>
                <strong style={{ color: '#fff' }}>{selectedCustomer.name} ({selectedCustomer.customer_code})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Loan:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{selectedCustomer.active_loan?.loan_code || 'LN-2026-004'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Outstanding:</span>
                <strong style={{ color: 'var(--red)' }}>{formatCurrency(selectedCustomer.outstanding_balance)}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Collection Amount (₹) *</label>
              <input
                type="number"
                className="form-input"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
                min={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['UPI', 'CASH', 'BANK'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`btn ${paymentMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center' }}
                    onClick={() => setPaymentMode(mode)}
                  >
                    {mode === 'UPI' ? '📱 UPI / QR' : mode === 'CASH' ? '💵 Cash' : '🏦 Bank Transfer'}
                  </button>
                ))}
              </div>
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
                className="btn btn-primary"
                style={{ minWidth: 160, justifyContent: 'center' }}
              >
                <CheckCircle2 size={16} />
                <span>Confirm & Print Receipt</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 2. 10-WEEK SCHEDULE MODAL                  */}
      {/* ========================================== */}
      {isScheduleModalOpen && scheduleCustomer && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title={`10-Week Repayment Schedule • ${scheduleCustomer.name}`}
        >
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Wk #</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt Ref</th>
                </tr>
              </thead>
              <tbody>
                {(scheduleCustomer.schedule || []).map((item) => (
                  <tr key={item.installment_no}>
                    <td>
                      <strong>Week {item.installment_no}</strong>
                    </td>
                    <td>{item.due_date}</td>
                    <td>
                      <strong>{formatCurrency(item.amount)}</strong>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {item.receipt_no || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button className="btn btn-secondary" onClick={() => setIsScheduleModalOpen(false)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 3. ONBOARD WEEKLY BORROWER MODAL           */}
      {/* ========================================== */}
      {isOnboardModalOpen && (
        <Modal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          title="Onboard New Weekly Borrower"
        >
          <form onSubmit={handleCreateWeeklyBorrower}>
            {onboardErrors.form && (
              <div className="feedback-banner" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'var(--red)', marginBottom: '1rem' }}>
                <AlertTriangle size={16} color="var(--red)" />
                <span style={{ color: '#fca5a5' }}>{onboardErrors.form}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Borrower Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh K"
                value={onboardForm.name}
                onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                required
              />
              {onboardErrors.name && <span style={{ color: 'var(--red)', fontSize: '0.75rem', display: 'block', marginTop: 4 }}>{onboardErrors.name}</span>}
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Occupation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Workshop Technician"
                  value={onboardForm.occupation}
                  onChange={(e) => setOnboardForm({ ...onboardForm, occupation: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address / Area</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 14 North Street, Triplicane, Chennai"
                value={onboardForm.address}
                onChange={(e) => setOnboardForm({ ...onboardForm, address: e.target.value })}
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Weekly Loan Principal (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={onboardForm.loan_principal}
                  onChange={(e) => setOnboardForm({ ...onboardForm, loan_principal: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tenure (Weeks)</label>
                <select
                  className="form-input"
                  value={onboardForm.total_installments}
                  onChange={(e) => setOnboardForm({ ...onboardForm, total_installments: e.target.value })}
                >
                  <option value="10">10 Weeks (Standard)</option>
                  <option value="12">12 Weeks</option>
                  <option value="8">8 Weeks (Short Cycle)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsOnboardModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingOnboard}
                className="btn btn-primary"
                style={{ minWidth: 160, justifyContent: 'center' }}
              >
                {submittingOnboard ? 'Onboarding...' : 'Onboard Borrower'}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 4. DIGITAL RECEIPT GENERATOR MODAL         */}
      {/* ========================================== */}
      {receiptData && (
        <Modal
          isOpen={Boolean(receiptData)}
          onClose={() => setReceiptData(null)}
          title="Digital Payment Receipt"
        >
          <div style={{ background: '#FFFFFF', color: '#0F172A', padding: '1.5rem', borderRadius: 8, fontFamily: 'monospace' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #CBD5E1', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#4338CA', fontSize: '1.2rem', fontWeight: 800 }}>APEX MICROFINANCE HUB</h3>
              <p style={{ margin: '0.2rem 0', fontSize: '0.75rem', color: '#64748B' }}>Official Weekly Repayment Receipt</p>
              <strong style={{ fontSize: '0.85rem' }}>Receipt: {receiptData.receiptNumber || receiptData.receipt_number}</strong>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Customer:</span>
                <strong>{receiptData.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Customer Code:</span>
                <span>{receiptData.customer_code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Loan Account:</span>
                <span>{receiptData.loan_code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date & Time:</span>
                <span>{receiptData.date} {receiptData.timestamp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Mode:</span>
                <strong>{receiptData.payment_mode}</strong>
              </div>
            </div>

            <div style={{ borderTop: '2px dashed #CBD5E1', borderBottom: '2px dashed #CBD5E1', padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>AMOUNT PAID:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(receiptData.amount)}</span>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748B', margin: '0.5rem 0 0 0' }}>
              ✓ Immutable ledger entry verified by SuperAdmin core node.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.25rem' }}>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={15} />
              <span>Print Receipt</span>
            </button>
            <button className="btn btn-primary" onClick={() => setReceiptData(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WeeklyCustomers;
