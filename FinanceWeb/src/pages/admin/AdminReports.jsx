import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import {
  Calendar,
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  DollarSign,
  Printer,
  Download,
  Filter,
} from 'lucide-react';

export const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'daily'
  const [weeklyDues, setWeeklyDues] = useState([]);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Collection Action Modal State
  const [collectModal, setCollectModal] = useState(false);
  const [collectTarget, setCollectTarget] = useState(null);
  const [collectType, setCollectType] = useState('weekly'); // 'weekly' | 'daily'
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [w, d] = await Promise.all([
        api.getWeeklyDues(),
        api.getDailyCollections(),
      ]);
      setWeeklyDues(w);
      setDailyCollections(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Weekly Stats
  const totalWeekly = weeklyDues.reduce((sum, d) => sum + d.due_amount, 0);
  const collectedWeekly = weeklyDues.filter((d) => d.status === 'PAID').reduce((sum, d) => sum + d.due_amount, 0);
  const pendingWeekly = totalWeekly - collectedWeekly;
  const overdueWeeklyCount = weeklyDues.filter((d) => d.status === 'OVERDUE').length;

  // Daily Stats
  const totalDaily = dailyCollections.reduce((sum, c) => sum + c.due_amount, 0);
  const collectedDaily = dailyCollections.filter((c) => c.status === 'COLLECTED').reduce((sum, c) => sum + c.collected_amount, 0);
  const pendingDaily = totalDaily - collectedDaily;

  // Open Collect Modal
  const openCollectDialog = (item, type) => {
    setCollectTarget(item);
    setCollectType(type);
    setReceiptSuccess(null);
    setCollectModal(true);
  };

  // Submit Collection
  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    if (!collectTarget) return;
    setSubmitting(true);
    try {
      if (collectType === 'weekly') {
        const res = await api.collectWeeklyDue(collectTarget.id, paymentMode);
        setReceiptSuccess(res);
      } else {
        const res = await api.recordDailyCollection(collectTarget.id, paymentMode);
        setReceiptSuccess(res);
      }
      await loadReports();
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lists
  const filteredWeekly = weeklyDues.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.customer_name?.toLowerCase().includes(q) ||
      item.phone?.includes(q) ||
      item.loan_code?.toLowerCase().includes(q) ||
      item.customer_code?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDaily = dailyCollections.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.customer_name?.toLowerCase().includes(q) ||
      item.phone?.includes(q) ||
      item.loan_code?.toLowerCase().includes(q) ||
      item.customer_code?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="page-loading">Loading Field Collection Reports...</div>;

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">FIELD RECOVERY & COLLECTIONS</div>
          <h1 className="page-title">Operations & Collection Reports</h1>
          <p className="page-subtitle">
            Inspect borrowers scheduled for payment this week and track daily route merchant collections.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={16} />
          <span>Print Sheet</span>
        </button>
      </div>

      {/* Main Tabs (Weekly Dues vs Daily Collections) */}
      <div className="tab-pill-container">
        <button
          className={`tab-pill-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => { setActiveTab('weekly'); setStatusFilter('ALL'); }}
        >
          <Calendar size={18} />
          <span>Who Need to Pay for This Week ({weeklyDues.length})</span>
        </button>

        <button
          className={`tab-pill-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => { setActiveTab('daily'); setStatusFilter('ALL'); }}
        >
          <Receipt size={18} />
          <span>Daily Collection Sheet ({dailyCollections.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WHO NEED TO PAY FOR THIS WEEK */}
      {/* ========================================================================= */}
      {activeTab === 'weekly' && (
        <div className="tab-content-area">
          {/* Weekly KPI Strip */}
          <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
            <StatCard
              label="Total Weekly Dues"
              value={formatCurrency(totalWeekly)}
              icon={Calendar}
              meta={`${weeklyDues.length} Scheduled Installments`}
              accentColor="#6366F1"
            />

            <StatCard
              label="Collected So Far"
              value={formatCurrency(collectedWeekly)}
              icon={CheckCircle2}
              meta={`${Math.round((collectedWeekly / totalWeekly) * 100)}% Recovered`}
              accentColor="#10B981"
            />

            <StatCard
              label="Remaining to Collect"
              value={formatCurrency(pendingWeekly)}
              icon={Clock}
              meta="Active Field Target"
              accentColor="#F59E0B"
            />

            <StatCard
              label="Overdue This Week"
              value={`${overdueWeeklyCount} Borrowers`}
              icon={AlertTriangle}
              meta="Priority Notice"
              accentColor="#EF4444"
            />
          </div>

          {/* Filters & Table */}
          <div className="card">
            <div className="sheet-control-bar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Search weekly borrower by name, code, loan ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <span className="filter-lbl">Status:</span>
                {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map((st) => (
                  <button
                    key={st}
                    className={`filter-btn ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Borrower</th>
                    <th>Loan Code</th>
                    <th>Week Cycle</th>
                    <th>Due Date</th>
                    <th>Installment Due</th>
                    <th>Remaining Bal</th>
                    <th>Status</th>
                    <th>Action / Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWeekly.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="client-cell">
                          <span className="client-name">{item.customer_name}</span>
                          <span className="client-phone"><Phone size={11} /> {item.phone}</span>
                        </div>
                      </td>
                      <td><code>{item.loan_code}</code></td>
                      <td>
                        <span className="cycle-tag">{item.installment_week}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.due_date}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(item.due_amount)}
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(item.remaining_balance)}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        {item.status === 'PAID' ? (
                          <div className="paid-stamp">
                            <CheckCircle2 size={14} color="var(--emerald)" />
                            <span>{item.receipt_no}</span>
                          </div>
                        ) : (
                          <button
                            className="btn btn-emerald btn-sm"
                            onClick={() => openCollectDialog(item, 'weekly')}
                          >
                            <Receipt size={13} />
                            <span>Collect Now</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAILY COLLECTION SHEET */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="tab-content-area">
          {/* Daily KPI Strip */}
          <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
            <StatCard
              label="Today's Daily Target"
              value={formatCurrency(totalDaily)}
              icon={Receipt}
              meta={`${dailyCollections.length} Merchant Visits`}
              accentColor="#6366F1"
            />

            <StatCard
              label="Collected Today"
              value={formatCurrency(collectedDaily)}
              icon={CheckCircle2}
              meta={`${Math.round((collectedDaily / totalDaily) * 100)}% Completed`}
              accentColor="#10B981"
            />

            <StatCard
              label="Pending Route Visits"
              value={formatCurrency(pendingDaily)}
              icon={Clock}
              meta="Triplicane & Saidapet"
              accentColor="#F59E0B"
            />
          </div>

          {/* Filters & Table */}
          <div className="card">
            <div className="sheet-control-bar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Search daily shopkeeper by name, loan ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <span className="filter-lbl">Status:</span>
                {['ALL', 'COLLECTED', 'PENDING_VISIT', 'MISSED'].map((st) => (
                  <button
                    key={st}
                    className={`filter-btn ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Merchant / Shop</th>
                    <th>Loan Code</th>
                    <th>Daily Installment</th>
                    <th>Due Amount</th>
                    <th>Collected Amt</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Action / Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDaily.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="client-cell">
                          <span className="client-name">{item.customer_name}</span>
                          <span className="client-phone"><Phone size={11} /> {item.phone}</span>
                        </div>
                      </td>
                      <td><code>{item.loan_code}</code></td>
                      <td>
                        <span className="cycle-tag">{item.installment_day}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(item.due_amount)}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: item.collected_amount > 0 ? 'var(--emerald)' : 'var(--text-muted)' }}>
                        {formatCurrency(item.collected_amount)}
                      </td>
                      <td>
                        {item.payment_mode ? (
                          <span className="badge badge-secondary">{item.payment_mode}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        {item.status === 'COLLECTED' ? (
                          <div className="paid-stamp">
                            <CheckCircle2 size={14} color="var(--emerald)" />
                            <span>{item.receipt_no} ({item.collected_time})</span>
                          </div>
                        ) : (
                          <button
                            className="btn btn-emerald btn-sm"
                            onClick={() => openCollectDialog(item, 'daily')}
                          >
                            <Receipt size={13} />
                            <span>Record Collection</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fast Repayment Collection */}
      <Modal
        isOpen={collectModal}
        onClose={() => setCollectModal(false)}
        title={receiptSuccess ? "Repayment Collected Successfully" : "Record Repayment Collection"}
        subtitle={receiptSuccess ? "Logged into double-entry ledger" : `Collecting due for ${collectTarget?.customer_name}`}
        maxWidth="460px"
        footer={
          receiptSuccess ? (
            <button className="btn btn-primary" onClick={() => setCollectModal(false)}>Close Window</button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setCollectModal(false)}>Cancel</button>
              <button className="btn btn-emerald" onClick={handleCollectSubmit} disabled={submitting}>
                {submitting ? 'Recording...' : 'Confirm Collection'}
              </button>
            </>
          )
        }
      >
        {receiptSuccess ? (
          <div className="receipt-voucher-preview">
            <CheckCircle2 size={36} color="var(--emerald)" />
            <h3>{formatCurrency(collectTarget?.due_amount)} Acknowledged</h3>
            <div className="voucher-details">
              <div>Borrower: <strong>{collectTarget?.customer_name}</strong></div>
              <div>Receipt Number: <code>{receiptSuccess.receipt_no}</code></div>
              <div>Payment Mode: <strong>{receiptSuccess.payment_mode}</strong></div>
              <div>Date & Time: <strong>{new Date().toLocaleString()}</strong></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCollectSubmit}>
            <div className="collect-dialog-body">
              <div className="collect-summary-card">
                <div className="cs-row">
                  <span>Borrower:</span>
                  <strong>{collectTarget?.customer_name}</strong>
                </div>
                <div className="cs-row">
                  <span>Loan Code:</span>
                  <code>{collectTarget?.loan_code}</code>
                </div>
                <div className="cs-row">
                  <span>Due Amount:</span>
                  <strong style={{ color: 'var(--emerald)', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                    {formatCurrency(collectTarget?.due_amount)}
                  </strong>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="CASH">Physical Cash (Field Officer Wallet)</option>
                  <option value="UPI">UPI / QR Code Transfer</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <style>{`
        .reports-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tab-pill-container {
          display: flex;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.4rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          width: fit-content;
        }

        .tab-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-pill-btn.active {
          background: var(--primary);
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
        }

        .sheet-control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          gap: 1rem;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--border-color);
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 2.3rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .filter-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-btn.active {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }

        .client-cell {
          display: flex;
          flex-direction: column;
        }

        .client-name {
          font-weight: 700;
          color: var(--text-primary);
        }

        .client-phone {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .cycle-tag {
          font-size: 0.75rem;
          color: #818cf8;
          font-weight: 600;
        }

        .paid-stamp {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--emerald);
          font-weight: 600;
        }

        .collect-summary-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .cs-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .receipt-voucher-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem 0;
          gap: 0.75rem;
        }

        .voucher-details {
          margin-top: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.82rem;
          text-align: left;
        }
      `}</style>
    </div>
  );
};
