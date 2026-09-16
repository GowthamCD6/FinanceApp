import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Receipt,
  Printer,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Layers,
  FileText,
  AlertTriangle,
  Smartphone,
  Banknote,
  Building2,
  ArrowRight,
} from 'lucide-react';
import './MonthlyCollect.css';

export const MonthlyCollect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId } = useParams();
  const { activeOrg } = useOrg();

  const initialCustomer = location.state?.customer || null;
  const initialDate = location.state?.selectedDate || new Date().toISOString().slice(0, 10);

  const [customer, setCustomer] = useState(initialCustomer);
  const [loadingCust, setLoadingCust] = useState(!initialCustomer);
  const [collectionDate, setCollectionDate] = useState(initialDate);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Tabs: 'COLLECT' | 'SCHEDULE'
  const [activeTab, setActiveTab] = useState('COLLECT');

  // Selected Loan Cards Selection (Multi-card Support)
  const [selectedLoans, setSelectedLoans] = useState({});

  // Monthly Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedLoanForModal, setSelectedLoanForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL');

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Initialize selected loans
  const initializeLoanState = (cust) => {
    const loans = cust.loans || [
      cust.active_loan || {
        id: `loan-${cust.id}`,
        loan_code: `LN-MTH-${cust.customer_code || cust.id}`,
        loan_name: '12-Month EMI Business Loan',
        principal: cust.principal || 50000,
        interest_rate: 18.0,
        total_installments: cust.total_installments || 12,
        paid_installments: cust.paid_installments || 4,
        installment_amount: cust.monthly_emi || 5000,
        remaining_balance: cust.outstanding_balance || 40000,
        issue_date: '2026-05-10',
        maturity_date: '2027-05-10',
      },
    ];
    const selMap = {};
    loans.forEach((l) => {
      selMap[l.id] = true;
    });
    setSelectedLoans(selMap);
  };

  // Fast Date Steppers
  const handlePrevDay = () => {
    const d = new Date(collectionDate);
    d.setDate(d.getDate() - 1);
    setCollectionDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(collectionDate);
    d.setDate(d.getDate() + 1);
    setCollectionDate(d.toISOString().slice(0, 10));
  };

  const handleSetToday = () => {
    setCollectionDate(new Date().toISOString().slice(0, 10));
  };

  const isToday = collectionDate === new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (initialCustomer) {
      initializeLoanState(initialCustomer);
    } else if (customerId) {
      setLoadingCust(true);
      api.getCustomerById(customerId)
        .then((cust) => {
          if (cust) {
            const mapped = {
              id: cust.id,
              customer_code: cust.customer_code || `MTH-${cust.id}`,
              name: cust.full_name || cust.name || 'Monthly Borrower',
              phone: cust.phone || '9876543210',
              address: cust.address || `${cust.city || 'Chennai'}, Tamil Nadu`,
              occupation: cust.occupation || 'Salaried Executive',
              monthly_emi: cust.monthly_emi || 5000,
              current_month_status: 'UNPAID',
              total_installments: 12,
              paid_installments: 4,
              outstanding_balance: cust.totalOutstanding || 40000,
              loans: [
                {
                  id: `loan-${cust.id}`,
                  loan_code: `LN-MTH-${cust.customer_code || cust.id}`,
                  loan_name: '12-Month EMI Business Loan',
                  principal: 50000,
                  interest_rate: 18.0,
                  total_installments: 12,
                  paid_installments: 4,
                  installment_amount: 5000,
                  remaining_balance: 40000,
                  issue_date: '2026-05-10',
                  maturity_date: '2027-05-10',
                },
              ],
            };
            setCustomer(mapped);
            initializeLoanState(mapped);
          }
        })
        .catch((err) => console.error('Error fetching monthly customer for collection:', err))
        .finally(() => setLoadingCust(false));
    }
  }, [customerId]);

  const activeLoans = customer?.loans || (customer?.active_loan ? [customer.active_loan] : []);

  // Helper to generate full monthly schedule for a loan
  const getLoanInstallments = (loan) => {
    if (!loan) return [];
    if (Array.isArray(loan.schedule) && loan.schedule.length > 0) {
      return loan.schedule;
    }

    const total = loan.total_installments || 12;
    const isPaid = customer?.current_month_status === 'PAID' || customer?.current_month_status === 'COLLECTED';
    const paidCount = loan.paid_installments || (isPaid ? 5 : 4);
    const monthlyAmt = loan.installment_amount || customer?.monthly_emi || 5000;
    const baseDate = new Date(loan.issue_date || '2026-05-10');

    const list = [];
    for (let i = 1; i <= total; i++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + (i - 1));
      const isMonthPaid = i <= paidCount;
      const isCurrentDue = i === paidCount + 1;

      list.push({
        month_number: i,
        due_date: d.toISOString().slice(0, 10),
        amount: monthlyAmt,
        paid_amount: isMonthPaid ? monthlyAmt : 0,
        status: isMonthPaid ? 'PAID' : isCurrentDue ? 'CURRENT_DUE' : 'PENDING',
        paid_date: isMonthPaid ? d.toISOString().slice(0, 10) : null,
        receipt_no: isMonthPaid ? `REC-MTH-${customer?.id || '101'}-${i}` : null,
        payment_mode: i % 2 === 0 ? 'CASH' : 'UPI',
        remaining_after: Math.max(0, (total - i) * monthlyAmt),
      });
    }
    return list;
  };

  const isLoanPaidOnDate = (loan) => {
    return customer?.current_month_status === 'PAID' || customer?.current_month_status === 'COLLECTED';
  };

  const toggleLoanSelection = (loanId) => {
    setSelectedLoans((prev) => ({
      ...prev,
      [loanId]: !prev[loanId],
    }));
  };

  const payableSelectedLoans = activeLoans.filter((l) => selectedLoans[l.id] && !isLoanPaidOnDate(l));
  const totalPayableAmount = payableSelectedLoans.reduce((sum, l) => sum + Number(l.installment_amount || 5000), 0);
  const totalCombinedMonthlyDue = activeLoans.reduce((sum, l) => sum + Number(l.installment_amount || 5000), 0);
  const isAlreadyPaid = customer?.current_month_status === 'PAID' || customer?.current_month_status === 'COLLECTED';

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!customer || payableSelectedLoans.length === 0 || totalPayableAmount <= 0) return;

    setSubmitting(true);
    try {
      const collectedItems = [];
      for (const loan of payableSelectedLoans) {
        const amt = loan.installment_amount || 5000;
        const res = await api.recordMonthlyCollection(customer.id, loan.loan_code, paymentMode, amt);
        collectedItems.push({
          loan_id: loan.id,
          loan_code: loan.loan_code,
          loan_name: loan.loan_name || '12-Month EMI Loan',
          amount: amt,
          receipt_no: res?.receipt_no || res?.receiptNumber || `REC-MTH-${Date.now().toString().slice(-6)}`,
        });
      }

      setCustomer((prev) => ({
        ...prev,
        current_month_status: 'PAID',
        paid_installments: (prev?.paid_installments || 4) + 1,
        outstanding_balance: Math.max(0, (prev?.outstanding_balance || 40000) - totalPayableAmount),
      }));

      setReceiptData({
        receipt_master_no: `REC-MTH-BATCH-${Date.now().toString().slice(-6)}`,
        customer_name: customer.name,
        customer_code: customer.customer_code,
        phone: customer.phone,
        address: customer.address,
        total_collected: totalPayableAmount,
        payment_mode: paymentMode,
        collection_date: collectionDate,
        timestamp: new Date().toLocaleString('en-IN'),
        items: collectedItems,
      });
    } catch (err) {
      alert('Failed to record payment: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLoanModal = (loan) => {
    setSelectedLoanForModal(loan);
    setModalFilterStatus('ALL');
    setShowLogModal(true);
  };

  if (loadingCust) {
    return (
      <div className="monthly-collect-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 0.5rem' }}>
        <div className="skeleton-bar" style={{ width: 220, height: 38, marginBottom: '1.5rem', borderRadius: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', borderRadius: 12 }}>
            <div className="skeleton-bar" style={{ width: '60%', height: 24, marginBottom: 12 }} />
            <div className="skeleton-bar" style={{ width: '40%', height: 16, marginBottom: 20 }} />
            <div className="skeleton-bar" style={{ width: '100%', height: 140, borderRadius: 8 }} />
          </div>
          <div className="card" style={{ padding: '2rem', borderRadius: 12 }}>
            <div className="skeleton-bar" style={{ width: '70%', height: 24, marginBottom: 16 }} />
            <div className="skeleton-bar" style={{ width: '100%', height: 180, borderRadius: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="monthly-collect-page" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <CreditCard size={44} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>Borrower Record Not Found</h3>
        <p style={{ color: '#64748B', margin: '0.5rem 0 1.5rem 0', fontSize: '0.88rem' }}>
          Unable to find active monthly EMI schemes for this borrower.
        </p>
        <button
          type="button"
          className="mcol-btn-back"
          onClick={() => navigate(getOrgPath('monthly-customers'))}
        >
          <ArrowLeft size={16} />
          <span>Back to Monthly Borrowers</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: OFFICIAL POST-PAYMENT RECEIPT
  // =========================================================================
  if (receiptData) {
    return (
      <div className="monthly-collect-page">
        <div className="mcol-receipt-container">
          <div className="mcol-receipt-card">
            <div className="mcol-receipt-icon">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="mcol-receipt-title">Monthly EMI Collection Receipt</h2>
            <p className="mcol-receipt-desc">
              Monthly EMI installment collection logged into branch loan portfolio.
            </p>

            <div className="mcol-receipt-details-box">
              <div className="mcol-receipt-row">
                <span className="mcol-receipt-row-label">Receipt Number:</span>
                <span className="mcol-receipt-row-val">{receiptData.receipt_master_no}</span>
              </div>

              <div className="mcol-receipt-row">
                <span className="mcol-receipt-row-label">Borrower / Client:</span>
                <span className="mcol-receipt-row-val">
                  {receiptData.customer_name} ({receiptData.customer_code})
                </span>
              </div>

              <div className="mcol-receipt-row">
                <span className="mcol-receipt-row-label">Phone & Location:</span>
                <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>
                  {receiptData.phone} • {receiptData.address}
                </span>
              </div>

              <div className="mcol-receipt-row">
                <span className="mcol-receipt-row-label">Payment Mode:</span>
                <span
                  style={{
                    color: '#065F46',
                    background: '#D1FAE5',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  {receiptData.payment_mode}
                </span>
              </div>

              <div className="mcol-receipt-row">
                <span className="mcol-receipt-row-label">Collection Date:</span>
                <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                  {receiptData.collection_date} • {receiptData.timestamp}
                </span>
              </div>

              <hr style={{ borderColor: '#E2E8F0', margin: '0.75rem 0' }} />

              <div className="mcol-receipt-items">
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}
                >
                  Allocated EMI Scheme Dues:
                </span>
                {receiptData.items.map((it, idx) => (
                  <div key={idx} className="mcol-receipt-item-card">
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 800 }}>
                        {it.loan_code}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: 6 }}>
                        ({it.loan_name})
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Ref: {it.receipt_no}</div>
                    </div>
                    <strong style={{ color: '#0F172A', fontSize: '1rem', fontWeight: 800 }}>
                      {formatCurrency(it.amount)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="mcol-receipt-total-row">
                <span className="mcol-receipt-total-label">Total EMI Collected:</span>
                <strong className="mcol-receipt-total-val">
                  {formatCurrency(receiptData.total_collected)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="mcol-btn-back"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Official Receipt</span>
              </button>
              <button
                type="button"
                className="mcol-btn-submit"
                style={{ width: 'auto', padding: '0.55rem 1.25rem' }}
                onClick={() => navigate(getOrgPath('monthly-customers'))}
              >
                <span>Back to Monthly Borrowers</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE MULTI-LOAN COLLECTION & SCHEDULE WORKSPACE
  // =========================================================================
  const scheduleLoan = activeLoans[0];
  const scheduleItems = scheduleLoan ? getLoanInstallments(scheduleLoan) : [];
  const filteredScheduleItems = scheduleItems.filter((inst) => {
    if (modalFilterStatus === 'PAID') return inst.status === 'PAID';
    if (modalFilterStatus === 'PENDING') return inst.status !== 'PAID';
    return true;
  });

  return (
    <div className="monthly-collect-page">
      {/* 1. Top Navigation & Tab Bar */}
      <div className="mcol-top-nav">
        <button
          type="button"
          className="mcol-btn-back"
          onClick={() => navigate(getOrgPath('monthly-customers'))}
        >
          <ArrowLeft size={16} />
          <span>Back to Monthly Borrowers</span>
        </button>

        <div className="mcol-tab-group">
          <button
            type="button"
            className={`mcol-tab-btn ${activeTab === 'COLLECT' ? 'active' : ''}`}
            onClick={() => setActiveTab('COLLECT')}
          >
            <DollarSign size={14} />
            <span>Quick Collection Form</span>
          </button>
          <button
            type="button"
            className={`mcol-tab-btn ${activeTab === 'SCHEDULE' ? 'active' : ''}`}
            onClick={() => setActiveTab('SCHEDULE')}
          >
            <Calendar size={14} />
            <span>12-Month EMI Schedule</span>
          </button>
        </div>
      </div>

      {/* 2. Borrower Profile Hero Bar */}
      <div className="mcol-hero-card">
        <div className="mcol-hero-left">
          <div className="mcol-hero-avatar">
            {customer.name?.charAt(0) || 'M'}
          </div>

          <div>
            <div className="mcol-hero-title-row">
              <h2 className="mcol-hero-name">{customer.name}</h2>
              <span className="mcol-scheme-count-pill">
                <Layers size={12} />
                <span>{activeLoans.length} Active Scheme{activeLoans.length > 1 ? 's' : ''}</span>
              </span>
            </div>

            <div className="mcol-hero-meta">
              <span className="mcol-hero-meta-item">
                Code: <strong>{customer.customer_code}</strong>
              </span>
              <span className="mcol-hero-meta-item">
                • <Phone size={13} color="#64748B" /> <strong>{customer.phone}</strong>
              </span>
              <span className="mcol-hero-meta-item">
                • <MapPin size={13} color="#64748B" /> <span>{customer.address || 'Chennai'}</span>
              </span>
              <span className="mcol-hero-meta-item">
                • Profession: <span>{customer.occupation || 'Salaried Executive'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Solid #0F172A Metric Numbers on Right */}
        <div className="mcol-hero-stats">
          <div className="mcol-hero-stat-block">
            <span className="mcol-hero-stat-label">Monthly Combined EMI</span>
            <strong className="mcol-hero-stat-val">
              {formatCurrency(totalCombinedMonthlyDue)}
            </strong>
          </div>
          <div className="mcol-hero-stat-block" style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.25rem' }}>
            <span className="mcol-hero-stat-label">Total Outstanding</span>
            <strong className="mcol-hero-stat-val">
              {formatCurrency(customer.outstanding_balance || 40000)}
            </strong>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: QUICK COLLECTION WORKSPACE                                     */}
      {/* ===================================================================== */}
      {activeTab === 'COLLECT' && (
        <div className="mcol-workspace-grid">
          {/* Left Column: Active Loan Cards Shelf */}
          <div>
            <div className="mcol-shelf-header">
              <h3 className="mcol-shelf-title">
                Active Monthly EMI Schemes ({activeLoans.length})
              </h3>
              <span className="mcol-shelf-hint">
                Click card to open 12-Month Log
              </span>
            </div>

            {activeLoans.map((loan, idx) => {
              const isSelected = !!selectedLoans[loan.id];
              const totalMonths = loan.total_installments || 12;
              const paidMonths = loan.paid_installments || (isAlreadyPaid ? 5 : 4);
              const progressPct = totalMonths > 0 ? Math.round((paidMonths / totalMonths) * 100) : 0;
              const isPaidForMonth = isLoanPaidOnDate(loan);

              return (
                <div
                  key={loan.id || idx}
                  className={`mcol-loan-card ${isPaidForMonth ? 'settled' : ''}`}
                  onClick={() => handleOpenLoanModal(loan)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="mcol-loan-card-top">
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                      {isPaidForMonth ? (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#ECFDF5',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            border: '1px solid #A7F3D0',
                          }}
                          title="Settled for this month"
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleLoanSelection(loan.id)}
                          style={{ width: 17, height: 17, accentColor: '#2563EB', cursor: 'pointer' }}
                        />
                      )}

                      <div>
                        <div className="mcol-loan-card-title-group">
                          <span className="mcol-loan-code">{loan.loan_code}</span>
                          <span className="mcol-loan-name-badge">
                            {loan.loan_name || '12-Month EMI Scheme'}
                          </span>
                        </div>
                        <div className="mcol-loan-card-sub">
                          Issued: {loan.issue_date || '2026-05-10'} • Maturity: {loan.maturity_date || '2027-05-10'}
                        </div>
                      </div>
                    </div>

                    <div className="mcol-loan-card-emi-block">
                      <span className="mcol-loan-card-emi-label">Monthly EMI</span>
                      <strong className="mcol-loan-card-emi-val">
                        {formatCurrency(loan.installment_amount || 5000)}
                      </strong>
                    </div>
                  </div>

                  {/* 3-Column Financial Grid: Solid #0F172A */}
                  <div className="mcol-loan-metrics-grid">
                    <div className="mcol-metric-box">
                      <span className="mcol-metric-label">Principal & Rate</span>
                      <strong className="mcol-metric-val">
                        {formatCurrency(loan.principal || 50000)} @ {loan.interest_rate || 18}%
                      </strong>
                    </div>
                    <div className="mcol-metric-box">
                      <span className="mcol-metric-label">Total Repayable</span>
                      <strong className="mcol-metric-val">
                        {formatCurrency((loan.principal || 50000) * 1.18)}
                      </strong>
                    </div>
                    <div className="mcol-metric-box">
                      <span className="mcol-metric-label">Remaining Balance</span>
                      <strong className="mcol-metric-val">
                        {formatCurrency(loan.remaining_balance || 40000)}
                      </strong>
                    </div>
                  </div>

                  {/* Timeline Progress */}
                  <div className="mcol-timeline-wrap">
                    <div className="mcol-timeline-header">
                      <span className="mcol-timeline-label">Repayment Timeline</span>
                      <span className="mcol-timeline-val">
                        Month {paidMonths} of {totalMonths} ({progressPct}%)
                      </span>
                    </div>
                    <div className="mcol-timeline-track">
                      <div
                        className={`mcol-timeline-fill ${isPaidForMonth ? 'settled' : ''}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Actions Bottom Bar */}
                  <div className="mcol-loan-card-footer" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="mcol-btn-view-log"
                      onClick={() => handleOpenLoanModal(loan)}
                    >
                      <Calendar size={13} />
                      <span>View 12-Month Log</span>
                    </button>

                    {isPaidForMonth ? (
                      <span className="mcol-pill-settled">
                        <CheckCircle2 size={13} />
                        <span>Settled</span>
                      </span>
                    ) : (
                      <span className="mcol-pill-due">
                        <Clock size={13} />
                        <span>EMI Due</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Collection Form Card */}
          <div>
            <div className="mcol-form-card">
              {/* Date Stepper */}
              <div className="mcol-form-date-group">
                <label className="mcol-form-label">Collection Date</label>
                <div className="mcol-date-stepper-row">
                  <button
                    type="button"
                    className="mcol-date-step-btn"
                    onClick={handlePrevDay}
                    title="Previous Day"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    className={`mcol-date-step-btn ${isToday ? 'active' : ''}`}
                    onClick={handleSetToday}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="mcol-date-step-btn"
                    onClick={handleNextDay}
                    title="Next Day"
                  >
                    <ChevronRight size={15} />
                  </button>
                  <input
                    type="date"
                    className="mcol-date-input"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                  />
                </div>
              </div>

              {isAlreadyPaid ? (
                <div className="mcol-settled-box">
                  <div className="mcol-settled-icon">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="mcol-settled-title">Month EMI Dues Settled</h4>
                  <p className="mcol-settled-desc">
                    This customer has completed their monthly installment payment.
                  </p>
                  <button
                    type="button"
                    className="mcol-btn-back"
                    onClick={() => setShowLogModal(true)}
                    style={{ marginTop: '1.25rem' }}
                  >
                    View Statement History
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment}>
                  {/* Clean Amount Box (No Loud Gradient, Solid #0F172A) */}
                  <div className="mcol-amount-box">
                    <div className="mcol-amount-box-label">Selected Monthly EMI</div>
                    <div className="mcol-amount-box-val">
                      {formatCurrency(totalPayableAmount)}
                    </div>
                    <div className="mcol-amount-box-meta">
                      Collecting for {payableSelectedLoans.length} active monthly scheme(s)
                    </div>
                  </div>

                  {/* Payment Mode Segmented Control */}
                  <div className="mcol-mode-group">
                    <label className="mcol-form-label">Select Payment Mode</label>
                    <div className="mcol-mode-selector">
                      {['UPI', 'CASH', 'BANK'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className={`mcol-mode-btn ${paymentMode === mode ? 'active' : ''}`}
                          onClick={() => setPaymentMode(mode)}
                        >
                          {mode === 'UPI' ? (
                            <Smartphone size={15} />
                          ) : mode === 'CASH' ? (
                            <Banknote size={15} />
                          ) : (
                            <Building2 size={15} />
                          )}
                          <span>{mode === 'UPI' ? 'UPI' : mode === 'CASH' ? 'Cash' : 'Bank'}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Collect Button */}
                  <button
                    type="submit"
                    className="mcol-btn-submit"
                    disabled={submitting || totalPayableAmount <= 0}
                  >
                    {submitting ? (
                      <span>Recording Collection...</span>
                    ) : (
                      <>
                        <span>Collect {formatCurrency(totalPayableAmount)} Now</span>
                        <Check size={17} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: INLINE 12-MONTH LEDGER & SCHEDULE                              */}
      {/* ===================================================================== */}
      {activeTab === 'SCHEDULE' && (
        <div className="directory-table-card" style={{ padding: '1.25rem 1.45rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                12-Month EMI Repayment Ledger
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                Full installment breakdown and payment receipt log for {customer.name}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <div className="mc-filter-pills">
                <button
                  type="button"
                  className={`mc-filter-pill-btn ${modalFilterStatus === 'ALL' ? 'active' : ''}`}
                  onClick={() => setModalFilterStatus('ALL')}
                >
                  All ({scheduleItems.length})
                </button>
                <button
                  type="button"
                  className={`mc-filter-pill-btn ${modalFilterStatus === 'PAID' ? 'active' : ''}`}
                  onClick={() => setModalFilterStatus('PAID')}
                >
                  Paid
                </button>
                <button
                  type="button"
                  className={`mc-filter-pill-btn ${modalFilterStatus === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setModalFilterStatus('PENDING')}
                >
                  Pending
                </button>
              </div>

              <button
                type="button"
                className="mcol-btn-back"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Ledger</span>
              </button>
            </div>
          </div>

          <div className="directory-table-responsive" style={{ border: '1px solid #E2E8F0', borderRadius: 8 }}>
            <table className="directory-table">
              <thead>
                <tr>
                  <th>MONTH #</th>
                  <th>DUE DATE</th>
                  <th>AMOUNT</th>
                  <th>PAID DATE</th>
                  <th>PAYMENT INFO</th>
                  <th style={{ textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredScheduleItems.map((inst) => {
                  const isPaid = inst.status === 'PAID';
                  const isCurrent = inst.status === 'CURRENT_DUE';
                  return (
                    <tr key={inst.month_number}>
                      <td style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                        Month {inst.month_number}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                        {inst.due_date}
                      </td>
                      <td style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                        {formatCurrency(inst.amount)}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {isPaid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 700 }}>
                            <CheckCircle2 size={13} />
                            <span>{inst.paid_date || inst.due_date}</span>
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {isPaid ? (
                          <span>
                            {inst.receipt_no} • <strong style={{ color: '#2563EB' }}>{inst.payment_mode}</strong>
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Uncollected</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          className={`mc-status-badge ${
                            isPaid ? 'paid' : isCurrent ? 'pending' : 'pending'
                          }`}
                        >
                          {isPaid ? 'PAID' : isCurrent ? 'DUE NOW' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Monthly Log Modal */}
      {showLogModal && (
        <div className="mcol-modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="mcol-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mcol-modal-header">
              <div className="mcol-modal-title-group">
                <div className="mcol-modal-avatar">
                  {customer.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <h3 className="mcol-modal-title">
                    {customer.name} — 12-Month EMI Schedule Log
                  </h3>
                  <div className="mcol-modal-sub">
                    {customer.customer_code} • {customer.phone}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mcol-modal-close-btn"
                onClick={() => setShowLogModal(false)}
                title="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mcol-modal-body">
              <div className="mcol-modal-table-wrap">
                <table className="mcol-modal-table">
                  <thead>
                    <tr>
                      <th>MONTH #</th>
                      <th>DUE DATE</th>
                      <th>AMOUNT</th>
                      <th>PAID DATE</th>
                      <th>PAYMENT INFO</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScheduleItems.map((inst) => {
                      const isPaid = inst.status === 'PAID';
                      const isCurrent = inst.status === 'CURRENT_DUE';
                      return (
                        <tr key={inst.month_number}>
                          <td style={{ fontWeight: 800, color: '#0F172A' }}>Month {inst.month_number}</td>
                          <td style={{ color: '#475569', fontWeight: 600 }}>{inst.due_date}</td>
                          <td style={{ fontWeight: 800, color: '#0F172A' }}>{formatCurrency(inst.amount)}</td>
                          <td style={{ color: isPaid ? '#059669' : '#94A3B8', fontWeight: isPaid ? 700 : 500 }}>
                            {isPaid ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={13} color="#059669" />
                                <span>{inst.paid_date || inst.due_date}</span>
                              </span>
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                          <td style={{ color: '#64748B' }}>
                            {isPaid ? (
                              <span>
                                {inst.receipt_no} • <strong style={{ color: '#2563EB' }}>{inst.payment_mode}</strong>
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Uncollected</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`mc-status-badge ${
                                isPaid ? 'paid' : isCurrent ? 'pending' : 'pending'
                              }`}
                            >
                              {isPaid ? 'PAID' : isCurrent ? 'DUE NOW' : 'PENDING'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {isPaid ? (
                              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Settled</span>
                            ) : (
                              <button
                                type="button"
                                className="mc-modal-btn-pay"
                                onClick={() => {
                                  setShowLogModal(false);
                                  setActiveTab('COLLECT');
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

            <div className="mcol-modal-footer">
              <button
                type="button"
                className="mcol-btn-back"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Borrower Statement</span>
              </button>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="mcol-btn-back"
                  onClick={() => setShowLogModal(false)}
                >
                  Close Log
                </button>

                <button
                  type="button"
                  className="mcol-btn-submit"
                  style={{ width: 'auto', padding: '0.45rem 1rem' }}
                  onClick={() => {
                    setShowLogModal(false);
                    setActiveTab('COLLECT');
                  }}
                >
                  <span>Collect Monthly EMI</span>
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

export default MonthlyCollect;
