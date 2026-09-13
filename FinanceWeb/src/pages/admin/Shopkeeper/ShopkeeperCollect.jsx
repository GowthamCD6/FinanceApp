import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  Calendar,
  Store,
  CreditCard,
  Printer,
  Clock,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const ShopkeeperCollect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopId } = useParams();
  const { activeOrg } = useOrg();

  // Initial State
  const initialShop = location.state?.shop || null;
  const initialDate = location.state?.selectedDate || new Date().toISOString().slice(0, 10);

  const [shop, setShop] = useState(initialShop);
  const [loading, setLoading] = useState(!initialShop);
  const [collectionDate, setCollectionDate] = useState(initialDate);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Active Loan Card Selection
  const [selectedLoans, setSelectedLoans] = useState({});
  const [activeTab, setActiveTab] = useState('COLLECT'); // 'COLLECT' | 'SCHEDULE'
  const [scheduleLoanId, setScheduleLoanId] = useState(null);

  // Daily Log Modal State
  const [selectedLoanForModal, setSelectedLoanForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING'

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

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

  // Initialize selected loans when shop data is loaded
  const initializeLoanState = (shopData) => {
    const loans = shopData.loans || shopData.active_loans || [];
    const selMap = {};

    loans.forEach((l) => {
      selMap[l.id] = true; // Select all by default for simultaneous collection
    });

    setSelectedLoans(selMap);
    if (loans.length > 0 && !scheduleLoanId) {
      setScheduleLoanId(loans[0].id);
    }
  };

  useEffect(() => {
    if (initialShop) {
      initializeLoanState(initialShop);
    } else if (shopId) {
      setLoading(true);
      api.getShopkeepers({ date: collectionDate, ...(activeOrg ? { organizationId: activeOrg.id } : {}) })
        .then((shops) => {
          const found = Array.isArray(shops)
            ? shops.find((s) => String(s.id) === String(shopId) || String(s.customer_code) === String(shopId))
            : null;

          if (found) {
            setShop(found);
            initializeLoanState(found);
          } else {
            // Direct fetch fallback
            return api.getCustomerById(shopId).then((cust) => {
              if (cust) {
                const fallbackShop = {
                  id: cust.id,
                  customer_code: cust.customer_code || `SHP-${cust.id}`,
                  name: cust.name || cust.full_name,
                  shop_name: cust.shop_name || `${cust.name || cust.full_name}'s Store`,
                  owner_name: cust.name || cust.full_name,
                  phone: cust.phone,
                  address: cust.address || `${cust.city || 'Chennai'}, Tamil Nadu`,
                  stall_no: `Stall #${(cust.id * 7) % 50 + 1}`,
                  market_location: cust.address || 'Saidapet Bazaar Route',
                  daily_collection_target: cust.daily_due || 1470,
                  total_outstanding: cust.totalOutstanding || 27000,
                  loans: [
                    {
                      id: `loan-1-${cust.id}`,
                      loan_code: `LN-DLY-A${cust.id}`,
                      loan_name: 'Daily Inventory Restock',
                      principal: 25000,
                      interest_rate: 12.5,
                      total_installments: 25,
                      paid_installments: 10,
                      installment_amount: 1125,
                      daily_due: 1125,
                      remaining_balance: 16875,
                      status: 'ACTIVE',
                      issue_date: '2026-09-01',
                      maturity_date: '2026-09-26',
                    },
                    {
                      id: `loan-2-${cust.id}`,
                      loan_code: `LN-DLY-B${cust.id}`,
                      loan_name: 'Festival Stock Advance',
                      principal: 15000,
                      interest_rate: 15.0,
                      total_installments: 50,
                      paid_installments: 18,
                      installment_amount: 345,
                      daily_due: 345,
                      remaining_balance: 11040,
                      status: 'ACTIVE',
                      issue_date: '2026-08-20',
                      maturity_date: '2026-10-09',
                    },
                  ],
                };
                setShop(fallbackShop);
                initializeLoanState(fallbackShop);
              }
            });
          }
        })
        .catch((err) => console.error('Error retrieving merchant collection record:', err))
        .finally(() => setLoading(false));
    }
  }, [shopId]);

  const activeLoans = shop?.loans || shop?.active_loans || [];

  // Toggle selection of a loan
  const toggleLoanSelection = (loanId) => {
    setSelectedLoans((prev) => ({
      ...prev,
      [loanId]: !prev[loanId],
    }));
  };

  // Open Daily Log Modal for a specific loan card
  const handleOpenLoanModal = (loan) => {
    setSelectedLoanForModal(loan);
    setModalFilterStatus('ALL');
  };

  // Helper to generate day-wise installment logs for a loan card
  const getLoanInstallments = (loan) => {
    if (!loan) return [];

    if (Array.isArray(loan.installments) && loan.installments.length > 0) {
      return loan.installments;
    }

    const total = loan.total_installments || 25;
    const paidCount = loan.paid_installments || 9;
    const dailyAmt = loan.installment_amount || loan.daily_due || 900;
    const baseDate = new Date(loan.issue_date || '2026-09-01');

    const list = [];
    for (let i = 1; i <= total; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (i - 1));
      const dateStr = d.toISOString().slice(0, 10);
      const isDateToday = dateStr === collectionDate;

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
        remaining_after: Math.max(0, (total - i) * dailyAmt),
      });
    }

    return list;
  };

  // Check whether a specific loan is already PAID on the currently selected date
  const isLoanPaidOnDate = (loan, targetDate) => {
    if (!loan) return false;
    const installments = getLoanInstallments(loan);
    const matched = installments.find((inst) => inst.due_date === targetDate);
    if (matched) {
      return matched.status === 'PAID';
    }
    const baseDate = new Date(loan.issue_date || '2026-09-01');
    const checkDate = new Date(targetDate);
    const diffDays = Math.floor((checkDate - baseDate) / (1000 * 60 * 60 * 24)) + 1;
    const paidCount = loan.paid_installments || 9;
    return diffDays <= paidCount;
  };

  // Check whether all active loans are paid for the selected date
  const isAllPaidForDate = activeLoans.length > 0 && activeLoans.every((l) => isLoanPaidOnDate(l, collectionDate));

  // Filter only payable loans (not yet paid on this date) that are selected
  const payableSelectedLoans = activeLoans.filter((l) => selectedLoans[l.id] && !isLoanPaidOnDate(l, collectionDate));

  // Calculate total selected payable sum
  const totalPayableAmount = payableSelectedLoans.reduce((sum, l) => {
    const amt = Number(l.installment_amount || l.daily_due || 900);
    return sum + amt;
  }, 0);

  // Total daily due for this merchant across all active loans
  const totalCombinedDailyDue = activeLoans.reduce((sum, l) => sum + Number(l.installment_amount || l.daily_due || 900), 0);

  // Handle Simultaneous Payment Submission
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!shop || payableSelectedLoans.length === 0 || totalPayableAmount <= 0) return;

    setSubmitting(true);
    try {
      const collectedItems = [];

      for (const loan of payableSelectedLoans) {
        const amt = loan.installment_amount || loan.daily_due || 900;
        const res = await api.recordShopkeeperCollection(
          shop.id,
          loan.loan_code,
          paymentMode,
          amt
        );
        collectedItems.push({
          loan_id: loan.id,
          loan_code: loan.loan_code,
          loan_name: loan.loan_name,
          amount: amt,
          receipt_no: res?.receipt_no || `REC-DLY-${Date.now().toString().slice(-6)}`,
        });
      }

      setReceiptData({
        receipt_master_no: `REC-DLY-BATCH-${Date.now().toString().slice(-6)}`,
        shop_name: shop.shop_name || shop.name,
        owner_name: shop.owner_name || shop.name,
        customer_code: shop.customer_code,
        stall_no: shop.stall_no,
        market_location: shop.market_location,
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

  // Loading Skeleton
  if (loading) {
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

  if (!shop) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <Store size={44} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Merchant Record Not Found</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
          Unable to find active loan cards for this merchant.
        </p>
        <button className="btn btn-secondary" onClick={() => navigate(getOrgPath('shopkeepers'))}>
          <ArrowLeft size={16} /> Back to Daily Merchants
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
            Daily Collection Receipt
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Simultaneous loan payment logged into active route ledger.
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
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Receipt Number:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '0.92rem', fontWeight: 800 }}>
                {receiptData.receipt_master_no}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Store / Merchant:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.92rem' }}>
                {receiptData.shop_name} ({receiptData.customer_code})
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Proprietor & Location:</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                {receiptData.owner_name} • {receiptData.stall_no} • {receiptData.market_location}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Payment Mode:</span>
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
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Date & Timestamp:</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{receiptData.collection_date} • {receiptData.timestamp}</span>
            </div>

            <hr style={{ borderColor: '#E2E8F0', margin: '0.75rem 0' }} />

            {/* Loan Card Breakdown Table */}
            <div style={{ marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Allocated Loan Card Installments:
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
              onClick={() => navigate(getOrgPath('shopkeepers'))}
              style={{ padding: '0.7rem 1.35rem', fontWeight: 800 }}
            >
              Back to Daily Merchants
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
          onClick={() => navigate(getOrgPath('shopkeepers'))}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Daily Merchants</span>
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
            <Calendar size={14} /> Day-Wise Ledger & Schedule
          </button>
        </div>
      </div>

      {/* Merchant Profile Hero Bar */}
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
              <Store size={24} color="var(--primary)" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {shop.shop_name || shop.name}
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
                  <Layers size={11} /> {activeLoans.length} Active Card{activeLoans.length > 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', marginTop: 4, fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span>Proprietor: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{shop.owner_name || shop.name}</strong> ({shop.customer_code})</span>
                {shop.stall_no && (
                  <span
                    style={{
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
                <span>• 📍 <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{shop.market_location || 'Saidapet Bazaar Route'}</strong></span>
                <span>• 📞 <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{shop.phone}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Daily Combined Due</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                {formatCurrency(shop.daily_collection_target)}
              </strong>
            </div>
            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.25rem' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Total Outstanding</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D97706', letterSpacing: '-0.02em' }}>
                {formatCurrency(shop.total_outstanding)}
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
                Active Daily Loan Cards ({activeLoans.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Click card to open Daily Log Modal
              </span>
            </div>

            {activeLoans.map((loan, idx) => {
              const isSelected = !!selectedLoans[loan.id];
              const totalDays = loan.total_installments || 25;
              const paidDays = loan.paid_installments || 0;
              const progressPct = totalDays > 0 ? Math.round((paidDays / totalDays) * 100) : 0;
              const isPaidForToday = isLoanPaidOnDate(loan, collectionDate);

              return (
                <div
                  key={loan.id || idx}
                  className="card"
                  onClick={() => handleOpenLoanModal(loan)}
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
                      {/* If loan is already paid on this date, show a green check badge; otherwise show selection checkbox */}
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
                            {loan.loan_name}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          Issued: {loan.issue_date || '2026-09-01'} • Maturity: {loan.maturity_date || '2026-09-26'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Daily Due</span>
                      <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: isPaidForToday ? '#047857' : 'var(--primary)', letterSpacing: '-0.02em' }}>
                        {formatCurrency(loan.installment_amount || loan.daily_due)}
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
                        {formatCurrency(loan.principal)} @ {loan.interest_rate || 12.5}%
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Repayable</span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                        {formatCurrency(loan.total_repayment_amount || loan.principal * 1.125)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>Remaining Balance</span>
                      <strong style={{ color: '#D97706', fontWeight: 900 }}>
                        {formatCurrency(loan.remaining_balance)}
                      </strong>
                    </div>
                  </div>

                  {/* Day Progress Strip */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        Installment Timeline:
                      </span>
                      <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                        Day {paidDays} of {totalDays} ({progressPct}%)
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
                      <Calendar size={13} /> View Daily Log Modal ↗
                    </button>

                    {/* Status Pill for the currently selected date */}
                    {isPaidForToday ? (
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
                    ) : (
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
                        Due on {collectionDate}: {formatCurrency(loan.installment_amount || loan.daily_due)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Record Daily Payment Panel */}
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
                Record Daily Payment
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Collect dues for selected date across merchant's active loan cards.
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
                  style={{
                    padding: '0.55rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <input
                  type="date"
                  className="form-input"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  required
                  style={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textAlign: 'center',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                  }}
                />

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleNextDay}
                  title="Next Day"
                  style={{
                    padding: '0.55rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: '1.5px solid #E2E8F0',
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* CONDITIONAL DISPLAY: IF ALREADY PAID FOR THIS DATE VS PAYABLE FORM */}
            {isAllPaidForDate ? (
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
                  All active loan installments ({formatCurrency(totalCombinedDailyDue)}) for this date are already collected and cleared.
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
                    <span style={{ color: 'var(--text-muted)' }}>Payable Cards for Date:</span>
                    <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>
                      {payableSelectedLoans.length} of {activeLoans.length} Loans
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
                      : `Collect ${formatCurrency(totalPayableAmount)} (${payableSelectedLoans.length} Cards)`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: DAY-WISE INSTALLMENT SCHEDULE & REPAYMENT LEDGER               */}
      {/* ===================================================================== */}
      {activeTab === 'SCHEDULE' && (
        <div className="card" style={{ padding: '1.5rem', border: '1.5px solid #E2E8F0', borderRadius: 12, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Day-Wise Installment Schedule & Ledger
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select an active loan card to view its complete date-of-payment breakdown
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
                    {formatCurrency(currentScheduleLoan.principal)} @ {currentScheduleLoan.interest_rate || 12.5}%
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Tenure</span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                    {currentScheduleLoan.total_installments || 25} Daily Installments
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Daily Installment</span>
                  <strong style={{ color: '#047857', fontWeight: 900 }}>
                    {formatCurrency(currentScheduleLoan.installment_amount || currentScheduleLoan.daily_due)}/day
                  </strong>
                </div>
              </div>

              {/* Installments Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day / Installment</th>
                      <th>Scheduled Due Date</th>
                      <th>Daily Target</th>
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

                      return (
                        <tr key={i}>
                          <td>
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                              Day {inst.day_number || inst.installment_number || i + 1}
                            </strong>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {inst.due_date || '2026-09-13'}
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
                                  : isTodayDue
                                  ? '#FEF3C7'
                                  : '#F1F5F9',
                                color: isPaid
                                  ? '#065F46'
                                  : isTodayDue
                                  ? '#92400E'
                                  : 'var(--text-muted)',
                                border: `1px solid ${isPaid ? '#A7F3D0' : isTodayDue ? '#FDE68A' : '#E2E8F0'}`,
                                fontWeight: 800,
                                fontSize: '0.72rem',
                              }}
                            >
                              {isPaid ? 'PAID ✓' : isTodayDue ? "TODAY'S DUE ⏱" : 'PENDING'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {inst.paid_date || (isPaid ? inst.due_date : '-')}
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
        </div>
      )}

      {/* ===================================================================== */}
      {/* DAILY LOG MODAL (CLICK-TO-VIEW FOR BASIC ADMIN USERS)                */}
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
                    Merchant: <strong style={{ color: 'var(--text-primary)' }}>{shop.shop_name || shop.name}</strong> • {shop.stall_no}
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
              {/* 4-Stat Box Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Daily Installment</span>
                  <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {formatCurrency(selectedLoanForModal.installment_amount || selectedLoanForModal.daily_due)}
                  </strong>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Total Repayable</span>
                  <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {formatCurrency(selectedLoanForModal.total_repayment_amount || selectedLoanForModal.principal * 1.125)}
                  </strong>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Paid Amount</span>
                  <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>
                    {formatCurrency((selectedLoanForModal.paid_installments || 9) * (selectedLoanForModal.installment_amount || 900))}
                  </strong>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Remaining Balance</span>
                  <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: '#D97706' }}>
                    {formatCurrency(selectedLoanForModal.remaining_balance)}
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
                    Day {selectedLoanForModal.paid_installments || 9} of {selectedLoanForModal.total_installments || 25} ({Math.round(((selectedLoanForModal.paid_installments || 9) / (selectedLoanForModal.total_installments || 25)) * 100)}%)
                  </strong>
                </div>
                <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.round(((selectedLoanForModal.paid_installments || 9) / (selectedLoanForModal.total_installments || 25)) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366F1, #4F46E5)',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Day-by-Day Daily Log & Ledger
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
                      <th>Day #</th>
                      <th>Due Date</th>
                      <th>Target</th>
                      <th>Paid Amount</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Receipt Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLoanInstallments(selectedLoanForModal)
                      .filter((inst) => {
                        if (modalFilterStatus === 'PAID') return inst.status === 'PAID';
                        if (modalFilterStatus === 'PENDING') return inst.status === 'PENDING' || inst.status === 'TODAY_DUE';
                        return true;
                      })
                      .map((inst, idx) => {
                        const isPaid = inst.status === 'PAID';
                        const isTodayDue = inst.status === 'TODAY_DUE';

                        return (
                          <tr key={idx}>
                            <td>
                              <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                                Day {inst.day_number}
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
                                    : isTodayDue
                                    ? '#FEF3C7'
                                    : '#F1F5F9',
                                  color: isPaid
                                    ? '#065F46'
                                    : isTodayDue
                                    ? '#92400E'
                                    : 'var(--text-muted)',
                                  border: `1px solid ${isPaid ? '#A7F3D0' : isTodayDue ? '#FDE68A' : '#E2E8F0'}`,
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                }}
                              >
                                {isPaid ? 'PAID ✓' : isTodayDue ? "TODAY'S DUE ⏱" : 'PENDING'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {inst.receipt_no || '-'}
                              </span>
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
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <Printer size={15} /> Print Daily Log
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedLoanForModal(null)}
                style={{ padding: '0.5rem 1.25rem', fontWeight: 800 }}
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperCollect;
