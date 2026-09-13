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
  Store,
  User,
  Receipt,
  Printer,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const ShopkeeperCollect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopId } = useParams();
  const { activeOrg } = useOrg();

  const [shop, setShop] = useState(location.state?.shop || null);
  const [loadingShop, setLoadingShop] = useState(!location.state?.shop);
  const [paymentAmount, setPaymentAmount] = useState(
    String(location.state?.shop?.daily_collection_target || location.state?.shop?.daily_due || 900)
  );
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  useEffect(() => {
    if (!shop && shopId) {
      setLoadingShop(true);
      api.getShopkeepers()
        .then((shops) => {
          const found = Array.isArray(shops) ? shops.find((s) => String(s.id) === String(shopId) || String(s.customer_code) === String(shopId)) : null;
          if (found) {
            setShop(found);
            setPaymentAmount(String(found.daily_collection_target || 900));
          } else {
            // fallback to getCustomerById
            return api.getCustomerById(shopId).then((cust) => {
              if (cust) {
                setShop({
                  id: cust.id,
                  shop_name: cust.shop_name || `${cust.name || cust.full_name}'s Store`,
                  owner_name: cust.name || cust.full_name,
                  phone: cust.phone,
                  address: cust.address || `${cust.city || 'Chennai'}, Tamil Nadu`,
                  customer_code: cust.customer_code || `SHP-${cust.id}`,
                  daily_collection_target: cust.daily_due || 900,
                  total_due: cust.totalOutstanding || 13500,
                  active_loans: cust.loans || [{ loan_code: `LN-SHP-${cust.customer_code || cust.id}`, principal: 25000, total_installments: 25, paid_installments: 10 }],
                });
                setPaymentAmount(String(cust.daily_due || 900));
              }
            });
          }
        })
        .catch((err) => console.error('Error fetching shopkeeper details for collection:', err))
        .finally(() => setLoadingShop(false));
    }
  }, [shopId, shop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop) return;
    setSubmitting(true);
    try {
      const mainLoan = shop.active_loans?.[0] || shop.active_loan || { loan_code: `LN-SHP-${shop.customer_code || shop.id}` };
      const loanCode = mainLoan.loan_code || `LN-SHP-${shop.id}`;
      const res = await api.recordShopkeeperCollection(shop.id, loanCode, paymentMode, paymentAmount);
      setReceiptData({
        ...res,
        shop_name: shop.shop_name || shop.name,
        owner_name: shop.owner_name || shop.name,
        customer_code: shop.customer_code || `SHP-${shop.id}`,
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

  if (loadingShop) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Loading Merchant Collection Record...
        </div>
        <span>Retrieving daily ledger and business profile</span>
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Merchant information not available.
        </p>
        <button className="btn btn-secondary" onClick={() => navigate(getOrgPath('shopkeepers'))}>
          <ArrowLeft size={16} /> Back to Daily Merchants
        </button>
      </div>
    );
  }

  const mainLoan = shop.active_loans?.[0] || shop.active_loan || {
    loan_code: `LN-SHP-${shop.customer_code || shop.id}`,
    principal: 25000,
    total_installments: 25,
    paid_installments: 10,
  };
  const totalDays = mainLoan.total_installments || 25;
  const paidDays = mainLoan.paid_installments || 10;
  const progressPct = totalDays > 0 ? Math.round((paidDays / totalDays) * 100) : 40;

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
            Daily Collection Recorded!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Merchant daily installment has been collected and credited to route ledger.
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
                {receiptData.receipt_no || receiptData.receiptNumber || `REC-DLY-${Date.now().toString().slice(-6)}`}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Merchant / Enterprise:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                {receiptData.shop_name} ({receiptData.customer_code})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Proprietor:</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{receiptData.owner_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loan Code:</span>
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
            <button className="btn btn-primary" onClick={() => navigate(getOrgPath('shopkeepers'))}>
              Back to Daily Merchants
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
        onClick={() => navigate(getOrgPath('shopkeepers'))}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Daily Merchants</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Merchant & Daily Loan Overview Card */}
        <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--purple)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(124, 58, 237, 0.12)',
                color: 'var(--purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}
            >
              <Store size={22} color="var(--purple)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {shop.shop_name || shop.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Proprietor: {shop.owner_name || shop.name} • {shop.customer_code || `SHP-${shop.id}`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} color="var(--text-muted)" />
              <strong style={{ color: 'var(--text-primary)' }}>{shop.phone}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} color="var(--text-muted)" />
              <span>{shop.address}</span>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Daily Repayment Timeline
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Daily Target Amount:</span>
            <strong style={{ color: 'var(--purple)', fontSize: '0.95rem' }}>{formatCurrency(shop.daily_collection_target || 900)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Balance Outstanding:</span>
            <strong style={{ color: 'var(--amber)' }}>{formatCurrency(shop.total_due || 13500)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Days Completed:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Day {paidDays} / {totalDays} ({progressPct}%)
            </span>
          </div>

          <div style={{ width: '100%', height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--purple)', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Collection Form Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Collect Daily Installment
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Collection Amount (₹) *</label>
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
              <label className="form-label">Payment Channel *</label>
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

export default ShopkeeperCollect;
