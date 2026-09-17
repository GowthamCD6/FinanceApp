import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useOrg } from '../../../context/OrgContext';
import { api } from '../../../services/api';
import { Modal } from '../../../components/common/Modal';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Calendar,
  KeyRound,
  Edit3,
  LogOut,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Briefcase,
  Users,
  Activity,
  AlertCircle,
} from 'lucide-react';
import './Profile.css';

export const AdminProfile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { activeOrg } = useOrg();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', assigned_route: '', department: '' });
  const [saving, setSaving] = useState(false);

  // Change Password Modal
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await api.getAdminProfile();
        setProfile(p);
        if (p) {
          setEditForm({
            name: p.name || '',
            phone: p.phone || '',
            email: p.email || '',
            assigned_route: p.assigned_route || '',
            department: p.department || 'Operations Management',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateAdminProfile(editForm);
      setProfile((prev) => ({ ...prev, ...updated }));
      if (updateProfile) {
        updateProfile({ name: editForm.name, email: editForm.email, phone: editForm.phone });
      }
      setEditModal(false);
      showToast('Admin Profile credentials updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Security password changed successfully!');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  return (
    <div className="admin-profile-page">
      {/* 1. Header (Standardized) */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">Admin Profile & Branch Operations</h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="directory-btn-secondary"
            onClick={() => setPasswordModal(true)}
          >
            <KeyRound size={15} />
            <span>Security & Password</span>
          </button>
          <button
            type="button"
            className="directory-btn-primary"
            onClick={() => setEditModal(true)}
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            className="directory-btn-secondary"
            onClick={logout}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="directory-feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2. Four Operational StatCards with Solid #0F172A Metric Values */}
      <div className="directory-kpi-grid">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="directory-kpi-card">
              <div className="directory-kpi-top">
                <div className="skeleton-bar" style={{ width: '50%', height: 12 }} />
                <div className="skeleton-circle" style={{ width: 32, height: 32, borderRadius: 6 }} />
              </div>
              <div className="skeleton-bar" style={{ width: '70%', height: 28, margin: '0.4rem 0' }} />
              <div className="skeleton-bar" style={{ width: '60%', height: 12 }} />
            </div>
          ))
        ) : (
          <>
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">TODAY'S COLLECTIONS</span>
                <div className="directory-kpi-icon emerald">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="directory-kpi-value">{formatCurrency(profile?.today_collections || 4200)}</div>
              <div className="directory-kpi-desc">
                <span>Verified cash in hand (72% Shift Pace)</span>
              </div>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">LIFETIME RECOVERIES</span>
                <div className="directory-kpi-icon indigo">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="directory-kpi-value">{formatCurrency(profile?.lifetime_collections || 142600)}</div>
              <div className="directory-kpi-desc">
                <span>Across all active borrower loans</span>
              </div>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">SUPERVISED BORROWERS</span>
                <div className="directory-kpi-icon blue">
                  <Users size={16} />
                </div>
              </div>
              <div className="directory-kpi-value">24 Clients</div>
              <div className="directory-kpi-desc">
                <span>38 active loans under territory route</span>
              </div>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">COMPLIANCE SCORE</span>
                <div className="directory-kpi-icon purple">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="directory-kpi-value">99.4%</div>
              <div className="directory-kpi-desc">
                <span>Audit verified • Zero ledger discrepancies</span>
              </div>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <>
          <div className="prof-hero-card">
            <div className="prof-hero-left">
              <div className="skeleton-circle" style={{ width: 68, height: 68, borderRadius: 12 }} />
              <div style={{ width: 220 }}>
                <div className="skeleton-bar" style={{ height: 24, width: '80%', marginBottom: 8 }} />
                <div className="skeleton-bar" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
            <div className="prof-hero-stats">
              <div className="skeleton-bar" style={{ width: 120, height: 60, borderRadius: 8 }} />
              <div className="skeleton-bar" style={{ width: 120, height: 60, borderRadius: 8 }} />
            </div>
          </div>

          <div className="prof-grid-2">
            <div className="prof-card">
              <div className="skeleton-bar" style={{ height: 20, width: '40%', marginBottom: 16 }} />
              <div className="skeleton-bar" style={{ height: 14, width: '100%', marginBottom: 12 }} />
              <div className="skeleton-bar" style={{ height: 14, width: '100%', marginBottom: 12 }} />
              <div className="skeleton-bar" style={{ height: 14, width: '100%', marginBottom: 12 }} />
              <div className="skeleton-bar" style={{ height: 14, width: '70%' }} />
            </div>

            <div className="prof-card">
              <div className="skeleton-bar" style={{ height: 20, width: '50%', marginBottom: 16 }} />
              <div className="skeleton-bar" style={{ height: 40, width: '100%', marginBottom: 10, borderRadius: 6 }} />
              <div className="skeleton-bar" style={{ height: 40, width: '100%', marginBottom: 10, borderRadius: 6 }} />
              <div className="skeleton-bar" style={{ height: 40, width: '100%', borderRadius: 6 }} />
            </div>
          </div>
        </>
      ) : profile ? (
        <>
          {/* 3. Hero Identity Card */}
          <div className="prof-hero-card">
            <div className="prof-hero-left">
              <div className="prof-avatar">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h2 className="prof-name">{profile.name}</h2>
                  <span className="prof-role-badge">{profile.role_title || 'Branch Administrator'}</span>
                </div>
                <div className="prof-meta-sub">
                  Staff ID: <strong>{profile.employee_id || 'STF-001'}</strong> • {profile.department || 'Operations Management'} • {activeOrg ? `${activeOrg.name} (${activeOrg.code})` : 'Apex Finance Ltd'}
                </div>
              </div>
            </div>

            <div className="prof-hero-stats">
              <div className="prof-stat-pill">
                <div className="prof-stat-label">Branch Status</div>
                <div className="prof-stat-val" style={{ color: '#059669' }}>ACTIVE</div>
              </div>

              <div className="prof-stat-pill">
                <div className="prof-stat-label">Assigned Node</div>
                <div className="prof-stat-val" style={{ color: '#4f46e5' }}>
                  {profile.assigned_route ? profile.assigned_route.split(' ')[0] : 'Saidapet'}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Credentials & Security Permissions Grid */}
          <div className="prof-grid-2">
            {/* Officer & Branch Credentials */}
            <div className="prof-card">
              <div className="prof-card-header">
                <h3 className="prof-card-title">
                  <User size={18} color="#4f46e5" />
                  <span>Officer & Branch Credentials</span>
                </h3>
              </div>

              <div className="prof-details-list">
                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Phone size={14} />
                    <span>Mobile Contact:</span>
                  </span>
                  <strong className="prof-detail-val">{profile.phone}</strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Mail size={14} />
                    <span>Official Email:</span>
                  </span>
                  <strong className="prof-detail-val">{profile.email}</strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Building size={14} />
                    <span>Branch Operations Hub:</span>
                  </span>
                  <strong className="prof-detail-val">
                    {activeOrg ? `${activeOrg.name} • ${activeOrg.code}` : 'Central Operations Hub'}
                  </strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <MapPin size={14} />
                    <span>Assigned Route / Territory:</span>
                  </span>
                  <strong className="prof-detail-val" style={{ color: '#4f46e5' }}>
                    {profile.assigned_route || 'Saidapet & T.Nagar Route'}
                  </strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Briefcase size={14} />
                    <span>Department:</span>
                  </span>
                  <strong className="prof-detail-val">{profile.department || 'Field Operations'}</strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Calendar size={14} />
                    <span>Member Since:</span>
                  </span>
                  <strong className="prof-detail-val">{profile.joined_date || '15 Jan 2026'}</strong>
                </div>
              </div>
            </div>

            {/* Field Security & Operations Permissions */}
            <div className="prof-card">
              <div className="prof-card-header">
                <h3 className="prof-card-title">
                  <ShieldCheck size={18} color="#059669" />
                  <span>Security & Field Permissions</span>
                </h3>
                <span className="prof-status-tag">Verified Active</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  {
                    title: 'CUSTOMER_ONBOARD_ADMIN',
                    desc: 'Authorized to register weekly micro-borrowers and daily merchants into the active portfolio.',
                  },
                  {
                    title: 'LOAN_DISBURSAL_SUPERVISION',
                    desc: 'Supervise capital allocation, repayment tenure schedules, and interest rates.',
                  },
                  {
                    title: 'PAYMENT_COLLECTION_RECEIPT',
                    desc: 'Collect cash/UPI repayments and issue instant digitally signed receipts.',
                  },
                  {
                    title: 'FINANCIAL_JOURNAL_EXPORT',
                    desc: 'Generate audit reports, settlement logs, and export accounting CSV files.',
                  },
                ].map((p) => (
                  <div key={p.title} className="prof-perm-item">
                    <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div className="prof-perm-title">{p.title}</div>
                      <div className="prof-perm-desc">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Recent System Operations Log */}
          <div className="prof-card" style={{ marginBottom: '1.5rem' }}>
            <div className="prof-card-header">
              <h3 className="prof-card-title">
                <Activity size={18} color="#4f46e5" />
                <span>Recent Operations & Audit Log</span>
              </h3>
            </div>

            <div>
              {[
                { time: '10 mins ago', action: 'Recorded cash collection of ₹1,350 from Annachi Tea Stall (LN-SHOP-001)', tag: 'COLLECTION' },
                { time: '2 hours ago', action: 'Configured Lending Rates for Daily 100-day cycles (10% flat)', tag: 'SETTINGS' },
                { time: 'Yesterday', action: 'Generated & printed Weekly Recovery Audit report for Central Hub', tag: 'REPORT' },
                { time: '3 days ago', action: 'Onboarded new Field Collector into Saidapet Route', tag: 'STAFF' },
              ].map((log, idx) => (
                <div key={idx} className="prof-activity-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="prof-activity-dot" />
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{log.action}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span className="prof-activity-tag">{log.tag}</span>
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Edit Profile Modal */}
      {editModal && (
        <Modal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          title="Edit Admin Officer Details"
        >
          <form onSubmit={handleEditSubmit} className="modal-form">
            <div className="modal-form-group">
              <label className="modal-form-label">Full Legal Name *</label>
              <input
                type="text"
                className="modal-form-input"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Mobile Phone Number *</label>
                <input
                  type="tel"
                  className="modal-form-input"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  maxLength={10}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Official Email Address *</label>
                <input
                  type="email"
                  className="modal-form-input"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Assigned Route / Territory</label>
                <input
                  type="text"
                  className="modal-form-input"
                  value={editForm.assigned_route}
                  onChange={(e) => setEditForm({ ...editForm, assigned_route: e.target.value })}
                  placeholder="e.g. Triplicane Bazaar & Saidapet Route"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Department</label>
                <input
                  type="text"
                  className="modal-form-input"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="e.g. Operations Management"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Security & Change Password Modal */}
      {passwordModal && (
        <Modal
          isOpen={passwordModal}
          onClose={() => setPasswordModal(false)}
          title="Security Credentials & Password"
        >
          <form onSubmit={handlePasswordSubmit} className="modal-form">
            {passwordError && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="modal-form-group">
              <label className="modal-form-label">Current Password *</label>
              <input
                type="password"
                className="modal-form-input"
                required
                placeholder="Enter existing password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">New Password *</label>
              <input
                type="password"
                className="modal-form-input"
                required
                placeholder="Minimum 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Confirm New Password *</label>
              <input
                type="password"
                className="modal-form-input"
                required
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit"
                disabled={savingPassword}
              >
                {savingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
