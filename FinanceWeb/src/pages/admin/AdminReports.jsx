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
  const completedDailyCount = dailyCollections.filter((c) => c.status === 'COLLECTED').length;

  const openCollectModal = (item, type) => {
    setCollectTarget(item);
    setCollectType(type);
    setPaymentMode('CASH');
    setCollectModal(true);
  };

  const handleConfirmCollect = async () => {
    if (!collectTarget) return;
    setSubmitting(true);
    try {
      if (collectType === 'weekly') {
        const res = await api.collectWeeklyDue(collectTarget.id, paymentMode);
        setReceiptSuccess({
          title: 'Weekly Due Collected',
          receipt: res.receipt_no,
          borrower: collectTarget.customer_name,
          amount: collectTarget.due_amount,
          mode: paymentMode,
          date: res.paid_date,
        });
      } else {
        const res = await api.collectDailyInstallment(collectTarget.id, paymentMode);
        setReceiptSuccess({
          title: 'Daily Installment Received',
          receipt: res.receipt_no,
          borrower: collectTarget.shopkeeper_name,
          amount: collectTarget.due_amount,
          mode: paymentMode,
          time: res.collected_time,
        });
      }
      setCollectModal(false);
      await loadReports();
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lists
  const filteredWeekly = weeklyDues.filter((d) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      d.customer_name?.toLowerCase().includes(q) ||
      d.customer_code?.toLowerCase().includes(q) ||
      d.phone?.includes(q) ||
      d.loan_code?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDaily = dailyCollections.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.shopkeeper_name?.toLowerCase().includes(q) ||
      c.shop_name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.customer_code?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="page-loading">Loading Collections & Dues Sheets...</div>;

  return (
    <div className="admin-reports-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">FIELD RECOVERY OPERATIONS</div>
          <h1 className="page-title">Reports & Collection Sheets</h1>
          <p className="page-subtitle">
            Execute weekly due recoveries, record daily retail collections, and issue instant verified vouchers.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Success Receipt Banner */}
      {receiptSuccess && (
        <div className="card" style={{ background: '#ECFDF5', borderColor: '#A7F3D0', marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} color="var(--emerald)" />
              </div>
              <div>
                <strong style={{ color: '#065F46', fontSize: '0.95rem' }}>{receiptSuccess.title}</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#047857' }}>
                  Received {formatCurrency(receiptSuccess.amount)} via {receiptSuccess.mode} from {receiptSuccess.borrower} (Receipt: <strong>{receiptSuccess.receipt}</strong>)
                </p>
              </div>
            </div>
            <button className="btn btn-emerald btn-sm" onClick={() => setReceiptSuccess(null)}>
              Dismiss Voucher
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => { setActiveTab('weekly'); setStatusFilter('ALL'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: activeTab === 'weekly' ? '1px solid #C7D2FE' : '1px solid transparent',
            background: activeTab === 'weekly' ? '#EEF2FF' : 'transparent',
            color: activeTab === 'weekly' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Calendar size={16} />
          <span>Tab 1: Weekly Dues Sheet</span>
          <span style={{ background: activeTab === 'weekly' ? 'var(--primary)' : '#E2E8F0', color: activeTab === 'weekly' ? '#ffffff' : '#64748B', padding: '0.1rem 0.45rem', borderRadius: '10px', fontSize: '0.7rem' }}>
            {weeklyDues.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('daily'); setStatusFilter('ALL'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: activeTab === 'daily' ? '1px solid #A7F3D0' : '1px solid transparent',
            background: activeTab === 'daily' ? '#ECFDF5' : 'transparent',
            color: activeTab === 'daily' ? 'var(--emerald)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Receipt size={16} />
          <span>Tab 2: Daily Collections Sheet</span>
          <span style={{ background: activeTab === 'daily' ? 'var(--emerald)' : '#E2E8F0', color: activeTab === 'daily' ? '#ffffff' : '#64748B', padding: '0.1rem 0.45rem', borderRadius: '10px', fontSize: '0.7rem' }}>
            {dailyCollections.length}
          </span>
        </button>
      </div>

      {/* TAB 1: WEEKLY DUES CONTENT */}
      {activeTab === 'weekly' && (
        <>
          {/* Weekly Summary KPIs */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <StatCard
              label="This Week's Target"
              value={formatCurrency(totalWeekly)}
              icon={Calendar}
              trend={`${weeklyDues.length} Clients`}
              trendDirection="up"
              meta="Scheduled Recovery"
              accentColor="#4F46E5"
              accentBg="#EEF2FF"
            />

            <StatCard
              label="Collected This Week"
              value={formatCurrency(collectedWeekly)}
              icon={CheckCircle2}
              trend={`${Math.round((collectedWeekly / totalWeekly) * 100)}% Recovered`}
              trendDirection="up"
              meta="Cash & Online In"
              accentColor="#059669"
              accentBg="#ECFDF5"
            />

            <StatCard
              label="Pending Recovery"
              value={formatCurrency(pendingWeekly)}
              icon={Clock}
              trend="Due by Saturday"
              trendDirection="down"
              meta="Field Follow-up"
              accentColor="#D97706"
              accentBg="#FFFBEB"
            />

            <StatCard
              label="Overdue Clients"
              value={`${overdueWeeklyCount} Cases`}
              icon={AlertTriangle}
              trend="Priority Attention"
              trendDirection="down"
              meta="Immediate Visit"
              accentColor="#E11D48"
              accentBg="#FFF1F2"
            />
          </div>

          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                type="text"
                className="form-input search-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Search by client name, mobile phone, customer code, or loan code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Payment</option>
              <option value="PAID">Paid / Received</option>
              <option value="OVERDUE">Overdue Dues</option>
            </select>
          </div>

          {/* Weekly Dues Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client / Borrower</th>
                  <th>Loan & Installment Week</th>
                  <th>Scheduled Due Date</th>
                  <th>Due Amount</th>
                  <th>Remaining Balance</th>
                  <th>Payment Status</th>
                  <th>Field Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredWeekly.map((due) => {
                  const isPaid = due.status === 'PAID';
                  return (
                    <tr key={due.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{due.customer_name}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {due.customer_code} • {due.phone}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{due.loan_code}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{due.installment_week}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={13} color="var(--text-muted)" />
                          <span>{due.due_date}</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{formatCurrency(due.due_amount)}</strong>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(due.remaining_balance)}</span>
                      </td>
                      <td>
                        <StatusBadge status={due.status} />
                      </td>
                      <td>
                        {isPaid ? (
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.72rem', color: 'var(--emerald)' }}>
                            <span>✓ Paid via {due.payment_mode}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{due.receipt_no}</span>
                          </div>
                        ) : (
                          <button
                            className="btn btn-emerald btn-sm"
                            onClick={() => openCollectModal(due, 'weekly')}
                          >
                            <DollarSign size={14} />
                            <span>Collect Due</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredWeekly.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Calendar size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <h3>No weekly dues records found</h3>
                      <p>Adjust filters or search parameters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 2: DAILY COLLECTIONS CONTENT */}
      {activeTab === 'daily' && (
        <>
          {/* Daily Summary KPIs */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <StatCard
              label="Today's Daily Target"
              value={formatCurrency(totalDaily)}
              icon={Receipt}
              trend={`${dailyCollections.length} Merchants`}
              trendDirection="up"
              meta="25-Day Rapid Track"
              accentColor="#059669"
              accentBg="#ECFDF5"
            />

            <StatCard
              label="Today's Recovery"
              value={formatCurrency(collectedDaily)}
              icon={CheckCircle2}
              trend={`${completedDailyCount}/${dailyCollections.length} Collected`}
              trendDirection="up"
              meta="Live Vault & UPI"
              accentColor="#4F46E5"
              accentBg="#EEF2FF"
            />

            <StatCard
              label="Pending on Route"
              value={formatCurrency(pendingDaily)}
              icon={Clock}
              trend="Field Route Pending"
              trendDirection="down"
              meta="Remaining Visits"
              accentColor="#D97706"
              accentBg="#FFFBEB"
            />

            <StatCard
              label="Collection Progress"
              value={`${Math.round((collectedDaily / totalDaily) * 100)}%`}
              icon={DollarSign}
              trend="98.8% Discipline"
              trendDirection="up"
              meta="Daily Efficiency"
              accentColor="#7C3AED"
              accentBg="#F5F3FF"
            />
          </div>

          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                type="text"
                className="form-input search-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Search shopkeeper, shop title, territory bazaar, or customer code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Visit Statuses</option>
              <option value="PENDING">Pending Visit</option>
              <option value="COLLECTED">Collected</option>
              <option value="MISSED">Missed / Shop Closed</option>
            </select>
          </div>

          {/* Daily Collections Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Merchant & Shop Location</th>
                  <th>Installment Day</th>
                  <th>Daily Installment</th>
                  <th>Remaining Total</th>
                  <th>Route Status</th>
                  <th>Field Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDaily.map((col) => {
                  const isCollected = col.status === 'COLLECTED';
                  return (
                    <tr key={col.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{col.shopkeeper_name}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {col.shop_name} • {col.location} ({col.customer_code})
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>{col.installment_day}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Daily Rapid Loan</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{formatCurrency(col.due_amount)}</strong>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(col.remaining_balance)}</span>
                      </td>
                      <td>
                        <StatusBadge status={col.status} />
                      </td>
                      <td>
                        {isCollected ? (
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.72rem', color: 'var(--emerald)' }}>
                            <span>✓ Collected at {col.collected_time}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{col.payment_mode} • {col.receipt_no}</span>
                          </div>
                        ) : (
                          <button
                            className="btn btn-emerald btn-sm"
                            onClick={() => openCollectModal(col, 'daily')}
                          >
                            <DollarSign size={14} />
                            <span>Record Collection</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredDaily.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Receipt size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <h3>No daily collections records match filters</h3>
                      <p>Adjust filters or search parameters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Collection Action Modal */}
      {collectTarget && (
        <Modal
          isOpen={collectModal}
          onClose={() => setCollectModal(false)}
          title={`Record Payment Collection`}
          subtitle={`Client: ${collectType === 'weekly' ? collectTarget.customer_name : collectTarget.shopkeeper_name}`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Amount Banner */}
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {collectType === 'weekly' ? 'Weekly Due Amount' : 'Daily Installment Amount'}
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--emerald)', margin: '0.2rem 0' }}>
                {formatCurrency(collectTarget.due_amount)}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                Remaining after payment: {formatCurrency(collectTarget.remaining_balance - collectTarget.due_amount)}
              </span>
            </div>

            {/* Payment Mode Selector */}
            <div className="form-group">
              <label className="form-label">Select Payment Mode *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['CASH', 'UPI', 'BANK_TRANSFER'].map((mode) => (
                  <div
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMode === mode ? '2px solid var(--emerald)' : '1px solid var(--border-color)',
                      background: paymentMode === mode ? '#ECFDF5' : '#FFFFFF',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: paymentMode === mode ? 'var(--emerald)' : 'var(--text-primary)',
                    }}
                  >
                    {mode === 'BANK_TRANSFER' ? 'Bank Transfer' : mode}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCollectModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-emerald"
                onClick={handleConfirmCollect}
                disabled={submitting}
              >
                {submitting ? 'Recording...' : 'Confirm & Generate Receipt'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
