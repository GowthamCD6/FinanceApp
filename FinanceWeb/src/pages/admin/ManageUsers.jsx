import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
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
} from 'lucide-react';

import { useOrg } from '../../context/OrgContext';

export const ManageUsers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const getOrgPath = (sub) => activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`;

  // Selected User Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  // Quick Additional Loan Modal from User KYC
  const [isQuickLoanModalOpen, setIsQuickLoanModalOpen] = useState(false);
  const [quickLoanForm, setQuickLoanForm] = useState({
    loan_name: '',
    principal: '20000',
    frequency: 'WEEKLY',
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

  const handleStatusChange = async (userId, nextStatus, userName) => {
    await api.updateUserStatus(userId, nextStatus);
    setStatusFeedback(`${userName} marked as ${nextStatus}`);
    setTimeout(() => setStatusFeedback(null), 3000);
    await loadUsers();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  const openUserDetail = (u) => {
    setSelectedUser(u);
    setDetailModal(true);
  };

  const handleOpenQuickLoan = (u) => {
    setSelectedUser(u);
    setQuickLoanForm({
      loan_name: `Concurrent Loan (${u.loans ? u.loans.length + 1 : 2})`,
      principal: '20000',
      frequency: u.role === 'SHOPKEEPER' ? 'DAILY' : 'WEEKLY',
    });
    setIsQuickLoanModalOpen(true);
  };

  const handleQuickLoanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmittingLoan(true);
    try {
      await api.createLoan({
        borrower_id: selectedUser.id,
        loan_name: quickLoanForm.loan_name,
        principal: quickLoanForm.principal,
        frequency: quickLoanForm.frequency,
      });
      setIsQuickLoanModalOpen(false);
      setStatusFeedback(`Additional loan successfully activated for ${selectedUser.name}!`);
      setTimeout(() => setStatusFeedback(null), 3500);
      await loadUsers();
      // update selectedUser state
      const updated = await api.getUserById(selectedUser.id);
      setSelectedUser(updated);
    } finally {
      setSubmittingLoan(false);
    }
  };

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.customer_code?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      (u.shop_name && u.shop_name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) return <div className="page-loading">Loading User Registry...</div>;

  return (
    <div className="manage-users-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">USER & MULTI-LOAN GOVERNANCE</div>
          <h1 className="page-title">Manage Users & Borrowers</h1>
          <p className="page-subtitle">
            Audit client enrollment, monitor concurrent active loans, and issue additional credit facilities.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate(getOrgPath('loans'))}>
            <CreditCard size={16} />
            <span>Loan Portfolio</span>
          </button>
          <button className="btn btn-emerald" onClick={() => navigate(getOrgPath('users/add'))}>
            <UserPlus size={16} />
            <span>Onboard User</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {statusFeedback && (
        <div className="feedback-banner">
          <CheckCircle2 size={16} color="var(--emerald)" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="card control-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input search-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by client name, mobile, code, shop name, or territory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DEFAULTER">Defaulter / Overdue</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="COMMON_CUSTOMER">Borrower (Weekly)</option>
            <option value="SHOPKEEPER">Merchant (Daily)</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client Profile</th>
              <th>Category & Profession</th>
              <th>Phone Number</th>
              <th>Approved Credit</th>
              <th>Active Loans</th>
              <th>Total Debt Outstanding</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const userLoans = u.loans && u.loans.length > 0 ? u.loans : (u.active_loan ? [u.active_loan] : []);
              const activeUserLoans = userLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
              const totalRemainingDebt = activeUserLoans.reduce((sum, l) => sum + (l.remaining_balance || 0), 0);
              const isMulti = activeUserLoans.length > 1;

              return (
                <tr key={u.id}>
                  {/* Profile */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          background: u.role === 'SHOPKEEPER' ? '#EEF2FF' : 'var(--primary-gradient)',
                          color: u.role === 'SHOPKEEPER' ? 'var(--primary)' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          flexShrink: 0,
                          border: u.role === 'SHOPKEEPER' ? '1px solid #C7D2FE' : 'none',
                        }}
                      >
                        {u.role === 'SHOPKEEPER' ? <Store size={18} /> : (u.name ? u.name.charAt(0) : 'U')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{u.name}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {u.customer_code} • {u.city}
                          {u.shop_name && ` • ${u.shop_name}`}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.type_label}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{u.occupation}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                      <Phone size={13} color="var(--text-muted)" />
                      <span>{u.phone}</span>
                    </div>
                  </td>

                  {/* Credit Limit */}
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(u.credit_limit)}</strong>
                  </td>

                  {/* Active Loans */}
                  <td>
                    {activeUserLoans.length === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Active Loans</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className={`badge ${isMulti ? 'badge-indigo' : 'badge-primary'}`} style={{ alignSelf: 'flex-start' }}>
                          {isMulti ? `⚡ ${activeUserLoans.length} Active Loans` : '1 Active Loan'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {activeUserLoans.map((l) => l.loan_code).join(', ')}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Total Debt Outstanding */}
                  <td>
                    {activeUserLoans.length > 0 ? (
                      <strong style={{ color: activeUserLoans.some((l) => l.status === 'OVERDUE') ? '#E11D48' : 'var(--text-primary)' }}>
                        {formatCurrency(totalRemainingDebt)}
                      </strong>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={u.status} />
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openUserDetail(u)}
                        title="View Full Client KYC & Multi-Loan Profile"
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </button>

                      <button
                        className="btn btn-emerald btn-sm"
                        onClick={() => handleOpenQuickLoan(u)}
                        title="Disburse Another Loan to this Client"
                      >
                        <Plus size={14} />
                        <span>Add Loan</span>
                      </button>

                      {u.status === 'ACTIVE' ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStatusChange(u.id, 'SUSPENDED', u.name)}
                          title="Suspend Client Operations"
                        >
                          <Power size={14} />
                        </button>
                      ) : (
                        <button
                          className="btn btn-emerald btn-sm"
                          onClick={() => handleStatusChange(u.id, 'ACTIVE', u.name)}
                          title="Restore / Activate Client"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <h3>No client records match your query</h3>
                  <p>Try refining search keywords or resetting filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail & Multi-Loan KYC Modal */}
      {selectedUser && (
        <Modal
          isOpen={detailModal}
          onClose={() => setDetailModal(false)}
          title={`Client Profile & Multi-Loan Portfolio`}
          subtitle={`${selectedUser.name} (${selectedUser.customer_code}) • Enrolled On ${selectedUser.joined_date}`}
          maxWidth="700px"
        >
          {(() => {
            const userLoans = selectedUser.loans && selectedUser.loans.length > 0 ? selectedUser.loans : (selectedUser.active_loan ? [selectedUser.active_loan] : []);
            const activeLoans = userLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
            const totalRemaining = activeLoans.reduce((sum, l) => sum + (l.remaining_balance || 0), 0);
            const totalPrincipal = userLoans.reduce((sum, l) => sum + (l.principal || 0), 0);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Top Identity Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 'var(--radius-md)',
                      background: selectedUser.role === 'SHOPKEEPER' ? '#EEF2FF' : 'var(--primary-gradient)',
                      color: selectedUser.role === 'SHOPKEEPER' ? 'var(--primary)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedUser.name}</h3>
                      <StatusBadge status={selectedUser.status} />
                      {activeLoans.length > 1 && (
                        <span className="badge badge-indigo">⚡ {activeLoans.length} Active Loans</span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {selectedUser.type_label} • {selectedUser.occupation}
                      {selectedUser.shop_name && ` • ${selectedUser.shop_name} (${selectedUser.stall_no})`}
                    </p>
                  </div>
                  <button
                    className="btn btn-emerald btn-sm"
                    onClick={() => {
                      setDetailModal(false);
                      handleOpenQuickLoan(selectedUser);
                    }}
                  >
                    <Plus size={14} />
                    <span>Issue Another Loan</span>
                  </button>
                </div>

                {/* Financial Summary Strip for this User */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  background: '#F8FAFC',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #E2E8F0',
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Lifetime Principal Given</span>
                    <p style={{ fontWeight: 800, margin: '0.15rem 0 0', color: 'var(--text-primary)' }}>{formatCurrency(totalPrincipal)}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Outstanding Debt</span>
                    <p style={{ fontWeight: 800, margin: '0.15rem 0 0', color: '#E11D48' }}>{formatCurrency(totalRemaining)}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Credit Limit</span>
                    <p style={{ fontWeight: 800, margin: '0.15rem 0 0', color: 'var(--emerald)' }}>{formatCurrency(selectedUser.credit_limit)}</p>
                  </div>
                </div>

                {/* All Loans Stack for this Borrower */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                    Active & Past Loan Facilities ({userLoans.length} Contracts)
                  </h4>
                  {userLoans.length === 0 ? (
                    <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No loan facilities currently registered for this client.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {userLoans.map((loan, idx) => {
                        const progress = Math.round(((loan.paid_installments || 0) / (loan.total_installments || 1)) * 100);
                        return (
                          <div
                            key={loan.loan_code || idx}
                            style={{
                              background: '#FFFFFF',
                              border: '1.5px solid #E2E8F0',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.85rem 1rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{loan.loan_code}</strong>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {loan.loan_name || `Loan #${idx + 1}`}
                                </span>
                              </div>
                              <StatusBadge status={loan.status} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.8rem', margin: '0.4rem 0' }}>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Principal</span>
                                <strong>{formatCurrency(loan.principal)}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Installment</span>
                                <strong>{formatCurrency(loan.installment_amount)}/{loan.frequency === 'WEEKLY' ? 'wk' : 'day'}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Progress</span>
                                <span>{loan.paid_installments}/{loan.total_installments} ({progress}%)</span>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Remaining</span>
                                <strong style={{ color: loan.remaining_balance === 0 ? 'var(--emerald)' : '#E11D48' }}>
                                  {loan.remaining_balance === 0 ? 'PAID' : formatCurrency(loan.remaining_balance)}
                                </strong>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.35rem' }}>
                              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--emerald)' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Quick Additional Loan Modal */}
      {isQuickLoanModalOpen && selectedUser && (
        <Modal
          isOpen={isQuickLoanModalOpen}
          onClose={() => setIsQuickLoanModalOpen(false)}
          title={`Disburse Concurrent Loan to ${selectedUser.name}`}
          subtitle={`Current Client: ${selectedUser.customer_code} • Credit Limit: ${formatCurrency(selectedUser.credit_limit)}`}
          maxWidth="560px"
        >
          <form onSubmit={handleQuickLoanSubmit}>
            <div className="form-group">
              <label className="form-label">Loan Purpose / Label *</label>
              <input
                type="text"
                className="form-input"
                value={quickLoanForm.loan_name}
                onChange={(e) => setQuickLoanForm({ ...quickLoanForm, loan_name: e.target.value })}
                placeholder="e.g. Festival Inventory, Machinery Purchase..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loan Scheme *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  onClick={() => setQuickLoanForm({ ...quickLoanForm, frequency: 'WEEKLY' })}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: quickLoanForm.frequency === 'WEEKLY' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: quickLoanForm.frequency === 'WEEKLY' ? '#EEF2FF' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Weekly (10 Wks)</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>10% flat interest</div>
                </div>

                <div
                  onClick={() => setQuickLoanForm({ ...quickLoanForm, frequency: 'DAILY' })}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: quickLoanForm.frequency === 'DAILY' ? '2px solid var(--emerald)' : '1px solid var(--border-color)',
                    background: quickLoanForm.frequency === 'DAILY' ? '#ECFDF5' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <strong style={{ color: 'var(--emerald)', fontSize: '0.9rem' }}>Daily (25 Days)</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>12.5% flat interest</div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Principal Amount (₹ INR) *</label>
              <input
                type="number"
                className="form-input"
                value={quickLoanForm.principal}
                onChange={(e) => setQuickLoanForm({ ...quickLoanForm, principal: e.target.value })}
                step="1000"
                min="5000"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsQuickLoanModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald" disabled={submittingLoan}>
                {submittingLoan ? 'Activating Loan...' : 'Disburse & Activate'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
