import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useOrg } from '../../context/OrgContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  Layers,
  Store,
} from 'lucide-react';

export const AdminLoans = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [profitSummary, setProfitSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [freqFilter, setFreqFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Disburse Loan Modal State
  const [disburseModal, setDisburseModal] = useState(false);
  const [formData, setFormData] = useState({
    borrower_id: '',
    loan_name: '',
    principal: '20000',
    frequency: 'WEEKLY',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const getOrgPath = (sub) => activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`;

  const loadData = async () => {
    setLoading(true);
    try {
      const [l, u, p] = await Promise.all([
        api.getLoans(),
        api.getUsers(),
        api.getFinancialProfitSummary(),
      ]);
      setLoans(l);
      setUsers(u);
      setProfitSummary(p);
      if (u.length > 0 && !formData.borrower_id) {
        setFormData((prev) => ({ ...prev, borrower_id: u[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const handleDisburseSubmit = async (e) => {
    e.preventDefault();
    if (!formData.borrower_id || !formData.principal) return;

    setSubmitting(true);
    try {
      const newLoan = await api.createLoan(formData);
      setToastMsg(`Loan ${newLoan.loan_code} disbursed successfully to ${newLoan.borrower_name}!`);
      setTimeout(() => setToastMsg(null), 3500);
      setDisburseModal(false);
      setFormData({
        borrower_id: users[0]?.id || '',
        loan_name: '',
        principal: '20000',
        frequency: 'WEEKLY',
      });
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for Disburse Preview
  const selectedPrincipal = parseFloat(formData.principal) || 0;
  const isDaily = formData.frequency === 'DAILY';
  const interestRate = isDaily ? 0.125 : 0.10;
  const totalRepayable = Math.round(selectedPrincipal * (1 + interestRate));
  const totalInstallments = isDaily ? 25 : 10;
  const installmentAmt = Math.round(totalRepayable / totalInstallments);

  // Selected borrower info in modal
  const selectedBorrower = users.find((u) => u.id === Number(formData.borrower_id));
  const borrowerExistingLoans = loans.filter((l) => l.borrower_id === Number(formData.borrower_id) && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
  const borrowerTotalOutstanding = borrowerExistingLoans.reduce((sum, l) => sum + (l.remaining_balance || 0), 0);

  const filteredLoans = loans.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      l.borrower_name?.toLowerCase().includes(q) ||
      l.customer_code?.toLowerCase().includes(q) ||
      l.loan_code?.toLowerCase().includes(q) ||
      l.borrower_phone?.includes(q) ||
      (l.loan_name && l.loan_name.toLowerCase().includes(q));

    const matchFreq = freqFilter === 'ALL' || l.frequency === freqFilter;
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;

    return matchSearch && matchFreq && matchStatus;
  });

  if (loading) return <div className="page-loading">Loading Loan Portfolio...</div>;

  return (
    <div className="admin-loans-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">LOAN PORTFOLIO & MULTI-LOAN MANAGEMENT</div>
          <h1 className="page-title">Loan Registry & Capital Tracking</h1>
          <p className="page-subtitle">
            Issue concurrent multi-loans to borrowers, track principal invested, repayments collected, and net profit.
          </p>
        </div>

        <button className="btn btn-emerald btn-lg" onClick={() => setDisburseModal(true)}>
          <Plus size={18} />
          <span>Disburse New Loan</span>
        </button>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="feedback-banner">
          <CheckCircle2 size={16} color="var(--emerald)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Financial Accounting & Portfolio KPIs */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          label="Total Capital Disbursed"
          value={formatCurrency(profitSummary?.totalCapitalInvested || 0)}
          icon={CreditCard}
          trend={`${loans.length} Total Contracts`}
          trendDirection="up"
          meta="All Loan Outflows"
          accentColor="#4F46E5"
          accentBg="#EEF2FF"
        />

        <StatCard
          label="Total Repayments Collected"
          value={formatCurrency(profitSummary?.totalAmountCollected || 0)}
          icon={DollarSign}
          trend={`${profitSummary?.recoveryProgressPercent || 0}% Recovery Rate`}
          trendDirection="up"
          meta={`Principal: ${formatCurrency(profitSummary?.totalPrincipalRecovered || 0)}`}
          accentColor="#059669"
          accentBg="#ECFDF5"
        />

        <StatCard
          label="Realized Net Profit (Cash)"
          value={formatCurrency(profitSummary?.realizedNetProfit || 0)}
          icon={TrendingUp}
          trend={`+${profitSummary?.realizedRoiPercent || 0}% ROI Yield`}
          trendDirection="up"
          meta={`Projected: +${formatCurrency(profitSummary?.projectedTotalNetProfit || 0)}`}
          accentColor="#D97706"
          accentBg="#FFFBEB"
        />

        <StatCard
          label="Outstanding Market Debt"
          value={formatCurrency(profitSummary?.totalOutstandingBalance || 0)}
          icon={Clock}
          trend={`${profitSummary?.activeLoansCount || 0} Active Loans`}
          trendDirection="up"
          meta="Active Field Exposure"
          accentColor="#7C3AED"
          accentBg="#F5F3FF"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="card control-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input search-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by borrower name, phone, loan name, or loan code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={freqFilter}
            onChange={(e) => setFreqFilter(e.target.value)}
          >
            <option value="ALL">All Schemes</option>
            <option value="WEEKLY">Weekly (10 Wks)</option>
            <option value="DAILY">Daily (25 Days)</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PAID_OFF">Paid Off</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Loan Code & Contract</th>
              <th>Borrower / Shop</th>
              <th>Scheme / Frequency</th>
              <th>Principal Given</th>
              <th>Total Repayable</th>
              <th>Progress</th>
              <th>Remaining Balance</th>
              <th>Next Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => {
              const progressPct = Math.round(((loan.paid_installments || 0) / (loan.total_installments || 1)) * 100);
              const isMulti = loan.total_user_loans > 1;

              return (
                <tr key={loan.loan_code}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                        {loan.loan_code}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {loan.loan_name || (loan.frequency === 'DAILY' ? 'Daily Merchant Loan' : 'Weekly Personal Loan')}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{loan.borrower_name}</strong>
                        {isMulti && (
                          <span className="badge badge-indigo text-xs" title="Borrower has multiple loans">
                            Loan #{loan.loan_index} of {loan.total_user_loans}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {loan.customer_code} • {loan.borrower_phone}
                        {loan.is_shopkeeper && ` • ${loan.shop_name || 'Shop'}`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${loan.frequency === 'WEEKLY' ? 'badge-primary' : 'badge-emerald'}`}>
                      {loan.frequency === 'WEEKLY' ? '10-Week Installments' : '25-Day Daily'}
                    </span>
                  </td>
                  <td>
                    <strong>{formatCurrency(loan.principal)}</strong>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(loan.total_repayable)}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {formatCurrency(loan.installment_amount)} / {loan.frequency === 'WEEKLY' ? 'wk' : 'day'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '110px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600 }}>
                        <span>{loan.paid_installments}/{loan.total_installments}</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--emerald)' }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: loan.remaining_balance === 0 ? 'var(--emerald)' : '#E11D48', fontWeight: 800 }}>
                      {loan.remaining_balance === 0 ? 'PAID IN FULL' : formatCurrency(loan.remaining_balance)}
                    </strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={13} color="var(--text-muted)" />
                      <span>{loan.next_due_date}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={loan.status} />
                  </td>
                </tr>
              );
            })}

            {filteredLoans.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <CreditCard size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <h3>No loan records found</h3>
                  <p>Try adjusting your search criteria or disburse a new loan.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Disburse Loan Modal (Multi-Loan Enabled) */}
      <Modal
        isOpen={disburseModal}
        onClose={() => setDisburseModal(false)}
        title="Disburse New Loan (Multi-Loan Enabled)"
        subtitle="Issue a new 10-week or 25-day installment loan facility. Existing borrowers can receive concurrent loans."
        maxWidth="600px"
      >
        <form onSubmit={handleDisburseSubmit}>
          {/* Borrower Selector */}
          <div className="form-group">
            <label className="form-label">Select Borrower / Merchant *</label>
            <select
              className="form-select"
              value={formData.borrower_id}
              onChange={(e) => setFormData({ ...formData, borrower_id: e.target.value })}
              required
            >
              {users.map((u) => {
                const uActive = loans.filter((l) => l.borrower_id === u.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.customer_code}) — {u.occupation} {uActive.length > 0 ? `[${uActive.length} Active Loan(s)]` : '[No Active Loans]'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Multi-Loan Warning / Exposure Card */}
          {borrowerExistingLoans.length > 0 && (
            <div style={{
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem' }}>
                <Layers size={16} />
                <span>Borrower has {borrowerExistingLoans.length} active running loan(s)</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Current Outstanding Debt: <strong>{formatCurrency(borrowerTotalOutstanding)}</strong> • Credit Limit: {formatCurrency(selectedBorrower?.credit_limit || 50000)}
              </div>
            </div>
          )}

          {/* Loan Purpose / Name */}
          <div className="form-group">
            <label className="form-label">Loan Purpose / Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.loan_name}
              onChange={(e) => setFormData({ ...formData, loan_name: e.target.value })}
              placeholder="e.g. Workshop Expansion, Festival Inventory, Equipment..."
              required
            />
          </div>

          {/* Scheme / Frequency */}
          <div className="form-group">
            <label className="form-label">Loan Scheme *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                onClick={() => setFormData({ ...formData, frequency: 'WEEKLY' })}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: formData.frequency === 'WEEKLY' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: formData.frequency === 'WEEKLY' ? '#EEF2FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                }}
              >
                <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Weekly Loan (10 Wks)</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>10% flat interest • 10 weekly installments</span>
              </div>

              <div
                onClick={() => setFormData({ ...formData, frequency: 'DAILY' })}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: formData.frequency === 'DAILY' ? '2px solid var(--emerald)' : '1px solid var(--border-color)',
                  background: formData.frequency === 'DAILY' ? '#ECFDF5' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                }}
              >
                <strong style={{ color: 'var(--emerald)', fontSize: '0.9rem' }}>Daily Loan (25 Days)</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>12.5% flat interest • 25 daily installments</span>
              </div>
            </div>
          </div>

          {/* Principal Amount */}
          <div className="form-group">
            <label className="form-label">Principal Amount (₹ INR) *</label>
            <div className="input-with-icon">
              <DollarSign size={16} className="input-icon" />
              <input
                type="number"
                className="form-input has-icon"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                placeholder="20000"
                step="1000"
                min="5000"
                required
              />
            </div>
          </div>

          {/* Live Loan Calculation Summary Box */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            margin: '1.25rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Contract Calculation Summary
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Principal Amount Given:</span>
              <strong>{formatCurrency(selectedPrincipal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Net Interest Margin ({(interestRate * 100).toFixed(1)}%):</span>
              <strong style={{ color: 'var(--emerald)' }}>+{formatCurrency(totalRepayable - selectedPrincipal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total Repayable:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{formatCurrency(totalRepayable)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Installment Schedule:</span>
              <span><strong>{formatCurrency(installmentAmt)}</strong> / {isDaily ? 'day (25 days)' : 'week (10 weeks)'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDisburseModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-emerald"
              disabled={submitting || selectedPrincipal <= 0}
            >
              {submitting ? 'Disbursing...' : 'Confirm Disbursal & Activate Loan'}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
