import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import { Modal } from '../../../components/common/Modal';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Phone,
  Mail,
  Power,
  Edit2,
  Navigation,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle2,
  Building,
  List,
  LayoutGrid,
  X,
  AlertCircle,
} from 'lucide-react';
import './ManageStaff.css';

export const ManageStaff = () => {
  const { activeOrg, branches, activeBranchId } = useOrg();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [feedback, setFeedback] = useState(null);

  // Add Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'FIELD_AGENT',
    branch_id: '',
    assigned_route: 'Saidapet Bazaar Route',
    daily_quota: 25000,
    designation: 'Route Field Collector',
    status: 'ACTIVE',
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Staff Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    phone: '',
    email: '',
    role: 'FIELD_AGENT',
    branch_id: '',
    assigned_route: '',
    daily_target: 25000,
    designation: '',
    status: 'ACTIVE',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const loadStaff = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeOrg) params.organizationId = activeOrg.id;
      if (activeBranchId && activeBranchId !== 'ALL') params.branchId = activeBranchId;
      const data = await api.getStaffUsers(params);
      setStaffList(Array.isArray(data) ? data : (data?.users || []));
    } catch (err) {
      console.error('Failed to load staff list:', err);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [activeOrg?.id, activeBranchId]);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Status toggle
  const handleStatusChange = async (userId, nextStatus, staffName) => {
    try {
      await api.updateUserStatus(userId, nextStatus);
      showFeedback(`${staffName} marked as ${nextStatus}`);
      setStaffList((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      showFeedback(`Failed to update status: ${err.message}`);
    }
  };

  // Open Edit Modal
  const openEditModal = (staff) => {
    setEditError('');
    setEditFormData({
      id: staff.id,
      name: staff.name || '',
      phone: staff.phone || '',
      email: staff.email || '',
      role: staff.roleType || staff.role || 'FIELD_AGENT',
      branch_id: staff.branchId || staff.branch_id || '',
      assigned_route: staff.assignedRoute || 'Saidapet Bazaar Route',
      daily_target: staff.dailyTarget || 25000,
      designation: staff.designation || '',
      status: staff.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editFormData.name.trim() || !editFormData.phone.trim()) {
      setEditError('Name and Phone number are required.');
      return;
    }

    setSavingEdit(true);
    try {
      await api.updateUser(editFormData.id, editFormData);
      showFeedback(`Staff member "${editFormData.name}" updated successfully!`);
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editFormData.id
            ? {
                ...s,
                ...editFormData,
                assignedRoute: editFormData.assigned_route,
                dailyTarget: editFormData.daily_target,
              }
            : s
        )
      );
      setIsEditModalOpen(false);
      await loadStaff();
    } catch (err) {
      setEditError(err.message || 'Failed to update staff member.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!addFormData.name.trim() || !addFormData.phone.trim()) {
      setAddError('Full name and mobile phone number are required.');
      return;
    }

    setSubmittingAdd(true);
    try {
      const selectedBranchId = addFormData.branch_id || (branches.length > 0 ? branches[0].id : null);
      await api.createUser({
        organizationId: activeOrg?.id || 1,
        branchId: selectedBranchId,
        name: addFormData.name.trim(),
        phone: addFormData.phone.trim(),
        email: addFormData.email.trim() || `${addFormData.phone.trim()}@staff.local`,
        password: addFormData.password || `${addFormData.phone.trim()}@123`,
        role: addFormData.role,
        assigned_route: addFormData.role === 'FIELD_AGENT' ? addFormData.assigned_route : null,
        daily_target: addFormData.role === 'FIELD_AGENT' ? parseFloat(addFormData.daily_quota || 0) : 0,
        designation:
          addFormData.designation ||
          (addFormData.role === 'BRANCH_ADMIN'
            ? 'Branch Administrator'
            : addFormData.role === 'ORG_ADMIN'
            ? 'Organization Admin'
            : 'Route Collector'),
        status: 'ACTIVE',
      });

      showFeedback(`Staff member "${addFormData.name}" created successfully!`);
      setIsAddModalOpen(false);
      setAddFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'FIELD_AGENT',
        branch_id: branches.length > 0 ? branches[0].id : '',
        assigned_route: 'Saidapet Bazaar Route',
        daily_quota: 25000,
        designation: 'Route Field Collector',
        status: 'ACTIVE',
      });
      await loadStaff();
    } catch (err) {
      setAddError(err.message || 'Failed to create staff member.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      s.name?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.assignedRoute?.toLowerCase().includes(q) ||
      s.branchName?.toLowerCase().includes(q) ||
      s.designation?.toLowerCase().includes(q);

    const sRole = (s.role || s.roleType || '').toUpperCase();
    const matchRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'FIELD_AGENT' && sRole === 'FIELD_AGENT') ||
      (roleFilter === 'BRANCH_ADMIN' && sRole === 'BRANCH_ADMIN') ||
      (roleFilter === 'ORG_ADMIN' && (sRole === 'ORG_ADMIN' || sRole === 'ADMIN'));

    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const totalCollectors = staffList.filter((s) => (s.role || s.roleType) === 'FIELD_AGENT').length;
  const totalBranchAdmins = staffList.filter((s) => (s.role || s.roleType) === 'BRANCH_ADMIN').length;
  const totalDailyTarget = staffList.reduce((sum, s) => sum + (s.dailyTarget || 0), 0);

  return (
    <div className="manage-staff-page">
      {/* 1. Header (Clean Page Title, Standard Action Button) */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">Staff & Field Collectors</h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="directory-btn-primary"
            onClick={() => {
              setAddError('');
              setIsAddModalOpen(true);
            }}
          >
            <UserPlus size={16} />
            <span>Add Staff / Collector</span>
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

      {/* 3. Top KPI Metric Cards Strip (Solid #0F172A Numbers) */}
      <div className="directory-kpi-grid">
        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">TOTAL STAFF MEMBERS</span>
            <div className="directory-kpi-icon indigo">
              <Users size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{staffList.length}</div>
          <div className="directory-kpi-desc">
            <span>Registered organization personnel</span>
          </div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">ROUTE COLLECTORS</span>
            <div className="directory-kpi-icon emerald">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{totalCollectors}</div>
          <div className="directory-kpi-desc">
            <span>Active field agents</span>
          </div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">BRANCH ADMINISTRATORS</span>
            <div className="directory-kpi-icon blue">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{totalBranchAdmins}</div>
          <div className="directory-kpi-desc">
            <span>Branch managers & officers</span>
          </div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">DAILY COLLECTION QUOTA</span>
            <div className="directory-kpi-icon amber">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{formatCurrency(totalDailyTarget)}</div>
          <div className="directory-kpi-desc">
            <span>Combined target across routes</span>
          </div>
        </div>
      </div>

      {/* 4. Controls Bar: Search, Role, Status & View Toggle */}
      <div className="directory-controls-bar">
        <div className="mc-search-wrapper">
          <Search size={16} className="mc-search-icon" />
          <input
            type="text"
            className="mc-search-input"
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        <div className="directory-filter-controls">
          <select
            className="directory-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="FIELD_AGENT">Field Collectors</option>
            <option value="BRANCH_ADMIN">Branch Admins</option>
            <option value="ORG_ADMIN">Org Admins</option>
          </select>

          <select
            className="directory-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Status</option>
            <option value="INACTIVE">Inactive Status</option>
          </select>

          <div className="directory-view-toggle">
            <button
              type="button"
              className={`directory-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`directory-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table Ledger View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Staff Content: Card View or Table View */}
      {loading ? (
        viewMode === 'table' ? (
          <div className="directory-table-card">
            <div className="directory-table-responsive">
              <table className="directory-table">
                <thead>
                  <tr>
                    <th><div className="directory-th-content">Staff Member</div></th>
                    <th><div className="directory-th-content">Role & Designation</div></th>
                    <th><div className="directory-th-content">Assigned Branch</div></th>
                    <th><div className="directory-th-content">Contact Info</div></th>
                    <th><div className="directory-th-content">Assigned Territory</div></th>
                    <th><div className="directory-th-content">Daily Quota</div></th>
                    <th><div className="directory-th-content">Status</div></th>
                    <th><div className="directory-th-content">Actions</div></th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} className="skeleton-row">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="skeleton-circle" style={{ width: 38, height: 38, borderRadius: 6 }} />
                          <div style={{ width: 130 }}>
                            <div className="skeleton-bar" style={{ height: 14, marginBottom: 4 }} />
                            <div className="skeleton-bar" style={{ height: 10, width: '60%' }} />
                          </div>
                        </div>
                      </td>
                      <td><div className="skeleton-bar" style={{ width: 110, height: 14, margin: '0 auto' }} /></td>
                      <td><div className="skeleton-bar" style={{ width: 90, height: 14, margin: '0 auto' }} /></td>
                      <td><div className="skeleton-bar" style={{ width: 100, height: 14, margin: '0 auto' }} /></td>
                      <td><div className="skeleton-bar" style={{ width: 120, height: 14, margin: '0 auto' }} /></td>
                      <td><div className="skeleton-bar" style={{ width: 80, height: 14, margin: '0 auto' }} /></td>
                      <td><div className="skeleton-pill" style={{ width: 70, height: 22, margin: '0 auto' }} /></td>
                      <td><div className="skeleton-bar" style={{ width: 80, height: 28, margin: '0 auto', borderRadius: 6 }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="staff-cards-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="staff-card-item skeleton-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="skeleton-circle" style={{ width: 42, height: 42, borderRadius: 6 }} />
                    <div style={{ width: 140 }}>
                      <div className="skeleton-bar" style={{ height: 16, marginBottom: 5 }} />
                      <div className="skeleton-bar" style={{ height: 12, width: '70%' }} />
                    </div>
                  </div>
                  <div className="skeleton-pill" style={{ width: 65, height: 22 }} />
                </div>
                <div className="skeleton-bar" style={{ height: 45, borderRadius: 6, marginBottom: '0.85rem' }} />
                <div className="skeleton-bar" style={{ height: 50, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        )
      ) : filteredStaff.length === 0 ? (
        <div className="empty-staff-state">
          <ShieldCheck size={44} color="#94a3b8" />
          <h3>No staff members or collectors found</h3>
          <p>Click "Add Staff / Collector" above to onboard your branch team members.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="directory-table-card">
          <div className="directory-table-responsive">
            <table className="directory-table">
              <thead>
                <tr>
                  <th><div className="directory-th-content">Staff Member</div></th>
                  <th><div className="directory-th-content">Role & Designation</div></th>
                  <th><div className="directory-th-content">Assigned Branch</div></th>
                  <th><div className="directory-th-content">Contact Info</div></th>
                  <th><div className="directory-th-content">Assigned Route</div></th>
                  <th><div className="directory-th-content">Daily Quota</div></th>
                  <th><div className="directory-th-content">Status</div></th>
                  <th><div className="directory-th-content">Actions</div></th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => {
                  const sRole = (staff.role || staff.roleType || '').toUpperCase();
                  const isAgent = sRole === 'FIELD_AGENT';
                  const isBranchAdmin = sRole === 'BRANCH_ADMIN';
                  const initials = staff.name
                    ? staff.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'ST';

                  return (
                    <tr key={staff.id}>
                      {/* Staff Member */}
                      <td>
                        <div className="staff-member-cell">
                          <div className={`staff-avatar ${isAgent ? 'avatar-agent' : isBranchAdmin ? 'avatar-branch' : 'avatar-admin'}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="staff-name">{staff.name}</div>
                            <div className="staff-sub">
                              <span>ID: #{staff.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Designation */}
                      <td>
                        <div style={{ textAlign: 'center' }}>
                          <span className={`staff-role-badge ${isAgent ? 'role-agent' : isBranchAdmin ? 'role-branch' : 'role-admin'}`}>
                            {isAgent ? 'FIELD COLLECTOR' : isBranchAdmin ? 'BRANCH ADMIN' : 'ORG ADMIN'}
                          </span>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                            {staff.designation || (isAgent ? 'Route Collector' : isBranchAdmin ? 'Branch Administrator' : 'Administrator')}
                          </div>
                        </div>
                      </td>

                      {/* Assigned Branch */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                          <Building size={13} color="#4f46e5" />
                          <span>{staff.branchName || staff.branch_name || 'Main Branch'}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          <Phone size={13} color="#64748b" />
                          <span>{staff.phone}</span>
                        </div>
                        {staff.email && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 2 }}>
                            <Mail size={13} />
                            <span>{staff.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Assigned Route */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 600, color: '#0f172a' }}>
                          <Navigation size={14} color="#4f46e5" />
                          <span>{staff.assignedRoute || 'General Territory'}</span>
                        </div>
                      </td>

                      {/* Daily Quota */}
                      <td style={{ textAlign: 'center' }}>
                        {isAgent ? (
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {formatCurrency(staff.dailyTarget || 25000)}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>N/A</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`staff-role-badge ${staff.status === 'ACTIVE' ? 'role-agent' : 'role-admin'}`} style={{ textTransform: 'uppercase' }}>
                          {staff.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="staff-action-cell">
                          <button
                            type="button"
                            className="btn-action-edit"
                            onClick={() => openEditModal(staff)}
                            title="Edit Staff Member"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className={`btn-action-power ${staff.status === 'ACTIVE' ? 'power-suspend' : 'power-activate'}`}
                            onClick={() =>
                              handleStatusChange(
                                staff.id,
                                staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                                staff.name
                              )
                            }
                            title={staff.status === 'ACTIVE' ? 'Deactivate staff account' : 'Activate staff account'}
                          >
                            <Power size={13} />
                            <span>{staff.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="staff-cards-grid">
          {filteredStaff.map((staff) => {
            const sRole = (staff.role || staff.roleType || '').toUpperCase();
            const isAgent = sRole === 'FIELD_AGENT';
            const isBranchAdmin = sRole === 'BRANCH_ADMIN';
            const initials = staff.name
              ? staff.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : 'ST';

            return (
              <div
                key={staff.id}
                className="staff-card-item"
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`staff-avatar ${isAgent ? 'avatar-agent' : isBranchAdmin ? 'avatar-branch' : 'avatar-admin'}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="staff-name">{staff.name}</div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {staff.designation || (isAgent ? 'Route Field Collector' : isBranchAdmin ? 'Branch Administrator' : 'Administrator')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600, marginTop: 2 }}>
                          <Building size={12} />
                          <span>{staff.branchName || staff.branch_name || 'Main Branch'}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`staff-role-badge ${staff.status === 'ACTIVE' ? 'role-agent' : 'role-admin'}`} style={{ textTransform: 'uppercase' }}>
                      {staff.status || 'ACTIVE'}
                    </span>
                  </div>

                  {/* Role Badge */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <span className={`staff-role-badge ${isAgent ? 'role-agent' : isBranchAdmin ? 'role-branch' : 'role-admin'}`}>
                      {isAgent ? 'ROUTE FIELD COLLECTOR' : isBranchAdmin ? 'BRANCH ADMINISTRATOR' : 'ORG ADMIN'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#334155', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} color="#64748b" />
                      <strong style={{ color: '#0f172a' }}>{staff.phone}</strong>
                    </div>
                    {staff.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={14} color="#64748b" />
                        <span>{staff.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Operational Route & Target Box */}
                  <div className="staff-route-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
                      <Navigation size={13} color="#4f46e5" />
                      <span>Assigned Territory Route:</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                      {staff.assignedRoute || 'Branch Operations'}
                    </div>

                    {isAgent && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        <span style={{ color: '#64748b' }}>Daily Target:</span>
                        <strong style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 800 }}>
                          {formatCurrency(staff.dailyTarget || 25000)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="staff-card-footer">
                  <button
                    type="button"
                    className="btn-action-edit"
                    onClick={() => openEditModal(staff)}
                  >
                    <Edit2 size={13} />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-action-power ${staff.status === 'ACTIVE' ? 'power-suspend' : 'power-activate'}`}
                    onClick={() =>
                      handleStatusChange(
                        staff.id,
                        staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                        staff.name
                      )
                    }
                  >
                    <Power size={13} />
                    <span>{staff.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Staff: ${editFormData.name}`}
        >
          <form onSubmit={handleEditSubmit} className="modal-form">
            {editError && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{editError}</span>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">Full Legal Name *</label>
              <input
                type="text"
                className="modal-form-input"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Mobile Phone *</label>
                <input
                  type="text"
                  className="modal-form-input"
                  required
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Email Address</label>
                <input
                  type="email"
                  className="modal-form-input"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">System Role</label>
                <select
                  className="modal-form-select"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="FIELD_AGENT">Field Agent (Collector)</option>
                  <option value="BRANCH_ADMIN">Branch Administrator (Isolated)</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Allocated Branch</label>
                <select
                  className="modal-form-select"
                  value={editFormData.branch_id || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, branch_id: e.target.value })}
                >
                  <option value="">-- Main Branch --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.branch_name} ({b.code || b.branch_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Job Title / Designation</label>
              <input
                type="text"
                className="modal-form-input"
                placeholder="e.g. Senior Route Collector"
                value={editFormData.designation}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
              />
            </div>

            {editFormData.role === 'FIELD_AGENT' && (
              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label className="modal-form-label">Assigned Route / Territory</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    value={editFormData.assigned_route}
                    onChange={(e) => setEditFormData({ ...editFormData, assigned_route: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Daily Target (₹)</label>
                  <input
                    type="number"
                    className="modal-form-input"
                    value={editFormData.daily_target}
                    onChange={(e) => setEditFormData({ ...editFormData, daily_target: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit"
                disabled={savingEdit}
              >
                {savingEdit ? 'Saving Changes...' : 'Update Staff Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Staff or Collector"
        >
          <form onSubmit={handleAddSubmit} className="modal-form">
            {addError && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{addError}</span>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">Full Legal Name *</label>
              <input
                type="text"
                className="modal-form-input"
                required
                placeholder="e.g. Ramesh Kumar"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
              />
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Mobile Phone *</label>
                <input
                  type="text"
                  className="modal-form-input"
                  required
                  placeholder="e.g. 9876543210"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Email Address</label>
                <input
                  type="email"
                  className="modal-form-input"
                  placeholder="ramesh@branch.com"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">System Role *</label>
                <select
                  className="modal-form-select"
                  value={addFormData.role}
                  onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                >
                  <option value="FIELD_AGENT">Field Agent (Collector)</option>
                  <option value="BRANCH_ADMIN">Branch Administrator (Isolated)</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Allocated Branch *</label>
                <select
                  className="modal-form-select"
                  value={addFormData.branch_id || ''}
                  onChange={(e) => setAddFormData({ ...addFormData, branch_id: e.target.value })}
                >
                  <option value="">-- Main Branch --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.branch_name} ({b.code || b.branch_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Job Title / Designation</label>
              <input
                type="text"
                className="modal-form-input"
                placeholder="e.g. Senior Route Collector"
                value={addFormData.designation}
                onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
              />
            </div>

            {addFormData.role === 'FIELD_AGENT' && (
              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label className="modal-form-label">Assigned Route / Territory</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    placeholder="e.g. T.Nagar Commercial Node"
                    value={addFormData.assigned_route}
                    onChange={(e) => setAddFormData({ ...addFormData, assigned_route: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Daily Collection Quota (₹)</label>
                  <input
                    type="number"
                    className="modal-form-input"
                    value={addFormData.daily_quota}
                    onChange={(e) => setAddFormData({ ...addFormData, daily_quota: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">Initial Password</label>
              <input
                type="password"
                className="modal-form-input"
                placeholder="Leave blank to use default (Phone@123)"
                value={addFormData.password}
                onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit"
                disabled={submittingAdd}
              >
                {submittingAdd ? 'Creating Staff Member...' : 'Confirm & Onboard'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
