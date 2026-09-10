import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
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
} from 'lucide-react';

export const AdminProfile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', assigned_route: '' });
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await api.getAdminProfile();
        setProfile(p);
        setEditForm({
          name: p.name,
          phone: p.phone,
          email: p.email,
          assigned_route: p.assigned_route,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateAdminProfile(editForm);
      setProfile({ ...updated });
      updateProfile({ name: editForm.name, email: editForm.email, phone: editForm.phone });
      setEditModal(false);
      setToastMsg('Profile details successfully updated!');
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  if (loading || !profile) return <div className="page-loading">Loading Profile...</div>;

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">OFFICER CREDENTIALS</div>
          <h1 className="page-title">Admin Profile & Field Credentials</h1>
          <p className="page-subtitle">
            Operating credentials, assigned route territory, and field compliance record.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setEditModal(true)}>
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {toastMsg && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} color="var(--emerald)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Officer Profile Card */}
      <div className="card profile-hero-card">
        <div className="hero-profile-top">
          <div className="avatar-big">
            {profile.name.charAt(0)}
          </div>

          <div className="hero-details">
            <div className="role-badge-row">
              <span className="role-tag-pill">{profile.role_tag}</span>
              <span className="status-pill active-pill">
                <span className="dot" /> ACTIVE STATUS
              </span>
            </div>
            <h2 className="hero-name">{profile.name}</h2>
            <div className="hero-org">
              <Building size={14} color="var(--primary)" />
              <span>{profile.organization} • {profile.branch}</span>
            </div>
          </div>
        </div>

        {/* 4 Stats Highlights Strip */}
        <div className="stats-strip">
          <div className="strip-col">
            <span className="strip-lbl">Today's Collections</span>
            <span className="strip-val green">{formatCurrency(profile.today_collections)}</span>
          </div>
          <div className="strip-col">
            <span className="strip-lbl">Lifetime Recoveries</span>
            <span className="strip-val">{formatCurrency(profile.lifetime_collections)}</span>
          </div>
          <div className="strip-col">
            <span className="strip-lbl">Assigned Borrowers</span>
            <span className="strip-val purple">{profile.active_borrowers_assigned} Clients</span>
          </div>
          <div className="strip-col">
            <span className="strip-lbl">Audit Score</span>
            <span className="strip-val">{profile.compliance_score}% Verified</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Field Identification & Operational Permissions */}
      <div className="profile-grid">
        {/* Left: Contact & Territory Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={18} color="var(--primary)" />
              Field Officer Credentials
            </h3>
            <span className="badge badge-secondary">{profile.employee_id}</span>
          </div>

          <div className="credentials-list">
            <div className="cred-row">
              <span className="cred-lbl"><Phone size={14} /> Mobile Phone:</span>
              <span className="cred-val">{profile.phone}</span>
            </div>
            <div className="cred-row">
              <span className="cred-lbl"><Mail size={14} /> Official Email:</span>
              <span className="cred-val">{profile.email}</span>
            </div>
            <div className="cred-row">
              <span className="cred-lbl"><MapPin size={14} /> Assigned Field Route:</span>
              <span className="cred-val">{profile.assigned_route}</span>
            </div>
            <div className="cred-row">
              <span className="cred-lbl"><Building size={14} /> Operating Branch:</span>
              <span className="cred-val">{profile.branch}</span>
            </div>
            <div className="cred-row">
              <span className="cred-lbl"><Calendar size={14} /> Commission Date:</span>
              <span className="cred-val">{profile.joined_date}</span>
            </div>
            <div className="cred-row">
              <span className="cred-lbl"><ShieldCheck size={14} /> Security Level:</span>
              <span className="cred-val" style={{ color: 'var(--emerald)' }}>Branch Operations (Level 2)</span>
            </div>
          </div>
        </div>

        {/* Right: Delegated Privileges & System Scope */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Award size={18} color="var(--emerald)" />
              Operational Privileges & Scope
            </h3>
            <span className="badge badge-emerald">Enforced</span>
          </div>

          <div className="permissions-list">
            {profile.permissions?.map((perm, idx) => (
              <div key={idx} className="perm-item">
                <CheckCircle2 size={16} color="var(--emerald)" />
                <span>{perm}</span>
              </div>
            ))}
          </div>

          <div className="logout-box">
            <button className="btn btn-danger" onClick={logout} style={{ width: '100%' }}>
              <LogOut size={16} />
              <span>Log Out of Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Admin Profile"
        subtitle="Update officer contact details and assigned field route"
        maxWidth="500px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
            <button className="btn btn-emerald" onClick={handleEditSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Email</label>
            <input
              type="email"
              className="form-input"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Route / Territory</label>
            <input
              type="text"
              className="form-input"
              value={editForm.assigned_route}
              onChange={(e) => setEditForm({ ...editForm, assigned_route: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      <style>{`
        .profile-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feedback-toast {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.85rem;
        }

        .profile-hero-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .hero-profile-top {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .avatar-big {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 2rem;
          color: white;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
        }

        .hero-details {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .role-badge-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .role-tag-pill {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
        }

        .active-pill {
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
        }

        .status-pill .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--emerald);
        }

        .hero-name {
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .hero-org {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .stats-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
        }

        @media (max-width: 800px) {
          .stats-strip {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }

        .strip-col {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .strip-lbl {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .strip-val {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.2rem;
          color: var(--text-primary);
        }

        .strip-val.green { color: var(--emerald); }
        .strip-val.purple { color: #c4b5fd; }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        .credentials-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .cred-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .cred-lbl {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
        }

        .cred-val {
          font-weight: 600;
          color: var(--text-primary);
        }

        .permissions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .perm-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .logout-box {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
};
