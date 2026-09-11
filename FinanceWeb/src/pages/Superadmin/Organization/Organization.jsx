import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import { Modal } from '../../../components/common/Modal';
import {
  Building,
  Plus,
  Search,
  Phone,
  User,
  ShieldCheck,
  Power,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  DollarSign,
  Users,
  Edit2,
  Save,
  X,
  CreditCard,
  MapPin,
  TrendingUp,
} from 'lucide-react';

const PLANS = [
  { id: 'STARTER', label: 'Starter', color: 'badge-starter', desc: 'Single branch, up to 100 borrowers' },
  { id: 'PRO', label: 'Pro', color: 'badge-pro', desc: 'Multi-branch operations with rapid collections' },
  { id: 'ENTERPRISE', label: 'Enterprise', color: 'badge-enterprise', desc: 'Unlimited branches, custom limits & priority SLA' },
];

export const Organization = () => {
  const navigate = useNavigate();
  const { organizations, addOrganization, updateOrganization, updateOrgStatus, setActiveOrg } = useOrg();

  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add Org Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    admin_name: '',
    admin_phone: '',
    plan: 'PRO',
    city: 'Chennai',
    state: 'Tamil Nadu',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

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

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const validateAdd = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Organization name is required';
    if (!formData.admin_name.trim()) errs.admin_name = 'Initial Admin Name is required';
    if (!formData.admin_phone.trim()) {
      errs.admin_phone = 'Admin phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.admin_phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.admin_phone = 'Please enter a valid 10-digit phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

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

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!validateAdd()) return;

    setSubmitting(true);
    try {
      const cleanCode = `ORG-${formData.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const created = await addOrganization({
        name: formData.name.trim(),
        code: cleanCode,
        admin_name: formData.admin_name.trim(),
        admin_phone: formData.admin_phone.trim(),
        plan: formData.plan,
        initial_capital: 500000,
        city: formData.city || 'Chennai',
        state: formData.state || 'Tamil Nadu',
        address: 'Tamil Nadu, India',
      });

      setIsAddModalOpen(false);
      setFormData({
        name: '',
        admin_name: '',
        admin_phone: '',
        plan: 'PRO',
        city: 'Chennai',
        state: 'Tamil Nadu',
      });
      setFeedbackMsg(`Organization "${created?.name || formData.name}" onboarded successfully!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setErrors({ form: err.message || 'Failed to create organization' });
    } finally {
      setSubmitting(false);
    }
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
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setEditErrors({ form: err.message || 'Failed to update organization' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleLaunchWorkspace = (org) => {
    setActiveOrg(org.id);
    navigate(`/org/${org.id}/dashboard`);
  };

  const handleToggleStatus = (org) => {
    const nextStatus = org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateOrgStatus(org.id, nextStatus);
    setFeedbackMsg(`Organization "${org.name}" status updated to ${nextStatus}`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const filteredOrgs = organizations.filter((org) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      org.name?.toLowerCase().includes(q) ||
      org.code?.toLowerCase().includes(q) ||
      org.admin_name?.toLowerCase().includes(q) ||
      org.admin_phone?.includes(q);

    const matchPlan = planFilter === 'ALL' || org.plan === planFilter;
    const matchStatus = statusFilter === 'ALL' || org.status === statusFilter;

    return matchSearch && matchPlan && matchStatus;
  });

  const totalBranches = organizations.reduce((sum, o) => sum + (o.branch_count || 1), 0);
  const totalBorrowers = organizations.reduce((sum, o) => sum + (o.total_customers || 0), 0);
  const totalPortfolio = organizations.reduce((sum, o) => sum + (o.active_portfolio || o.initial_capital || 0), 0);

  return (
    <div className="org-registry-container">
      {/* Page Header */}
      <div className="org-header-row">
        <div className="org-header-left">
          <div className="org-section-tag">SUPERADMIN GOVERNANCE • MULTI-TENANT</div>
          <h1 className="org-main-title">Organization & Branch Registry</h1>
          <p className="org-main-subtitle">
            Manage platform tenant organizations, multi-branch network operations, and subscription tier licenses.
          </p>
        </div>

        <button
          type="button"
          className="btn-create-org"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>Onboard Organization</span>
        </button>
      </div>

      {/* Success Alert Banner */}
      {feedbackMsg && (
        <div className="org-feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="org-kpi-grid">
        <div className="org-kpi-card">
          <div className="org-kpi-top">
            <span className="org-kpi-label">Total Organizations</span>
            <div className="org-kpi-icon icon-blue">
              <Building size={20} />
            </div>
          </div>
          <div className="org-kpi-value">{organizations.length}</div>
          <div className="org-kpi-footer">
            <span className="dot-green" />
            <span>Active Tenants Registered</span>
          </div>
        </div>

        <div className="org-kpi-card">
          <div className="org-kpi-top">
            <span className="org-kpi-label">Operating Branches</span>
            <div className="org-kpi-icon icon-purple">
              <Layers size={20} />
            </div>
          </div>
          <div className="org-kpi-value">{totalBranches}</div>
          <div className="org-kpi-footer">
            <span>Multi-Branch Field Network</span>
          </div>
        </div>

        <div className="org-kpi-card">
          <div className="org-kpi-top">
            <span className="org-kpi-label">Active Borrowers</span>
            <div className="org-kpi-icon icon-green">
              <Users size={20} />
            </div>
          </div>
          <div className="org-kpi-value">{totalBorrowers}</div>
          <div className="org-kpi-footer">
            <span className="highlight-green">Across all registered branches</span>
          </div>
        </div>

        <div className="org-kpi-card">
          <div className="org-kpi-top">
            <span className="org-kpi-label">Total Circulating Capital</span>
            <div className="org-kpi-icon icon-amber">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="org-kpi-value">{formatCurrency(totalPortfolio)}</div>
          <div className="org-kpi-footer">
            <span>Active lending liquidity</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="org-toolbar">
        <div className="org-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by organization name, code, admin name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="org-filter-group">
          <select
            className="org-select"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="ALL">All Plans</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <select
            className="org-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="org-table-card">
        <div className="org-table-wrapper">
          <table className="org-table">
            <thead>
              <tr>
                <th>ORGANIZATION & CODE</th>
                <th>BRANCH MANAGER / ADMIN</th>
                <th>CONTACT PHONE</th>
                <th>PLAN TIER</th>
                <th>BRANCHES</th>
                <th>BORROWERS</th>
                <th>STATUS</th>
                <th>REGISTERED DATE</th>
                <th className="th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-table-cell">
                    <div className="empty-state">
                      <Building size={40} color="#94a3b8" />
                      <h4>No organizations found</h4>
                      <p>Try adjusting your search query or filters.</p>
                      {(searchTerm || planFilter !== 'ALL' || statusFilter !== 'ALL') && (
                        <button
                          type="button"
                          className="btn-reset-filters"
                          onClick={() => {
                            setSearchTerm('');
                            setPlanFilter('ALL');
                            setStatusFilter('ALL');
                          }}
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="org-row">
                    {/* Organization & Code */}
                    <td>
                      <div className="org-name-cell">
                        <div className="org-avatar-badge">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="org-name-meta">
                          <span className="org-title-text">{org.name}</span>
                          <span className="org-code-sub">{org.code}</span>
                        </div>
                      </div>
                    </td>

                    {/* Admin Name */}
                    <td>
                      <div className="admin-name-cell">
                        <User size={15} className="admin-user-icon" />
                        <span>{org.admin_name || 'Branch Admin'}</span>
                      </div>
                    </td>

                    {/* Admin Phone */}
                    <td>
                      <div className="admin-phone-cell">
                        <Phone size={14} className="phone-icon" />
                        <span>{org.admin_phone || '9876543210'}</span>
                      </div>
                    </td>

                    {/* Plan Tier Badge */}
                    <td>
                      <span className={`plan-pill plan-${org.plan?.toLowerCase() || 'pro'}`}>
                        {org.plan || 'PRO'}
                      </span>
                    </td>

                    {/* Branches */}
                    <td>
                      <span className="branch-count-badge">{org.branch_count || 1}</span>
                    </td>

                    {/* Total Borrowers */}
                    <td>
                      <span className="borrower-count-badge">{org.total_customers || 0}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`status-pill status-${org.status?.toLowerCase() || 'active'}`}>
                        <span className="status-indicator-dot" />
                        {org.status || 'ACTIVE'}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td>
                      <span className="created-date-text">
                        {org.created_at ? new Date(org.created_at).toLocaleDateString('en-GB') : '10/01/2026'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="td-actions">
                      <div className="action-buttons-group">
                        {/* Open Branch Workspace */}
                        <button
                          type="button"
                          className="btn-launch-workspace"
                          title="Open Organization Branch Dashboard"
                          onClick={() => handleLaunchWorkspace(org)}
                        >
                          <span>Open</span>
                          <ExternalLink size={13} />
                        </button>

                        {/* Edit Organization */}
                        <button
                          type="button"
                          className="btn-icon-action btn-edit"
                          title="Edit Organization Details"
                          onClick={() => openEditModal(org)}
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Suspend / Activate Toggle */}
                        <button
                          type="button"
                          className={`btn-icon-action ${org.status === 'ACTIVE' ? 'btn-suspend' : 'btn-activate'}`}
                          title={org.status === 'ACTIVE' ? 'Suspend Organization' : 'Activate Organization'}
                          onClick={() => handleToggleStatus(org)}
                        >
                          <Power size={15} />
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

      {/* ======================================================== */}
      {/* 1. ONBOARD NEW ORGANIZATION MODAL                        */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Organization"
        >
          <form onSubmit={handleCreateOrg} className="org-modal-form">
            {errors.form && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Building size={14} />
                <span>Organization / Company Name *</span>
              </label>
              <input
                type="text"
                className={`modal-form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Apex MicroFinance Ltd"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                required
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <User size={14} />
                  <span>Initial Admin Name *</span>
                </label>
                <input
                  type="text"
                  className={`modal-form-input ${errors.admin_name ? 'input-error' : ''}`}
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.admin_name}
                  onChange={(e) => {
                    setFormData({ ...formData, admin_name: e.target.value });
                    if (errors.admin_name) setErrors({ ...errors, admin_name: null });
                  }}
                  required
                />
                {errors.admin_name && <span className="field-error-text">{errors.admin_name}</span>}
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Phone size={14} />
                  <span>Admin Phone Number *</span>
                </label>
                <input
                  type="text"
                  className={`modal-form-input ${errors.admin_phone ? 'input-error' : ''}`}
                  placeholder="e.g. 9876543210"
                  value={formData.admin_phone}
                  onChange={(e) => {
                    setFormData({ ...formData, admin_phone: e.target.value });
                    if (errors.admin_phone) setErrors({ ...errors, admin_phone: null });
                  }}
                  required
                />
                {errors.admin_phone && <span className="field-error-text">{errors.admin_phone}</span>}
              </div>
            </div>

            {/* Plan Tier Cards */}
            <div className="modal-form-group">
              <label className="modal-form-label">
                <Layers size={14} />
                <span>Select Subscription Plan</span>
              </label>
              <div className="plan-selection-grid">
                {PLANS.map((p) => (
                  <div
                    key={p.id}
                    className={`plan-option-card ${formData.plan === p.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, plan: p.id })}
                  >
                    <div className="plan-opt-header">
                      <span className="plan-opt-name">{p.label}</span>
                      {formData.plan === p.id && <CheckCircle2 size={16} color="#1976d2" />}
                    </div>
                    <p className="plan-opt-desc">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-modal-primary"
              >
                {submitting ? 'Onboarding...' : 'Onboard Organization'}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 2. EDIT ORGANIZATION DETAILS MODAL                       */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Organization: ${editFormData.name}`}
        >
          <form onSubmit={handleSaveEdit} className="org-modal-form">
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
                  <User size={14} />
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
        .org-registry-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: #0f172a;
          font-family: inherit;
        }

        .org-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .org-section-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: #1976d2;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .org-main-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }

        .org-main-subtitle {
          font-size: 0.88rem;
          color: #475569;
          margin: 0.35rem 0 0 0;
          max-width: 680px;
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

        .org-feedback-banner {
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
        .org-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .org-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .org-kpi-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .org-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .org-kpi-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .org-kpi-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-blue { background: #eff6ff; color: #1976d2; }
        .icon-purple { background: #f5f3ff; color: #7c3aed; }
        .icon-green { background: #ecfdf5; color: #059669; }
        .icon-amber { background: #fffbeb; color: #d97706; }

        .org-kpi-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0.4rem 0 0.35rem 0;
          letter-spacing: -0.02em;
        }

        .org-kpi-footer {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .dot-green {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #059669;
        }

        .highlight-green {
          color: #059669;
          font-weight: 600;
        }

        /* Toolbar */
        .org-toolbar {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .org-search-box {
          flex: 1;
          min-width: 280px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .org-search-box .search-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
          pointer-events: none;
        }

        .org-search-box input {
          width: 100%;
          padding: 0.6rem 2.2rem 0.6rem 2.4rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .org-search-box input:focus {
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

        .clear-search-btn:hover {
          color: #0f172a;
        }

        .org-filter-group {
          display: flex;
          gap: 0.75rem;
        }

        .org-select {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .org-select:focus {
          border-color: #1976d2;
        }

        /* Table Card */
        .org-table-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .org-table-wrapper {
          overflow-x: auto;
        }

        .org-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .org-table thead th {
          background: #f8fafc;
          padding: 0.85rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .org-table thead .th-actions {
          text-align: right;
        }

        .org-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
        }

        .org-row:hover {
          background-color: #f8fafc;
        }

        .org-row td {
          padding: 0.85rem 1rem;
          font-size: 0.875rem;
          vertical-align: middle;
        }

        .org-name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .org-avatar-badge {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #1976d2;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(25, 118, 210, 0.25);
        }

        .org-name-meta {
          display: flex;
          flex-direction: column;
        }

        .org-title-text {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.9rem;
        }

        .org-code-sub {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .admin-name-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 600;
          color: #1e293b;
        }

        .admin-user-icon {
          color: #1976d2;
          flex-shrink: 0;
        }

        .admin-phone-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #475569;
          font-size: 0.85rem;
        }

        .phone-icon {
          color: #64748b;
          flex-shrink: 0;
        }

        .plan-pill {
          display: inline-block;
          padding: 0.2rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .plan-enterprise { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .plan-pro { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .plan-starter { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }

        .branch-count-badge, .borrower-count-badge {
          display: inline-block;
          font-weight: 700;
          color: #0f172a;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-active { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .status-suspended { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        .status-indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .created-date-text {
          color: #64748b;
          font-size: 0.8rem;
        }

        .td-actions {
          text-align: right;
        }

        .action-buttons-group {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.45rem;
        }

        .btn-launch-workspace {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1976d2;
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-launch-workspace:hover {
          background: #1976d2;
          border-color: #1976d2;
          color: #ffffff;
        }

        .btn-icon-action {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-edit:hover {
          border-color: #1976d2;
          color: #1976d2;
          background: #eff6ff;
        }

        .btn-suspend:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }

        .btn-activate:hover {
          border-color: #059669;
          color: #059669;
          background: #ecfdf5;
        }

        .empty-state {
          padding: 3rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-state h4 {
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

        .btn-reset-filters {
          margin-top: 0.75rem;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.4rem 0.85rem;
          border-radius: 6px;
          cursor: pointer;
        }

        /* Modal Styles */
        .org-modal-form {
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
          padding: 0.6rem 0.85rem;
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

        .plan-selection-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .plan-option-card {
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .plan-option-card:hover {
          border-color: #93c5fd;
          background: #eff6ff;
        }

        .plan-option-card.selected {
          border-color: #1976d2;
          background: #eff6ff;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
        }

        .plan-opt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          font-size: 0.85rem;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .plan-opt-desc {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0;
          line-height: 1.3;
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

        @media (max-width: 1024px) {
          .org-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .org-kpi-grid {
            grid-template-columns: 1fr;
          }
          .modal-form-row {
            grid-template-columns: 1fr;
          }
          .plan-selection-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export const CreateOrganization = Organization;
export default Organization;
