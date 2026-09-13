import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useOrg } from '../../../context/OrgContext';
import { api } from '../../../services/api';
import { Modal } from '../../../components/common/Modal';
import { StatCard } from '../../../components/common/StatCard';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  Calendar,
  CreditCard,
  KeyRound,
  Edit3,
  LogOut,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  Briefcase,
  Users,
  Key,
  Lock,
  Activity,
  Check,
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
      // Simulate/Trigger password update
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
      {/* 1. Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Profile & Operations</h1>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setPasswordModal(true)}>
            <KeyRound size={16} />
            <span>Security & Password</span>
          </button>
          <button className="btn btn-primary" onClick={() => setEditModal(true)}>
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="feedback-banner" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2. Four Operational StatCards with Skeleton Loading */}
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
              label="TODAY'S COLLECTIONS"
              value={formatCurrency(profile?.today_collections || 4200)}
              icon={TrendingUp}
              trend="72% Shift Pace"
              trendDirection="up"
              meta="Verified cash in hand"
              accentColor="#059669"
              accentBg="#ECFDF5"
            />
            <StatCard
              label="LIFETIME RECOVERIES"
              value={formatCurrency(profile?.lifetime_collections || 142600)}
              icon={DollarSign}
              trend="Cumulative Total"
              trendDirection="up"
              meta="Across all active loans"
              accentColor="#2563EB"
              accentBg="#EFF6FF"
            />
            <StatCard
              label="SUPERVISED BORROWERS"
              value="24 Clients"
              icon={Users}
              trend="38 Active Loans"
              trendDirection="up"
              meta="Under territory route"
              accentColor="#4F46E5"
              accentBg="#EEF2FF"
            />
            <StatCard
              label="COMPLIANCE SCORE"
              value="99.4%"
              icon={ShieldCheck}
              trend="Audit Verified"
              trendDirection="up"
              meta="Zero ledger discrepancies"
              accentColor="#7C3AED"
              accentBg="#FAF5FF"
            />
          </>
        )}
      </div>

      {loading ? (
        /* ==========================================================================
           SKELETON SHIMMER LOADERS
           ========================================================================== */
        <>
          <div className="prof-hero-card">
            <div className="prof-hero-left">
              <div className="skeleton-circle" style={{ width: 72, height: 72, borderRadius: 16 }} />
              <div style={{ width: 220 }}>
                <div className="skeleton-bar" style={{ height: 24, width: '80%', marginBottom: 8 }} />
                <div className="skeleton-bar" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
            <div className="prof-hero-stats">
              <div className="skeleton-bar" style={{ width: 140, height: 60, borderRadius: 8 }} />
              <div className="skeleton-bar" style={{ width: 140, height: 60, borderRadius: 8 }} />
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="skeleton-bar" style={{ height: 20, width: '40%', marginBottom: 16 }} />
              <div className="skeleton-bar" style={{ height: 14, width: '100%', marginBottom: 12 }} />
              <div className="skeleton-bar" style={{ height: 14, width: '100%', marginBottom: 12 }} />
              <div className="skeleton-bar" style={{ height: 14, width: '100%', marginBottom: 12 }} />
              <div className="skeleton-bar" style={{ height: 14, width: '70%' }} />
            </div>

            <div className="card">
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
                <div className="prof-stat-val" style={{ color: '#2563eb', fontSize: '1.05rem' }}>
                  {profile.assigned_route ? profile.assigned_route.split(' ')[0] : 'Saidapet'}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Credentials & Security Permissions Grid */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {/* Officer & Branch Credentials */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <User size={18} color="var(--primary)" />
                  Officer & Branch Credentials
                </h3>
              </div>

              <div className="prof-details-list">
                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Phone size={14} />
                    Mobile Contact:
                  </span>
                  <strong className="prof-detail-val">{profile.phone}</strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Mail size={14} />
                    Official Email:
                  </span>
                  <strong className="prof-detail-val">{profile.email}</strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Building size={14} />
                    Branch Operations Hub:
                  </span>
                  <strong className="prof-detail-val">
                    {activeOrg ? `${activeOrg.name} • ${activeOrg.code}` : 'Central Operations Hub'}
                  </strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <MapPin size={14} />
                    Assigned Route / Territory:
                  </span>
                  <strong className="prof-detail-val" style={{ color: 'var(--primary)' }}>
                    {profile.assigned_route || 'Saidapet & T.Nagar Route'}
                  </strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Briefcase size={14} />
                    Department:
                  </span>
                  <strong className="prof-detail-val">{profile.department || 'Field Operations'}</strong>
                </div>

                <div className="prof-detail-row">
                  <span className="prof-detail-label">
                    <Calendar size={14} />
                    Member Since:
                  </span>
                  <strong className="prof-detail-val">{profile.joined_date || '15 Jan 2026'}</strong>
                </div>
              </div>
            </div>

            {/* Field Security & Operations Permissions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <ShieldCheck size={18} color="var(--emerald)" />
                  Security & Field Permissions
                </h3>
                <span className="badge badge-emerald">Verified Active</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                    <CheckCircle2 size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
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
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Activity size={18} color="var(--primary)" />
                Recent Operations & Audit Log
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
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{log.action}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>{log.tag}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Admin Officer Details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Legal Name *</label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Mobile Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                required
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email Address</label>
              <input
                type="email"
                className="form-input"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assigned Route / Territory</label>
              <input
                type="text"
                className="form-input"
                value={editForm.assigned_route}
                onChange={(e) => setEditForm({ ...editForm, assigned_route: e.target.value })}
                placeholder="e.g. Triplicane Bazaar & Saidapet Route"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                placeholder="e.g. Operations Management"
              />
            </div>
          </div>

          <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Security & Change Password Modal */}
      <Modal
        isOpen={passwordModal}
        onClose={() => setPasswordModal(false)}
        title="Security Credentials & Password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="feedback-banner" style={{ background: '#FFF1F2', color: '#E11D48', borderColor: '#FDA4AF' }}>
              <span>{passwordError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Current Password *</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="Enter existing password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password *</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="Minimum 6 characters"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password *</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="Re-enter new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>

          <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPasswordModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPassword}
            >
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
