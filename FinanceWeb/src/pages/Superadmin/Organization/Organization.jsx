import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import { StatusBadge } from '../../../components/common/Badge';
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
} from 'lucide-react';

const PLANS = [
  { id: 'STARTER', label: 'Starter', color: 'badge-yellow', desc: 'Single branch, up to 100 borrowers' },
  { id: 'PRO', label: 'Pro', color: 'badge-purple', desc: 'Multi-branch operations with rapid collections' },
  { id: 'ENTERPRISE', label: 'Enterprise', color: 'badge-emerald', desc: 'Unlimited branches, custom limits & priority SLA' },
];

export const Organization = () => {
  const navigate = useNavigate();
  const { organizations, addOrganization, updateOrganization, updateOrgStatus, setActiveOrg } = useOrg();

  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add Org Modal State (Clean: Org Name, Admin Name, Admin Phone, Plan)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    admin_name: '',
    admin_phone: '',
    plan: 'PRO',
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

  const handleCreateOrg = (e) => {
    e.preventDefault();
    if (!validateAdd()) return;

    setSubmitting(true);
    try {
      const created = addOrganization({
        name: formData.name.trim(),
        admin_name: formData.admin_name.trim(),
        admin_phone: formData.admin_phone.trim(),
        plan: formData.plan,
        initial_capital: 500000,
        address: 'Tamil Nadu, India',
      });

      setIsAddModalOpen(false);
      setFormData({
        name: '',
        admin_name: '',
        admin_phone: '',
        plan: 'PRO',
      });
      setFeedbackMsg(`Organization "${created.name}" created successfully with initial admin ${created.admin_name}!`);
      setTimeout(() => setFeedbackMsg(''), 3500);
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
    <div className="organization-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">SUPERADMIN ORGANIZATION GOVERNANCE</div>
          <h1 className="page-title">Organizations & Branch Registry</h1>
          <p className="page-subtitle">
            Manage registered finance organizations, edit branch details, and onboard new organizations.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            Add Organization
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Organizations</span>
            <Building size={18} color="var(--accent-primary)" />
          </div>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', color: '#fff' }}>{organizations.length}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Active on platform</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Operating Branches</span>
            <Layers size={18} color="var(--purple)" />
          </div>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', color: 'var(--purple)' }}>{totalBranches}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-branch network</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Borrowers Managed</span>
            <Users size={18} color="var(--emerald)" />
          </div>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', color: 'var(--emerald)' }}>{totalBorrowers}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all branches</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Portfolio Capital</span>
            <DollarSign size={18} color="#fbbf24" />
          </div>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', color: '#fbbf24' }}>{formatCurrency(totalPortfolio)}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Circulating liquidity</span>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="table-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by organization name, code, admin name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-input"
            style={{ width: 150 }}
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="ALL">All Plans</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <select
            className="form-input"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Organizations Table UI */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization & Code</th>
                <th>Initial Admin Name</th>
                <th>Admin Phone</th>
                <th>Plan Tier</th>
                <th>Branches</th>
                <th>Borrowers</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No organizations match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{org.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{org.code}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontSize: '0.9rem' }}>
                        <User size={14} color="var(--accent-primary)" />
                        <strong>{org.admin_name || 'Branch Admin'}</strong>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Phone size={13} color="var(--text-muted)" />
                        <span>{org.admin_phone || '9876543210'}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${org.plan === 'ENTERPRISE' ? 'badge-emerald' : org.plan === 'PRO' ? 'badge-purple' : 'badge-yellow'}`}>
                        {org.plan}
                      </span>
                    </td>

                    <td>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{org.branch_count || 1}</span>
                    </td>

                    <td>
                      <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{org.total_customers || 0}</span>
                    </td>

                    <td>
                      <StatusBadge status={org.status} />
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {org.created_at || '2025-01-15'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {/* Open Branch Workspace */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', gap: '0.3rem' }}
                          title="Enter Organization Branch Dashboard"
                          onClick={() => handleLaunchWorkspace(org)}
                        >
                          <span>Open</span>
                          <ExternalLink size={13} />
                        </button>

                        {/* Edit Organization Details */}
                        <button
                          className="btn-icon"
                          title="Edit Organization Details"
                          onClick={() => openEditModal(org)}
                        >
                          <Edit2 size={15} color="var(--accent-primary)" />
                        </button>

                        {/* Status Toggle */}
                        <button
                          className="btn-icon"
                          title={org.status === 'ACTIVE' ? 'Suspend Organization' : 'Activate Organization'}
                          onClick={() => handleToggleStatus(org)}
                        >
                          <Power size={15} color={org.status === 'ACTIVE' ? 'var(--red)' : 'var(--emerald)'} />
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
      {/* 1. ADD ORGANIZATION MODAL                  */}
      {/* ========================================== */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Organization"
        >
          <form onSubmit={handleCreateOrg}>
            {errors.form && (
              <div className="feedback-banner" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'var(--red)', marginBottom: '1rem' }}>
                <AlertCircle size={16} color="var(--red)" />
                <span style={{ color: '#fca5a5' }}>{errors.form}</span>
              </div>
            )}

            {/* 1. Organization Name */}
            <div className="form-group">
              <label className="form-label">
                <Building size={14} style={{ display: 'inline', marginRight: 4 }} />
                Organization / Company Name *
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Apex MicroFinance Ltd"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                required
              />
              {errors.name && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.name}</span>}
            </div>

            {/* 2. Initial Admin User Name */}
            <div className="form-group">
              <label className="form-label">
                <User size={14} style={{ display: 'inline', marginRight: 4 }} />
                Initial Admin Name (Branch Manager) *
              </label>
              <input
                type="text"
                className={`form-input ${errors.admin_name ? 'input-error' : ''}`}
                placeholder="e.g. Rajesh Kumar"
                value={formData.admin_name}
                onChange={(e) => {
                  setFormData({ ...formData, admin_name: e.target.value });
                  if (errors.admin_name) setErrors({ ...errors, admin_name: null });
                }}
                required
              />
              {errors.admin_name && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.admin_name}</span>}
            </div>

            {/* 3. Initial Admin Phone Number */}
            <div className="form-group">
              <label className="form-label">
                <Phone size={14} style={{ display: 'inline', marginRight: 4 }} />
                Initial Admin Phone Number *
              </label>
              <input
                type="text"
                className={`form-input ${errors.admin_phone ? 'input-error' : ''}`}
                placeholder="e.g. 9876543210"
                value={formData.admin_phone}
                onChange={(e) => {
                  setFormData({ ...formData, admin_phone: e.target.value });
                  if (errors.admin_phone) setErrors({ ...errors, admin_phone: null });
                }}
                required
              />
              {errors.admin_phone && <span style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.admin_phone}</span>}
            </div>

            {/* Plan Tier Selection */}
            <div className="form-group">
              <label className="form-label">Organization Plan Tier</label>
              <select
                className="form-input"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              >
                <option value="PRO">PRO Plan (Recommended - Multi-branch)</option>
                <option value="STARTER">STARTER Plan (Single branch)</option>
                <option value="ENTERPRISE">ENTERPRISE Plan (Custom scale & API)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ minWidth: 160, justifyContent: 'center' }}
              >
                {submitting ? 'Creating Organization...' : 'Save & Onboard Org'}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 2. EDIT ORGANIZATION MODAL                 */}
      {/* ========================================== */}
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
    </div>
  );
};

// Aliases for seamless imports
export const CreateOrganization = Organization;
export default Organization;
