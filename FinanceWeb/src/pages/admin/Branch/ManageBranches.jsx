import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { Modal } from '../../../components/common/Modal';
import {
  Building,
  Plus,
  Search,
  MapPin,
  Phone,
  User,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Power,
  X,
  Layers,
  ShieldCheck,
  ArrowRight,
  Key,
  Mail,
  UserCheck,
} from 'lucide-react';
import './ManageBranches.css';

export const ManageBranches = () => {
  const navigate = useNavigate();
  const { activeOrg, organizations, setActiveBranchId } = useOrg();
  const { isSuperAdmin, isOrgAdmin } = useAuth();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState(null);

  // Selected organization ID (defaults to activeOrg or first org)
  const currentOrgId = activeOrg?.id || organizations[0]?.id || 1;

  // Add Branch Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    branch_name: '',
    branch_code: '',
    location: '',
    phone: '',
    manager_name: '',
    manager_phone: '',
    create_branch_admin: false,
    manager_email: '',
    manager_password: '',
  });
  const [addErrors, setAddErrors] = useState({});
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Branch Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    branch_name: '',
    branch_code: '',
    location: '',
    phone: '',
    manager_name: '',
    manager_phone: '',
    status: 'ACTIVE',
  });
  const [editErrors, setEditErrors] = useState({});
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Allocate Branch Admin Modal State
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedBranchForAdmin, setSelectedBranchForAdmin] = useState(null);
  const [adminMode, setAdminMode] = useState('NEW'); // 'NEW' or 'EXISTING'
  const [existingStaffList, setExistingStaffList] = useState([]);
  const [allocateData, setAllocateData] = useState({
    userId: '',
    name: '',
    phone: '',
    email: '',
    password: 'Admin@123',
  });
  const [allocateErrors, setAllocateErrors] = useState({});
  const [submittingAllocate, setSubmittingAllocate] = useState(false);

  // Fetch branches from backend API
  const fetchBranches = useCallback(async () => {
    if (!currentOrgId) return;
    try {
      setLoading(true);
      const data = await api.organizations.getBranches(currentOrgId);
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load branches from API:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOrgId]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Validation
  const validateAddForm = () => {
    const errs = {};
    if (!addFormData.branch_name.trim()) errs.branch_name = 'Branch name is required';
    if (!addFormData.location.trim()) errs.location = 'Branch location/address is required';
    if (addFormData.phone && !/^[6-9]\d{9}$/.test(addFormData.phone.trim().replace(/\D/g, '').slice(-10))) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }
    if (addFormData.create_branch_admin) {
      if (!addFormData.manager_name.trim()) errs.manager_name = 'Admin name is required when provisioning login';
      if (!addFormData.manager_phone.trim()) errs.manager_phone = 'Admin phone number is required';
    }
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editFormData.branch_name.trim()) errs.branch_name = 'Branch name is required';
    if (!editFormData.location.trim()) errs.location = 'Branch location is required';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Add Branch
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    setSubmittingAdd(true);
    try {
      const generatedCode = addFormData.branch_code.trim() || `BR-${currentOrgId}-${Date.now().toString().slice(-4)}`;
      await api.organizations.createBranch(currentOrgId, {
        ...addFormData,
        branch_code: generatedCode,
      });

      setIsAddModalOpen(false);
      setAddFormData({
        branch_name: '',
        branch_code: '',
        location: '',
        phone: '',
        manager_name: '',
        manager_phone: '',
        create_branch_admin: false,
        manager_email: '',
        manager_password: '',
      });
      setFeedback(`Branch "${addFormData.branch_name}" created successfully!`);
      await fetchBranches();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setAddErrors({ form: err.message || 'Failed to create branch.' });
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (branch) => {
    setEditErrors({});
    setEditFormData({
      id: branch.id,
      branch_name: branch.branch_name || '',
      branch_code: branch.branch_code || '',
      location: branch.location || '',
      phone: branch.phone || '',
      manager_name: branch.manager_name || '',
      manager_phone: branch.manager_phone || '',
      status: branch.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Branch
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setSubmittingEdit(true);
    try {
      await api.organizations.updateBranch(currentOrgId, editFormData.id, editFormData);
      setIsEditModalOpen(false);
      setFeedback(`Branch "${editFormData.branch_name}" updated successfully!`);
      await fetchBranches();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setEditErrors({ form: err.message || 'Failed to update branch.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Open Allocate Branch Admin Modal
  const openAllocateModal = async (branch) => {
    setSelectedBranchForAdmin(branch);
    setAdminMode('NEW');
    setAllocateErrors({});
    setAllocateData({
      userId: '',
      name: branch.admin_user_name || branch.manager_name || '',
      phone: branch.admin_user_phone || branch.manager_phone || '',
      email: branch.admin_user_email || '',
      password: 'Admin@123',
    });
    setIsAllocateModalOpen(true);

    try {
      const usersData = await api.users.getAll({ organizationId: currentOrgId, scope: 'STAFF' });
      const rawUsers = usersData?.users || (Array.isArray(usersData) ? usersData : []);
      setExistingStaffList(rawUsers);
    } catch (err) {
      console.warn('Could not load staff list for allocation:', err);
    }
  };

  // Submit Allocate Branch Admin
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBranchForAdmin) return;

    if (adminMode === 'NEW') {
      if (!allocateData.name.trim() || !allocateData.phone.trim()) {
        setAllocateErrors({ form: 'Admin name and phone number are required.' });
        return;
      }
    } else if (adminMode === 'EXISTING') {
      if (!allocateData.userId) {
        setAllocateErrors({ form: 'Please select an existing staff member.' });
        return;
      }
    }

    setSubmittingAllocate(true);
    try {
      await api.organizations.assignBranchAdmin(currentOrgId, selectedBranchForAdmin.id, {
        userId: adminMode === 'EXISTING' ? allocateData.userId : null,
        name: allocateData.name,
        phone: allocateData.phone,
        email: allocateData.email,
        password: allocateData.password,
      });

      setIsAllocateModalOpen(false);
      setFeedback(`Branch Admin allocated to "${selectedBranchForAdmin.branch_name}" successfully!`);
      await fetchBranches();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setAllocateErrors({ form: err.message || 'Failed to allocate branch admin.' });
    } finally {
      setSubmittingAllocate(false);
    }
  };

  // Toggle Branch Status
  const handleToggleStatus = async (branch) => {
    const nextStatus = branch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.organizations.updateBranchStatus(currentOrgId, branch.id, nextStatus);
      setFeedback(`Branch "${branch.branch_name}" status set to ${nextStatus}!`);
      await fetchBranches();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback(`Failed to update status: ${err.message}`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Filtered branches
  const filteredBranches = branches.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.branch_name?.toLowerCase().includes(q) ||
      b.branch_code?.toLowerCase().includes(q) ||
      b.location?.toLowerCase().includes(q) ||
      b.manager_name?.toLowerCase().includes(q) ||
      b.admin_user_name?.toLowerCase().includes(q) ||
      b.phone?.includes(q);
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBorrowers = branches.reduce((sum, b) => sum + (Number(b.borrower_count) || 0), 0);
  const totalStaff = branches.reduce((sum, b) => sum + (Number(b.staff_count) || 0), 0);
  const totalActiveLoans = branches.reduce((sum, b) => sum + (Number(b.active_loans_count) || 0), 0);
  const activeBranchesCount = branches.filter((b) => b.status === 'ACTIVE').length;

  return (
    <div className="branches-page">
      {/* 1. Header (Clean Page Title, Standard Action Button) */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">Branch Network & Admin Allocation</h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="directory-btn-primary"
            onClick={() => {
              setAddErrors({});
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add New Branch</span>
          </button>
        </div>
      </div>

      {/* 2. Feedback Banner */}
      {feedback && (
        <div className="directory-feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 3. Top KPI Cards Strip (Solid #0F172A Metric Numbers) */}
      <div className="directory-kpi-grid">
        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">TOTAL BRANCHES</span>
            <div className="directory-kpi-icon indigo">
              <Building size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{branches.length}</div>
          <div className="directory-kpi-desc">
            <span>{activeBranchesCount} Active Operating Units</span>
          </div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">REGISTERED BORROWERS</span>
            <div className="directory-kpi-icon emerald">
              <Users size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{totalBorrowers.toLocaleString()}</div>
          <div className="directory-kpi-desc">
            <span>Across all branch territories</span>
          </div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">ACTIVE LOAN ACCOUNTS</span>
            <div className="directory-kpi-icon purple">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{totalActiveLoans.toLocaleString()}</div>
          <div className="directory-kpi-desc">
            <span>In active circulation</span>
          </div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">FIELD STAFF & ADMINS</span>
            <div className="directory-kpi-icon blue">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{totalStaff.toLocaleString()}</div>
          <div className="directory-kpi-desc">
            <span>Branch managers & collectors</span>
          </div>
        </div>
      </div>

      {/* 4. Controls Bar: Search & Status Filter Tabs */}
      <div className="directory-controls-bar">
        <div className="mc-search-wrapper">
          <Search size={16} className="mc-search-icon" />
          <input
            type="text"
            className="mc-search-input"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          {searchTerm && (
            <button
              type="button"
              className="mc-search-clear"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="mc-filter-pills">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              type="button"
              className={`mc-filter-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
              disabled={loading}
            >
              <span>{st === 'ALL' ? 'All Branches' : st.charAt(0) + st.slice(1).toLowerCase()}</span>
              {st !== 'ALL' && (
                <span className="mc-filter-count-badge">
                  {branches.filter((b) => b.status === st).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Branch Cards Grid */}
      <div className="branch-grid">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="branch-card skeleton-card">
                <div className="skeleton-bar" style={{ width: '60%', height: 20 }} />
                <div className="skeleton-bar" style={{ width: '40%', height: 14, margin: '8px 0' }} />
                <div className="skeleton-bar" style={{ width: '100%', height: 50, borderRadius: 6 }} />
              </div>
            ))}
          </>
        ) : filteredBranches.length === 0 ? (
          <div className="empty-branches-state">
            <Building size={44} color="#94a3b8" />
            <h3>No branches found</h3>
            <p>Onboard a new operational branch to expand your lending territory.</p>
          </div>
        ) : (
          filteredBranches.map((branch) => {
            const adminName = branch.admin_user_name || branch.manager_name;
            const adminPhone = branch.admin_user_phone || branch.manager_phone;

            return (
              <div className="branch-card" key={branch.id}>
                <div className="branch-card-header">
                  <div className="branch-avatar">
                    <Building size={20} />
                  </div>
                  <div className="branch-title-wrap">
                    <h3 className="branch-name" title={branch.branch_name}>
                      {branch.branch_name}
                    </h3>
                    <span className="branch-code-pill">{branch.branch_code}</span>
                  </div>
                  <span className={`status-pill status-${branch.status?.toLowerCase() || 'active'}`}>
                    <span className="status-indicator-dot" />
                    {branch.status || 'ACTIVE'}
                  </span>
                </div>

                {/* Branch Stats Strip */}
                <div className="branch-stats-strip">
                  <div className="stat-col">
                    <span className="stat-val">{branch.borrower_count || 0}</span>
                    <span className="stat-lbl">Borrowers</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-col">
                    <span className="stat-val">{branch.active_loans_count || 0}</span>
                    <span className="stat-lbl">Active Loans</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-col">
                    <span className="stat-val">{branch.staff_count || 0}</span>
                    <span className="stat-lbl">Staff</span>
                  </div>
                </div>

                {/* Branch Admin Dedicated Badge */}
                <div className="branch-admin-badge">
                  <div className="admin-badge-left">
                    <div className="admin-shield-icon-wrap">
                      <ShieldCheck size={16} />
                    </div>
                    <div className="admin-badge-info">
                      <span className="admin-badge-title">Allocated Branch Admin</span>
                      <span className="admin-badge-name">
                        {adminName ? adminName : <em className="unassigned-text">Unassigned</em>}
                      </span>
                      {adminPhone && (
                        <span className="admin-badge-phone">
                          <Phone size={12} className="meta-icon" />
                          <span>{adminPhone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-allocate-admin"
                    onClick={() => openAllocateModal(branch)}
                    title="Allocate or modify dedicated Branch Admin"
                  >
                    <UserCheck size={13} />
                    <span>{adminName ? 'Change' : 'Allocate'}</span>
                  </button>
                </div>

                {/* Meta Details */}
                <div className="branch-meta-list">
                  {branch.location && (
                    <div className="branch-meta-item">
                      <MapPin size={14} className="meta-icon" />
                      <span>{branch.location}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="branch-meta-item">
                      <Phone size={14} className="meta-icon" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>

                {/* Primary Action: Enter Branch Operations */}
                <button
                  type="button"
                  className="btn-card-enter"
                  onClick={() => {
                    setActiveBranchId(String(branch.id));
                    navigate(`/org/${currentOrgId}/dashboard`);
                  }}
                  title={`Enter and manage ${branch.branch_name} (${branch.branch_code})`}
                >
                  <span>Enter Branch Operations</span>
                  <ArrowRight size={14} />
                </button>

                {/* Secondary Action Buttons */}
                <div className="branch-card-actions">
                  <button
                    type="button"
                    className="btn-card-edit"
                    onClick={() => openEditModal(branch)}
                    title="Edit Branch Information"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-card-power ${branch.status === 'ACTIVE' ? 'power-suspend' : 'power-activate'}`}
                    onClick={() => handleToggleStatus(branch)}
                    title={branch.status === 'ACTIVE' ? 'Deactivate Branch' : 'Activate Branch'}
                  >
                    <Power size={13} />
                    <span>{branch.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Allocate Branch Admin Modal */}
      {isAllocateModalOpen && selectedBranchForAdmin && (
        <Modal
          isOpen={isAllocateModalOpen}
          onClose={() => setIsAllocateModalOpen(false)}
          title={`Allocate Branch Admin: ${selectedBranchForAdmin.branch_name}`}
        >
          <form onSubmit={handleAllocateSubmit} className="modal-form">
            {allocateErrors.form && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{allocateErrors.form}</span>
              </div>
            )}

            <div className="admin-allocation-notice">
              <ShieldCheck size={18} color="#4f46e5" style={{ flexShrink: 0, marginTop: 2 }} />
              <p>
                A <strong>Branch Admin</strong> is restricted to this branch only. They can manage
                assigned staff, borrowers, loans, collections, and daily passbooks for{' '}
                <strong>{selectedBranchForAdmin.branch_name}</strong>.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="tab-mode-selector">
              <button
                type="button"
                className={`tab-mode-btn ${adminMode === 'NEW' ? 'active' : ''}`}
                onClick={() => setAdminMode('NEW')}
              >
                Create New Branch Admin
              </button>
              <button
                type="button"
                className={`tab-mode-btn ${adminMode === 'EXISTING' ? 'active' : ''}`}
                onClick={() => setAdminMode('EXISTING')}
              >
                Assign Existing Staff
              </button>
            </div>

            {adminMode === 'NEW' ? (
              <>
                <div className="modal-form-group">
                  <label className="modal-form-label">
                    <User size={14} />
                    <span>Admin Full Name *</span>
                  </label>
                  <input
                    type="text"
                    className="modal-form-input"
                    value={allocateData.name}
                    onChange={(e) => setAllocateData({ ...allocateData, name: e.target.value })}
                    placeholder="e.g. Ramesh V"
                    required
                  />
                </div>

                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label className="modal-form-label">
                      <Phone size={14} />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      className="modal-form-input"
                      value={allocateData.phone}
                      onChange={(e) => setAllocateData({ ...allocateData, phone: e.target.value })}
                      placeholder="98XXXXXXXX"
                      required
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">
                      <Mail size={14} />
                      <span>Email (Optional)</span>
                    </label>
                    <input
                      type="email"
                      className="modal-form-input"
                      value={allocateData.email}
                      onChange={(e) => setAllocateData({ ...allocateData, email: e.target.value })}
                      placeholder="admin@branch.in"
                    />
                  </div>
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">
                    <Key size={14} />
                    <span>Initial Password</span>
                  </label>
                  <input
                    type="text"
                    className="modal-form-input"
                    value={allocateData.password}
                    onChange={(e) => setAllocateData({ ...allocateData, password: e.target.value })}
                    placeholder="Admin@123"
                  />
                  <span className="field-helper-text">User can use this password to sign in to their branch portal.</span>
                </div>
              </>
            ) : (
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Users size={14} />
                  <span>Select Existing Staff Member *</span>
                </label>
                <select
                  className="modal-form-input"
                  value={allocateData.userId}
                  onChange={(e) => setAllocateData({ ...allocateData, userId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Staff to Promote to Branch Admin --</option>
                  {existingStaffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.phone}) — {st.role || st.role_type || 'Staff'}
                    </option>
                  ))}
                </select>
                <span className="field-helper-text">
                  This user will be upgraded to <strong>BRANCH_ADMIN</strong> and locked to this branch.
                </span>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsAllocateModalOpen(false)}
                disabled={submittingAllocate}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit"
                disabled={submittingAllocate}
              >
                {submittingAllocate ? 'Allocating Admin...' : 'Confirm Admin Allocation'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. Add Branch Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Operational Branch"
        >
          <form onSubmit={handleAddSubmit} className="modal-form">
            {addErrors.form && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{addErrors.form}</span>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Building size={14} />
                <span>Branch Name *</span>
              </label>
              <input
                type="text"
                className={`modal-form-input ${addErrors.branch_name ? 'input-error' : ''}`}
                value={addFormData.branch_name}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, branch_name: e.target.value });
                  if (addErrors.branch_name) setAddErrors({ ...addErrors, branch_name: null });
                }}
                placeholder="e.g. Tambaram Branch Hub"
                required
              />
              {addErrors.branch_name && <span className="field-error-text">{addErrors.branch_name}</span>}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Layers size={14} />
                <span>Branch Code (Optional / Auto-Generated)</span>
              </label>
              <input
                type="text"
                className="modal-form-input"
                value={addFormData.branch_code}
                onChange={(e) => setAddFormData({ ...addFormData, branch_code: e.target.value.toUpperCase() })}
                placeholder="e.g. BR-CHE-02"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <MapPin size={14} />
                <span>Location & Address *</span>
              </label>
              <input
                type="text"
                className={`modal-form-input ${addErrors.location ? 'input-error' : ''}`}
                value={addFormData.location}
                onChange={(e) => {
                  setAddFormData({ ...addFormData, location: e.target.value });
                  if (addErrors.location) setAddErrors({ ...addErrors, location: null });
                }}
                placeholder="e.g. 45 GST Road, Tambaram, Chennai"
                required
              />
              {addErrors.location && <span className="field-error-text">{addErrors.location}</span>}
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <User size={14} />
                  <span>Branch Manager / Admin Name</span>
                </label>
                <input
                  type="text"
                  className={`modal-form-input ${addErrors.manager_name ? 'input-error' : ''}`}
                  value={addFormData.manager_name}
                  onChange={(e) => setAddFormData({ ...addFormData, manager_name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                />
                {addErrors.manager_name && <span className="field-error-text">{addErrors.manager_name}</span>}
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Phone size={14} />
                  <span>Manager Phone</span>
                </label>
                <input
                  type="tel"
                  className={`modal-form-input ${addErrors.manager_phone || addErrors.phone ? 'input-error' : ''}`}
                  value={addFormData.manager_phone}
                  onChange={(e) => {
                    setAddFormData({ ...addFormData, manager_phone: e.target.value });
                    if (addErrors.manager_phone) setAddErrors({ ...addErrors, manager_phone: null });
                  }}
                  placeholder="98XXXXXXXX"
                />
                {addErrors.manager_phone && <span className="field-error-text">{addErrors.manager_phone}</span>}
              </div>
            </div>

            {/* Quick Branch Admin Provisioning Option */}
            <div className="quick-admin-toggle-card">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  checked={addFormData.create_branch_admin}
                  onChange={(e) => setAddFormData({ ...addFormData, create_branch_admin: e.target.checked })}
                />
                <span className="checkbox-text">
                  <ShieldCheck size={16} color="#4f46e5" />
                  <span>Provision Login Credentials for Branch Admin Immediately</span>
                </span>
              </label>

              {addFormData.create_branch_admin && (
                <div className="quick-admin-fields">
                  <div className="modal-form-group">
                    <label className="modal-form-label">
                      <Mail size={14} />
                      <span>Admin Login Email (Optional)</span>
                    </label>
                    <input
                      type="email"
                      className="modal-form-input"
                      value={addFormData.manager_email}
                      onChange={(e) => setAddFormData({ ...addFormData, manager_email: e.target.value })}
                      placeholder="admin@branch.in"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">
                      <Key size={14} />
                      <span>Initial Password</span>
                    </label>
                    <input
                      type="text"
                      className="modal-form-input"
                      value={addFormData.manager_password}
                      onChange={(e) => setAddFormData({ ...addFormData, manager_password: e.target.value })}
                      placeholder="Admin@123"
                    />
                    <span className="field-helper-text">
                      Default is "Admin@123" if left empty. The admin will be prompted to reset upon first login.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsAddModalOpen(false)}
                disabled={submittingAdd}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit"
                disabled={submittingAdd}
              >
                {submittingAdd ? 'Creating Branch...' : 'Create & Onboard Branch'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 8. Edit Branch Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Branch: ${editFormData.branch_name}`}
        >
          <form onSubmit={handleEditSubmit} className="modal-form">
            {editErrors.form && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{editErrors.form}</span>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Building size={14} />
                <span>Branch Name *</span>
              </label>
              <input
                type="text"
                className={`modal-form-input ${editErrors.branch_name ? 'input-error' : ''}`}
                value={editFormData.branch_name}
                onChange={(e) => setEditFormData({ ...editFormData, branch_name: e.target.value })}
                required
              />
              {editErrors.branch_name && <span className="field-error-text">{editErrors.branch_name}</span>}
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <Layers size={14} />
                <span>Branch Code</span>
              </label>
              <input
                type="text"
                className="modal-form-input"
                value={editFormData.branch_code}
                onChange={(e) => setEditFormData({ ...editFormData, branch_code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <MapPin size={14} />
                <span>Location & Address *</span>
              </label>
              <input
                type="text"
                className={`modal-form-input ${editErrors.location ? 'input-error' : ''}`}
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                required
              />
              {editErrors.location && <span className="field-error-text">{editErrors.location}</span>}
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <User size={14} />
                  <span>Branch Manager Name</span>
                </label>
                <input
                  type="text"
                  className="modal-form-input"
                  value={editFormData.manager_name}
                  onChange={(e) => setEditFormData({ ...editFormData, manager_name: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Phone size={14} />
                  <span>Contact Phone</span>
                </label>
                <input
                  type="tel"
                  className="modal-form-input"
                  value={editFormData.phone || editFormData.manager_phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <ShieldCheck size={14} />
                <span>Operational Status</span>
              </label>
              <select
                className="modal-form-input"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE — Full Lending Operations</option>
                <option value="INACTIVE">INACTIVE — Suspended Operations</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsEditModalOpen(false)}
                disabled={submittingEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit"
                disabled={submittingEdit}
              >
                {submittingEdit ? 'Saving Changes...' : 'Save Branch Details'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
