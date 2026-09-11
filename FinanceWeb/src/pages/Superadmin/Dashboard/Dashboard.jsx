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
  RotateCw,
  Power,
  Edit2,
  Save,
  AlertCircle,
  X,
  Layers,
  DollarSign,
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';

const PLAN_CONFIG = {
  STARTER:    { label: 'Starter',    color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  PRO:        { label: 'Pro',        color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  ENTERPRISE: { label: 'Enterprise', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
};

const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const {
    organizations,
    loading,
    platformStats,
    updateOrgStatus,
    updateOrganization,
    setActiveOrg,
    refreshOrganizations,
  } = useOrg();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleManualRefresh = async () => {
    if (refreshOrganizations) {
      setIsRefreshing(true);
      try {
        await refreshOrganizations();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  const filtered = organizations.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.name?.toLowerCase().includes(q) ||
        o.code?.toLowerCase().includes(q) ||
        (o.admin_name || '').toLowerCase().includes(q) ||
        (o.admin_phone || '').includes(q)
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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateEdit()) return;

    setSavingEdit(true);
    try {
      if (updateOrganization) {
        await updateOrganization(editFormData.id, {
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
    <div className="sa-dash-container">
      {/* 1. Header Row */}
      <div className="sa-header-row">
        <div className="sa-header-left">
          <div className="title-wrap">
            <h1 className="sa-main-title">SuperAdmin Platform Overview</h1>
            <span className="sa-badge-count">
              {loading ? (
                <span className="skeleton-pill" style={{ width: 45, height: 20 }} />
              ) : (
                `${organizations.length} Tenants Active`
              )}
            </span>
          </div>
        </div>

        <div className="sa-header-actions">
          <button
            type="button"
            className={`btn-refresh-data ${isRefreshing || loading ? 'is-spinning' : ''}`}
            onClick={handleManualRefresh}
            title="Refresh Live Data"
            disabled={loading || isRefreshing}
          >
            <RotateCw size={16} />
          </button>

          <button
            type="button"
            className="btn-create-org"
            onClick={() => navigate('/org/create')}
          >
            <Plus size={18} />
            <span>Onboard Organization</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="feedback-banner-success">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Platform KPI Cards */}
      <div className="sa-kpi-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="sa-kpi-card skeleton-card">
                <div className="kpi-top-row">
                  <div className="skeleton-bar" style={{ width: '45%', height: 14 }} />
                  <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
                </div>
                <div className="skeleton-bar" style={{ width: '60%', height: 28, margin: '10px 0' }} />
                <div className="skeleton-bar" style={{ width: '75%', height: 12 }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="sa-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-label">Total Organizations</span>
                <div className="kpi-icon-wrap icon-blue">
                  <Building size={20} />
                </div>
              </div>
              <div className="kpi-value">{platformStats.totalOrgs}</div>
              <div className="kpi-footer">
                <span className="dot-green" />
                <span>{platformStats.activeOrgs} Active • {platformStats.suspendedOrgs} Suspended</span>
              </div>
            </div>

            <div className="sa-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-label">Registered Borrowers</span>
                <div className="kpi-icon-wrap icon-green">
                  <Users size={20} />
                </div>
              </div>
              <div className="kpi-value">{platformStats.totalCustomers.toLocaleString()}</div>
              <div className="kpi-footer">
                <span className="highlight-green">Across all branch networks</span>
              </div>
            </div>

            <div className="sa-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-label">Circulating Portfolio</span>
                <div className="kpi-icon-wrap icon-amber">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="kpi-value">{formatCurrency(platformStats.totalPortfolio)}</div>
              <div className="kpi-footer">
                <span>Active ledger outstanding</span>
              </div>
            </div>

            <div className="sa-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-label">Total Platform Capital</span>
                <div className="kpi-icon-wrap icon-purple">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="kpi-value">{formatCurrency(platformStats.totalCapital)}</div>
              <div className="kpi-footer">
                <span>Initial capital liquidity</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="sa-toolbar">
        <div className="sa-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search organizations by name, code, admin, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="sa-filter-chips">
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
              disabled={loading}
            >
              {st === 'ALL' ? 'All Tenants' : st.charAt(0) + st.slice(1).toLowerCase()}
              {st !== 'ALL' && (
                <span className="chip-count">
                  {organizations.filter((o) => o.status === st).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Organization Cards Grid */}
      <div className="sa-org-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="org-card skeleton-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="skeleton-circle" style={{ width: 44, height: 44 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <div className="skeleton-bar" style={{ width: '70%', height: 16 }} />
                    <div className="skeleton-bar" style={{ width: '40%', height: 12 }} />
                  </div>
                </div>
                <div className="skeleton-bar" style={{ width: '100%', height: 48, borderRadius: 8, margin: '8px 0' }} />
                <div className="skeleton-bar" style={{ width: '90%', height: 14 }} />
                <div className="skeleton-bar" style={{ width: '60%', height: 14 }} />
              </div>
            ))}
          </>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Building size={48} color="#94a3b8" />
            <h3>No organizations found</h3>
            <p>Try adjusting your search filters or onboard a new organization.</p>
          </div>
        ) : (
          filtered.map((org) => {
            const plan = PLAN_CONFIG[org.plan] || PLAN_CONFIG.PRO;

            return (
              <div className="org-card" key={org.id}>
                {/* Header */}
                <div className="org-card-header">
                  <div className="org-avatar" style={{ background: plan.bg, color: plan.color, borderColor: plan.border }}>
                    {org.name?.charAt(0).toUpperCase() || 'O'}
                  </div>
                  <div className="org-header-text">
                    <h3 className="org-name" title={org.name}>{org.name}</h3>
                    <span className="org-code">{org.code}</span>
                  </div>
                  <div className="org-badges">
                    <span className={`plan-pill plan-${org.plan?.toLowerCase() || 'pro'}`}>
                      {org.plan || 'PRO'}
                    </span>
                    <span className={`status-pill status-${org.status?.toLowerCase() || 'active'}`}>
                      <span className="status-indicator-dot" />
                      {org.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                {/* Stats Strip */}
                <div className="org-stats-strip">
                  <div className="org-stat-col">
                    <span className="org-stat-num">{org.total_customers || org.customer_count || 0}</span>
                    <span className="org-stat-lbl">Borrowers</span>
                  </div>
                  <div className="org-stat-divider" />
                  <div className="org-stat-col">
                    <span className="org-stat-num">{org.branch_count || 1}</span>
                    <span className="org-stat-lbl">Branches</span>
                  </div>
                  <div className="org-stat-divider" />
                  <div className="org-stat-col">
                    <span className="org-stat-num">{formatCurrency(org.active_portfolio || 0)}</span>
                    <span className="org-stat-lbl">Portfolio</span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="org-meta-list">
                  <div className="org-meta-item">
                    <Users size={14} className="meta-icon" />
                    <span>Admin: <strong>{org.admin_name || 'Branch Admin'}</strong></span>
                  </div>
                  {(org.admin_phone || org.phone) && (
                    <div className="org-meta-item">
                      <Phone size={14} className="meta-icon" />
                      <span>{org.admin_phone || org.phone}</span>
                    </div>
                  )}
                  {org.city && (
                    <div className="org-meta-item">
                      <MapPin size={14} className="meta-icon" />
                      <span>{org.city}, {org.state || 'Tamil Nadu'}</span>
                    </div>
                  )}
                  <div className="org-meta-item">
                    <Calendar size={14} className="meta-icon" />
                    <span>Registered: {org.created_at ? new Date(org.created_at).toLocaleDateString('en-GB') : '10/01/2026'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="org-card-actions">
                  <button
                    type="button"
                    className="btn-card-edit"
                    title="Edit Organization Details"
                    onClick={() => openEditModal(org)}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-card-power ${org.status === 'ACTIVE' ? 'power-suspend' : 'power-activate'}`}
                    title={org.status === 'ACTIVE' ? 'Suspend Organization' : 'Activate Organization'}
                    onClick={() => handleToggleStatus(org)}
                  >
                    <Power size={14} />
                    <span>{org.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-card-workspace"
                    onClick={() => handleManageOrg(org)}
                  >
                    <Briefcase size={14} />
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Edit Organization Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Organization: ${editFormData.name}`}
        >
          <form onSubmit={handleSaveEdit} className="sa-modal-form">
            {editErrors.form && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{editErrors.form}</span>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Building size={14} />
                <span>Organization Name *</span>
              </label>
              <input
                type="text"
                className={`modal-form-input ${editErrors.name ? 'input-error' : ''}`}
                value={editFormData.name}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, name: e.target.value });
                  if (editErrors.name) setEditErrors({ ...editErrors, name: null });
                }}
                required
              />
              {editErrors.name && <span className="field-error-text">{editErrors.name}</span>}
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Users size={14} />
                  <span>Admin Name *</span>
                </label>
                <input
                  type="text"
                  className={`modal-form-input ${editErrors.admin_name ? 'input-error' : ''}`}
                  value={editFormData.admin_name}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, admin_name: e.target.value });
                    if (editErrors.admin_name) setEditErrors({ ...editErrors, admin_name: null });
                  }}
                  required
                />
                {editErrors.admin_name && <span className="field-error-text">{editErrors.admin_name}</span>}
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Phone size={14} />
                  <span>Admin Phone *</span>
                </label>
                <input
                  type="text"
                  className={`modal-form-input ${editErrors.admin_phone ? 'input-error' : ''}`}
                  value={editFormData.admin_phone}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, admin_phone: e.target.value });
                    if (editErrors.admin_phone) setEditErrors({ ...editErrors, admin_phone: null });
                  }}
                  required
                />
                {editErrors.admin_phone && <span className="field-error-text">{editErrors.admin_phone}</span>}
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Plan Tier</label>
                <select
                  className="modal-form-select"
                  value={editFormData.plan}
                  onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
                >
                  <option value="PRO">PRO</option>
                  <option value="STARTER">STARTER</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Status</label>
                <select
                  className="modal-form-select"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="btn-modal-primary"
              >
                <Save size={15} />
                <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Embedded Component Styles */}
      <style>{`
        .sa-dash-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: #0f172a;
          font-family: inherit;
        }

        .sa-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .sa-main-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }

        .sa-badge-count {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1976d2;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
        }

        .sa-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-refresh-data {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh-data:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1976d2;
          border-color: #93c5fd;
        }

        .btn-refresh-data.is-spinning svg {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-create-org {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #1976d2;
          color: #ffffff;
          border: none;
          padding: 0.65rem 1.15rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
          transition: all 0.2s ease;
        }

        .btn-create-org:hover {
          background: #1565c0;
          box-shadow: 0 4px 10px rgba(25, 118, 210, 0.35);
          transform: translateY(-1px);
        }

        .feedback-banner-success {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* KPI Cards */
        .sa-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .sa-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .sa-kpi-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .kpi-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .kpi-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-blue { background: #eff6ff; color: #1976d2; }
        .icon-green { background: #ecfdf5; color: #059669; }
        .icon-amber { background: #fffbeb; color: #d97706; }
        .icon-purple { background: #f5f3ff; color: #7c3aed; }

        .kpi-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0.45rem 0 0.35rem 0;
          letter-spacing: -0.02em;
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .dot-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #059669;
          box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
        }

        .highlight-green {
          color: #059669;
          font-weight: 700;
        }

        /* Toolbar */
        .sa-toolbar {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .sa-search-box {
          flex: 1;
          min-width: 280px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .sa-search-box .search-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
          pointer-events: none;
        }

        .sa-search-box input {
          width: 100%;
          padding: 0.65rem 2.2rem 0.65rem 2.4rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .sa-search-box input:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
        }

        .clear-search-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sa-filter-chips {
          display: flex;
          gap: 0.5rem;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-chip.active {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1976d2;
          font-weight: 700;
        }

        .chip-count {
          background: #f1f5f9;
          padding: 0.1rem 0.45rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        /* Grid */
        .sa-org-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.25rem;
        }

        .org-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .org-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .org-card-header {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .org-avatar {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          border: 1px solid;
          flex-shrink: 0;
        }

        .org-header-text {
          flex: 1;
          min-width: 0;
        }

        .org-name {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .org-code {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .org-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.35rem;
        }

        .plan-pill {
          display: inline-block;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .plan-enterprise { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .plan-pro { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .plan-starter { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-active { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .status-suspended { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        .status-indicator-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .org-stats-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.65rem 0.85rem;
        }

        .org-stat-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .org-stat-num {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
        }

        .org-stat-lbl {
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .org-stat-divider {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
        }

        .org-meta-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .org-meta-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.8rem;
          color: #475569;
        }

        .meta-icon {
          color: #64748b;
          flex-shrink: 0;
        }

        .org-card-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .btn-card-edit, .btn-card-power {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.65rem;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-card-edit:hover {
          border-color: #1976d2;
          color: #1976d2;
          background: #eff6ff;
        }

        .power-suspend:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }

        .power-activate:hover {
          border-color: #059669;
          color: #059669;
          background: #ecfdf5;
        }

        .btn-card-workspace {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          border: none;
          background: #1976d2;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-card-workspace:hover {
          background: #1565c0;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0.5rem 0 0 0;
        }

        .empty-state p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
        }

        /* Modal */
        .sa-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .modal-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .modal-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .modal-form-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
        }

        .modal-form-input, .modal-form-select {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .modal-form-input:focus, .modal-form-select:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
        }

        .input-error {
          border-color: #ef4444 !important;
        }

        .field-error-text {
          font-size: 0.75rem;
          color: #ef4444;
          font-weight: 600;
        }

        .modal-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.85rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn-modal-secondary {
          padding: 0.55rem 1.1rem;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-modal-secondary:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .btn-modal-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.25rem;
          border-radius: 6px;
          border: none;
          background: #1976d2;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-modal-primary:hover:not(:disabled) {
          background: #1565c0;
        }

        .btn-modal-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Skeleton Styles */
        .skeleton-bar {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-circle {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 50%;
          animation: shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        .skeleton-pill {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 9999px;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1024px) {
          .sa-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .sa-kpi-grid {
            grid-template-columns: 1fr;
          }
          .sa-org-grid {
            grid-template-columns: 1fr;
          }
          .modal-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;
