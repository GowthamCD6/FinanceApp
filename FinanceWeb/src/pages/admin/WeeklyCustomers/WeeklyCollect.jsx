import React, { useState, useEffect } from 'react';
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
  Building,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
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

export const WeeklyCollect = () => {
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

  // Weekly Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedLoanForModal, setSelectedLoanForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL');

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Initialize selected loans
  const initializeLoanState = (cust) => {
    const rawLoans = (cust.loans && cust.loans.length > 0)
      ? cust.loans
      : (cust.active_loan ? [cust.active_loan] : []);
    const selMap = {};
    rawLoans.forEach((l) => {
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

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setCollectionDate(d.toISOString().slice(0, 10));
  };

  const isToday = collectionDate === new Date().toISOString().slice(0, 10);
  const isYesterday = (() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return collectionDate === y.toISOString().slice(0, 10);
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

  useEffect(() => {
    if (initialCustomer && initialCustomer.loans && initialCustomer.loans.length > 0) {
      setCustomer(initialCustomer);
      initializeLoanState(initialCustomer);
      setLoadingCust(false);
    } else if (customerId) {
      setLoadingCust(true);
      api.getCustomerById(customerId)
        .then((cust) => {
          if (cust) {
            const rawLoans = cust.loans || [];
            const weeklyLoans = rawLoans.filter((l) => (l.repayment_frequency || '').toUpperCase() === 'WEEKLY' || !l.repayment_frequency);
            const activeLoanList = (weeklyLoans.length > 0 ? weeklyLoans : rawLoans).map((l) => {
              const instList = l.installments || l.schedule || [];
              const totalInst = l.total_installments || (instList.length > 0 ? instList.length : 10);
              const paidInst = instList.filter((i) => i.status === 'PAID').length;
              const schedAmt = instList.length > 0
                ? Number(instList[0].scheduled_amount || instList[0].amount)
                : Math.ceil(Number(l.total_repayment_amount || l.principal_amount) / totalInst);
              const totalRepay = Number(l.total_repayment_amount || (Number(l.principal_amount) + Number(l.contracted_income_amount || 0)));
              const paidAmt = instList.filter((i) => i.status === 'PAID').reduce((s, i) => s + Number(i.paid_amount || schedAmt), 0);
              const remaining = Math.max(0, totalRepay - paidAmt);
              return {
                id: l.id,
                loan_code: l.loan_number || `LN-WK-${cust.customer_code || cust.id}`,
                loan_name: l.loan_title || l.product_name || `${totalInst}-Week Micro-Loan`,
                principal: Number(l.principal_amount),
                interest_rate: Number(l.interest_rate || 20),
                total_repayment_amount: totalRepay,
                installment_amount: schedAmt,
                total_installments: totalInst,
                paid_installments: paidInst,
                remaining_balance: remaining,
                status: l.status,
                issue_date: l.disbursement_date ? String(l.disbursement_date).slice(0, 10) : '2026-09-16',
                maturity_date: l.maturity_date ? String(l.maturity_date).slice(0, 10) : (instList.length > 0 ? String(instList[instList.length - 1].due_date).slice(0, 10) : null),
                schedule: l.schedule || instList,
              };
            });

            const firstLoan = activeLoanList[0] || null;
            const mapped = {
              id: cust.id,
              customer_code: cust.customer_code || `CUST-${cust.id}`,
              name: cust.full_name || cust.name || 'Weekly Borrower',
              phone: cust.phone || '9876543210',
              address: cust.address || `${cust.city || 'Chennai'}, Tamil Nadu`,
              occupation: cust.occupation || 'Self Employed',
              current_week_due: firstLoan?.installment_amount || 0,
              current_week_status: firstLoan?.paid_installments > 0 ? 'PAID' : 'UNPAID',
              total_installments: firstLoan?.total_installments || 10,
              paid_installments: firstLoan?.paid_installments || 0,
              outstanding_balance: firstLoan?.remaining_balance || 0,
              active_loan: firstLoan,
              loans: activeLoanList,
            };
            setCustomer(mapped);
            initializeLoanState(mapped);
          }
        })
        .catch((err) => console.error('Error fetching customer for collection:', err))
        .finally(() => setLoadingCust(false));
    }
  }, [customerId, initialCustomer]);

  const activeLoans = customer?.loans || (customer?.active_loan ? [customer.active_loan] : []);

  // Helper to generate full weekly schedule for a loan
  const getLoanInstallments = (loan) => {
    if (!loan) return [];
    if (Array.isArray(loan.schedule) && loan.schedule.length > 0) {
      return loan.schedule.map((s, idx) => ({
        week_number: s.installment_no || s.week_number || (idx + 1),
        due_date: String(s.due_date).slice(0, 10),
        amount: Number(s.amount || s.scheduled_amount || loan.installment_amount || 0),
        paid_amount: Number(s.paid_amount || 0),
        status: s.status,
        paid_date: s.paid_at ? String(s.paid_at).slice(0, 10) : (s.status === 'PAID' ? String(s.due_date).slice(0, 10) : null),
        receipt_no: s.receipt_no || null,
        payment_mode: s.payment_mode || ((idx % 2 === 0) ? 'CASH' : 'UPI'),
        remaining_after: Math.max(0, (loan.total_repayment_amount || (loan.installment_amount * loan.total_installments)) - ((idx + 1) * (loan.installment_amount || 0))),
      }));
    }

    const total = loan.total_installments || 10;
    const isPaid = customer?.current_week_status === 'PAID' || customer?.current_week_status === 'COLLECTED';
    const paidCount = loan.paid_installments || (isPaid ? 1 : 0);
    const weeklyAmt = loan.installment_amount || 0;
    const baseDate = new Date(loan.issue_date || '2026-09-16');

    const list = [];
    for (let i = 1; i <= total; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (i - 1) * 7);
      const isWeekPaid = i <= paidCount;
      const isCurrentDue = i === paidCount + 1;

      list.push({
        week_number: i,
        due_date: d.toISOString().slice(0, 10),
        amount: weeklyAmt,
        paid_amount: isWeekPaid ? weeklyAmt : 0,
        status: isWeekPaid ? 'PAID' : isCurrentDue ? 'CURRENT_DUE' : 'PENDING',
        paid_date: isWeekPaid ? d.toISOString().slice(0, 10) : null,
        receipt_no: isWeekPaid ? `REC-WK-${customer?.id || '101'}-${i}` : null,
        payment_mode: i % 2 === 0 ? 'CASH' : 'UPI',
        remaining_after: Math.max(0, (total - i) * weeklyAmt),
      });
    }
    return list;
  };

  const isLoanPaidOnDate = (loan) => {
    return customer?.current_week_status === 'PAID' || customer?.current_week_status === 'COLLECTED';
  };

  const toggleLoanSelection = (loanId) => {
    setSelectedLoans((prev) => ({
      ...prev,
      [loanId]: !prev[loanId],
    }));
  };

  const payableSelectedLoans = activeLoans.filter((l) => selectedLoans[l.id] && !isLoanPaidOnDate(l));
  const totalPayableAmount = payableSelectedLoans.reduce((sum, l) => sum + Number(l.installment_amount || 2200), 0);
  const totalCombinedWeeklyDue = activeLoans.reduce((sum, l) => sum + Number(l.installment_amount || 2200), 0);
  const isAlreadyPaid = customer?.current_week_status === 'PAID' || customer?.current_week_status === 'COLLECTED';

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!customer || payableSelectedLoans.length === 0 || totalPayableAmount <= 0) return;

    setSubmitting(true);
    try {
      const collectedItems = [];
      for (const loan of payableSelectedLoans) {
        const amt = loan.installment_amount || 2200;
        const res = await api.recordWeeklyCollection(customer.id, loan.loan_code, paymentMode, amt);
        collectedItems.push({
          loan_id: loan.id,
          loan_code: loan.loan_code,
          loan_name: loan.loan_name || 'Weekly Microfinance Scheme',
          amount: amt,
          receipt_no: res?.receipt_no || res?.receiptNumber || `REC-WK-${Date.now().toString().slice(-6)}`,
        });
      }

      setCustomer((prev) => ({
        ...prev,
        current_week_status: 'PAID',
        paid_installments: (prev?.paid_installments || 3) + 1,
        outstanding_balance: Math.max(0, (prev?.outstanding_balance || 15400) - totalPayableAmount),
      }));

      setReceiptData({
        receipt_master_no: `REC-WK-BATCH-${Date.now().toString().slice(-6)}`,
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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 0.5rem' }}>
        <div className="skeleton-bar" style={{ width: 220, height: 38, marginBottom: '1.5rem', borderRadius: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', borderRadius: 14 }}>
            <div className="skeleton-bar" style={{ width: '60%', height: 24, marginBottom: 12 }} />
            <div className="skeleton-bar" style={{ width: '40%', height: 16, marginBottom: 20 }} />
            <div className="skeleton-bar" style={{ width: '100%', height: 140, borderRadius: 10 }} />
          </div>
          <div className="card" style={{ padding: '2rem', borderRadius: 14 }}>
            <div className="skeleton-bar" style={{ width: '70%', height: 24, marginBottom: 16 }} />
            <div className="skeleton-bar" style={{ width: '100%', height: 180, borderRadius: 10 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <Users size={44} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Borrower Record Not Found</h3>
        <p style={{ color: '#64748B', margin: '0.5rem 0 1.5rem 0' }}>
          Unable to find active weekly installment schemes for this borrower.
        </p>
        <button className="btn btn-secondary" onClick={() => navigate(getOrgPath('weekly-customers'))}>
          <ArrowLeft size={16} /> Back to Weekly Borrowers
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: OFFICIAL POST-PAYMENT RECEIPT
  // =========================================================================
  if (receiptData) {
    return (
      <div style={{ maxWidth: 740, margin: '1.5rem auto', padding: '0 1rem' }}>
        <div
          className="card"
          style={{
            padding: '2.5rem 2rem',
            textAlign: 'center',
            borderTop: '4px solid #059669',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            borderRadius: 16,
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              border: '2px solid #A7F3D0',
            }}
          >
            <CheckCircle2 size={36} color="#059669" />
          </div>

          <h2 style={{ margin: '0 0 0.4rem 0', color: 'var(--text-primary)', fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Weekly Collection Receipt
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Weekly installment repayment successfully logged into branch portfolio.
          </p>

          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 12,
              padding: '1.5rem',
              textAlign: 'left',
              marginBottom: '1.75rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 700 }}>Receipt Number:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '0.92rem', fontWeight: 800 }}>
                {receiptData.receipt_master_no}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 700 }}>Borrower / Client:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.92rem' }}>
                {receiptData.customer_name} ({receiptData.customer_code})
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 700 }}>Phone & Location:</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                {receiptData.phone} • {receiptData.address}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 700 }}>Payment Mode:</span>
              <span
                style={{
                  color: '#065F46',
                  background: '#D1FAE5',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  border: '1px solid #A7F3D0',
                }}
              >
                {receiptData.payment_mode}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 700 }}>Collection Date:</span>
              <span style={{ color: '#64748B', fontSize: '0.85rem' }}>{receiptData.collection_date} • {receiptData.timestamp}</span>
            </div>

            <hr style={{ borderColor: '#E2E8F0', margin: '0.75rem 0' }} />

            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>
                Allocated Weekly Scheme Dues:
              </span>
              {receiptData.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#FFFFFF',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 8,
                    marginBottom: 6,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800 }}>{it.loan_code}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: 6 }}>({it.loan_name})</span>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Ref: {it.receipt_no}</div>
                  </div>
                  <strong style={{ color: '#047857', fontSize: '1.05rem', fontWeight: 900 }}>
                    {formatCurrency(it.amount)}
                  </strong>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '2px solid #E2E8F0',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Total Amount Collected:
              </span>
              <strong style={{ fontSize: '1.45rem', fontWeight: 900, color: '#047857' }}>
                {formatCurrency(receiptData.total_collected)}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.35rem', fontWeight: 700 }}
            >
              <Printer size={16} /> <span>Print Official Receipt</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(getOrgPath('weekly-customers'))}
              style={{ padding: '0.7rem 1.35rem', fontWeight: 800 }}
            >
              Back to Weekly Borrowers
            </button>
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
    <div style={{ width: '100%', maxWidth: '100%', padding: '0 0.5rem' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(getOrgPath('weekly-customers'))}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Weekly Borrowers</span>
        </button>

        {/* Tab Selector: Collection Mode vs Day-wise Installment Schedule */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.25rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'COLLECT' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', fontWeight: 700 }}
            onClick={() => setActiveTab('COLLECT')}
          >
            <DollarSign size={14} /> Quick Collection Form
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'SCHEDULE' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', fontWeight: 700 }}
            onClick={() => setActiveTab('SCHEDULE')}
          >
            <Calendar size={14} /> 10-Week Ledger & Schedule
          </button>
        </div>
      </div>

      {/* Borrower Profile Hero Bar */}
      <div
        className="card"
        style={{
          padding: '1.35rem 1.5rem',
          marginBottom: '1.25rem',
          border: '1.5px solid #E2E8F0',
          borderRadius: 14,
          background: '#FFFFFF',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#EEF2FF',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.25rem',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.12)',
              }}
            >
              {customer.name?.charAt(0) || 'W'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {customer.name}
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 6,
                    background: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Layers size={11} /> {activeLoans.length} Active Scheme{activeLoans.length > 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap', alignItems: 'center' }}>
                <span>Code: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{customer.customer_code || `CUST-${customer.id}`}</strong></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>• <Phone size={13} color="#64748B" /> <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{customer.phone}</strong></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>• <MapPin size={13} color="#64748B" /> <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{customer.address || 'Chennai'}</strong></span>
                <span>• Profession: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{customer.occupation || 'Retail Vendor'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Weekly Combined Due</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: isAlreadyPaid ? '#059669' : 'var(--primary)', letterSpacing: '-0.02em' }}>
                {formatCurrency(totalCombinedWeeklyDue)}
              </strong>
            </div>
            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.25rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Total Outstanding</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626', letterSpacing: '-0.02em' }}>
                {formatCurrency(customer.outstanding_balance || 0)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: QUICK COLLECTION WORKSPACE                                     */}
      {/* ===================================================================== */}
      {activeTab === 'COLLECT' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {/* Left Column: Active Loan Cards Shelf */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Active Weekly Loan Schemes ({activeLoans.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                Click card to open {activeLoans[0]?.total_installments || 10}-Week Log
              </span>
            </div>

            {activeLoans.map((loan, idx) => {
              const isSelected = !!selectedLoans[loan.id];
              const totalWeeks = loan.total_installments || 10;
              const paidWeeks = loan.paid_installments || (isAlreadyPaid ? 1 : 0);
              const progressPct = totalWeeks > 0 ? Math.round((paidWeeks / totalWeeks) * 100) : 0;
              const isPaidForWeek = isLoanPaidOnDate(loan);

              return (
                <div
                  key={loan.id || idx}
                  className="card"
                  onClick={() => handleOpenLoanModal(loan)}
                  style={{
                    padding: '1.25rem 1.4rem',
                    border: `1.5px solid ${isPaidForWeek ? '#A7F3D0' : isSelected ? 'var(--primary)' : '#E2E8F0'}`,
                    borderRadius: 14,
                    background: isPaidForWeek ? '#F0FDF4' : isSelected ? '#FFFFFF' : '#F8FAFC',
                    boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isPaidForWeek ? '#059669' : 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isPaidForWeek ? '#A7F3D0' : isSelected ? 'var(--primary)' : '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                      {isPaidForWeek ? (
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#059669',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                          }}
                          title="Settled for this week"
                        >
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleLoanSelection(loan.id)}
                          style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            {loan.loan_code}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.55rem',
                              borderRadius: 4,
                              background: '#EEF2FF',
                              border: '1px solid #C7D2FE',
                              color: 'var(--primary)',
                            }}
                          >
                            {loan.loan_name || `${totalWeeks}-Week Microfinance Scheme`}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          Issued: {loan.issue_date || '2026-09-16'} {loan.maturity_date ? `• Maturity: ${loan.maturity_date}` : ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Weekly Due</span>
                      <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: isPaidForWeek ? '#047857' : 'var(--primary)', letterSpacing: '-0.02em' }}>
                        {formatCurrency(loan.installment_amount || 0)}
                      </strong>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      background: isPaidForWeek ? '#FFFFFF' : '#F8FAFC',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 8,
                      marginBottom: '0.75rem',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Principal & Rate</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                        {formatCurrency(loan.principal)} @ {loan.interest_rate}%
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Repayable</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                        {formatCurrency(loan.total_repayment_amount)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Remaining Balance</span>
                      <strong style={{ color: '#DC2626', fontWeight: 900 }}>
                        {formatCurrency(loan.remaining_balance)}
                      </strong>
                    </div>
                  </div>

                  {/* Timeline Progress */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>
                        Repayment Timeline:
                      </span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                        Week {paidWeeks} of {totalWeeks} ({progressPct}%)
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          background: isPaidForWeek ? '#059669' : 'linear-gradient(90deg, #6366F1, #4F46E5)',
                          borderRadius: 3,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>

                  {/* Card Actions Bottom Bar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid #E2E8F0',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleOpenLoanModal(loan)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        color: 'var(--primary)',
                        borderColor: '#C7D2FE',
                        background: '#EEF2FF',
                      }}
                    >
                      <Calendar size={13} /> View 10-Week Log ↗
                    </button>

                    {isPaidForWeek ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 12,
                          background: '#ECFDF5',
                          color: '#059669',
                          border: '1px solid #A7F3D0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CheckCircle2 size={13} /> Settled
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 12,
                          background: '#FFFBEB',
                          color: '#D97706',
                          border: '1px solid #FDE68A',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Clock size={13} /> Payment Due
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Payment Form or Settled Screen */}
          <div>
            <div
              className="card"
              style={{
                padding: '1.5rem',
                border: '1.5px solid #E2E8F0',
                borderRadius: 14,
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Date Stepper in Form */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Collection Date
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handlePrevDay}
                    style={{ padding: '0.35rem 0.6rem' }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${isToday ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={handleSetToday}
                    style={{ fontWeight: 800, fontSize: '0.78rem' }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleNextDay}
                    style={{ padding: '0.35rem 0.6rem' }}
                  >
                    <ChevronRight size={15} />
                  </button>
                  <input
                    type="date"
                    className="form-input"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    style={{ flex: 1, padding: '0.35rem 0.65rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: 8, border: '1.5px solid #E2E8F0' }}
                  />
                </div>
              </div>

              {isAlreadyPaid ? (
                <div
                  style={{
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    background: '#F0FDF4',
                    borderRadius: 12,
                    border: '1.5px solid #A7F3D0',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: '#ECFDF5',
                      border: '2px solid #A7F3D0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem auto',
                    }}
                  >
                    <CheckCircle2 size={32} color="#059669" />
                  </div>
                  <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: 900, color: '#065F46' }}>
                    Week Dues Already Cleared!
                  </h4>
                  <p style={{ margin: 0, color: '#047857', fontSize: '0.85rem' }}>
                    This customer has completed installment payment for this collection cycle.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowLogModal(true)}
                    style={{ marginTop: '1.25rem', fontWeight: 700 }}
                  >
                    View Statement History
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment}>
                  {/* Amount Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #4F46E5, #3730A3)',
                      borderRadius: 12,
                      padding: '1.25rem',
                      color: '#FFFFFF',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <span style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Selected Weekly Amount
                    </span>
                    <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginTop: '0.15rem' }}>
                      {formatCurrency(totalPayableAmount)}
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                      Collecting for {payableSelectedLoans.length} active weekly loan scheme(s)
                    </span>
                  </div>

                  {/* Payment Mode Pills */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Select Payment Mode
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {['UPI', 'CASH', 'BANK'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className={`btn btn-sm ${paymentMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setPaymentMode(mode)}
                          style={{ padding: '0.55rem', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          {mode === 'UPI' ? <Smartphone size={15} /> : mode === 'CASH' ? <Banknote size={15} /> : <Building2 size={15} />}
                          <span>{mode === 'UPI' ? 'UPI' : mode === 'CASH' ? 'Cash' : 'Bank'}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Action */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || totalPayableAmount <= 0}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '1rem',
                      fontWeight: 900,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {submitting ? (
                      <span>Recording Collection...</span>
                    ) : (
                      <>
                        <span>Collect {formatCurrency(totalPayableAmount)} Now</span>
                        <Check size={18} />
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
      {/* TAB 2: INLINE 10-WEEK LEDGER & SCHEDULE                               */}
      {/* ===================================================================== */}
      {activeTab === 'SCHEDULE' && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            border: '1.5px solid #E2E8F0',
            borderRadius: 14,
            background: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                10-Week Repayment Ledger
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                Full installment breakdown and payment receipt log for {customer.name}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: '#F8FAFC', padding: 3, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${modalFilterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, border: 'none' }}
                  onClick={() => setModalFilterStatus('ALL')}
                >
                  All ({scheduleItems.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${modalFilterStatus === 'PAID' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, border: 'none' }}
                  onClick={() => setModalFilterStatus('PAID')}
                >
                  Paid
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${modalFilterStatus === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, border: 'none' }}
                  onClick={() => setModalFilterStatus('PENDING')}
                >
                  Pending
                </button>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <Printer size={15} /> Print Ledger
              </button>
            </div>
          </div>

          <div className="table-responsive" style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B' }}>WEEK #</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B' }}>SCHEDULED DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B' }}>AMOUNT</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B' }}>PAID DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B' }}>PAYMENT DETAILS</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredScheduleItems.map((inst) => {
                  const isPaid = inst.status === 'PAID';
                  const isCurrent = inst.status === 'CURRENT_DUE';
                  return (
                    <tr key={inst.week_number} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        Week {inst.week_number}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                        {inst.due_date}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.92rem', fontWeight: 900, color: isPaid ? '#059669' : 'var(--text-primary)' }}>
                        {formatCurrency(inst.amount)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: isPaid ? '#059669' : '#94A3B8', fontWeight: isPaid ? 700 : 500 }}>
                        {isPaid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} color="#059669" />
                            <span>{inst.paid_date || inst.due_date}</span>
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748B' }}>
                        {isPaid ? (
                          <span>
                            {inst.receipt_no} • <strong style={{ color: 'var(--primary)' }}>{inst.payment_mode}</strong>
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Uncollected</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isPaid ? '#ECFDF5' : isCurrent ? '#EFF6FF' : '#FFFBEB',
                            color: isPaid ? '#059669' : isCurrent ? '#2563EB' : '#D97706',
                            border: isPaid ? '1px solid #A7F3D0' : isCurrent ? '1px solid #BFDBFE' : '1px solid #FDE68A',
                          }}
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

      {/* Weekly Log Modal */}
      {showLogModal && (
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
          onClick={() => setShowLogModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 760,
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
                  {customer.name?.charAt(0) || 'W'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {customer.name} — 10-Week Ledger Log
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                    {customer.customer_code} • {customer.phone}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowLogModal(false)}
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

            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
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
                    {filteredScheduleItems.map((inst) => {
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
                                  setShowLogModal(false);
                                  setActiveTab('COLLECT');
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
                  onClick={() => setShowLogModal(false)}
                  style={{ fontSize: '0.82rem', fontWeight: 700 }}
                >
                  Close Log
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowLogModal(false);
                    setActiveTab('COLLECT');
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

export default WeeklyCollect;
