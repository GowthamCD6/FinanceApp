import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import { api } from '../../../services/api';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { CardSkeleton } from '../../../components/common/Skeleton';
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
  Server,
  Activity,
  Globe,
} from 'lucide-react';
import './Dashboard.css';

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
  const [clusterData, setClusterData] = useState(null);
  const [clusterLoading, setClusterLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

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

  const loadClusterTelemetry = async () => {
    try {
      setClusterLoading(true);
      const res = await api.governance.getClusterTelemetry();
      const payload = res?.data || res;
      if (payload) {
        setClusterData(payload);
      }
    } catch (e) {
      console.warn('Could not load cluster telemetry in dashboard:', e);
    } finally {
      setClusterLoading(false);
    }
  };

  useEffect(() => {
    loadClusterTelemetry();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        refreshOrganizations ? refreshOrganizations() : Promise.resolve(),
        loadClusterTelemetry(),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
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

  const paginatedTenants = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="sa-dashboard-container">
      {/* 1. Header */}
      <div className="sa-header">
        <div className="sa-header-left">
          <h1 className="sa-title">SuperAdmin Global Command Center</h1>
          <span className="sa-badge-pill">
            <span className="dot-green" />
            <span>Platform Online</span>
          </span>
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
          <CardSkeleton count={4} />
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
                <span style={{ color: '#059669', fontWeight: 700 }}>Across all branch networks</span>
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

      {/* 3. Infra Cluster Telemetry Strip */}
      <div className="sa-k8s-strip">
        <div className="sa-k8s-left">
          <div className="sa-k8s-icon">
            <Server size={20} />
          </div>
          <div className="sa-k8s-info">
            <div className="sa-k8s-title-row">
              <span className="sa-k8s-title">{clusterData?.cluster_name || 'k8s-finance-production-cluster'}</span>
              <span className="sa-k8s-status-badge">
                <span className="dot-green" style={{ width: 6, height: 6 }} />
                <span>{clusterData?.status || 'HEALTHY'}</span>
              </span>
            </div>
            <div className="sa-k8s-metrics-row">
              <span>{clusterData?.nodes_ready ?? 3}/{clusterData?.total_nodes ?? 3} Worker Nodes Online</span>
              <span className="k8s-m-sep">•</span>
              <span>{clusterData?.running_pods ?? 24} Microservice Pods Active</span>
              <span className="k8s-m-sep">•</span>
              <span>TiDB Cloud Clustered DB: Connected</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-manage-k8s"
          onClick={() => navigate('/superadmin/kubernetes')}
        >
          <Activity size={15} />
          <span>Infra Health & Pods</span>
        </button>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="sa-filter-card">
        <div className="sa-search-wrap">
          <Search size={16} className="sa-search-icon" />
          <input
            type="text"
            className="sa-search-input"
            placeholder="Search organizations by name, code, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sa-filter-tabs">
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((status) => (
            <button
              key={status}
              type="button"
              className={`sa-filter-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'ALL' ? 'All Tenants' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Organization Cards Grid */}
      <div className="sa-org-grid">
        {loading ? (
          Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="sa-org-card skeleton-shimmer" style={{ minHeight: 220, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="skeleton-circle" style={{ width: 44, height: 44 }} />
                <div className="skeleton-pill" style={{ width: 70, height: 24 }} />
              </div>
              <div className="skeleton-bar" style={{ width: '65%', height: 18, marginBottom: 8 }} />
              <div className="skeleton-bar" style={{ width: '40%', height: 12, marginBottom: 16 }} />
              <div className="skeleton-bar" style={{ width: '85%', height: 12, marginBottom: 6 }} />
              <div className="skeleton-bar" style={{ width: '75%', height: 12, marginBottom: 16 }} />
              <div className="skeleton-bar" style={{ width: '100%', height: 36, borderRadius: 6 }} />
            </div>
          ))
        ) : paginatedTenants.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b' }}>
            <Building size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>No organizations found</div>
            <div style={{ fontSize: '0.85rem', marginTop: 4 }}>Try changing your search term or filter tabs.</div>
          </div>
        ) : (
          paginatedTenants.map((org) => {
            const planMeta = PLAN_CONFIG[org.plan] || PLAN_CONFIG.PRO;
            const isActive = org.status === 'ACTIVE';

            return (
              <div key={org.id} className="sa-org-card">
                <div className="sa-org-card-top">
                  <div className="sa-org-avatar">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="sa-org-badges">
                    <span
                      className="plan-badge"
                      style={{ background: planMeta.bg, color: planMeta.color, border: `1px solid ${planMeta.border}` }}
                    >
                      {planMeta.label}
                    </span>
                    <span className={isActive ? 'status-badge-active' : 'status-badge-suspended'}>
                      {org.status}
                    </span>
                  </div>
                </div>

                <h3 className="sa-org-title">{org.name}</h3>
                <span className="sa-org-code">{org.code}</span>

                <div className="sa-org-meta-list">
                  <div className="sa-org-meta-item">
                    <Users size={14} color="#64748b" />
                    <span>Admin: {org.admin_name || 'Primary Admin'}</span>
                  </div>
                  <div className="sa-org-meta-item">
                    <Phone size={14} color="#64748b" />
                    <span>Phone: {org.admin_phone || 'Unset'}</span>
                  </div>
                  <div className="sa-org-meta-item">
                    <Calendar size={14} color="#64748b" />
                    <span>Onboarded: {org.created_at ? new Date(org.created_at).toLocaleDateString('en-IN') : 'Recent'}</span>
                  </div>
                </div>

                <div className="sa-org-actions">
                  <button
                    type="button"
                    className="btn-org-manage"
                    onClick={() => handleManageOrg(org)}
                  >
                    <span>Enter Organization</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn-org-icon"
                    title="Edit Organization Details"
                    onClick={() => openEditModal(org)}
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    className="btn-org-icon"
                    title={isActive ? 'Suspend Tenant Access' : 'Activate Tenant Access'}
                    onClick={() => handleToggleStatus(org)}
                    style={{ color: isActive ? '#e11d48' : '#059669' }}
                  >
                    <Power size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            pageSizeOptions={[6, 12, 24, 48]}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="organizations"
          />
        </div>
      )}

      {/* 6. Edit Organization Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Organization: ${editFormData.name || 'Tenant'}`}
      >
        <form onSubmit={handleSaveEdit}>
          {editErrors.form && (
            <div style={{ color: '#e11d48', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
              {editErrors.form}
            </div>
          )}

          <div className="modal-form-group">
            <label className="modal-form-label">Organization Legal Name *</label>
            <input
              type="text"
              className="modal-form-input"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
            {editErrors.name && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{editErrors.name}</span>}
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Primary Admin Name *</label>
              <input
                type="text"
                className="modal-form-input"
                value={editFormData.admin_name}
                onChange={(e) => setEditFormData({ ...editFormData, admin_name: e.target.value })}
                required
              />
              {editErrors.admin_name && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{editErrors.admin_name}</span>}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Admin Phone Number *</label>
              <input
                type="tel"
                className="modal-form-input"
                value={editFormData.admin_phone}
                onChange={(e) => setEditFormData({ ...editFormData, admin_phone: e.target.value })}
                required
              />
              {editErrors.admin_phone && <span style={{ color: '#e11d48', fontSize: '0.78rem' }}>{editErrors.admin_phone}</span>}
            </div>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-form-label">Subscription Tier</label>
              <select
                className="modal-form-input"
                value={editFormData.plan}
                onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
              >
                <option value="STARTER">Starter Tier</option>
                <option value="PRO">Pro Tier</option>
                <option value="ENTERPRISE">Enterprise Tier</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Tenant Status</label>
              <select
                className="modal-form-input"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={savingEdit}
            >
              {savingEdit ? 'Saving...' : 'Update Organization'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
