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
} from 'lucide-react';

export const WeeklyCollect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId } = useParams();
  const { activeOrg } = useOrg();

  const [customer, setCustomer] = useState(location.state?.customer || null);
  const [loadingCust, setLoadingCust] = useState(!location.state?.customer);
  const [paymentAmount, setPaymentAmount] = useState(
    String(location.state?.customer?.current_week_due || 2200)
  );
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  useEffect(() => {
    if (!customer && customerId) {
      setLoadingCust(true);
      api.getCustomerById(customerId)
        .then((cust) => {
          if (cust) {
            setCustomer({
              id: cust.id,
              customer_code: cust.customer_code,
              name: cust.full_name || cust.name,
              phone: cust.phone,
              address: cust.address || `${cust.city || 'Chennai'}, Tamil Nadu`,
              occupation: cust.occupation || 'Self Employed',
              active_loan: cust.loans?.[0] || { loan_code: `LN-WK-${cust.customer_code}`, principal: 20000, total_installments: 10 },
              paid_installments: 4,
              total_installments: 10,
              current_week_due: 2200,
              outstanding_balance: cust.totalOutstanding || 14000,
            });
            setPaymentAmount('2200');
          }
        })
        .catch((err) => console.error('Error fetching customer for collection:', err))
        .finally(() => setLoadingCust(false));
    }
  }, [customerId, customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) return;
    setSubmitting(true);
    try {
      const loanCode = customer.active_loan?.loan_code || customer.active_loan?.loan_number || `LN-WK-${customer.customer_code || customer.id}`;
      const res = await api.recordWeeklyCollection(customer.id, loanCode, paymentMode, paymentAmount);
      setReceiptData({
        ...res,
        customer_name: customer.name,
        customer_code: customer.customer_code,
        loan_code: loanCode,
        amount: parseFloat(paymentAmount),
        payment_mode: paymentMode,
        timestamp: new Date().toLocaleString('en-IN'),
      });
    } catch (err) {
      alert('Failed to record payment: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCust) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Loading Borrower Payment Profile...
        </div>
        <span>Retrieving loan ledger</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Customer details not available.
        </p>
        <button className="btn btn-secondary" onClick={() => navigate(getOrgPath('weekly-customers'))}>
          <ArrowLeft size={16} /> Back to Weekly Customers
        </button>
      </div>
    );
  }

  const progressPct = customer.total_installments > 0
    ? Math.round((customer.paid_installments / customer.total_installments) * 100)
    : 40;

  if (receiptData) {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
        <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', borderTop: '4px solid var(--emerald)' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(5, 150, 105, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <CheckCircle2 size={34} color="var(--emerald)" />
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 700 }}>
            Payment Collected Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Weekly installment has been processed and logged into the central fund ledger.
          </p>

          <div
            style={{
              background: 'var(--bg-primary)',
              borderRadius: 10,
              padding: '1.5rem',
              textAlign: 'left',
              marginBottom: '1.75rem',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Receipt Number:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                {receiptData.receipt_no || receiptData.receiptNumber || `REC-WK-${Date.now().toString().slice(-6)}`}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Borrower:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                {receiptData.customer_name} ({receiptData.customer_code})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loan Identifier:</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{receiptData.loan_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Amount Collected:</span>
              <strong style={{ color: 'var(--emerald)', fontSize: '1.15rem' }}>{formatCurrency(receiptData.amount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Payment Mode:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{receiptData.payment_mode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Timestamp:</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{receiptData.timestamp}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={16} /> <span>Print Receipt</span>
            </button>
            <button className="btn btn-primary" onClick={() => navigate(getOrgPath('weekly-customers'))}>
              Back to Weekly Customers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 0.5rem' }}>
      {/* Back Button */}
      <button
        className="btn btn-secondary"
        onClick={() => navigate(getOrgPath('weekly-customers'))}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Weekly Customers</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Borrower & Loan Overview Card */}
        <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(79, 70, 229, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}
            >
              {customer.name?.charAt(0) || 'B'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {customer.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {customer.customer_code} • {customer.occupation}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} color="var(--text-muted)" />
              <strong style={{ color: 'var(--text-primary)' }}>{customer.phone}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} color="var(--text-muted)" />
              <span>{customer.address}</span>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Weekly Repayment Status
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Scheduled Weekly Installment:</span>
            <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{formatCurrency(customer.current_week_due || 2200)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Remaining Balance:</span>
            <strong style={{ color: 'var(--amber)' }}>{formatCurrency(customer.outstanding_balance || 14000)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Installments Progress:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {customer.paid_installments || 0} / {customer.total_installments || 10} weeks ({progressPct}%)
            </span>
          </div>

          <div style={{ width: '100%', height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--emerald)', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Collection Form Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Record Weekly Payment
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Payment Amount (₹) *</label>
              <input
                type="number"
                className="form-input"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="1"
                required
                style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--emerald)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Payment Mode *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['UPI', 'CASH', 'BANK_TRANSFER'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`btn ${paymentMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '0.55rem' }}
                    onClick={() => setPaymentMode(mode)}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !paymentAmount}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <DollarSign size={18} />
              <span>{submitting ? 'Recording Collection...' : `Collect ${formatCurrency(paymentAmount)}`}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCollect;
