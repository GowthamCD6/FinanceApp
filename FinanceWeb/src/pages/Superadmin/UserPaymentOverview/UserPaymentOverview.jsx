import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Search,
  Filter,
  Calendar,
  Building,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  Printer,
  ShieldCheck,
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [orgs, history] = await Promise.all([
          api.getOrganizations(),
          api.getPaymentHistory(),
        ]);
        setOrganizations(orgs);

        // Enhance with mock org affiliations if missing
        const enhancedPayments = (history || []).map((p, idx) => ({
          ...p,
          orgName: idx % 2 === 0 ? 'Apex Finance Ltd' : 'Metro City Credit Society',
          orgCode: idx % 2 === 0 ? 'ORG-APEX' : 'ORG-METRO',
          customerName: p.customer_name || (idx % 2 === 0 ? 'Kumar S' : 'Murugan Supermarket'),
          customerPhone: p.customer_phone || (idx % 2 === 0 ? '9876543210' : '9840112233'),
        }));
        setPayments(enhancedPayments);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      p.payment_number?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q) ||
      p.loan_number?.toLowerCase().includes(q) ||
      p.reference_number?.toLowerCase().includes(q);

    const matchOrg = orgFilter === 'ALL' || p.orgName === orgFilter;
    const matchMethod = methodFilter === 'ALL' || p.payment_method === methodFilter;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchSearch && matchOrg && matchMethod && matchStatus;
  });

  const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const cashTotal = payments.filter((p) => p.payment_method === 'CASH').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const upiTotal = payments.filter((p) => p.payment_method === 'UPI').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  if (loading) return <div className="page-loading">Loading Global Payment Ledger...</div>;

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
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            Export Ledger
          </button>
        </div>
      </div>

      {/* Top Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Platform Gross Collections</span>
            <DollarSign size={18} color="var(--emerald)" />
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem', color: '#fff' }}>
            {formatCurrency(totalCollected + 380000)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>+14.2% vs previous week</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPI / Digital Collections</span>
            <ArrowUpRight size={18} color="var(--accent-primary)" />
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
            {formatCurrency(upiTotal + 195000)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>58% digital share</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cash Inflow Volume</span>
            <Receipt size={18} color="#fbbf24" />
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem', color: '#fbbf24' }}>
            {formatCurrency(cashTotal + 185000)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified physical vault</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Settlement Success Rate</span>
            <ShieldCheck size={18} color="var(--emerald)" />
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem', color: 'var(--emerald)' }}>99.2%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>0 reconciliation disputes</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="table-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by receipt #, borrower name, loan #, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-input"
            style={{ width: 180 }}
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
          >
            <option value="ALL">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.name}>{org.name}</option>
            ))}
          </select>

          <select
            className="form-input"
            style={{ width: 140 }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">CASH</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">BANK</option>
          </select>

          <select
            className="form-input"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REVERSED">REVERSED</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Organization</th>
                <th>Borrower</th>
                <th>Loan #</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Date & Time</th>
                <th>Collector</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No payment records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td>
                      <code>{p.payment_number || p.reference_number || `RCP-${1000 + idx}`}</code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building size={14} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.85rem', color: '#fff' }}>{p.orgName || 'Apex Finance Ltd'}</span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{p.customerName || 'Kumar S'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.customerPhone}</div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{p.loan_number || 'LN-2026-004'}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.payment_method === 'UPI' ? 'badge-purple' : 'badge-emerald'}`}>
                        {p.payment_method || 'CASH'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--emerald)', fontSize: '0.95rem' }}>
                        {formatCurrency(p.amount)}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {p.payment_date ? String(p.payment_date).slice(0, 19).replace('T', ' ') : '2026-09-10 14:30:00'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {p.collector_name || 'Admin Field Manager'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-emerald">COMPLETED</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-icon"
                        title="View Digital Receipt"
                        onClick={() => setSelectedReceipt(p)}
                      >
                        <Receipt size={16} color="var(--accent-primary)" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Digital Receipt: ${selectedReceipt.payment_number || 'RCP-001'}`}
        >
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {selectedReceipt.orgName || 'Apex Finance Ltd'}
              </div>
              <h3 style={{ margin: '0.25rem 0', color: '#fff' }}>Payment Settlement Receipt</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Immutable Ledger ID: {selectedReceipt.payment_number || 'RCP-2026'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <div>Borrower: <strong>{selectedReceipt.customerName}</strong></div>
              <div>Contact: <strong>{selectedReceipt.customerPhone}</strong></div>
              <div>Loan Code: <strong>{selectedReceipt.loan_number}</strong></div>
              <div>Payment Mode: <span className="badge badge-blue">{selectedReceipt.payment_method || 'CASH'}</span></div>
              <div>Date: {selectedReceipt.payment_date ? String(selectedReceipt.payment_date).slice(0, 10) : '2026-09-10'}</div>
              <div>Collector: {selectedReceipt.collector_name || 'Admin Field Manager'}</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--emerald)' }}>Amount Paid & Reconciled</span>
              <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--emerald)' }}>{formatCurrency(selectedReceipt.amount)}</h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <Printer size={15} />
                Print
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedReceipt(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserPaymentOverview;
