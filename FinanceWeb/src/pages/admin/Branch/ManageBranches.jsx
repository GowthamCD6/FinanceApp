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
  RotateCw,
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
  const [refreshing, setRefreshing] = useState(false);
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
  const fetchBranches = useCallback(async (isManual = false) => {
    if (!currentOrgId) return;
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const data = await api.organizations.getBranches(currentOrgId);
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load branches from API:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 400);
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
      await fetchBranches(true);
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
      await fetchBranches(true);
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
      await fetchBranches(true);
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
      await fetchBranches(true);
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

  return (
    <div className="branches-container">
      {/* 1. Header */}
      <div className="branches-header-row">
        <div className="header-left">
          <div className="title-wrap">
            <h1 className="branches-main-title">Branch Network & Admin Allocation</h1>
            <span className="count-badge">
              {loading ? (
                <span className="skeleton-pill" style={{ width: 45, height: 20 }} />
              ) : (
                `${branches.length} Operating Branches`
              )}
            </span>
          </div>
          <p className="branches-sub-title">
            Manage branches, allocate dedicated Branch Admins, and enforce territory isolation for{' '}
            <strong>{activeOrg?.name || 'Your Organization'}</strong>.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className={`btn-refresh ${refreshing || loading ? 'is-spinning' : ''}`}
            onClick={() => fetchBranches(true)}
            title="Refresh Live Data"
            disabled={loading || refreshing}
          >
            <RotateCw size={16} />
          </button>

          <button
            type="button"
            className="btn-add-branch"
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

      {/* 2. Feedback Alert */}
      {feedback && (
        <div className="feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 3. Top KPI Cards */}
      <div className="branches-kpi-grid">
        <div className="branch-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Branches</span>
            <div className="kpi-icon-wrap icon-blue">
              <Building size={18} />
            </div>
          </div>
          <div className="kpi-value">{branches.length}</div>
          <div className="kpi-footer">
            <span className="dot-green" />
            <span>{branches.filter((b) => b.status === 'ACTIVE').length} Active Units</span>
          </div>
        </div>

        <div className="branch-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Registered Borrowers</span>
            <div className="kpi-icon-wrap icon-green">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalBorrowers.toLocaleString()}</div>
          <div className="kpi-footer">
            <span className="highlight-green">Across all branch territories</span>
          </div>
        </div>

        <div className="branch-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Loan Accounts</span>
            <div className="kpi-icon-wrap icon-purple">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalActiveLoans.toLocaleString()}</div>
          <div className="kpi-footer">
            <span>In active circulation</span>
          </div>
        </div>

        <div className="branch-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Field Staff & Admins</span>
            <div className="kpi-icon-wrap icon-amber">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalStaff.toLocaleString()}</div>
          <div className="kpi-footer">
            <span>Branch managers & collectors</span>
          </div>
        </div>
      </div>

      {/* 4. Toolbar: Search & Status Filters */}
      <div className="branches-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search branches by code, name, city, admin, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
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

        <div className="filter-chips">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
              disabled={loading}
            >
              {st === 'ALL' ? 'All Branches' : st.charAt(0) + st.slice(1).toLowerCase()}
              {st !== 'ALL' && (
                <span className="chip-count">
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
                <div className="skeleton-bar" style={{ width: '100%', height: 50, borderRadius: 8 }} />
              </div>
            ))}
          </>
        ) : filteredBranches.length === 0 ? (
          <div className="empty-branches-state">
            <Building size={48} color="#94a3b8" />
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
                        <span className="admin-badge-phone">📱 {adminPhone}</span>
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
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-card-power ${branch.status === 'ACTIVE' ? 'power-suspend' : 'power-activate'}`}
                    onClick={() => handleToggleStatus(branch)}
                    title={branch.status === 'ACTIVE' ? 'Deactivate Branch' : 'Activate Branch'}
                  >
                    <Power size={14} />
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
              <ShieldCheck size={18} color="#4f46e5" />
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
                  checked={addFormData.create_branch_admin}
                  onChange={(e) => setAddFormData({ ...addFormData, create_branch_admin: e.target.checked })}
                />
                <span className="checkbox-title">Provision Branch Administrator Credentials Immediately</span>
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
                      placeholder="manager@branch.in"
                    />
                  </div>
                  <div className="modal-form-group">
                    <label className="modal-form-label">
                      <Key size={14} />
                      <span>Branch Admin Password</span>
                    </label>
                    <input
                      type="text"
                      className="modal-form-input"
                      value={addFormData.manager_password}
                      onChange={(e) => setAddFormData({ ...addFormData, manager_password: e.target.value })}
                      placeholder="Admin@123"
                    />
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
                {submittingAdd ? 'Onboarding Branch...' : 'Create Branch'}
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
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <User size={14} />
                  <span>Branch Manager</span>
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
                  <span>Manager Phone</span>
                </label>
                <input
                  type="tel"
                  className="modal-form-input"
                  value={editFormData.manager_phone}
                  onChange={(e) => setEditFormData({ ...editFormData, manager_phone: e.target.value })}
                />
              </div>
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
                {submittingEdit ? 'Saving Changes...' : 'Update Branch'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageBranches;

