import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { StatCard } from '../../../components/common/StatCard';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Power,
  Edit2,
  Navigation,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle2,
  Building,
  Key,
  List,
  LayoutGrid,
  RefreshCw,
  User,
} from 'lucide-react';
import './ManageStaff.css';

export const ManageStaff = () => {
  const { activeOrg } = useOrg();
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
      const data = await api.getStaffUsers(activeOrg ? { organizationId: activeOrg.id } : {});
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
  }, [activeOrg?.id]);

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
      alert(err.message || 'Failed to update status');
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
        prev.map((s) => (s.id === editFormData.id ? { ...s, ...editFormData, assignedRoute: editFormData.assigned_route, dailyTarget: editFormData.daily_target } : s))
      );
      setIsEditModalOpen(false);
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
      await api.createUser({
        organizationId: activeOrg?.id || 1,
        name: addFormData.name.trim(),
        phone: addFormData.phone.trim(),
        email: addFormData.email.trim() || `${addFormData.phone.trim()}@staff.local`,
        password: addFormData.password || `${addFormData.phone.trim()}@123`,
        role: addFormData.role,
        assigned_route: addFormData.role === 'FIELD_AGENT' ? addFormData.assigned_route : null,
        daily_target: addFormData.role === 'FIELD_AGENT' ? parseFloat(addFormData.daily_quota || 0) : 0,
        designation: addFormData.designation || (addFormData.role === 'ADMIN' ? 'Branch Administrator' : 'Route Collector'),
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
      s.designation?.toLowerCase().includes(q);

    const matchRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'ADMIN' && (s.role === 'ADMIN' || s.roleType === 'ADMIN')) ||
      (roleFilter === 'FIELD_AGENT' && (s.role === 'FIELD_AGENT' || s.roleType === 'FIELD_AGENT'));

    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const totalCollectors = staffList.filter((s) => s.role === 'FIELD_AGENT' || s.roleType === 'FIELD_AGENT').length;
  const totalAdmins = staffList.filter((s) => s.role === 'ADMIN' || s.roleType === 'ADMIN').length;
  const totalDailyTarget = staffList.reduce((sum, s) => sum + (s.dailyTarget || 0), 0);

  return (
    <div className="manage-staff-page">
      {/* 1. Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff & Field Collectors</h1>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={loadStaff}
            title="Refresh Staff List"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>Add Staff / Collector</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. Four KPI Summary Cards with Skeleton Loading */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="card stat-card" style={{ minHeight: 120 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div className="skeleton-bar" style={{ width: '50%', height: 12 }} />
                <div className="skeleton-circle" style={{ width: 38, height: 38, borderRadius: 8 }} />
              </div>
              <div className="skeleton-bar" style={{ width: '70%', height: 28, marginBottom: '0.5rem' }} />
              <div className="skeleton-bar" style={{ width: '60%', height: 12 }} />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="TOTAL STAFF MEMBERS"
              value={staffList.length}
              icon={Users}
              trend="Registered Staff"
              trendDirection="up"
              meta="Full branch team"
              accentColor="#4F46E5"
              accentBg="#EEF2FF"
            />
            <StatCard
              label="ROUTE COLLECTORS"
              value={totalCollectors}
              icon={Briefcase}
              trend="Active in Field"
              trendDirection="up"
              meta="Territory agents"
              accentColor="#059669"
              accentBg="#ECFDF5"
            />
            <StatCard
              label="BRANCH ADMINISTRATORS"
              value={totalAdmins}
              icon={ShieldCheck}
              trend="Operations Control"
              trendDirection="up"
              meta="System managers"
              accentColor="#2563EB"
              accentBg="#EFF6FF"
            />
            <StatCard
              label="DAILY COLLECTION QUOTA"
              value={formatCurrency(totalDailyTarget)}
              icon={DollarSign}
              trend="Combined Target"
              trendDirection="up"
              meta="Across all routes"
              accentColor="#D97706"
              accentBg="#FFFBEB"
            />
          </>
        )}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="staff-toolbar">
        <div className="staff-search-wrap">
          <Search size={16} className="staff-search-icon" />
          <input
            type="text"
            className="staff-search-input"
            placeholder="Search by staff name, phone, email, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="staff-filters-group">
          <select
            className="staff-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="FIELD_AGENT">Field Collectors</option>
            <option value="ADMIN">Branch Admins</option>
          </select>

          <select
            className="staff-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Status</option>
            <option value="INACTIVE">Inactive Status</option>
          </select>

          <div className="staff-view-toggle">
            <button
              className={`staff-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`staff-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table Ledger View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Staff Content: Card View or Table View */}
      {loading ? (
        viewMode === 'table' ? (
          <div className="staff-table-container">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role & Designation</th>
                  <th>Contact Info</th>
                  <th>Assigned Territory</th>
                  <th>Daily Quota</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="staff-skeleton-row">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="skeleton-circle" style={{ width: 40, height: 40, borderRadius: 8 }} />
                        <div style={{ width: 130 }}>
                          <div className="skeleton-bar" style={{ height: 14, marginBottom: 4 }} />
                          <div className="skeleton-bar" style={{ height: 10, width: '60%' }} />
                        </div>
                      </div>
                    </td>
                    <td><div className="skeleton-bar" style={{ width: 110, height: 14 }} /></td>
                    <td><div className="skeleton-bar" style={{ width: 100, height: 14 }} /></td>
                    <td><div className="skeleton-bar" style={{ width: 120, height: 14 }} /></td>
                    <td><div className="skeleton-bar" style={{ width: 80, height: 14 }} /></td>
                    <td><div className="skeleton-pill" style={{ width: 70, height: 22 }} /></td>
                    <td style={{ textAlign: 'right' }}><div className="skeleton-bar" style={{ width: 80, height: 28, marginLeft: 'auto', borderRadius: 6 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="staff-cards-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card staff-skeleton-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="skeleton-circle" style={{ width: 44, height: 44, borderRadius: 10 }} />
                    <div style={{ width: 140 }}>
                      <div className="skeleton-bar" style={{ height: 16, marginBottom: 5 }} />
                      <div className="skeleton-bar" style={{ height: 12, width: '70%' }} />
                    </div>
                  </div>
                  <div className="skeleton-pill" style={{ width: 65, height: 22 }} />
                </div>
                <div className="skeleton-bar" style={{ height: 45, borderRadius: 8, marginBottom: '0.85rem' }} />
                <div className="skeleton-bar" style={{ height: 50, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        )
      ) : filteredStaff.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={40} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
          <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.15rem' }}>
            No staff members or collectors found
          </h3>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.875rem' }}>
            Click "Add Staff / Collector" above to onboard your branch team members.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* ========================
           TABLE LEDGER VIEW
           ======================== */
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role & Designation</th>
                <th>Contact Info</th>
                <th>Assigned Route</th>
                <th>Daily Quota</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => {
                const isAgent = staff.role === 'FIELD_AGENT' || staff.roleType === 'FIELD_AGENT';
                const initials = staff.name
                  ? staff.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                  : 'ST';

                return (
                  <tr key={staff.id}>
                    {/* Staff Member */}
                    <td>
                      <div className="staff-member-cell">
                        <div className={`staff-avatar ${isAgent ? 'avatar-agent' : 'avatar-admin'}`}>
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
                      <div>
                        <span className={`staff-role-badge ${isAgent ? 'role-agent' : 'role-admin'}`}>
                          {isAgent ? 'FIELD COLLECTOR' : 'BRANCH ADMIN'}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                          {staff.designation || (isAgent ? 'Route Collector' : 'Administrator')}
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Phone size={13} color="var(--text-muted)" />
                        <span>{staff.phone}</span>
                      </div>
                      {staff.email && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                          <Mail size={13} />
                          <span>{staff.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Assigned Route */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Navigation size={14} color="var(--primary)" />
                        <span>{staff.assignedRoute || 'General Branch Territory'}</span>
                      </div>
                    </td>

                    {/* Daily Quota */}
                    <td>
                      {isAgent ? (
                        <div style={{ fontWeight: 750, color: '#d97706' }}>
                          {formatCurrency(staff.dailyTarget || 25000)}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>N/A (Admin)</span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={staff.status || 'ACTIVE'} />
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="staff-action-cell">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(staff)}
                          title="Edit Staff Member"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          className={`btn btn-sm ${staff.status === 'ACTIVE' ? 'btn-danger' : 'btn-emerald'}`}
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
      ) : (
        /* ========================
           CARD GRID VIEW
           ======================== */
        <div className="staff-cards-grid">
          {filteredStaff.map((staff) => {
            const isAgent = staff.role === 'FIELD_AGENT' || staff.roleType === 'FIELD_AGENT';
            const initials = staff.name
              ? staff.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : 'ST';

            return (
              <div
                key={staff.id}
                className={`staff-card-item ${isAgent ? 'card-agent' : 'card-admin'}`}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`staff-avatar ${isAgent ? 'avatar-agent' : 'avatar-admin'}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="staff-name">{staff.name}</div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {staff.designation || (isAgent ? 'Route Field Collector' : 'Administrator')}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status={staff.status || 'ACTIVE'} />
                  </div>

                  {/* Role Badge */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <span className={`staff-role-badge ${isAgent ? 'role-agent' : 'role-admin'}`}>
                      {isAgent ? 'ROUTE FIELD COLLECTOR' : 'BRANCH ADMINISTRATOR'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <strong style={{ color: 'var(--text-primary)' }}>{staff.phone}</strong>
                    </div>
                    {staff.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={14} color="var(--text-muted)" />
                        <span>{staff.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Operational Route & Target Box */}
                  <div className="staff-route-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Navigation size={13} color="var(--primary)" />
                      <span>Assigned Territory Route:</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {staff.assignedRoute || 'Main Branch Route'}
                    </div>

                    {isAgent && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Daily Target:</span>
                        <strong style={{ color: '#d97706', fontSize: '0.925rem' }}>
                          {formatCurrency(staff.dailyTarget || 25000)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: 'auto' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(staff)}
                  >
                    <Edit2 size={13} />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    className={`btn btn-sm ${staff.status === 'ACTIVE' ? 'btn-danger' : 'btn-emerald'}`}
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
          title="Edit Staff Member Credentials"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="feedback-banner" style={{ background: '#FFF1F2', color: '#E11D48', borderColor: '#FDA4AF' }}>
                <span>{editError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Legal Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Mobile Phone *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">System Role</label>
                <select
                  className="form-select"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="FIELD_AGENT">Field Agent (Collector)</option>
                  <option value="ADMIN">Branch Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title / Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Route Collector"
                  value={editFormData.designation}
                  onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                />
              </div>
            </div>

            {editFormData.role === 'FIELD_AGENT' && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Assigned Route / Territory</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.assigned_route}
                    onChange={(e) => setEditFormData({ ...editFormData, assigned_route: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Target (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.daily_target}
                    onChange={(e) => setEditFormData({ ...editFormData, daily_target: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {addError && (
              <div className="feedback-banner" style={{ background: '#FFF1F2', color: '#E11D48', borderColor: '#FDA4AF' }}>
                <span>{addError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Legal Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Ramesh Kumar"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Mobile Phone *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 9876543210"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="ramesh@branch.com"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">System Role *</label>
                <select
                  className="form-select"
                  value={addFormData.role}
                  onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                >
                  <option value="FIELD_AGENT">Field Agent (Collector)</option>
                  <option value="ADMIN">Branch Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Route Field Collector"
                  value={addFormData.designation}
                  onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
                />
              </div>
            </div>

            {addFormData.role === 'FIELD_AGENT' && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Assigned Route / Territory</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. T.Nagar Commercial Node"
                    value={addFormData.assigned_route}
                    onChange={(e) => setAddFormData({ ...addFormData, assigned_route: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Collection Quota (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={addFormData.daily_quota}
                    onChange={(e) => setAddFormData({ ...addFormData, daily_quota: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Leave blank to use default (Phone@123)"
                value={addFormData.password}
                onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
              />
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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
