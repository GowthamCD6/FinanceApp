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
} from 'lucide-react';

export const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Selected User Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

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

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.customer_code?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q);

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
          <div className="welcome-tag">USER STATUS GOVERNANCE</div>
          <h1 className="page-title">Manage Users & Borrowers</h1>
          <p className="page-subtitle">
            Audit client enrollment, monitor assigned credit limits, and control account active/suspended statuses.
          </p>
        </div>

        <button className="btn btn-emerald btn-lg" onClick={() => navigate('/users/add')}>
          <UserPlus size={18} />
          <span>Onboard New User</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {statusFeedback && (
        <div className="feedback-banner">
          <CheckCircle2 size={16} color="var(--emerald)" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="card control-card">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by client name, phone number, customer code, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-lbl">Status:</span>
            {['ALL', 'ACTIVE', 'SUSPENDED', 'DEFAULTER'].map((st) => (
              <button
                key={st}
                className={`filter-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <span className="filter-lbl">Type:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'COMMON_CUSTOMER', label: 'Weekly' },
              { id: 'SHOPKEEPER', label: 'Daily (Merchant)' },
            ].map((r) => (
              <button
                key={r.id}
                className={`filter-btn ${roleFilter === r.id ? 'active' : ''}`}
                onClick={() => setRoleFilter(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>User / Borrower</th>
                <th>Segment Type</th>
                <th>Credit Limit</th>
                <th>Active Loan</th>
                <th>Discipline</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <code className="user-code">{u.customer_code}</code>
                  </td>
                  <td>
                    <div className="user-name-box">
                      <span className="user-fullname">{u.name}</span>
                      <span className="user-phone"><Phone size={12} /> {u.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`role-pill ${u.role === 'SHOPKEEPER' ? 'pill-merchant' : 'pill-weekly'}`}>
                      {u.type_label}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {formatCurrency(u.credit_limit)}
                  </td>
                  <td>
                    {u.active_loan ? (
                      <div className="loan-snapshot">
                        <span className="loan-badge">{u.active_loan.loan_code}</span>
                        <span className="loan-bal">Bal: {formatCurrency(u.active_loan.remaining_balance)}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Active Loan</span>
                    )}
                  </td>
                  <td>
                    <span className="discipline-tag">{u.repayment_discipline}</span>
                  </td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openUserDetail(u)}
                        title="View Complete Profile"
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </button>

                      {u.status === 'ACTIVE' ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStatusChange(u.id, 'SUSPENDED', u.name)}
                          title="Suspend Client"
                        >
                          <Power size={13} />
                          <span>Suspend</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-emerald btn-sm"
                          onClick={() => handleStatusChange(u.id, 'ACTIVE', u.name)}
                          title="Reactivate Client"
                        >
                          <CheckCircle2 size={13} />
                          <span>Activate</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User 360° Detail Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title={`${selectedUser?.name} (${selectedUser?.customer_code})`}
        subtitle="Complete client KYC, assigned credit limit, and current loan position"
        maxWidth="600px"
        footer={
          <button className="btn btn-secondary" onClick={() => setDetailModal(false)}>Close Window</button>
        }
      >
        {selectedUser && (
          <div className="user-detail-body">
            <div className="detail-hero">
              <div className="dh-left">
                <div className="dh-avatar">{selectedUser.name.charAt(0)}</div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {selectedUser.type_label} • {selectedUser.occupation}
                  </div>
                </div>
              </div>
              <StatusBadge status={selectedUser.status} />
            </div>

            <div className="detail-grid">
              <div className="dg-item">
                <span className="dg-lbl"><Phone size={13} /> Contact Phone:</span>
                <span className="dg-val">{selectedUser.phone}</span>
              </div>
              <div className="dg-item">
                <span className="dg-lbl"><Mail size={13} /> Email Address:</span>
                <span className="dg-val">{selectedUser.email}</span>
              </div>
              <div className="dg-item">
                <span className="dg-lbl"><MapPin size={13} /> City & Address:</span>
                <span className="dg-val">{selectedUser.address}</span>
              </div>
              <div className="dg-item">
                <span className="dg-lbl"><CreditCard size={13} /> Approved Credit Limit:</span>
                <span className="dg-val" style={{ color: 'var(--emerald)' }}>{formatCurrency(selectedUser.credit_limit)}</span>
              </div>
              <div className="dg-item">
                <span className="dg-lbl"><Briefcase size={13} /> Enrolled On:</span>
                <span className="dg-val">{selectedUser.joined_date}</span>
              </div>
              <div className="dg-item">
                <span className="dg-lbl"><ShieldCheck size={13} /> Repayment Track:</span>
                <span className="dg-val">{selectedUser.repayment_discipline}</span>
              </div>
            </div>

            {selectedUser.active_loan && (
              <div className="card active-loan-box" style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  Active Contract: {selectedUser.active_loan.loan_code}
                </h4>
                <div className="loan-mini-grid">
                  <div>Principal: <strong>{formatCurrency(selectedUser.active_loan.principal)}</strong></div>
                  <div>Installment: <strong>{formatCurrency(selectedUser.active_loan.installment_amount)} ({selectedUser.active_loan.frequency})</strong></div>
                  <div>Remaining Balance: <strong style={{ color: 'var(--rose)' }}>{formatCurrency(selectedUser.active_loan.remaining_balance)}</strong></div>
                  <div>Progress: <strong>{selectedUser.active_loan.paid_installments} of {selectedUser.active_loan.total_installments} Paid</strong></div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        .manage-users-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feedback-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.85rem;
        }

        .control-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }

        .search-box {
          position: relative;
          width: 100%;
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

        .filters-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
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

        .user-code {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
        }

        .user-name-box {
          display: flex;
          flex-direction: column;
        }

        .user-fullname {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .user-phone {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .role-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .pill-weekly { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; }
        .pill-merchant { background: rgba(245, 158, 11, 0.15); color: #fcd34d; }

        .loan-snapshot {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .loan-badge {
          font-size: 0.72rem;
          font-weight: 600;
          color: #818cf8;
        }

        .loan-bal {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        .discipline-tag {
          font-size: 0.75rem;
          color: var(--emerald);
          font-weight: 600;
        }

        .action-buttons-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .user-detail-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .dh-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .dh-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .dg-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
        }

        .dg-lbl {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .dg-val {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .loan-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .loan-mini-grid strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};
