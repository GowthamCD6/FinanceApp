import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
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
} from 'lucide-react';

export const ManageStaff = () => {
  const { activeOrg } = useOrg();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
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
    <div className="manage-staff-page" style={{ padding: '0 0.5rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Staff & Field Collectors
            </h1>
            {activeOrg && (
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 6,
                  background: 'rgba(79, 70, 229, 0.08)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Building size={14} />
                {activeOrg.name} ({activeOrg.code || `ORG-${activeOrg.id}`})
              </span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage branch administrators, route collectors, and operational field agents
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UserPlus size={16} />
            <span>Add Staff / Collector</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Top Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Staff Members</span>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {staffList.length}
          </h3>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Route Collectors</span>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', fontWeight: 700, color: 'var(--emerald)' }}>
            {totalCollectors}
          </h3>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Branch Administrators</span>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>
            {totalAdmins}
          </h3>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Daily Collection Quota</span>
          <h3 style={{ margin: '0.4rem 0 0 0', fontSize: '1.6rem', fontWeight: 700, color: 'var(--amber)' }}>
            {formatCurrency(totalDailyTarget)}
          </h3>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="table-controls" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by staff name, phone, email, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-input"
            style={{ width: 180 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="FIELD_AGENT">Field Collectors</option>
            <option value="ADMIN">Branch Admins</option>
          </select>

          <select
            className="form-input"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Loading Staff & Collectors...
          </div>
          <span>Retrieving staff registry</span>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No staff members or collectors found</div>
          <span style={{ fontSize: '0.85rem' }}>Click "Add Staff / Collector" to onboard your team members.</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredStaff.map((staff) => {
            const isAgent = staff.role === 'FIELD_AGENT' || staff.roleType === 'FIELD_AGENT';
            const isAdmin = staff.role === 'ADMIN' || staff.roleType === 'ADMIN';

            return (
              <div
                key={staff.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isAgent ? '4px solid var(--emerald)' : '4px solid var(--primary)',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: isAgent ? 'rgba(5, 150, 105, 0.12)' : 'rgba(79, 70, 229, 0.12)',
                          color: isAgent ? 'var(--emerald)' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        {staff.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {staff.name}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {staff.designation || (isAgent ? 'Field Collector' : 'Administrator')}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status={staff.status || 'ACTIVE'} />
                  </div>

                  {/* Role Badge */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 4,
                        background: isAgent ? 'rgba(5, 150, 105, 0.08)' : 'rgba(79, 70, 229, 0.08)',
                        color: isAgent ? 'var(--emerald)' : 'var(--primary)',
                        border: isAgent ? '1px solid rgba(5, 150, 105, 0.2)' : '1px solid rgba(79, 70, 229, 0.2)',
                      }}
                    >
                      {isAgent ? 'ROUTE FIELD COLLECTOR' : 'BRANCH ADMINISTRATOR'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
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
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '0.85rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Navigation size={13} color="var(--primary)" />
                      <span>Assigned Route / Territory:</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {staff.assignedRoute || 'Main Branch Route'}
                    </div>

                    {isAgent && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Daily Collection Target:</span>
                        <strong style={{ color: 'var(--amber)', fontSize: '0.9rem' }}>
                          {formatCurrency(staff.dailyTarget || 25000)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(staff)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Edit2 size={13} color="var(--primary)" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    title={staff.status === 'ACTIVE' ? 'Deactivate Staff' : 'Activate Staff'}
                    onClick={() =>
                      handleStatusChange(staff.id, staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', staff.name)
                    }
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Power size={13} color={staff.status === 'ACTIVE' ? 'var(--rose)' : 'var(--emerald)'} />
                    <span>{staff.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* 1. ADD NEW STAFF MODAL                     */}
      {/* ========================================== */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Staff Member / Collector"
        >
          <form onSubmit={handleAddSubmit}>
            {addError && (
              <div style={{ padding: '0.75rem', background: 'rgba(225,29,72,0.1)', color: 'var(--rose)', borderRadius: 6, marginBottom: '1rem', fontSize: '0.85rem' }}>
                {addError}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Mobile Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="10-digit mobile"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role Type</label>
                <select
                  className="form-input"
                  value={addFormData.role}
                  onChange={(e) => {
                    const r = e.target.value;
                    setAddFormData({
                      ...addFormData,
                      role: r,
                      designation: r === 'ADMIN' ? 'Branch Administrator' : 'Route Field Collector',
                    });
                  }}
                >
                  <option value="FIELD_AGENT">Route Field Collector</option>
                  <option value="ADMIN">Branch Administrator</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="staff@branch.in"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Login Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Default: phone@123"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                />
              </div>
            </div>

            {addFormData.role === 'FIELD_AGENT' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Collection Route</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Saidapet Bazaar Route"
                    value={addFormData.assigned_route}
                    onChange={(e) => setAddFormData({ ...addFormData, assigned_route: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Daily Target (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={addFormData.daily_quota}
                    onChange={(e) => setAddFormData({ ...addFormData, daily_quota: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingAdd}>
                {submittingAdd ? 'Onboarding...' : 'Onboard Staff Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 2. EDIT STAFF MODAL                        */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Staff: ${editFormData.name}`}
        >
          <form onSubmit={handleEditSubmit}>
            {editError && (
              <div style={{ padding: '0.75rem', background: 'rgba(225,29,72,0.1)', color: 'var(--rose)', borderRadius: 6, marginBottom: '1rem', fontSize: '0.85rem' }}>
                {editError}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Designation / Role Title</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.designation}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Assigned Route</label>
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
                  onChange={(e) => setEditFormData({ ...editFormData, daily_target: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageStaff;
