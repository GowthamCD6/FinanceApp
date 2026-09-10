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
      setToastMsg('Admin Profile credentials updated successfully!');
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  if (loading || !profile) return <div className="page-loading">Loading Admin Profile...</div>;

  return (
    <div className="admin-profile-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="welcome-tag">STAFF CREDENTIALS & SECURITY</div>
          <h1 className="page-title">Admin Profile & Operations</h1>
          <p className="page-subtitle">
            Officer credentials, assigned territory route node, shift recovery performance, and security settings.
          </p>
        </div>

        <div className="header-actions">
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

      {/* Toast */}
      {toastMsg && (
        <div className="feedback-banner">
          <CheckCircle2 size={16} color="var(--emerald)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Profile Banner Card */}
      <div className="card" style={{ marginBottom: '1.5rem', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-gradient)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
              }}
            >
              {profile.name ? profile.name.charAt(0) : 'A'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{profile.name}</h2>
                <span className="badge badge-primary">{profile.role_title}</span>
              </div>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Staff ID: <strong>{profile.employee_id}</strong> • {profile.department}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#F8FAFC', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Shift Recovery</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald)' }}>{formatCurrency(profile.today_collections)}</div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Recovered</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(profile.lifetime_collections)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Details & Permissions */}
      <div className="grid-2">
        {/* Officer Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={18} color="var(--primary)" />
              Officer Credentials
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mobile Phone:</span>
              <strong>{profile.phone}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Official Email:</span>
              <strong>{profile.email}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Branch Node:</span>
              <strong>{profile.branch}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned Route:</span>
              <strong style={{ color: 'var(--primary)' }}>{profile.assigned_route}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
              <strong>{profile.joined_date}</strong>
            </div>
          </div>
        </div>

        {/* Security & Access Rights */}
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
              { label: 'CUSTOMER_ONBOARD', desc: 'Authorized to enroll weekly borrowers & daily shopkeepers' },
              { label: 'LOAN_DISBURSAL_REQUEST', desc: 'Issue 10-week and 25-day rapid credit facilities' },
              { label: 'PAYMENT_COLLECTION_RECEIPT', desc: 'Record Cash/UPI collections and issue verified vouchers' },
              { label: 'FIELD_ROUTE_AUDIT', desc: 'Inspect borrower credit history and repayment discipline' },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #E2E8F0',
                }}
              >
                <CheckCircle2 size={16} color="var(--emerald)" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{p.label}</strong>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Admin Officer Details"
        subtitle="Update officer contact credentials and assigned field route."
        maxWidth="500px"
      >
        <form onSubmit={handleEditSubmit}>
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

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
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
    </div>
  );
};
