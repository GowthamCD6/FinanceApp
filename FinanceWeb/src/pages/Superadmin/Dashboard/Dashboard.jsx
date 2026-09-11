import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import {
  Building,
  Plus,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Search,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';

const PLAN_CONFIG = {
  STARTER:    { label: 'Starter',    color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  PRO:        { label: 'Pro',        color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
  ENTERPRISE: { label: 'Enterprise', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
};

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',    color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
  SUSPENDED: { label: 'Suspended', color: '#BE123C', bg: '#FFF1F2', border: '#FECDD3' },
};

const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { organizations, platformStats, updateOrgStatus, updateOrganization, setActiveOrg } = useOrg();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Org Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    admin_name: '',
    admin_phone: '',
    plan: 'PRO',
    status: 'ACTIVE',
  });
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const filtered = organizations.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        (o.admin_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const validateEdit = () => {
    const errs = {};
    if (!editFormData.name.trim()) errs.name = 'Organization name is required';
    if (!editFormData.admin_name.trim()) errs.admin_name = 'Admin Name is required';
    if (!editFormData.admin_phone.trim()) {
      errs.admin_phone = 'Admin phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(editFormData.admin_phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.admin_phone = 'Please enter a valid 10-digit phone number';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openEditModal = (org) => {
    setEditErrors({});
    setEditFormData({
      id: org.id,
      name: org.name || '',
      admin_name: org.admin_name || '',
      admin_phone: org.admin_phone || '',
      plan: org.plan || 'PRO',
      status: org.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validateEdit()) return;

    setSavingEdit(true);
    try {
      if (updateOrganization) {
        updateOrganization(editFormData.id, {
          name: editFormData.name.trim(),
          admin_name: editFormData.admin_name.trim(),
          admin_phone: editFormData.admin_phone.trim(),
          plan: editFormData.plan,
          status: editFormData.status,
        });
      }

      setIsEditModalOpen(false);
      setFeedbackMsg(`Organization "${editFormData.name}" updated successfully!`);
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      setEditErrors({ form: err.message || 'Failed to update organization' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleManageOrg = (org) => {
    setActiveOrg(org.id);
    navigate(`/org/${org.id}/dashboard`);
  };

  const handleToggleStatus = (org) => {
    const next = org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateOrgStatus(org.id, next);
    setFeedbackMsg(`Organization "${org.name}" status updated to ${next}`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  return (
    <div className="sa-dash">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">SUPERADMIN • PLATFORM GOVERNANCE</div>
          <h1 className="page-title">Organization Command Center</h1>
          <p className="page-subtitle">
            Create, govern, and monitor all registered finance organizations on the platform.
          </p>
        </div>
        <button className="btn btn-emerald btn-lg" onClick={() => navigate('/org/create')}>
          <Plus size={18} />
          <span>Create Organization</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Platform KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Building size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Organizations</span>
            <span className="kpi-value">{platformStats.totalOrgs}</span>
            <span className="kpi-meta">{platformStats.activeOrgs} Active • {platformStats.suspendedOrgs} Suspended</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
            <Users size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Customers</span>
            <span className="kpi-value">{platformStats.totalCustomers.toLocaleString()}</span>
            <span className="kpi-meta">Across all organizations</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
            <TrendingUp size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Active Portfolio</span>
            <span className="kpi-value">{formatCurrency(platformStats.totalPortfolio)}</span>
            <span className="kpi-meta">Outstanding balance across all orgs</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            <Shield size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Capital Deployed</span>
            <span className="kpi-value">{formatCurrency(platformStats.totalCapital)}</span>
            <span className="kpi-meta">Initial capital across all orgs</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by organization name, code, or admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'All Orgs' : st.charAt(0) + st.slice(1).toLowerCase()}
              {st !== 'ALL' && (
                <span className="chip-count">
                  {organizations.filter((o) => o.status === st).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Organization Grid */}
      <div className="org-grid">
        {filtered.map((org) => {
          const plan = PLAN_CONFIG[org.plan] || PLAN_CONFIG.PRO;
          const status = STATUS_CONFIG[org.status] || STATUS_CONFIG.ACTIVE;

          return (
            <div className="card org-card" key={org.id}>
              {/* Card Header */}
              <div className="org-card-header">
                <div className="org-avatar" style={{ background: plan.bg, color: plan.color, borderColor: plan.border }}>
                  {org.name.charAt(0)}
                </div>
                <div className="org-header-text">
                  <h3 className="org-name">{org.name}</h3>
                  <span className="org-code">{org.code}</span>
                </div>
                <div className="org-badges">
                  <span className="org-badge" style={{ background: plan.bg, color: plan.color, borderColor: plan.border }}>
                    {plan.label}
                  </span>
                  <span className="org-badge" style={{ background: status.bg, color: status.color, borderColor: status.border }}>
                    <span className="status-dot" style={{ backgroundColor: status.color }} />
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="org-stats-row">
                <div className="org-stat">
                  <span className="org-stat-val">{org.total_customers}</span>
                  <span className="org-stat-lbl">Customers</span>
                </div>
                <div className="org-stat-divider" />
                <div className="org-stat">
                  <span className="org-stat-val">{org.branch_count}</span>
                  <span className="org-stat-lbl">Branches</span>
                </div>
                <div className="org-stat-divider" />
                <div className="org-stat">
                  <span className="org-stat-val">{formatCurrency(org.active_portfolio)}</span>
                  <span className="org-stat-lbl">Portfolio</span>
                </div>
                <div className="org-stat-divider" />
                <div className="org-stat">
                  <span className="org-stat-val">{formatCurrency(org.initial_capital)}</span>
                  <span className="org-stat-lbl">Capital</span>
                </div>
              </div>

              {/* Admin & Meta */}
              <div className="org-meta">
                <div className="org-meta-row">
                  <Users size={13} color="var(--text-muted)" />
                  <span>Admin: <strong>{org.admin_name}</strong></span>
                </div>
                {org.admin_email && (
                  <div className="org-meta-row">
                    <Mail size={13} color="var(--text-muted)" />
                    <span>{org.admin_email}</span>
                  </div>
                )}
                {org.address && (
                  <div className="org-meta-row">
                    <MapPin size={13} color="var(--text-muted)" />
                    <span>{org.address}</span>
                  </div>
                )}
                <div className="org-meta-row">
                  <Calendar size={13} color="var(--text-muted)" />
                  <span>Registered: {org.created_at}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="org-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  title="Edit Organization Details"
                  onClick={() => openEditModal(org)}
                >
                  <Edit2 size={13} color="var(--accent-primary)" />
                  <span>Edit</span>
                </button>
                <button
                  className={`btn btn-sm ${org.status === 'ACTIVE' ? 'btn-secondary' : 'btn-emerald'}`}
                  onClick={() => handleToggleStatus(org)}
                >
                  {org.status === 'ACTIVE' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  <span>{org.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleManageOrg(org)}
                >
                  <Briefcase size={14} />
                  <span>Workspace</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <Building size={48} color="var(--text-muted)" />
            <h3>No organizations found</h3>
            <p>Adjust your search or filters, or create a new organization.</p>
          </div>
        )}
      </div>

      {/* Edit Organization Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Organization: ${editFormData.name}`}
        >
          <form onSubmit={handleSaveEdit}>
            {editErrors.form && (
              <div className="feedback-banner" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'var(--red)', marginBottom: '1rem' }}>
                <AlertCircle size={16} color="var(--red)" />
                <span style={{ color: '#fca5a5' }}>{editErrors.form}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Organization / Company Name *</label>
              <input
                type="text"
                className={`form-input ${editErrors.name ? 'input-error' : ''}`}
                value={editFormData.name}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, name: e.target.value });
                  if (editErrors.name) setEditErrors({ ...editErrors, name: null });
                }}
                required
              />
              {editErrors.name && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{editErrors.name}</span>}
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Admin Name *</label>
                <input
                  type="text"
                  className={`form-input ${editErrors.admin_name ? 'input-error' : ''}`}
                  value={editFormData.admin_name}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, admin_name: e.target.value });
                    if (editErrors.admin_name) setEditErrors({ ...editErrors, admin_name: null });
                  }}
                  required
                />
                {editErrors.admin_name && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{editErrors.admin_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Admin Phone Number *</label>
                <input
                  type="text"
                  className={`form-input ${editErrors.admin_phone ? 'input-error' : ''}`}
                  value={editFormData.admin_phone}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, admin_phone: e.target.value });
                    if (editErrors.admin_phone) setEditErrors({ ...editErrors, admin_phone: null });
                  }}
                  required
                />
                {editErrors.admin_phone && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{editErrors.admin_phone}</span>}
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Plan Tier</label>
                <select
                  className="form-input"
                  value={editFormData.plan}
                  onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
                >
                  <option value="PRO">PRO</option>
                  <option value="STARTER">STARTER</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
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
                style={{ minWidth: 150, justifyContent: 'center' }}
              >
                <Save size={15} />
                {savingEdit ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        .sa-dash { display: flex; flex-direction: column; gap: 1.5rem; }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .kpi-grid { grid-template-columns: 1fr; } }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
        }
        .kpi-icon {
          width: 48px; height: 48px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .kpi-body { display: flex; flex-direction: column; }
        .kpi-label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin: 0.15rem 0; letter-spacing: -0.02em; }
        .kpi-meta { font-size: 0.72rem; color: var(--text-muted); font-weight: 500; }

        .filter-bar {
          display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1.25rem;
          flex-wrap: wrap; background: #FFFFFF;
        }
        .search-box { position: relative; flex: 1; min-width: 240px; }
        .search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .search-input { padding-left: 2.25rem !important; }
        .filter-chips { display: flex; gap: 0.5rem; }
        .filter-chip {
          display: flex; align-items: center; gap: 0.35rem;
          padding: 0.4rem 0.85rem; border-radius: var(--radius-full);
          font-size: 0.78rem; font-weight: 600; cursor: pointer;
          background: #FFFFFF; border: 1px solid var(--border-color);
          color: var(--text-secondary); transition: all var(--transition-fast);
        }
        .filter-chip:hover { border-color: var(--border-hover); color: var(--text-primary); }
        .filter-chip.active {
          background: #EEF2FF; border-color: #C7D2FE;
          color: #4338CA; font-weight: 700;
        }
        .chip-count {
          background: #F1F5F9; padding: 0.1rem 0.45rem; border-radius: 10px;
          font-size: 0.7rem; font-weight: 700; color: #475569;
        }

        .org-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 500px) { .org-grid { grid-template-columns: 1fr; } }

        .org-card {
          padding: 1.35rem; display: flex; flex-direction: column; gap: 1rem;
          background: #FFFFFF; border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }
        .org-card:hover {
          border-color: var(--border-hover);
          box-shadow: var(--shadow-md);
        }
        .org-card-header { display: flex; align-items: flex-start; gap: 0.85rem; }
        .org-avatar {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.25rem;
          border: 1px solid; flex-shrink: 0;
        }
        .org-header-text { flex: 1; min-width: 0; }
        .org-name { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .org-code { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; letter-spacing: 0.05em; }
        .org-badges { display: flex; flex-direction: column; gap: 0.3rem; flex-shrink: 0; }
        .org-badge {
          display: inline-flex; align-items: center; gap: 0.3rem;
          font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full); border: 1px solid;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .org-stats-row {
          display: flex; align-items: center; justify-content: space-between;
          background: #F8FAFC; border: 1px solid #E2E8F0;
          border-radius: var(--radius-md); padding: 0.75rem 0.85rem;
        }
        .org-stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .org-stat-val { font-size: 0.85rem; font-weight: 800; color: var(--text-primary); }
        .org-stat-lbl { font-size: 0.65rem; color: var(--text-muted); margin-top: 0.15rem; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
        .org-stat-divider { width: 1px; height: 28px; background: #E2E8F0; }

        .org-meta { display: flex; flex-direction: column; gap: 0.35rem; }
        .org-meta-row {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; color: var(--text-secondary);
        }
        .org-meta-row strong { color: var(--text-primary); font-weight: 700; }

        .org-actions { display: flex; gap: 0.65rem; padding-top: 0.65rem; border-top: 1px solid #F1F5F9; }
        .org-actions .btn { flex: 1; justify-content: center; }

        .empty-state {
          grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;
          color: var(--text-muted);
        }
        .empty-state h3 { margin: 0.75rem 0 0.35rem; color: var(--text-secondary); }
        .empty-state p { font-size: 0.85rem; }
      `}</style>
    </div>
  );
};
