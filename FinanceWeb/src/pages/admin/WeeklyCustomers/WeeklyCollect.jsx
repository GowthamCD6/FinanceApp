import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  Calendar,
  CreditCard,
  Printer,
  Clock,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Phone,
  MapPin,
  ArrowRight,
  AlertTriangle,
  User,
  Users,
} from 'lucide-react';

export const WeeklyCollect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId } = useParams();
  const { activeOrg } = useOrg();

  // Initial State
  const initialCustomer = location.state?.customer || null;
  const initialDate = location.state?.selectedDate || new Date().toISOString().slice(0, 10);

  const [customer, setCustomer] = useState(initialCustomer);
  const [loadingCust, setLoadingCust] = useState(!initialCustomer);
  const [collectionDate, setCollectionDate] = useState(initialDate);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Active Loan Card Selection
  const [selectedLoans, setSelectedLoans] = useState({});
  const [activeTab, setActiveTab] = useState('COLLECT'); // 'COLLECT' | 'SCHEDULE'
  const [scheduleLoanId, setScheduleLoanId] = useState(null);

  // Weekly Log Modal State
  const [selectedLoanForModal, setSelectedLoanForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING'

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Helper to parse date to clean YYYY-MM-DD string
  const toCleanIsoDate = (val, fallback = null) => {
    if (!val) return fallback;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return fallback;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch (e) {
      return fallback;
    }
  };

  const activeLoans = (customer?.loans && customer.loans.length > 0)
    ? customer.loans
    : (customer?.active_loan ? [customer.active_loan] : []);

  // Helper to generate week-wise installment logs for a loan card (with OVERDUE detection)
  const getLoanInstallments = (loan) => {
    if (!loan) return [];

    const todayStr = toCleanIsoDate(new Date());

    // If backend returned real installments or schedule, use them
    const instList = (Array.isArray(loan.installments) && loan.installments.length > 0)
      ? loan.installments
      : (Array.isArray(loan.schedule) && loan.schedule.length > 0 ? loan.schedule : []);

    if (instList.length > 0) {
      return instList.map((inst, idx) => {
        let status = inst.status || 'PENDING';
        const dueStr = toCleanIsoDate(inst.due_date);
        let daysOverdue = 0;

        if (status !== 'PAID' && dueStr && dueStr < todayStr) {
          status = 'OVERDUE';
          daysOverdue = Math.max(1, Math.floor((new Date(todayStr) - new Date(dueStr)) / 86400000));
        } else if (status !== 'PAID' && dueStr === todayStr) {
          status = 'TODAY_DUE';
        }

        const amt = Number(inst.amount || inst.scheduled_amount || loan.installment_amount || 0);
        const paidAmt = Number(inst.paid_amount || (status === 'PAID' ? amt : 0));

        return {
          week_number: inst.installment_no || inst.week_number || (idx + 1),
          installment_number: inst.installment_no || inst.week_number || (idx + 1),
          due_date: dueStr,
          amount: amt,
          paid_amount: paidAmt,
          status,
          days_overdue: daysOverdue,
          paid_date: inst.paid_at ? toCleanIsoDate(inst.paid_at) : (status === 'PAID' ? (inst.paid_date ? toCleanIsoDate(inst.paid_date) : dueStr) : null),
          receipt_no: inst.receipt_no || (status === 'PAID' ? `REC-WK-${customer?.id || '101'}-${inst.installment_no || idx + 1}` : null),
          payment_mode: inst.payment_mode || ((idx + 1) % 2 === 0 ? 'CASH' : 'UPI'),
          remaining_after: Math.max(
            0,
            (loan.total_repayment_amount || ((loan.installment_amount || amt) * (loan.total_installments || 10))) -
              ((idx + 1) * (loan.installment_amount || amt))
          ),
        };
      });
    }

    const total = loan.total_installments || 10;
    const paidCount = typeof loan.paid_installments === 'number' ? loan.paid_installments : 0;
    const weeklyAmt = Number(loan.installment_amount || customer?.current_week_due || 2200);
    const baseDateStr = toCleanIsoDate(loan.first_due_date || loan.issue_date || loan.start_date, '2026-09-16');
    const baseDate = new Date(baseDateStr);

    const list = [];
    for (let i = 1; i <= total; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (i - 1) * 7);
      const dateStr = toCleanIsoDate(d);

      let status = 'PENDING';
      let paidAmt = 0;
      let paidAt = null;
      let receiptNo = null;
      let mode = 'UPI';
      let daysOverdue = 0;

      if (i <= paidCount) {
        status = 'PAID';
        paidAmt = weeklyAmt;
        paidAt = dateStr;
        receiptNo = `REC-WK-${102400 + i}`;
        mode = i % 2 === 0 ? 'CASH' : 'UPI';
      } else if (dateStr === todayStr) {
        status = 'TODAY_DUE';
      } else if (dateStr < todayStr) {
        status = 'OVERDUE';
        daysOverdue = Math.max(1, Math.floor((new Date(todayStr) - new Date(dateStr)) / 86400000));
      }

      list.push({
        week_number: i,
        installment_number: i,
        day_number: i,
        due_date: dateStr,
        amount: weeklyAmt,
        paid_amount: paidAmt,
        status,
        days_overdue: daysOverdue,
        paid_date: paidAt,
        receipt_no: receiptNo,
        payment_mode: mode,
        remaining_after: Math.max(0, (total - i) * weeklyAmt),
      });
    }

    return list;
  };

  // Check whether a specific loan is already PAID on the currently selected date
  const isLoanPaidOnDate = (loan, targetDate) => {
    if (!loan || !targetDate) return false;
    const installments = getLoanInstallments(loan);
    const matched = installments.find((inst) => inst.due_date === targetDate);
    if (matched) {
      return matched.status === 'PAID';
    }
    return false;
  };

  // Compute loan date bounds (minDate & maxDate) dynamically from SELECTED card(s)
  const loanDateBounds = (() => {
    if (activeLoans.length === 0) return { minDate: null, maxDate: null };

    const selectedList = activeLoans.filter((l) => selectedLoans[l.id]);
    const relevantLoans = selectedList.length > 0 ? selectedList : activeLoans;

    let minDate = null;
    let maxDate = null;

    relevantLoans.forEach((l) => {
      const installments = getLoanInstallments(l);
      const firstDue = installments.length > 0 ? installments[0].due_date : (l.first_due_date || l.start_date || l.issue_date);
      const lastDue = installments.length > 0 ? installments[installments.length - 1].due_date : (l.last_due_date || l.maturity_date || l.end_date);

      const startStr = toCleanIsoDate(firstDue);
      const endStr = toCleanIsoDate(lastDue);

      if (startStr) {
        if (!minDate || startStr < minDate) minDate = startStr;
      }
      if (endStr) {
        if (!maxDate || endStr > maxDate) maxDate = endStr;
      }
    });

    return { minDate, maxDate };
  })();

  // Clamp a date string within the current loan bounds
  const clampDate = (dateStr) => {
    if (!dateStr) return dateStr;
    if (loanDateBounds.minDate && dateStr < loanDateBounds.minDate) return loanDateBounds.minDate;
    if (loanDateBounds.maxDate && dateStr > loanDateBounds.maxDate) return loanDateBounds.maxDate;
    return dateStr;
  };

  // Adjust collectionDate when selected loans change or customer loads so date is within valid bounds
  useEffect(() => {
    if (loanDateBounds.minDate && loanDateBounds.maxDate) {
      setCollectionDate((cur) => {
        if (!cur) return loanDateBounds.minDate;
        if (cur < loanDateBounds.minDate) return loanDateBounds.minDate;
        if (cur > loanDateBounds.maxDate) return loanDateBounds.maxDate;
        return cur;
      });
    }
  }, [selectedLoans, loanDateBounds.minDate, loanDateBounds.maxDate]);

  // When customer data loads, default to the earliest pending installment due date if not passed from navigation
  useEffect(() => {
    if (activeLoans.length > 0 && !location.state?.selectedDate) {
      let earliestPending = null;
      activeLoans.forEach((l) => {
        const insts = getLoanInstallments(l);
        const pendingInst = insts.find((i) => i.status !== 'PAID');
        const candidate = pendingInst ? pendingInst.due_date : insts[0]?.due_date;
        if (candidate && (!earliestPending || candidate < earliestPending)) {
          earliestPending = candidate;
        }
      });
      if (earliestPending) {
        setCollectionDate(earliestPending);
      }
    }
  }, [customer?.id]);

  // Fast Date Steppers (clamped to loan tenure)
  const handlePrevDay = () => {
    const d = new Date(collectionDate);
    d.setDate(d.getDate() - 1);
    const newDate = toCleanIsoDate(d);
    setCollectionDate(clampDate(newDate));
  };

  const handleNextDay = () => {
    const d = new Date(collectionDate);
    d.setDate(d.getDate() + 1);
    const newDate = toCleanIsoDate(d);
    setCollectionDate(clampDate(newDate));
  };

  const handleSetToday = () => {
    const todayStr = toCleanIsoDate(new Date());
    setCollectionDate(clampDate(todayStr));
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterdayStr = toCleanIsoDate(d);
    setCollectionDate(clampDate(yesterdayStr));
  };

  // Initialize selected loans when customer data is loaded
  const initializeLoanState = (custData) => {
    const loans = (custData.loans && custData.loans.length > 0)
      ? custData.loans
      : (custData.active_loan ? [custData.active_loan] : []);
    const selMap = {};

    loans.forEach((l) => {
      selMap[l.id] = true; // Select all by default for simultaneous collection
    });

    setSelectedLoans(selMap);
    if (loans.length > 0 && !scheduleLoanId) {
      setScheduleLoanId(loans[0].id);
    }
  };

  const fetchCustomerData = async (isInitial = true) => {
    const targetId = customerId || initialCustomer?.id;
    if (!targetId) return;
    if (isInitial && !customer) setLoadingCust(true);

    try {
      const list = await api.getWeeklyCustomers({
        ...(activeOrg ? { organizationId: activeOrg.id } : {}),
      });
      const found = Array.isArray(list)
        ? list.find((c) => String(c.id) === String(targetId) || String(c.customer_code) === String(targetId))
        : null;

      if (found) {
        setCustomer(found);
        initializeLoanState(found);
      } else {
        // Direct fetch fallback
        const cust = await api.getCustomerById(targetId);
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
              loan_name: l.loan_title || l.product_name || `${totalInst}-Week Microfinance Scheme`,
              principal: Number(l.principal_amount || 20000),
              interest_rate: Number(l.interest_rate || 20),
              total_repayment_amount: totalRepay,
              installment_amount: schedAmt || 2200,
              total_installments: totalInst,
              paid_installments: paidInst,
              remaining_balance: remaining,
              status: l.status,
              issue_date: l.disbursement_date ? String(l.disbursement_date).slice(0, 10) : '2026-09-16',
              maturity_date: l.maturity_date ? String(l.maturity_date).slice(0, 10) : (instList.length > 0 ? String(instList[instList.length - 1].due_date).slice(0, 10) : null),
              schedule: l.schedule || instList,
              installments: l.installments || l.schedule || [],
            };
          });

          const firstLoan = activeLoanList[0] || null;
          const mapped = {
            id: cust.id,
            customer_code: cust.customer_code || `CUST-${cust.id}`,
            name: cust.full_name || cust.name || 'Weekly Borrower',
            phone: cust.phone || '9840112233',
            address: cust.address || `${cust.city || 'Chennai'}, Tamil Nadu`,
            occupation: cust.occupation || 'Retail Vendor',
            current_week_due: firstLoan?.installment_amount || 2200,
            current_week_status: firstLoan?.paid_installments > 0 ? 'PAID' : 'PENDING',
            total_installments: firstLoan?.total_installments || 10,
            paid_installments: firstLoan?.paid_installments || 0,
            outstanding_balance: firstLoan?.remaining_balance || 13200,
            active_loan: firstLoan,
            loans: activeLoanList,
          };
          setCustomer(mapped);
          initializeLoanState(mapped);
        }
      }
    } catch (err) {
      console.error('Error retrieving weekly collection record:', err);
    } finally {
      if (isInitial) setLoadingCust(false);
    }
  };

  // Only fetch initial data on mount or customer change — NOT on collectionDate changes!
  useEffect(() => {
    fetchCustomerData(true);
  }, [customerId, activeOrg?.id]);

  // Toggle selection of a loan
  const toggleLoanSelection = (loanId) => {
    setSelectedLoans((prev) => ({
      ...prev,
      [loanId]: !prev[loanId],
    }));
  };

  // Open Weekly Log Modal for a specific loan card
  const handleOpenLoanModal = (loan) => {
    setSelectedLoanForModal(loan);
    setModalFilterStatus('ALL');
  };

  // Check whether any active loan has a scheduled installment on the selected date
  const hasScheduledInstallmentOnDate = activeLoans.some((l) => {
    const insts = getLoanInstallments(l);
    return insts.some((i) => i.due_date === collectionDate);
  });

  // Check whether all active loans are paid for the selected date
  const isAllPaidForDate = hasScheduledInstallmentOnDate && activeLoans.every((l) => isLoanPaidOnDate(l, collectionDate));

  // Check whether collectionDate is before the loan repayment tenure begins
  const isBeforeLoanTenure = Boolean(loanDateBounds.minDate && collectionDate < loanDateBounds.minDate);

  // Filter only payable loans (not yet paid on this date) that are selected
  const payableSelectedLoans = activeLoans.filter((l) => {
    if (!selectedLoans[l.id]) return false;
    const insts = getLoanInstallments(l);
    const matched = insts.find((i) => i.due_date === collectionDate);
    if (matched) return matched.status !== 'PAID';
    return !isLoanPaidOnDate(l, collectionDate);
  });

  // Calculate total selected payable sum
  const totalPayableAmount = payableSelectedLoans.reduce((sum, l) => {
    const amt = Number(l.installment_amount || customer?.current_week_due || 2200);
    return sum + amt;
  }, 0);

  // Total weekly due for this borrower across all active loans
  const totalCombinedWeeklyDue = activeLoans.reduce((sum, l) => sum + Number(l.installment_amount || customer?.current_week_due || 2200), 0);

  // Compute overdue summary across selected or active loans
  const overdueSummary = (() => {
    const selectedList = activeLoans.filter((l) => selectedLoans[l.id]);
    const relevant = selectedList.length > 0 ? selectedList : activeLoans;

    let overdueCount = 0;
    let overdueTotalAmount = 0;
    let earliestOverdueDate = null;

    relevant.forEach((loan) => {
      const installments = getLoanInstallments(loan);
      installments.forEach((inst) => {
        if (inst.status === 'OVERDUE') {
          overdueCount++;
          overdueTotalAmount += Number(inst.amount || loan.installment_amount || 2200);
          if (!earliestOverdueDate || inst.due_date < earliestOverdueDate) {
            earliestOverdueDate = inst.due_date;
          }
        }
      });
    });

    return { overdueCount, overdueTotalAmount, earliestOverdueDate };
  })();

  // Handle Simultaneous Payment Submission
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!customer || payableSelectedLoans.length === 0 || totalPayableAmount <= 0) return;

    setSubmitting(true);
    try {
      const collectedItems = [];

      for (const loan of payableSelectedLoans) {
        const amt = loan.installment_amount || customer?.current_week_due || 2200;
        const res = await api.recordWeeklyCollection(
          customer.id,
          loan.loan_code,
          paymentMode === 'BANK' ? 'BANK_TRANSFER' : paymentMode,
          amt,
          collectionDate
        );
        const receiptNo = res?.paymentNumber || res?.receipt_no || res?.receiptNumber || `REC-WK-${Date.now().toString().slice(-6)}`;
        collectedItems.push({
          loan_id: loan.id,
          loan_code: loan.loan_code,
          loan_name: loan.loan_name || 'Weekly Microfinance Scheme',
          amount: amt,
          receipt_no: receiptNo,
        });
      }

      setReceiptData({
        receipt_master_no: collectedItems[0]?.receipt_no || `REC-WK-BATCH-${Date.now().toString().slice(-6)}`,
        customer_name: customer.name,
        customer_code: customer.customer_code,
        phone: customer.phone,
        address: customer.address,
        occupation: customer.occupation,
        total_collected: totalPayableAmount,
        payment_mode: paymentMode,
        collection_date: collectionDate,
        timestamp: new Date().toLocaleString('en-IN'),
        items: collectedItems,
      });

      // Silently refresh customer and loan data so the updated installment state is fresh
      fetchCustomerData(false);
    } catch (err) {
      alert('Failed to record payment: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Skeleton
  if (loadingCust) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 0.5rem' }}>
        <div className="skeleton skeleton-text" style={{ width: 220, height: 38, marginBottom: '1.5rem', borderRadius: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div className="skeleton skeleton-text" style={{ width: '60%', height: 24, marginBottom: 12 }} />
            <div className="skeleton skeleton-text" style={{ width: '40%', height: 16, marginBottom: 20 }} />
            <div className="skeleton skeleton-text" style={{ width: '100%', height: 140, borderRadius: 10 }} />
          </div>
          <div className="card" style={{ padding: '2rem' }}>
            <div className="skeleton skeleton-text" style={{ width: '70%', height: 24, marginBottom: 16 }} />
            <div className="skeleton skeleton-text" style={{ width: '100%', height: 180, borderRadius: 10 }} />
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
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
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
            {/* Header / Receipt Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Receipt Reference</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 900, display: 'block' }}>
                  {receiptData.receipt_master_no}
                </strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment Mode</span>
                <div>
                  <span
                    style={{
                      color: '#065F46',
                      background: '#D1FAE5',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      border: '1px solid #A7F3D0',
                      display: 'inline-block',
                      marginTop: 2,
                    }}
                  >
                    {receiptData.payment_mode}
                  </span>
                </div>
              </div>
            </div>

            {/* Borrower Details in Clean 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Borrower Name</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.92rem' }}>
                  {receiptData.customer_name}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Customer ID</span>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.88rem' }}>
                  {receiptData.customer_code}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Contact Number</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.88rem' }}>
                  {receiptData.phone || 'N/A'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Profession / Shop</span>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.88rem' }}>
                  {receiptData.occupation || 'Retail Vendor'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Address / Branch</span>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                  {receiptData.address || 'Chennai Central Route'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Date & Timestamp</span>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem' }}>
                  {receiptData.collection_date} • {receiptData.timestamp}
                </div>
              </div>
            </div>

            <hr style={{ borderColor: '#E2E8F0', margin: '0.85rem 0' }} />

            {/* Loan Card Breakdown Table */}
            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Allocated Weekly Loan Installments:
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
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>({it.loan_name})</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ref: {it.receipt_no}</div>
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.35rem', fontWeight: 700 }}
            >
              <Printer size={16} /> <span>Print Official Receipt</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setReceiptData(null);
                fetchCustomerData(false);
              }}
              style={{ padding: '0.7rem 1.45rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Collection Form</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(getOrgPath('weekly-customers'))}
              style={{ padding: '0.7rem 1.15rem', fontWeight: 600, fontSize: '0.85rem' }}
            >
              All Weekly Borrowers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE MULTI-LOAN COLLECTION & SCHEDULE WORKSPACE
  // =========================================================================
  const currentScheduleLoan = activeLoans.find((l) => l.id === scheduleLoanId) || activeLoans[0];

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

        {/* Tab Selector: Collection Mode vs Week-wise Installment Schedule */}
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
            <Calendar size={14} /> Week-Wise Ledger & Schedule
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
          borderRadius: 12,
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
                borderRadius: 10,
                background: '#EEF2FF',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.25rem',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.12)',
              }}
            >
              <Users size={24} color="var(--primary)" />
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

              <div style={{ display: 'flex', gap: '0.85rem', marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span>Code: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{customer.customer_code}</strong></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>• <Phone size={13} color="#64748B" /> <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{customer.phone}</strong></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>• <MapPin size={13} color="#64748B" /> <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{customer.address || 'Chennai'}</strong></span>
                <span>• Profession: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{customer.occupation || 'Retail Vendor'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Weekly Combined Due</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                {formatCurrency(totalCombinedWeeklyDue)}
              </strong>
            </div>
            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.25rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Total Outstanding</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D97706', letterSpacing: '-0.02em' }}>
                {formatCurrency(customer.outstanding_balance ?? activeLoans[0]?.remaining_balance ?? 0)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: SIMULTANEOUS MULTI-CARD COLLECTION WORKSPACE                   */}
      {/* ===================================================================== */}
      {activeTab === 'COLLECT' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {/* Left Column: Active Loan Cards Shelf */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Active Weekly Loan Schemes ({activeLoans.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Click card to select for collection
              </span>
            </div>

            {activeLoans.map((loan, idx) => {
              const isSelected = !!selectedLoans[loan.id];
              const loanInstallments = getLoanInstallments(loan);
              const paidInstallmentsList = loanInstallments.filter((inst) => inst.status === 'PAID');
              const paidWeeks = paidInstallmentsList.length;
              const totalWeeks = loanInstallments.length || loan.total_installments || 10;
              const progressPct = totalWeeks > 0 ? Math.round((paidWeeks / totalWeeks) * 100) : 0;
              const isPaidForToday = isLoanPaidOnDate(loan, collectionDate);

              // Calculate overdue count
              const overdueCount = loanInstallments.filter((inst) => inst.status === 'OVERDUE').length;
              const isOverdue = overdueCount > 0;

              return (
                <div
                  key={loan.id || idx}
                  className="card"
                  onClick={() => toggleLoanSelection(loan.id)}
                  style={{
                    padding: '1.25rem 1.4rem',
                    border: `1.5px solid ${isPaidForToday ? '#A7F3D0' : isSelected ? 'var(--primary)' : '#E2E8F0'}`,
                    borderRadius: 12,
                    background: isPaidForToday ? '#F0FDF4' : isSelected ? '#FFFFFF' : '#F8FAFC',
                    boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isPaidForToday ? '#059669' : 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isPaidForToday ? '#A7F3D0' : isSelected ? 'var(--primary)' : '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Card Header & Selection/Paid Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                      {isPaidForToday ? (
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
                          title={`Already paid for ${collectionDate}`}
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
                          title="Toggle inclusion in collection"
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
                            {loan.loan_name || `${totalWeeks}-Week Scheme`}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          Issued: {loan.issue_date || '2026-09-16'} • Maturity: {loan.maturity_date || '2026-11-25'}
                        </span>
                        {isOverdue && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              color: '#991B1B',
                              background: '#FEE2E2',
                              border: '1px solid #FECACA',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 5,
                              marginTop: 2,
                              animation: 'pulse 2s infinite',
                            }}
                          >
                            <AlertTriangle size={12} /> {overdueCount} OVERDUE
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Weekly Due</span>
                      <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: isPaidForToday ? '#047857' : 'var(--primary)', letterSpacing: '-0.02em' }}>
                        {formatCurrency(loan.installment_amount || customer?.current_week_due || 2200)}
                      </strong>
                    </div>
                  </div>

                  {/* Financial & Lending Details Breakdown */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      background: isPaidForToday ? '#FFFFFF' : '#F8FAFC',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 8,
                      marginBottom: '0.75rem',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Principal & Rate</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                        {formatCurrency(loan.principal)} @ {loan.interest_rate || 20}%
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Repayable</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                        {formatCurrency(loan.total_repayment_amount || (loan.principal + (loan.principal * (loan.interest_rate || 0) / 100)))}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Remaining Balance</span>
                      <strong style={{ color: '#D97706', fontWeight: 900 }}>
                        {formatCurrency(
                          loan.remaining_balance != null
                            ? loan.remaining_balance
                            : Math.max(
                                0,
                                (loan.total_repayment_amount || (loan.principal + (loan.principal * (loan.interest_rate || 0) / 100))) -
                                  paidInstallmentsList.reduce((acc, i) => acc + Number(i.paid_amount || loan.installment_amount || 0), 0)
                              )
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* Timeline Progress Strip */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        Installment Timeline:
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
                          background: isPaidForToday ? '#059669' : 'linear-gradient(90deg, #6366F1, #4F46E5)',
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
                      <Calendar size={13} /> View Weekly Log Modal ↗
                    </button>

                    {/* Status Pill for the currently selected date */}
                    {(() => {
                      const firstLoanDue = loanInstallments.length > 0 ? loanInstallments[0].due_date : loan.issue_date;
                      const isBeforeThisLoanTenure = Boolean(firstLoanDue && collectionDate < firstLoanDue);

                      if (isPaidForToday) {
                        return (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#065F46',
                              background: '#D1FAE5',
                              border: '1px solid #A7F3D0',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <CheckCircle2 size={13} color="#059669" /> Paid for {collectionDate}
                          </span>
                        );
                      }

                      if (isBeforeThisLoanTenure) {
                        return (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#1E40AF',
                              background: '#DBEAFE',
                              border: '1px solid #BFDBFE',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Clock size={13} color="#2563EB" /> Starts {firstLoanDue}
                          </span>
                        );
                      }

                      if (isOverdue) {
                        return (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#991B1B',
                              background: '#FEE2E2',
                              border: '1px solid #FECACA',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <AlertTriangle size={13} color="#DC2626" /> {overdueCount} Overdue — {formatCurrency(loan.installment_amount || customer?.current_week_due || 2200)}/wk
                          </span>
                        );
                      }

                      return (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: '#92400E',
                            background: '#FEF3C7',
                            border: '1px solid #FDE68A',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 6,
                          }}
                        >
                          Due on {collectionDate}: {formatCurrency(loan.installment_amount || customer?.current_week_due || 2200)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Record Weekly Payment Panel */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              height: 'fit-content',
              border: '1.5px solid #E2E8F0',
              borderRadius: 12,
              background: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Record Weekly Payment
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Collect dues for selected date across borrower's active loan schemes.
            </p>

            {/* Fast Date Stepper Bar */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Date</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={handleSetYesterday}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Yesterday
                  </button>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <button
                    type="button"
                    onClick={handleSetToday}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Today
                  </button>
                </div>
              </label>

              {/* Fast Left/Right Arrow Stepper + Date Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevDay}
                  title="Previous Day"
                  disabled={Boolean(loanDateBounds.minDate && collectionDate <= loanDateBounds.minDate)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                    opacity: loanDateBounds.minDate && collectionDate <= loanDateBounds.minDate ? 0.45 : 1,
                    cursor: loanDateBounds.minDate && collectionDate <= loanDateBounds.minDate ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <input
                  type="date"
                  className="form-input"
                  value={collectionDate}
                  min={loanDateBounds.minDate || undefined}
                  max={loanDateBounds.maxDate || undefined}
                  onChange={(e) => setCollectionDate(clampDate(e.target.value))}
                  required
                  style={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textAlign: 'center',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    flex: 1,
                  }}
                />

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleNextDay}
                  title="Next Day"
                  disabled={Boolean(loanDateBounds.maxDate && collectionDate >= loanDateBounds.maxDate)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                    opacity: loanDateBounds.maxDate && collectionDate >= loanDateBounds.maxDate ? 0.45 : 1,
                    cursor: loanDateBounds.maxDate && collectionDate >= loanDateBounds.maxDate ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Date range indicator placed neatly below the buttons */}
              {loanDateBounds.minDate && loanDateBounds.maxDate && (
                <div
                  style={{
                    marginTop: '0.45rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#F8FAFC',
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Loan Tenure:
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 800 }}>
                    {loanDateBounds.minDate} to {loanDateBounds.maxDate}
                  </span>
                </div>
              )}

              {/* Overdue alert notice if any unpaid days are past due */}
              {overdueSummary.overdueCount > 0 && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 8,
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <AlertTriangle size={15} color="#DC2626" />
                    <span style={{ fontSize: '0.76rem', color: '#991B1B', fontWeight: 700 }}>
                      {overdueSummary.overdueCount} missed week{overdueSummary.overdueCount > 1 ? 's' : ''} ({formatCurrency(overdueSummary.overdueTotalAmount)})
                    </span>
                  </div>
                  {overdueSummary.earliestOverdueDate && collectionDate !== overdueSummary.earliestOverdueDate && (
                    <button
                      type="button"
                      onClick={() => setCollectionDate(overdueSummary.earliestOverdueDate)}
                      style={{
                        background: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 5,
                        padding: '3px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Collect Overdue ({overdueSummary.earliestOverdueDate})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* CONDITIONAL DISPLAY: IF BEFORE LOAN START VS ALREADY PAID FOR THIS DATE VS PAYABLE FORM */}
            {isBeforeLoanTenure ? (
              <div
                style={{
                  background: '#EFF6FF',
                  borderRadius: 12,
                  padding: '1.75rem 1.25rem',
                  textAlign: 'center',
                  border: '1.5px solid #BFDBFE',
                  marginTop: '1rem',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: '#DBEAFE',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    border: '2px solid #93C5FD',
                  }}
                >
                  <Clock size={32} />
                </div>

                <h4 style={{ margin: '0 0 0.35rem 0', color: '#1E40AF', fontSize: '1.15rem', fontWeight: 900 }}>
                  Repayment Begins on {loanDateBounds.minDate}
                </h4>
                <p style={{ color: '#1E3A8A', fontSize: '0.85rem', margin: '0 0 1.25rem 0', fontWeight: 600 }}>
                  Selected date ({collectionDate}) is before the first scheduled installment due date. Week 1 collection starts on <strong>{loanDateBounds.minDate}</strong>.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCollectionDate(loanDateBounds.minDate)}
                    style={{ fontSize: '0.8rem', fontWeight: 800, padding: '0.45rem 1rem' }}
                  >
                    Go to Week 1 ({loanDateBounds.minDate}) →
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('SCHEDULE')}
                    style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.45rem 0.85rem' }}
                  >
                    View Ledger
                  </button>
                </div>
              </div>
            ) : isAllPaidForDate ? (
              <div
                style={{
                  background: '#F0FDF4',
                  borderRadius: 12,
                  padding: '1.75rem 1.25rem',
                  textAlign: 'center',
                  border: '1.5px solid #A7F3D0',
                  marginTop: '1rem',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: '#D1FAE5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    border: '2px solid #A7F3D0',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>

                <h4 style={{ margin: '0 0 0.35rem 0', color: '#065F46', fontSize: '1.15rem', fontWeight: 900 }}>
                  Dues Settled for {collectionDate}
                </h4>
                <p style={{ color: '#047857', fontSize: '0.85rem', margin: '0 0 1.25rem 0', fontWeight: 600 }}>
                  All active loan installments ({formatCurrency(totalCombinedWeeklyDue)}) for this date are already collected and cleared.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleNextDay}
                    style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.45rem 0.85rem' }}
                  >
                    Check Next Day ({'>'})
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('SCHEDULE')}
                    style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.45rem 0.85rem' }}
                  >
                    View Ledger
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment}>
                {/* Selected Cards Summary Strip */}
                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 10,
                    padding: '1rem 1.25rem',
                    marginBottom: '1.25rem',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payable Schemes for Date:</span>
                    <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>
                      {payableSelectedLoans.length} of {activeLoans.length} Schemes
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Due Amount:</span>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                      {formatCurrency(totalPayableAmount)}
                    </strong>
                  </div>

                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Total Collection:
                    </span>
                    <strong style={{ fontSize: '1.4rem', fontWeight: 900, color: '#047857' }}>
                      {formatCurrency(totalPayableAmount)}
                    </strong>
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Payment Mode *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {['UPI', 'CASH', 'BANK_TRANSFER'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`btn ${paymentMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.8rem', padding: '0.55rem', fontWeight: 800 }}
                        onClick={() => setPaymentMode(mode)}
                      >
                        {mode.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || payableSelectedLoans.length === 0 || totalPayableAmount <= 0}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--primary-gradient)',
                    boxShadow: 'var(--primary-glow)',
                  }}
                >
                  <DollarSign size={18} />
                  <span>
                    {submitting
                      ? 'Recording Payment...'
                      : `Collect ${formatCurrency(totalPayableAmount)} (${payableSelectedLoans.length} Scheme${payableSelectedLoans.length > 1 ? 's' : ''})`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: WEEK-WISE INSTALLMENT SCHEDULE & REPAYMENT LEDGER             */}
      {/* ===================================================================== */}
      {activeTab === 'SCHEDULE' && (
        <div className="card" style={{ padding: '1.5rem', border: '1.5px solid #E2E8F0', borderRadius: 12, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Week-Wise Installment Schedule & Ledger
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select an active loan scheme to view its complete date-of-payment breakdown
              </span>
            </div>

            {/* Loan Card Selector */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {activeLoans.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`btn btn-sm ${currentScheduleLoan?.id === l.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', fontWeight: 800 }}
                  onClick={() => setScheduleLoanId(l.id)}
                >
                  <CreditCard size={13} /> {l.loan_code} ({l.loan_name})
                </button>
              ))}
            </div>
          </div>

          {currentScheduleLoan && (
            <div>
              {/* Card Meta Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  background: '#F8FAFC',
                  padding: '1rem',
                  borderRadius: 8,
                  marginBottom: '1.25rem',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Loan Product</span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{currentScheduleLoan.loan_name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Principal & Rate</span>
                  <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>
                    {formatCurrency(currentScheduleLoan.principal)} @ {currentScheduleLoan.interest_rate || 20}%
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Tenure</span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                    {currentScheduleLoan.total_installments || 10} Weekly Installments
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Weekly Installment</span>
                  <strong style={{ color: '#047857', fontWeight: 900 }}>
                    {formatCurrency(currentScheduleLoan.installment_amount || customer?.current_week_due || 2200)}/week
                  </strong>
                </div>
              </div>

              {/* Installments Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Week / Installment</th>
                      <th>Scheduled Due Date</th>
                      <th>Weekly Target</th>
                      <th>Amount Paid</th>
                      <th>Remaining</th>
                      <th>Status</th>
                      <th>Paid Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLoanInstallments(currentScheduleLoan).map((inst, i) => {
                      const isPaid = inst.status === 'PAID';
                      const isTodayDue = inst.status === 'TODAY_DUE';
                      const isOverdueInst = inst.status === 'OVERDUE';

                      return (
                        <tr key={i} style={{ background: isOverdueInst ? '#FFF5F5' : undefined }}>
                          <td>
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                              Week {inst.week_number || inst.installment_number || i + 1}
                            </strong>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {inst.due_date || '2026-09-16'}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontWeight: 800 }}>{formatCurrency(inst.amount || currentScheduleLoan.installment_amount)}</strong>
                          </td>
                          <td style={{ color: isPaid ? '#047857' : 'var(--text-muted)', fontWeight: 800 }}>
                            {formatCurrency(inst.paid_amount || (isPaid ? inst.amount : 0))}
                          </td>
                          <td style={{ color: isPaid ? 'var(--text-muted)' : '#D97706', fontWeight: 800 }}>
                            {formatCurrency(inst.remaining_after !== undefined ? inst.remaining_after : (isPaid ? 0 : inst.amount))}
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: isPaid
                                  ? '#D1FAE5'
                                  : isOverdueInst
                                    ? '#FEE2E2'
                                    : isTodayDue
                                      ? '#FEF3C7'
                                      : '#F1F5F9',
                                color: isPaid
                                  ? '#065F46'
                                  : isOverdueInst
                                    ? '#991B1B'
                                    : isTodayDue
                                      ? '#92400E'
                                      : 'var(--text-muted)',
                                border: `1px solid ${isPaid ? '#A7F3D0' : isOverdueInst ? '#FECACA' : isTodayDue ? '#FDE68A' : '#E2E8F0'}`,
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              {isPaid ? 'PAID' : isOverdueInst ? (<><AlertTriangle size={11} /> OVERDUE</>) : isTodayDue ? "TODAY'S DUE" : 'PENDING'}
                            </span>
                          </td>
                          <td>
                            {isPaid ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ECFDF5', color: '#047857', padding: '2px 7px', borderRadius: 6, fontWeight: 700, border: '1px solid #A7F3D0', fontSize: '0.78rem' }}>
                                <CheckCircle2 size={12} color="#059669" />
                                <span>{inst.paid_date || inst.due_date}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* WEEKLY LOG MODAL (MATCHING SHOPKEEPER MODAL ARCHITECTURE)             */}
      {/* ===================================================================== */}
      {selectedLoanForModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setSelectedLoanForModal(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 820,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              padding: 0,
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
                borderRadius: '16px 16px 0 0',
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
                    fontWeight: 800,
                  }}
                >
                  <CreditCard size={22} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {selectedLoanForModal.loan_code}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 6,
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        color: 'var(--primary)',
                      }}
                    >
                      {selectedLoanForModal.loan_name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Borrower: <strong style={{ color: 'var(--text-primary)' }}>{customer.name}</strong> ({customer.customer_code}) • {customer.phone}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-icon"
                onClick={() => setSelectedLoanForModal(null)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} color="var(--text-muted)" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {(() => {
                const totalRepay = Number(
                  selectedLoanForModal.total_repayment_amount ||
                    (selectedLoanForModal.principal + (selectedLoanForModal.principal * (selectedLoanForModal.interest_rate || 0)) / 100)
                );
                const insts = getLoanInstallments(selectedLoanForModal);
                const paidList = insts.filter((i) => i.status === 'PAID');
                const paidCount = paidList.length;
                const totalCount = insts.length || Number(selectedLoanForModal.total_installments || 10);
                const weeklyAmt = Number(selectedLoanForModal.installment_amount || customer?.current_week_due || 2200);
                const paidAmount = paidList.reduce((acc, i) => acc + Number(i.paid_amount || weeklyAmt), 0);
                const remainingBal = Number(
                  selectedLoanForModal.remaining_balance != null
                    ? selectedLoanForModal.remaining_balance
                    : Math.max(0, totalRepay - paidAmount)
                );
                const progressPct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

                return (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '0.75rem',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Weekly Installment</span>
                        <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)' }}>
                          {formatCurrency(weeklyAmt)}
                        </strong>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Total Repayable</span>
                        <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                          {formatCurrency(totalRepay)}
                        </strong>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Paid Amount</span>
                        <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>
                          {formatCurrency(paidAmount)}
                        </strong>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Remaining Balance</span>
                        <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: '#D97706' }}>
                          {formatCurrency(remainingBal)}
                        </strong>
                      </div>
                    </div>

                    {/* Progress Bar Strip */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                          Installment Recovery Progress:
                        </span>
                        <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                          Week {paidCount} of {totalCount} ({progressPct}%)
                        </strong>
                      </div>
                      <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #6366F1, #4F46E5)',
                            borderRadius: 4,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Filter Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Week-by-Week Installment Ledger
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['ALL', 'PAID', 'PENDING'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`btn btn-sm ${modalFilterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', fontWeight: 700 }}
                      onClick={() => setModalFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Installments Table */}
              <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC', zIndex: 1 }}>
                    <tr>
                      <th>Week #</th>
                      <th>Due Date</th>
                      <th>Target</th>
                      <th>Paid Amount</th>
                      <th>Paid Date</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Receipt Ref</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLoanInstallments(selectedLoanForModal)
                      .filter((inst) => {
                        if (modalFilterStatus === 'PAID') return inst.status === 'PAID';
                        if (modalFilterStatus === 'PENDING') return inst.status === 'PENDING' || inst.status === 'TODAY_DUE' || inst.status === 'OVERDUE';
                        return true;
                      })
                      .map((inst, idx) => {
                        const isPaid = inst.status === 'PAID';
                        const isTodayDue = inst.status === 'TODAY_DUE';
                        const isOverdueModal = inst.status === 'OVERDUE';

                        return (
                          <tr key={idx} style={{ background: isOverdueModal ? '#FFF5F5' : undefined }}>
                            <td>
                              <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                                Week {inst.week_number || inst.installment_number || idx + 1}
                              </strong>
                            </td>
                            <td>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
                                {inst.due_date}
                              </span>
                            </td>
                            <td>
                              <strong style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                                {formatCurrency(inst.amount)}
                              </strong>
                            </td>
                            <td style={{ color: isPaid ? '#047857' : 'var(--text-muted)', fontWeight: 800 }}>
                              {formatCurrency(inst.paid_amount)}
                            </td>
                            <td>
                              {isPaid ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ECFDF5', color: '#047857', padding: '2px 7px', borderRadius: 6, fontWeight: 700, border: '1px solid #A7F3D0', fontSize: '0.75rem' }}>
                                  <CheckCircle2 size={12} color="#059669" />
                                  <span>{inst.paid_date || inst.due_date}</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                              )}
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                {isPaid ? inst.payment_mode : '-'}
                              </span>
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  background: isPaid
                                    ? '#D1FAE5'
                                    : isOverdueModal
                                      ? '#FEE2E2'
                                      : isTodayDue
                                        ? '#FEF3C7'
                                        : '#F1F5F9',
                                  color: isPaid
                                    ? '#065F46'
                                    : isOverdueModal
                                      ? '#991B1B'
                                      : isTodayDue
                                        ? '#92400E'
                                        : 'var(--text-muted)',
                                  border: `1px solid ${isPaid ? '#A7F3D0' : isOverdueModal ? '#FECACA' : isTodayDue ? '#FDE68A' : '#E2E8F0'}`,
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                {isPaid ? 'PAID' : isOverdueModal ? (<><AlertTriangle size={11} /> OVERDUE</>) : isTodayDue ? "TODAY'S DUE" : 'PENDING'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {inst.receipt_no || '-'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {isPaid ? (
                                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Settled</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (inst.due_date) setCollectionDate(inst.due_date);
                                    setSelectedLoans({ [selectedLoanForModal.id]: true });
                                    setSelectedLoanForModal(null);
                                    setActiveTab('COLLECT');
                                  }}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    background: isOverdueModal ? '#DC2626' : 'var(--primary)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    boxShadow: isOverdueModal ? '0 1px 2px rgba(220, 38, 38, 0.3)' : '0 1px 2px rgba(79, 70, 229, 0.2)',
                                  }}
                                >
                                  <span>{isOverdueModal ? 'Pay Overdue' : 'Pay'}</span>
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
                borderRadius: '0 0 16px 16px',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <Printer size={15} /> Print Weekly Log
              </button>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedLoanForModal(null)}
                  style={{ padding: '0.5rem 1rem', fontWeight: 700 }}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedLoans({ [selectedLoanForModal.id]: true });
                    setSelectedLoanForModal(null);
                    setActiveTab('COLLECT');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1.25rem', fontWeight: 800 }}
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
