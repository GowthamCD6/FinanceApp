import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { TableSkeleton, CardSkeleton } from '../../../components/common/Skeleton';
import {
  DollarSign,
  Receipt,
  Search,
  CheckCircle2,
  Printer,
  RefreshCw,
} from 'lucide-react';
import './UserPaymentOverview.css';

export const UserPaymentOverview = () => {
  const [payments, setPayments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orgFilter, setOrgFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, orgFilter, methodFilter, statusFilter]);

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
  const bankTotal = payments.filter((p) => p.payment_method === 'BANK_TRANSFER' || p.payment_method === 'ONLINE').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="user-payment-overview-page">
      {/* 1. Clean Header */}
      <div className="upo-page-header">
        <h1 className="upo-title">Platform Payment & Collection Overview</h1>

        <div className="upo-header-actions">
          <button className="upo-btn-secondary" onClick={loadData}>
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button className="upo-btn-secondary" onClick={() => window.print()}>
            <Printer size={15} />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* 2. Platform KPI Cards (Solid #0F172A numbers) */}
      <div className="upo-kpi-grid">
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <div className="upo-kpi-card">
              <span className="upo-kpi-label">Total Collections</span>
              <div className="upo-kpi-val">{formatCurrency(totalCollected)}</div>
              <span className="upo-kpi-sub">{payments.length} total transactions</span>
            </div>

            <div className="upo-kpi-card">
              <span className="upo-kpi-label">Cash Collections</span>
              <div className="upo-kpi-val">{formatCurrency(cashTotal)}</div>
              <span className="upo-kpi-sub">Field route collections</span>
            </div>

            <div className="upo-kpi-card">
              <span className="upo-kpi-label">UPI Digital Inflows</span>
              <div className="upo-kpi-val">{formatCurrency(upiTotal)}</div>
              <span className="upo-kpi-sub">Instant merchant settlements</span>
            </div>

            <div className="upo-kpi-card">
              <span className="upo-kpi-label">Bank Transfers</span>
              <div className="upo-kpi-val">{formatCurrency(bankTotal)}</div>
              <span className="upo-kpi-sub">Direct account transfers</span>
            </div>
          </>
        )}
      </div>

      {/* 3. Filter Bar */}
      <div className="upo-filter-card">
        <div className="upo-search-wrap">
          <Search size={16} />
          <input
            type="text"
            className="upo-search-input"
            placeholder="Search by receipt #, customer name, loan #, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="upo-select-group">
          <select
            className="upo-select"
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
          >
            <option value="ALL">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>

          <select
            className="upo-select"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>

          <select
            className="upo-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="REVERSED">Reversed</option>
          </select>
        </div>
      </div>

      {/* 4. Transactions Table */}
      <div className="upo-table-card">
        <table className="upo-table">
          <thead>
            <tr>
              <th>RECEIPT #</th>
              <th>BORROWER / SHOP</th>
              <th>LOAN #</th>
              <th>AMOUNT</th>
              <th>METHOD</th>
              <th>STATUS</th>
              <th>COLLECTION DATE</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={pageSize} cols={8} />
            ) : paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <Receipt size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>No transactions found</div>
                  <div style={{ fontSize: '0.85rem', marginTop: 4 }}>Try adjusting your search criteria or filters.</div>
                </td>
              </tr>
            ) : (
              paginatedPayments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 750, color: '#0f172a', fontFamily: 'monospace' }}>
                    {p.payment_number}
                  </td>
                  <td style={{ fontWeight: 750, color: '#0f172a' }}>
                    {p.customer_name || 'Borrower'}
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {p.loan_number}
                  </td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#334155' }}>
                      {p.payment_method || 'CASH'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={p.status || 'COMPLETED'} />
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.825rem' }}>
                    {p.paid_at || p.payment_date ? new Date(p.paid_at || p.payment_date).toLocaleDateString('en-IN') : 'Recent'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-receipt"
                      onClick={() => setSelectedReceipt(p)}
                    >
                      <Receipt size={13} />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredPayments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredPayments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="transactions"
          />
        )}
      </div>

      {/* 5. Clean Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title={`Receipt: ${selectedReceipt.payment_number}`}
        >
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                PAYMENT AMOUNT
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
                {formatCurrency(selectedReceipt.amount)}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#059669', fontWeight: 700 }}>
                Status: {selectedReceipt.status || 'SUCCESS'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Borrower Name</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedReceipt.customer_name || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Loan Account</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedReceipt.loan_number || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Payment Method</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedReceipt.payment_method || 'CASH'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Date & Time</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>
                  {selectedReceipt.paid_at ? new Date(selectedReceipt.paid_at).toLocaleString('en-IN') : 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="upo-btn-secondary"
                onClick={() => setSelectedReceipt(null)}
              >
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
