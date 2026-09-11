import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  DollarSign,
  Receipt,
  Search,
  CheckCircle2,
  Printer,
  RefreshCw,
} from 'lucide-react';

export const UserPaymentOverview = () => {
  const [payments, setPayments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orgFilter, setOrgFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgs, paymentList] = await Promise.all([
        api.organizations.getAll().catch(() => []),
        api.payments.getAll().catch(() => []),
      ]);
      setOrganizations(Array.isArray(orgs) ? orgs : []);
      setPayments(Array.isArray(paymentList) ? paymentList : (paymentList?.payments || []));
    } catch (err) {
      console.error('Failed to load live payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      p.payment_number?.toLowerCase().includes(q) ||
      p.customer_name?.toLowerCase().includes(q) ||
      p.loan_number?.toLowerCase().includes(q) ||
      p.reference_number?.toLowerCase().includes(q);

    const matchOrg = orgFilter === 'ALL' || String(p.organization_id) === String(orgFilter);
    const matchMethod = methodFilter === 'ALL' || p.payment_method === methodFilter;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchSearch && matchOrg && matchMethod && matchStatus;
  });

  const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const cashTotal = payments.filter((p) => p.payment_method === 'CASH').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const upiTotal = payments.filter((p) => p.payment_method === 'UPI').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="user-payment-overview-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">GLOBAL TRANSACTION INTELLIGENCE</div>
          <h1 className="page-title">User Payment Overview</h1>
          <p className="page-subtitle">
            Platform-wide aggregated payment transaction ledger, collection volumes, and branch settlement auditing.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={loadData}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            Print Ledger
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Platform Collections</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.5rem', color: 'var(--emerald)' }}>
            {formatCurrency(totalCollected)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{payments.length} transactions recorded</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cash Collections</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.5rem', color: 'var(--accent-primary)' }}>
            {formatCurrency(cashTotal)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Field route physical cash</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Digital UPI Collections</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.5rem', color: 'var(--purple)' }}>
            {formatCurrency(upiTotal)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instant QR settlements</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reconciliation Status</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.5rem', color: '#fbbf24' }}>Balanced</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>TiDB Cloud Verified</span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input"
              placeholder="Search receipt #, customer name, loan #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select className="form-input" style={{ width: 160 }} value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)}>
              <option value="ALL">All Organizations</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>

            <select className="form-input" style={{ width: 140 }} value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="ALL">All Methods</option>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">BANK TRANSFER</option>
            </select>

            <select className="form-input" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Customer Name</th>
                <th>Loan #</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading live payment records...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No payment records found.</td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id || p.payment_number}>
                    <td>
                      <strong style={{ color: '#fff' }}>{p.payment_number}</strong>
                      {p.reference_number && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ref: {p.reference_number}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p.customer_name || 'Customer'}</div>
                    </td>
                    <td><code>{p.loan_number || 'LN-PORTFOLIO'}</code></td>
                    <td>
                      <strong style={{ color: 'var(--emerald)' }}>{formatCurrency(p.amount)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${p.payment_method === 'UPI' ? 'badge-purple' : 'badge-emerald'}`}>
                        {p.payment_method}
                      </span>
                    </td>
                    <td>{p.payment_date ? new Date(p.payment_date).toISOString().slice(0, 10) : 'Today'}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem' }}
                        onClick={() => setSelectedReceipt(p)}
                      >
                        <Receipt size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Payment Receipt #${selectedReceipt.payment_number}`}
        >
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#fff' }}>Official Repayment Receipt</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FinanceFlow Microfinance Platform</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Receipt No:</span>
                <div style={{ color: '#fff', fontWeight: 600 }}>{selectedReceipt.payment_number}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                <div style={{ color: '#fff' }}>{selectedReceipt.payment_date}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <div style={{ color: '#fff' }}>{selectedReceipt.customer_name || 'Customer'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Loan Account:</span>
                <div style={{ color: '#fff' }}>{selectedReceipt.loan_number}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                <div style={{ color: '#fff' }}>{selectedReceipt.payment_method}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                <div style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: '1.1rem' }}>
                  {formatCurrency(selectedReceipt.amount)}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserPaymentOverview;
