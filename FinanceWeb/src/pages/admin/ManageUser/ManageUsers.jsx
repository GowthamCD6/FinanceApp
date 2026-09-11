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

  // View User Profile Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    phone: '',
    address: '',
    role: 'COMMON_CUSTOMER',
    status: 'ACTIVE',
    notes: '',
    occupation: '',
    shopName: '',
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

  // Open Detailed Financial Profile
  const openUserDetail = async (u) => {
    setDetailLoading(true);
    setSelectedUser(u);
    setDetailModal(true);
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
      address: u.address || '',
      role: u.role || 'COMMON_CUSTOMER',
      status: u.status || 'ACTIVE',
      notes: u.notes || '',
      occupation: u.occupation || '',
      shopName: u.shopName || u.shop_name || '',
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

      // In-place state update without full page reload
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
      setStatusFeedback(`New loan successfully created and schedule generated for ${quickLoanTarget.name}!`);
      setTimeout(() => setStatusFeedback(null), 3500);
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
                        {/* View Borrower Financial Profile */}
                        <button
                          className="btn-icon"
                          title="View Borrower Financial Profile & History"
                          onClick={() => openUserDetail(u)}
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit User Details (PUT /api/users/:id) */}
                        <button
                          className="btn-icon"
                          title="Edit User Details"
                          onClick={() => openEditModal(u)}
                        >
                          <Edit2 size={16} color="var(--accent-primary)" />
                        </button>

                        {/* Quick Loan Issuance */}
                        <button
                          className="btn-icon"
                          title="Assign Loan / Obligation"
                          onClick={() => handleOpenQuickLoan(u)}
                        >
                          <Plus size={16} color="var(--emerald)" />
                        </button>

                        {/* Activate / Deactivate Toggle */}
                        <button
                          className="btn-icon"
                          title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                          onClick={() =>
                            handleStatusChange(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', u.name)
                          }
                        >
                          <Power size={16} color={u.status === 'ACTIVE' ? 'var(--red)' : 'var(--emerald)'} />
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
      {/* 1. BORROWER FINANCIAL PROFILE MODAL */}
      {/* ========================================== */}
      {detailModal && selectedUser && (
        <Modal
          isOpen={detailModal}
          onClose={() => setDetailModal(false)}
          title={`Borrower Financial Profile: ${selectedUser.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header / KYC Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{selectedUser.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedUser.customerCode || selectedUser.customer_code || `CUST-00${selectedUser.id}`} • Phone: {selectedUser.phone}
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  📍 {selectedUser.address || 'Address not recorded'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusBadge status={selectedUser.status} />
                <div style={{ marginTop: 6 }}>
                  <span className="badge badge-blue">
                    {selectedUser.role === 'SHOPKEEPER' ? 'Merchant (Daily)' : 'Borrower (Weekly)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Borrowed</span>
                <h4 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '1.1rem' }}>
                  {formatCurrency(selectedUser.financialSummary?.totalBorrowed || selectedUser.totalBorrowed || 0)}
                </h4>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Payable</span>
                <h4 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '1.1rem' }}>
                  {formatCurrency(selectedUser.financialSummary?.totalPayable || (selectedUser.totalBorrowed ? selectedUser.totalBorrowed * 1.1 : 0))}
                </h4>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Paid</span>
                <h4 style={{ margin: '4px 0 0 0', color: 'var(--emerald)', fontSize: '1.1rem' }}>
                  {formatCurrency(selectedUser.financialSummary?.totalPaid || selectedUser.totalPaid || 0)}
                </h4>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outstanding Due</span>
                <h4 style={{ margin: '4px 0 0 0', color: '#fbbf24', fontSize: '1.1rem' }}>
                  {formatCurrency(selectedUser.financialSummary?.outstanding || selectedUser.outstandingAmount || 0)}
                </h4>
              </div>
            </div>

            {/* Active Loans & Schedules */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CreditCard size={16} color="var(--accent-primary)" />
                Active Loans & Schedules
              </h4>

              {(!selectedUser.loans || selectedUser.loans.length === 0) && !selectedUser.active_loan ? (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No active loans found. Click "Assign Loan" to issue credit.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(selectedUser.loans || [selectedUser.active_loan]).filter(Boolean).map((loan, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{loan.loan_code || loan.loanNumber || `Loan #${idx + 1}`}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                            ({loan.frequency || loan.repayment_frequency || 'WEEKLY'})
                          </span>
                        </div>
                        <StatusBadge status={loan.status} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>Principal: {formatCurrency(loan.principal || loan.principal_amount)}</div>
                        <div>Total Payable: {formatCurrency(loan.total_repayable || loan.total_repayment_amount)}</div>
                        <div>Installment: {formatCurrency(loan.installment_amount)}</div>
                        <div>Remaining: <strong style={{ color: '#fbbf24' }}>{formatCurrency(loan.remaining_balance || loan.outstanding_balance || 0)}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Permanent Payment History Section */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={16} color="var(--emerald)" />
                Permanent Transaction History (Immutable Ledger)
              </h4>

              {(!selectedUser.paymentHistory || selectedUser.paymentHistory.length === 0) ? (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No payment transactions recorded yet. Payments recorded via Reports will permanently appear here.
                </div>
              ) : (
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Receipt #</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Loan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.paymentHistory.map((p, pIdx) => (
                        <tr key={pIdx}>
                          <td><code>{p.payment_number || p.reference_number || `RCP-${p.id}`}</code></td>
                          <td>{p.payment_date ? String(p.payment_date).slice(0, 10) : '2026-09-10'}</td>
                          <td><strong style={{ color: 'var(--emerald)' }}>{formatCurrency(p.amount)}</strong></td>
                          <td><span className="badge badge-blue">{p.payment_method || 'CASH'}</span></td>
                          <td>{p.loan_number || 'LN-2026'}</td>
                          <td><span className="badge badge-emerald">COMPLETED</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedUser.notes && (
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Notes:</strong> {selectedUser.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setDetailModal(false);
                  openEditModal(selectedUser);
                }}
              >
                <Edit2 size={15} />
                Edit Profile
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setDetailModal(false);
                  handleOpenQuickLoan(selectedUser);
                }}
              >
                <Plus size={15} />
                Assign New Loan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 2. EDIT USER MODAL (PUT /api/users/:id)    */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit User: ${editFormData.name}`}
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

            <div className="form-group">
              <label className="form-label">Residential / Stall Address</label>
              <textarea
                className="form-input"
                rows={2}
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  className="form-input"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                />
              </div>
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
              >
                {savingEdit ? 'Updating User in DB...' : 'Save Changes'}
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
