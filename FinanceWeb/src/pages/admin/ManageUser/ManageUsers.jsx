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
  Building,
  RefreshCw,
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
    city: '',
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
      const data = await api.getBorrowers(activeOrg ? { organizationId: activeOrg.id } : {});
      setUsers(Array.isArray(data) ? data : (data?.users || []));
    } catch (err) {
      console.error('Failed to load borrowers:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeOrg?.id]);

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
      if (fullProfile) {
        setSelectedUser({
          ...u,
          ...fullProfile,
          activeLoansCount: fullProfile.activeLoansCount ?? fullProfile.financialSummary?.activeLoansCount ?? u.activeLoansCount,
          outstandingAmount: fullProfile.outstandingAmount ?? fullProfile.financialSummary?.outstanding ?? u.outstandingAmount,
          totalPaid: fullProfile.totalPaid ?? fullProfile.financialSummary?.totalPaid ?? u.totalPaid,
          ongoingLoans: fullProfile.ongoingLoans || fullProfile.activeLoans || fullProfile.loans || [],
        });
      }
    } catch (err) {
      console.warn('Could not fetch full user profile, using table data:', err);
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
      city: u.city || '',
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
      setStatusFeedback(`User "${updatedUser.name || editFormData.name}" updated successfully!`);
      setTimeout(() => setStatusFeedback(null), 3500);

      setUsers((prev) =>
        prev.map((u) => (u.id === editFormData.id ? { ...u, ...editFormData } : u))
      );

      if (selectedUser && selectedUser.id === editFormData.id) {
        setSelectedUser((prev) => ({ ...prev, ...editFormData }));
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
        organizationId: activeOrg?.id || 1,
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
        setSelectedUser(fullProfile || selectedUser);
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

  if (viewMode === 'VIRTUAL_PAGE' && selectedUser) {
    const ongoingLoans = selectedUser.ongoingLoans || selectedUser.activeLoans || (selectedUser.loans ? selectedUser.loans.filter((l) => ['ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE'].includes(l.status)) : []);
    const completedLoans = selectedUser.completedLoans || (selectedUser.loans ? selectedUser.loans.filter((l) => l.status === 'COMPLETED') : []);
    const paymentHistory = selectedUser.paymentHistory || [];

    const displayActiveCount = selectedUser.activeLoansCount ?? selectedUser.financialSummary?.activeLoansCount ?? ongoingLoans.length ?? 0;
    const displayOutstanding = selectedUser.outstandingAmount ?? selectedUser.financialSummary?.outstanding ?? ongoingLoans.reduce((sum, l) => sum + parseFloat(l.outstanding_balance || l.remaining_balance || l.outstanding_amount || 0), 0);
    const displayTotalPaid = selectedUser.totalPaid ?? selectedUser.financialSummary?.totalPaid ?? 0;

    return (
      <div className="virtual-user-page" style={{ padding: '0 0.5rem' }}>
        {/* Top Navigation & Breadcrumbs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setViewMode('DIRECTORY')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Borrower Directory</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              <span>Print Statement</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => openEditModal(selectedUser)}
            >
              <Edit2 size={15} color="var(--primary)" />
              <span>Edit Details</span>
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

        {/* User Hero Banner */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(79, 70, 229, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {selectedUser.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedUser.name}
                  </h2>
                  <StatusBadge status={selectedUser.status || 'ACTIVE'} />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 4,
                      background: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                    }}
                  >
                    {selectedUser.role === 'SHOPKEEPER' ? 'Daily Merchant' : (selectedUser.role === 'COMMON_CUSTOMER' ? 'Weekly Borrower' : selectedUser.role)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} color="var(--text-muted)" /> {selectedUser.phone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--text-muted)" /> {selectedUser.address ? `${selectedUser.address}${selectedUser.city ? `, ${selectedUser.city}` : ''}` : (selectedUser.city || 'No address registered')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--text-muted)" /> Joined: {selectedUser.dateJoined || '2026-09-11'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-primary)', padding: '0.85rem 1.25rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Loans</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--emerald)' }}>
                  {displayActiveCount}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Outstanding</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--amber)' }}>
                  {formatCurrency(displayOutstanding)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Repaid</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {formatCurrency(displayTotalPaid)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button
            className={`btn ${virtualTab === 'ONGOING' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
            onClick={() => setVirtualTab('ONGOING')}
          >
            <Clock size={15} /> Ongoing Loans ({ongoingLoans.length || displayActiveCount || 0})
          </button>
          <button
            className={`btn ${virtualTab === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
            onClick={() => setVirtualTab('COMPLETED')}
          >
            <CheckCircle2 size={15} /> Settled Archive ({completedLoans.length})
          </button>
          <button
            className={`btn ${virtualTab === 'LEDGER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
            onClick={() => setVirtualTab('LEDGER')}
          >
            <Receipt size={15} /> Payment Ledger
          </button>
        </div>

        {/* Tab 1: Ongoing Loans */}
        {virtualTab === 'ONGOING' && (
          <div>
            {ongoingLoans.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <CreditCard size={36} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No Active Loans Currently</p>
                <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 1.25rem 0' }}>This borrower has completed all previous obligations or is newly enrolled.</p>
                <button className="btn btn-primary" onClick={() => handleOpenQuickLoan(selectedUser)}>
                  <Plus size={16} /> Assign New Loan
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {ongoingLoans.map((loan, idx) => (
                  <div key={loan.id || idx} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--emerald)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {loan.loan_name || loan.product_name || `Loan #${loan.loan_number || idx + 1}`}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.loan_code || loan.loan_number}</span>
                      </div>
                      <StatusBadge status={loan.status || 'ACTIVE'} />
                    </div>

                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Principal:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(loan.principal_amount || loan.principal || 20000)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Remaining Balance:</span>
                        <strong style={{ color: 'var(--amber)' }}>{formatCurrency(loan.remaining_balance || loan.outstanding_balance || loan.outstanding_amount || 0)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Installments Paid:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {loan.paid_installments || 0} / {loan.total_installments || 10}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Settled Archive */}
        {virtualTab === 'COMPLETED' && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Settled Loan History</h4>
            {completedLoans.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No archived or completed loans recorded yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Loan Number</th>
                    <th>Principal</th>
                    <th>Total Repaid</th>
                    <th>Settlement Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedLoans.map((cl, i) => (
                    <tr key={i}>
                      <td><strong>{cl.loan_number}</strong></td>
                      <td>{formatCurrency(cl.principal_amount)}</td>
                      <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>{formatCurrency(cl.total_repayment_amount)}</td>
                      <td>{cl.completed_at || 'Settled'}</td>
                      <td><StatusBadge status="COMPLETED" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Payment Ledger */}
        {virtualTab === 'LEDGER' && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Live Payment Receipts & Circulation Ledger</h4>
            {paymentHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No payment entries found for this borrower.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date</th>
                    <th>Amount Paid</th>
                    <th>Payment Mode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.receipt_number || `REC-${i + 1}`}</strong></td>
                      <td>{p.payment_date || new Date().toISOString().slice(0, 10)}</td>
                      <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                      <td>{p.payment_mode || 'UPI'}</td>
                      <td><StatusBadge status="COMPLETED" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: STANDARD USERS DIRECTORY TABLE (LIGHT FINTECH AESTHETIC)
  // =========================================================================
  return (
    <div className="manage-users-page" style={{ padding: '0 0.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Borrower & User Directory
            </h1>
            {activeOrg && (
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 6,
                  background: 'rgba(79, 70, 229, 0.08)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Building size={14} />
                {activeOrg.name} ({activeOrg.code || `ORG-${activeOrg.id}`})
              </span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Central database of active borrowers, shopkeepers, and field staff under this organization
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={loadUsers}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate(getOrgPath('users/add'))} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <UserPlus size={16} />
            <span>Onboard New Borrower</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div className="skeleton-bar" style={{ width: '50%', height: 13 }} />
                <div className="skeleton-circle" style={{ width: 28, height: 28, borderRadius: 6 }} />
              </div>
              <div className="skeleton-bar" style={{ width: '65%', height: 28, marginBottom: '0.4rem' }} />
              <div className="skeleton-bar" style={{ width: '40%', height: 11 }} />
            </div>
          ))
        ) : (
          <>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Enrolled Users</span>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={14} color="var(--primary)" />
                </div>
              </div>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {users.length}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>All registered accounts</span>
            </div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Borrowers</span>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={14} color="var(--emerald)" />
                </div>
              </div>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald)' }}>
                {totalActiveBorrowers}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>With running installment schemes</span>
            </div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Outstanding Portfolio</span>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={14} color="var(--amber)" />
                </div>
              </div>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--amber)' }}>
                {formatCurrency(totalOutstanding)}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Pending recovery balance</span>
            </div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Loans Archive</span>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={14} color="var(--purple)" />
                </div>
              </div>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                {users.reduce((sum, u) => sum + (u.completedLoansCount || 0), 0)}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Fully settled micro-loans</span>
            </div>
          </>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="table-controls" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by name, phone, customer code, or shop name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-input"
            style={{ width: 180 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="COMMON_CUSTOMER">Borrowers (Weekly)</option>
            <option value="SHOPKEEPER">Merchants (Daily)</option>
            <option value="FIELD_AGENT">Field Agents</option>
            <option value="ADMIN">Admins / Staff</option>
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
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="skeleton-circle" style={{ width: 38, height: 38 }} />
                        <div>
                          <div className="skeleton-bar" style={{ width: 130, height: 14, marginBottom: '0.35rem' }} />
                          <div className="skeleton-bar" style={{ width: 80, height: 10 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div className="skeleton-bar" style={{ width: 105, height: 20, borderRadius: 4, marginBottom: 4 }} />
                      <div className="skeleton-bar" style={{ width: 75, height: 10 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div className="skeleton-bar" style={{ width: 95, height: 14, marginBottom: 4 }} />
                      <div className="skeleton-bar" style={{ width: 120, height: 11 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div className="skeleton-bar" style={{ width: 85, height: 13 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div className="skeleton-bar" style={{ width: 60, height: 16, borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div className="skeleton-bar" style={{ width: 80, height: 16 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div className="skeleton-bar" style={{ width: 65, height: 20, borderRadius: 4 }} />
                    </td>
                    <td style={{ padding: '0.95rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <div className="skeleton-bar" style={{ width: 85, height: 28, borderRadius: 6 }} />
                        <div className="skeleton-bar" style={{ width: 28, height: 28, borderRadius: 6 }} />
                        <div className="skeleton-bar" style={{ width: 28, height: 28, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    <Users size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No borrowers or users found</div>
                    <span style={{ fontSize: '0.85rem' }}>Try adjusting your search terms or filter selections.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isShop = u.role === 'SHOPKEEPER';
                  const isWeekly = u.role === 'COMMON_CUSTOMER';
                  const isAdmin = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: isShop ? 'rgba(124, 58, 237, 0.12)' : isWeekly ? 'rgba(79, 70, 229, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                              color: isShop ? 'var(--purple)' : isWeekly ? 'var(--primary)' : 'var(--emerald)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                            }}
                          >
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem', display: 'block' }}>
                              {u.name}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {u.customerCode || u.customer_code || `CUST-${u.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={{
                            background: isShop ? 'rgba(124, 58, 237, 0.1)' : isWeekly ? 'rgba(79, 70, 229, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                            color: isShop ? 'var(--purple)' : isWeekly ? 'var(--primary)' : 'var(--emerald)',
                            fontWeight: 600,
                            padding: '0.25rem 0.6rem',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                          }}
                        >
                          {isShop ? 'Merchant (Daily)' : isWeekly ? 'Borrower (Weekly)' : u.role}
                        </span>
                        {u.shopName && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                            {u.shopName}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          <Phone size={13} color="var(--text-muted)" />
                          {u.phone}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color="var(--text-muted)" />
                          <span>{u.address ? `${u.address}${u.city ? `, ${u.city}` : ''}` : (u.city || 'No address set')}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {u.dateJoined || '2026-09-11'}
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
                        <strong style={{ color: (u.outstandingAmount || 0) > 0 ? 'var(--amber)' : 'var(--emerald)' }}>
                          {formatCurrency(u.outstandingAmount || 0)}
                        </strong>
                      </td>

                      <td>
                        <StatusBadge status={u.status || 'ACTIVE'} />
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Open Virtual Page View */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Open Virtual Profile & Full History"
                            onClick={() => openVirtualUserPage(u)}
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Eye size={14} color="var(--primary)" />
                            <span>View History</span>
                          </button>

                          {/* Edit User Details */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit User Details"
                            onClick={() => openEditModal(u)}
                            style={{ padding: '0.35rem 0.55rem' }}
                          >
                            <Edit2 size={14} color="var(--primary)" />
                          </button>

                          {/* Quick Loan Issuance */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Assign Loan / Obligation"
                            onClick={() => handleOpenQuickLoan(u)}
                            style={{ padding: '0.35rem 0.55rem' }}
                          >
                            <Plus size={14} color="var(--emerald)" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                            onClick={() =>
                              handleStatusChange(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', u.name)
                            }
                            style={{ padding: '0.35rem 0.55rem' }}
                          >
                            <Power size={14} color={u.status === 'ACTIVE' ? 'var(--rose)' : 'var(--emerald)'} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          title={`Edit Borrower: ${editFormData.name}`}
        >
          <form onSubmit={handleEditSubmit}>
            {editError && (
              <div style={{ padding: '0.75rem', background: 'rgba(225,29,72,0.1)', color: 'var(--rose)', borderRadius: 6, marginBottom: '1rem', fontSize: '0.85rem' }}>
                {editError}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Residential / Shop Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 42 Bazaar Road, Saidapet"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Chennai / Tirupur"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Occupation / Trade</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.occupation}
                  onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Shop / Enterprise Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.shopName}
                  onChange={(e) => setEditFormData({ ...editFormData, shopName: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 3. QUICK LOAN ASSIGNMENT MODAL             */}
      {/* ========================================== */}
      {isQuickLoanModalOpen && quickLoanTarget && (
        <Modal
          isOpen={isQuickLoanModalOpen}
          onClose={() => setIsQuickLoanModalOpen(false)}
          title={`Assign Loan to: ${quickLoanTarget.name}`}
        >
          <form onSubmit={handleQuickLoanSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Loan Title / Product Name</label>
              <input
                type="text"
                className="form-input"
                value={quickLoanForm.loan_name}
                onChange={(e) => setQuickLoanForm({ ...quickLoanForm, loan_name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Principal Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={quickLoanForm.principal}
                  onChange={(e) => setQuickLoanForm({ ...quickLoanForm, principal: e.target.value })}
                  min="1000"
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
                  <option value="WEEKLY">Weekly Installments</option>
                  <option value="DAILY">Daily Collection (Shopkeeper)</option>
                  <option value="MONTHLY">Monthly EMI</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsQuickLoanModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingLoan}>
                {submittingLoan ? 'Generating Schedule...' : 'Disburse & Assign Loan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageUsers;
