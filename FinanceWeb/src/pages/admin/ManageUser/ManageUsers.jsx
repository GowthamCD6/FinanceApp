import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Power,
  Eye,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Layers,
  Plus,
  DollarSign,
  ArrowRight,
  Store,
  Edit2,
  Calendar,
  Clock,
  Receipt,
  FileText,
  History,
  ArrowLeft,
  Printer,
  Sparkles,
  ShieldAlert,
  Save,
  ChevronRight,
  Award,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';

export const ManageUsers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFeedback, setStatusFeedback] = useState(null);

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);

  // View Mode: 'DIRECTORY' | 'VIRTUAL_PAGE'
  const [viewMode, setViewMode] = useState('DIRECTORY');
  const [virtualTab, setVirtualTab] = useState('ONGOING'); // 'ONGOING' | 'COMPLETED' | 'LEDGER' | 'KYC'
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    phone: '',
    email: '',
    address: '',
    role: 'COMMON_CUSTOMER',
    status: 'ACTIVE',
    notes: '',
    occupation: '',
    shopName: '',
    credit_limit: 50000,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Quick Loan Assignment Modal
  const [isQuickLoanModalOpen, setIsQuickLoanModalOpen] = useState(false);
  const [quickLoanTarget, setQuickLoanTarget] = useState(null);
  const [quickLoanForm, setQuickLoanForm] = useState({
    principal: '20000',
    frequency: 'WEEKLY',
    loan_name: '',
  });
  const [submittingLoan, setSubmittingLoan] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Status toggle
  const handleStatusChange = async (userId, nextStatus, userName) => {
    try {
      await api.updateUserStatus(userId, nextStatus);
      setStatusFeedback(`${userName} marked as ${nextStatus}`);
      setTimeout(() => setStatusFeedback(null), 3000);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Open Virtual Borrower Page
  const openVirtualUserPage = async (u) => {
    setDetailLoading(true);
    setSelectedUser(u);
    setViewMode('VIRTUAL_PAGE');
    setVirtualTab('ONGOING');
    try {
      const fullProfile = await api.getUserById(u.id);
      setSelectedUser(fullProfile);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Edit User Modal
  const openEditModal = (u) => {
    setEditError('');
    setEditFormData({
      id: u.id,
      name: u.name || '',
      phone: u.phone || '',
      email: u.email || '',
      address: u.address || '',
      role: u.role || 'COMMON_CUSTOMER',
      status: u.status || 'ACTIVE',
      notes: u.notes || '',
      occupation: u.occupation || '',
      shopName: u.shopName || u.shop_name || '',
      credit_limit: u.credit_limit || 50000,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit (PUT /api/users/:id)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editFormData.name.trim() || !editFormData.phone.trim()) {
      setEditError('Name and Phone number are required.');
      return;
    }

    setSavingEdit(true);
    try {
      const updatedUser = await api.updateUser(editFormData.id, editFormData);
      setStatusFeedback(`User "${updatedUser.name}" updated successfully!`);
      setTimeout(() => setStatusFeedback(null), 3500);

      // In-place state update
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
      );

      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser((prev) => ({ ...prev, ...updatedUser }));
      }

      setIsEditModalOpen(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update user.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Quick Loan Assignment
  const handleOpenQuickLoan = (u) => {
    setQuickLoanTarget(u);
    setQuickLoanForm({
      loan_name: `${u.name} Loan (${(u.activeLoansCount || 0) + 1})`,
      principal: '20000',
      frequency: u.role === 'SHOPKEEPER' ? 'DAILY' : 'WEEKLY',
    });
    setIsQuickLoanModalOpen(true);
  };

  const handleQuickLoanSubmit = async (e) => {
    e.preventDefault();
    if (!quickLoanTarget) return;

    setSubmittingLoan(true);
    try {
      await api.createLoan({
        userId: quickLoanTarget.id,
        customerId: quickLoanTarget.customerId || quickLoanTarget.id,
        loan_name: quickLoanForm.loan_name,
        principal: parseFloat(quickLoanForm.principal),
        frequency: quickLoanForm.frequency,
      });

      setIsQuickLoanModalOpen(false);
      setStatusFeedback(`New loan created & schedule generated for ${quickLoanTarget.name}!`);
      setTimeout(() => setStatusFeedback(null), 3500);

      if (viewMode === 'VIRTUAL_PAGE' && selectedUser?.id === quickLoanTarget.id) {
        const fullProfile = await api.getUserById(quickLoanTarget.id);
        setSelectedUser(fullProfile);
      }
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to create loan');
    } finally {
      setSubmittingLoan(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      (u.customerCode && u.customerCode.toLowerCase().includes(q)) ||
      (u.customer_code && u.customer_code.toLowerCase().includes(q)) ||
      u.city?.toLowerCase().includes(q) ||
      (u.shopName && u.shopName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalOutstanding = users.reduce((sum, u) => sum + (u.outstandingAmount || 0), 0);
  const totalActiveBorrowers = users.filter((u) => (u.activeLoansCount || 0) > 0).length;

  if (loading) return <div className="page-loading">Loading Borrower Registry...</div>;

  // =========================================================================
  // VIEW 1: DEDICATED VIRTUAL BORROWER PAGE VIEW
  // =========================================================================
  if (viewMode === 'VIRTUAL_PAGE' && selectedUser) {
    const ongoingLoans = selectedUser.ongoingLoans || (selectedUser.loans ? selectedUser.loans.filter((l) => l.status === 'ACTIVE') : []);
    const completedLoans = selectedUser.completedLoans || [];
    const paymentHistory = selectedUser.paymentHistory || [];

    return (
      <div className="virtual-user-page">
        {/* Top Navigation & Breadcrumbs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setViewMode('DIRECTORY')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Users Directory</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              <span>Print Ledger Statement</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => openEditModal(selectedUser)}
            >
              <Edit2 size={15} color="var(--accent-primary)" />
              <span>Edit User Details</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenQuickLoan(selectedUser)}
            >
              <Plus size={15} />
              <span>Assign New Loan</span>
            </button>
          </div>
        </div>

        {statusFeedback && (
          <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
            <CheckCircle2 size={18} color="var(--emerald)" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* User Hero Header Card */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                }}
              >
                {selectedUser.name?.charAt(0) || 'U'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>{selectedUser.name}</h2>
                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                    Credit Rating: {selectedUser.financialSummary?.creditRating || selectedUser.credit_rating || 'A+'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 6, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span><strong>Code:</strong> {selectedUser.customerCode || selectedUser.customer_code || `CUST-00${selectedUser.id}`}</span>
                  <span>•</span>
                  <span><Phone size={13} style={{ display: 'inline', marginRight: 3 }} /> {selectedUser.phone}</span>
                  <span>•</span>
                  <span><MapPin size={13} style={{ display: 'inline', marginRight: 3 }} /> {selectedUser.address || 'Chennai, Tamil Nadu'}</span>
                  <span>•</span>
                  <span><strong>Enrolled:</strong> {selectedUser.dateJoined || selectedUser.joined_date || '2025-05-12'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <StatusBadge status={selectedUser.status} />
              <span className={`badge ${selectedUser.role === 'SHOPKEEPER' ? 'badge-purple' : 'badge-blue'}`}>
                {selectedUser.role === 'SHOPKEEPER' ? 'Merchant (Daily)' : 'Borrower (Weekly)'}
              </span>
            </div>
          </div>
        </div>

        {/* Lifetime Financial Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lifetime Borrowed</span>
            <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.5rem', color: '#fff' }}>
              {formatCurrency(selectedUser.financialSummary?.totalBorrowed || selectedUser.totalBorrowed || 0)}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all loan cycles</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lifetime Repaid</span>
            <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.5rem', color: 'var(--emerald)' }}>
              {formatCurrency(selectedUser.financialSummary?.totalRepaid || selectedUser.totalPaid || 0)}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>100% Verified Ledger</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Active Due</span>
            <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.5rem', color: (selectedUser.outstandingAmount || 0) > 0 ? '#fbbf24' : 'var(--emerald)' }}>
              {formatCurrency(selectedUser.financialSummary?.outstanding || selectedUser.outstandingAmount || 0)}
            </h3>
            <span style={{ fontSize: '0.75rem', color: (selectedUser.outstandingAmount || 0) > 0 ? '#fbbf24' : 'var(--emerald)' }}>
              {(selectedUser.outstandingAmount || 0) > 0 ? 'Active Obligations' : 'All Clear / Settled'}
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Settled Loan Cycles</span>
            <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.5rem', color: 'var(--accent-primary)' }}>
              {completedLoans.length || selectedUser.completedLoansCount || 0} Cycles
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Flawless repayment score</span>
          </div>
        </div>

        {/* Tabbed Navigation: Ongoing vs Completed History vs Ledger */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            className={`filter-chip ${virtualTab === 'ONGOING' ? 'active' : ''}`}
            onClick={() => setVirtualTab('ONGOING')}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem' }}
          >
            <CreditCard size={15} />
            <span>Ongoing Loans ({ongoingLoans.length})</span>
          </button>

          <button
            className={`filter-chip ${virtualTab === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setVirtualTab('COMPLETED')}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem' }}
          >
            <Award size={15} />
            <span>Completed Loans History ({completedLoans.length})</span>
          </button>

          <button
            className={`filter-chip ${virtualTab === 'LEDGER' ? 'active' : ''}`}
            onClick={() => setVirtualTab('LEDGER')}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem' }}
          >
            <History size={15} />
            <span>Permanent Payment Ledger ({paymentHistory.length})</span>
          </button>

          <button
            className={`filter-chip ${virtualTab === 'KYC' ? 'active' : ''}`}
            onClick={() => setVirtualTab('KYC')}
            style={{ fontSize: '0.88rem', padding: '0.5rem 1rem' }}
          >
            <FileText size={15} />
            <span>KYC & Account Details</span>
          </button>
        </div>

        {/* TAB 1: ONGOING LOANS */}
        {virtualTab === 'ONGOING' && (
          <div className="tab-pane">
            {ongoingLoans.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={42} color="var(--emerald)" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>No Active Loans Outstanding</h3>
                <p style={{ maxWidth: 450, margin: '0 auto 1.25rem auto' }}>
                  This borrower currently has zero active financial obligations. All past loans are completed.
                </p>
                <button className="btn btn-primary" onClick={() => handleOpenQuickLoan(selectedUser)}>
                  <Plus size={15} />
                  <span>Assign New Loan Cycle</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
                {ongoingLoans.map((loan, idx) => {
                  const progressPct =
                    loan.total_installments > 0
                      ? Math.round(((loan.paid_installments || 0) / loan.total_installments) * 100)
                      : 0;

                  return (
                    <div className="card" key={idx} style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '1.05rem' }}>
                            {loan.loan_code || loan.loanNumber || `Loan #${idx + 1}`}
                          </strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {loan.loan_name || `${loan.frequency || 'WEEKLY'} Cycle`}
                          </div>
                        </div>
                        <StatusBadge status={loan.status || 'ACTIVE'} />
                      </div>

                      {/* Financial Numbers Matrix */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 8, marginBottom: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Principal Disbursed:</span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                            {formatCurrency(loan.principal || loan.principal_amount)}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Repayable:</span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                            {formatCurrency(loan.total_repayable || loan.total_repayment_amount)}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Installment Amount:</span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            {formatCurrency(loan.installment_amount)} / {loan.frequency || 'Wk'}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Remaining Balance:</span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>
                            {formatCurrency(loan.remaining_balance || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Repayment Progress Bar */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                          <span style={{ color: '#fff' }}>
                            Progress: <strong>{loan.paid_installments || 0}</strong> of <strong>{loan.total_installments || 10}</strong> installments
                          </span>
                          <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>{progressPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--emerald)', borderRadius: 4 }} />
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Disbursed: {loan.disbursed_date || '2026-08-15'}</span>
                        <span>Next Due: <strong>{loan.next_due_date || '2026-09-15'}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPLETED LOANS HISTORY */}
        {virtualTab === 'COMPLETED' && (
          <div className="tab-pane">
            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loan Cycle</th>
                      <th>Principal Disbursed</th>
                      <th>Total Repaid</th>
                      <th>Tenure & Frequency</th>
                      <th>Settled Date</th>
                      <th>Discipline Rating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedLoans.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No completed loan cycles recorded for this borrower yet.
                        </td>
                      </tr>
                    ) : (
                      completedLoans.map((cl, cIdx) => (
                        <tr key={cIdx}>
                          <td>
                            <strong style={{ color: '#fff' }}>{cl.loan_code || `LN-2025-00${cIdx + 1}`}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cl.loan_name || `Cycle #${cIdx + 1}`}</div>
                          </td>
                          <td>{formatCurrency(cl.principal || cl.principal_amount || 10000)}</td>
                          <td><strong style={{ color: 'var(--emerald)' }}>{formatCurrency(cl.total_repaid || cl.total_repayable || 11000)}</strong></td>
                          <td>{cl.total_installments || 10} Installments ({cl.frequency || 'WEEKLY'})</td>
                          <td>{cl.settled_date || '2025-08-20'}</td>
                          <td>
                            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                              ✓ {cl.rating || '100% On-Time (Flawless)'}
                            </span>
                          </td>
                          <td><StatusBadge status="COMPLETED" /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERMANENT PAYMENT LEDGER */}
        {virtualTab === 'LEDGER' && (
          <div className="tab-pane">
            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Date & Time</th>
                      <th>Amount Paid</th>
                      <th>Payment Mode</th>
                      <th>Loan Ref</th>
                      <th>Notes / Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No transactions recorded in ledger. Payments collected via reports or field officer will permanently appear here.
                        </td>
                      </tr>
                    ) : (
                      paymentHistory.map((p, pIdx) => (
                        <tr key={pIdx}>
                          <td>
                            <code>{p.receiptNumber || p.receipt_number || p.payment_number || `RCP-${p.id}`}</code>
                          </td>
                          <td>{p.payment_date ? String(p.payment_date).slice(0, 10) : '2026-09-10'}</td>
                          <td><strong style={{ color: 'var(--emerald)', fontSize: '0.95rem' }}>{formatCurrency(p.amount)}</strong></td>
                          <td><span className="badge badge-blue">{p.payment_method || p.payment_mode || 'UPI'}</span></td>
                          <td>{p.loan_code || p.loan_number || 'LN-2026-004'}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.notes || 'Periodic installment repayment'}</td>
                          <td><span className="badge badge-emerald">VERIFIED</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KYC & DETAILS */}
        {virtualTab === 'KYC' && (
          <div className="tab-pane card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.1rem' }}>Borrower KYC & Account Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Full Name</span>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{selectedUser.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Customer Code</span>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                  {selectedUser.customerCode || selectedUser.customer_code || `CUST-00${selectedUser.id}`}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Phone Number</span>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{selectedUser.phone}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email</span>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{selectedUser.email || 'Not provided'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Occupation / Business</span>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{selectedUser.occupation || 'Self Employed'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Credit Limit Approved</span>
                <div style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: '0.95rem' }}>
                  {formatCurrency(selectedUser.credit_limit || 50000)}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Residential / Business Address</span>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{selectedUser.address || 'Chennai, Tamil Nadu'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Internal Remarks & Notes</span>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 6 }}>
                  {selectedUser.notes || 'No administrative notes recorded.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: STANDARD USERS DIRECTORY TABLE
  // =========================================================================
  return (
    <div className="manage-users-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">CENTRAL BORROWER & USER MANAGEMENT</div>
          <h1 className="page-title">Borrower & User Directory</h1>
          <p className="page-subtitle">
            Database of all borrowers, merchants, and staff accounts with live financial summaries and complete payment history.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate(getOrgPath('users/add'))}>
            <UserPlus size={16} />
            Onboard New Borrower
          </button>
        </div>
      </div>

      {statusFeedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* KPI Top Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Enrolled Users</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.5rem', color: '#fff' }}>{users.length}</h3>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Borrowers</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.5rem', color: 'var(--emerald)' }}>{totalActiveBorrowers}</h3>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Outstanding Portfolio</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.5rem', color: '#fbbf24' }}>{formatCurrency(totalOutstanding)}</h3>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Loans Archive</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.5rem', color: 'var(--accent-primary)' }}>
            {users.reduce((sum, u) => sum + (u.completedLoansCount || 0), 0)}
          </h3>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="table-controls" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, phone, customer code, or shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-input"
            style={{ width: 160 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="COMMON_CUSTOMER">Borrowers (Weekly)</option>
            <option value="SHOPKEEPER">Merchants (Daily)</option>
            <option value="FIELD_AGENT">Field Agents</option>
            <option value="ADMIN">Admins</option>
          </select>

          <select
            className="form-input"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Borrower / User</th>
                <th>Category</th>
                <th>Contact & Location</th>
                <th>Date Joined</th>
                <th>Active Loans</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No borrowers match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: u.role === 'SHOPKEEPER' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: u.role === 'SHOPKEEPER' ? 'var(--purple)' : 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{u.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {u.customerCode || u.customer_code || `CUST-00${u.id}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${u.role === 'SHOPKEEPER' ? 'badge-purple' : 'badge-blue'}`}>
                        {u.role === 'SHOPKEEPER' ? 'Merchant (Daily)' : (u.role === 'COMMON_CUSTOMER' ? 'Borrower (Weekly)' : u.role)}
                      </span>
                      {u.shopName && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          {u.shopName}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#fff' }}>
                        <Phone size={13} color="var(--text-muted)" />
                        {u.phone}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        📍 {u.address || u.city || 'Chennai'}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {u.dateJoined || u.joined_date || '2025-05-12'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: (u.activeLoansCount || 0) > 0 ? 'var(--emerald)' : 'var(--text-muted)' }}>
                        {u.activeLoansCount || 0} active
                      </span>
                      {(u.completedLoansCount || 0) > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ({u.completedLoansCount} settled)
                        </div>
                      )}
                    </td>

                    <td>
                      <strong style={{ color: (u.outstandingAmount || 0) > 0 ? '#fbbf24' : 'var(--emerald)' }}>
                        {formatCurrency(u.outstandingAmount || 0)}
                      </strong>
                    </td>

                    <td>
                      <StatusBadge status={u.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {/* Open Virtual Page View */}
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Open Virtual Profile & Full History"
                          onClick={() => openVirtualUserPage(u)}
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                        >
                          <Eye size={14} />
                          <span>View History</span>
                        </button>

                        {/* Edit User Details */}
                        <button
                          className="btn-icon"
                          title="Edit User Details"
                          onClick={() => openEditModal(u)}
                        >
                          <Edit2 size={15} color="var(--accent-primary)" />
                        </button>

                        {/* Quick Loan Issuance */}
                        <button
                          className="btn-icon"
                          title="Assign Loan / Obligation"
                          onClick={() => handleOpenQuickLoan(u)}
                        >
                          <Plus size={15} color="var(--emerald)" />
                        </button>

                        {/* Activate / Deactivate Toggle */}
                        <button
                          className="btn-icon"
                          title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                          onClick={() =>
                            handleStatusChange(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', u.name)
                          }
                        >
                          <Power size={15} color={u.status === 'ACTIVE' ? 'var(--red)' : 'var(--emerald)'} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. EDIT USER MODAL (PUT /api/users/:id)    */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Borrower / User: ${editFormData.name}`}
        >
          <form onSubmit={handleEditSubmit}>
            {editError && (
              <div className="feedback-banner" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'var(--red)', marginBottom: '1rem' }}>
                <AlertTriangle size={16} color="var(--red)" />
                <span style={{ color: '#fca5a5' }}>{editError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role / Category</label>
                <select
                  className="form-input"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="COMMON_CUSTOMER">Borrower (Weekly)</option>
                  <option value="SHOPKEEPER">Merchant (Daily)</option>
                  <option value="FIELD_AGENT">Field Agent</option>
                  <option value="ADMIN">Admin Staff</option>
                </select>
              </div>
            </div>

            {editFormData.role === 'SHOPKEEPER' ? (
              <div className="form-group">
                <label className="form-label">Shop / Business Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.shopName}
                  onChange={(e) => setEditFormData({ ...editFormData, shopName: e.target.value })}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Occupation / Trade</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.occupation}
                  onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                />
              </div>
            )}

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Credit Limit (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editFormData.credit_limit}
                  onChange={(e) => setEditFormData({ ...editFormData, credit_limit: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  className="form-input"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="DEFAULTER">DEFAULTER</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential / Stall Address</label>
              <textarea
                className="form-input"
                rows={2}
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Internal Remarks / Notes</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="btn btn-primary"
                style={{ minWidth: 150, justifyContent: 'center' }}
              >
                <Save size={15} />
                <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 3. ASSIGN LOAN MODAL                       */}
      {/* ========================================== */}
      {isQuickLoanModalOpen && quickLoanTarget && (
        <Modal
          isOpen={isQuickLoanModalOpen}
          onClose={() => setIsQuickLoanModalOpen(false)}
          title={`Assign Loan to ${quickLoanTarget.name}`}
        >
          <form onSubmit={handleQuickLoanSubmit}>
            <div className="form-group">
              <label className="form-label">Loan Purpose / Description</label>
              <input
                type="text"
                className="form-input"
                value={quickLoanForm.loan_name}
                onChange={(e) => setQuickLoanForm({ ...quickLoanForm, loan_name: e.target.value })}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Principal Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={quickLoanForm.principal}
                  onChange={(e) => setQuickLoanForm({ ...quickLoanForm, principal: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Repayment Frequency</label>
                <select
                  className="form-input"
                  value={quickLoanForm.frequency}
                  onChange={(e) => setQuickLoanForm({ ...quickLoanForm, frequency: e.target.value })}
                >
                  <option value="WEEKLY">WEEKLY (10 Weeks @ 10% Interest)</option>
                  <option value="DAILY">DAILY (25 Days @ 12.5% Interest)</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 8, marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Calculated Obligation:</strong> Total Repayable: ₹
                {Math.round(parseFloat(quickLoanForm.principal || 0) * (quickLoanForm.frequency === 'DAILY' ? 1.125 : 1.1))} |
                Installment: ₹
                {Math.round(
                  (parseFloat(quickLoanForm.principal || 0) * (quickLoanForm.frequency === 'DAILY' ? 1.125 : 1.1)) /
                    (quickLoanForm.frequency === 'DAILY' ? 25 : 10)
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsQuickLoanModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingLoan}
                className="btn btn-primary"
              >
                {submittingLoan ? 'Generating Schedule...' : 'Disburse & Generate Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageUsers;
