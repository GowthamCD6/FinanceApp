import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import {
  Building,
  ArrowRight,
  CheckCircle2,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
} from 'lucide-react';

const PLANS = [
  { id: 'STARTER',    label: 'Starter',    desc: 'Single branch, up to 100 customers',      color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  { id: 'PRO',        label: 'Pro',        desc: 'Multi-branch, analytics & audit trail',    color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
  { id: 'ENTERPRISE', label: 'Enterprise', desc: 'Unlimited branches, API access & priority', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
];

export const CreateOrganization = () => {
  const navigate = useNavigate();
  const { addOrganization } = useOrg();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    plan: 'PRO',
    initial_capital: '500000',
    address: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const autoCode = formData.name
    ? formData.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4) + '-01'
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.admin_name.trim() || !formData.admin_phone.trim()) return;

    setSubmitting(true);
    try {
      const org = addOrganization({
        ...formData,
        code: formData.code || autoCode,
      });
      setSuccessMsg(`Organization "${org.name}" (${org.code}) created successfully!`);
      setTimeout(() => navigate('/dashboard'), 1600);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');
  const selectedPlan = PLANS.find((p) => p.id === formData.plan) || PLANS[1];

  return (
    <div className="create-org-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">SUPERADMIN • ORGANIZATION REGISTRY</div>
          <h1 className="page-title">Register New Organization</h1>
          <p className="page-subtitle">
            Create a new finance branch with initial capital allocation and assign its first admin.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="feedback-banner">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="create-grid">
        {/* Registration Form */}
        <div className="card form-card">
          <div className="card-header">
            <h3 className="card-title">
              <Building size={20} color="var(--emerald)" />
              Organization Details
            </h3>
            <span className="badge badge-emerald">New Registration</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Plan Tier Selector */}
            <div className="form-group">
              <label className="form-label">Plan Tier *</label>
              <div className="plan-grid">
                {PLANS.map((p) => (
                  <div
                    key={p.id}
                    className={`plan-box ${formData.plan === p.id ? 'active' : ''}`}
                    style={formData.plan === p.id ? { borderColor: p.border, background: p.bg } : {}}
                    onClick={() => setFormData({ ...formData, plan: p.id })}
                  >
                    <div className="plan-header">
                      <span className="plan-title" style={formData.plan === p.id ? { color: p.color } : {}}>{p.label}</span>
                      {formData.plan === p.id && <CheckCircle2 size={15} color={p.color} />}
                    </div>
                    <span className="plan-desc">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Org Name & Code */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Organization Name *</label>
                <div className="input-with-icon">
                  <Building size={15} className="input-icon" />
                  <input
                    type="text"
                    className="form-input has-icon"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex MicroFinance Hub"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Organization Code</label>
                <div className="input-with-icon">
                  <Shield size={15} className="input-icon" />
                  <input
                    type="text"
                    className="form-input has-icon"
                    value={formData.code || autoCode}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Auto-generated"
                  />
                </div>
              </div>
            </div>

            {/* Capital & Address */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Initial Capital (₹ INR) *</label>
                <div className="input-with-icon">
                  <DollarSign size={15} className="input-icon" />
                  <input
                    type="number"
                    className="form-input has-icon"
                    value={formData.initial_capital}
                    onChange={(e) => setFormData({ ...formData, initial_capital: e.target.value })}
                    placeholder="500000"
                    min="50000"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Branch Address</label>
                <div className="input-with-icon">
                  <MapPin size={15} className="input-icon" />
                  <input
                    type="text"
                    className="form-input has-icon"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 14 Financial District, Chennai"
                  />
                </div>
              </div>
            </div>

            {/* Admin Section Header */}
            <div className="section-divider">
              <User size={14} color="var(--text-muted)" />
              <span>Initial Branch Admin</span>
            </div>

            {/* Admin Name & Phone */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Admin Full Name *</label>
                <div className="input-with-icon">
                  <User size={15} className="input-icon" />
                  <input
                    type="text"
                    className="form-input has-icon"
                    value={formData.admin_name}
                    onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Phone *</label>
                <div className="input-with-icon">
                  <Phone size={15} className="input-icon" />
                  <input
                    type="tel"
                    className="form-input has-icon"
                    value={formData.admin_phone}
                    onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    required
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Admin Email */}
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <div className="input-with-icon">
                <Mail size={15} className="input-icon" />
                <input
                  type="email"
                  className="form-input has-icon"
                  value={formData.admin_email}
                  onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                  placeholder="e.g. admin@organization.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-emerald btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={submitting || !formData.name.trim() || !formData.admin_name.trim()}
            >
              {submitting ? 'Registering...' : 'Register Organization & Assign Admin'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="card preview-card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={20} color="var(--primary)" />
              Registration Preview
            </h3>
          </div>

          <div className="preview-body">
            <div className="preview-avatar" style={{ background: selectedPlan.bg, color: selectedPlan.color, borderColor: selectedPlan.border }}>
              {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
            </div>

            <h3 className="preview-name">{formData.name || 'Organization Name'}</h3>
            <span className="preview-code">{formData.code || autoCode || 'ORG-CODE'}</span>

            <div className="preview-plan-badge" style={{ background: selectedPlan.bg, color: selectedPlan.color, borderColor: selectedPlan.border }}>
              {selectedPlan.label} Plan
            </div>

            <div className="preview-capital-box">
              <span className="pc-sub">Initial Capital Allocation</span>
              <div className="pc-amt">{formatCurrency(formData.initial_capital || 0)}</div>
              <span className="pc-note">Available for lending operations</span>
            </div>

            <div className="preview-meta-list">
              <div className="pm-row">
                <span>Branch Admin:</span>
                <strong>{formData.admin_name || '—'}</strong>
              </div>
              <div className="pm-row">
                <span>Phone:</span>
                <strong>{formData.admin_phone || '—'}</strong>
              </div>
              {formData.admin_email && (
                <div className="pm-row">
                  <span>Email:</span>
                  <strong>{formData.admin_email}</strong>
                </div>
              )}
              {formData.address && (
                <div className="pm-row">
                  <span>Location:</span>
                  <strong>{formData.address}</strong>
                </div>
              )}
              <div className="pm-row">
                <span>Status:</span>
                <span className="badge badge-emerald">ACTIVE UPON CREATION</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .create-org-page { display: flex; flex-direction: column; gap: 1.5rem; }

        .create-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; }
        @media (max-width: 960px) { .create-grid { grid-template-columns: 1fr; } }

        .plan-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; }
        @media (max-width: 600px) { .plan-grid { grid-template-columns: 1fr; } }

        .plan-box {
          background: #FFFFFF; border: 1px solid var(--border-color);
          border-radius: var(--radius-md); padding: 0.75rem 0.85rem;
          cursor: pointer; transition: all var(--transition-fast);
          display: flex; flex-direction: column; gap: 0.2rem;
        }
        .plan-box:hover { background: #F8FAFC; border-color: var(--border-hover); }
        .plan-header { display: flex; align-items: center; justify-content: space-between; }
        .plan-title { font-weight: 700; font-size: 0.85rem; color: var(--text-primary); }
        .plan-desc { font-size: 0.7rem; color: var(--text-secondary); }

        .section-divider {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 0; margin: 0.5rem 0;
          border-top: 1px solid var(--border-color);
          font-size: 0.72rem; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .form-row-2 { grid-template-columns: 1fr; } }

        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; }
        .form-input.has-icon { padding-left: 2.3rem; }

        .preview-body { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem 0; }
        .preview-avatar {
          width: 58px; height: 58px; border-radius: 50%; border: 2px solid;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.5rem; margin-bottom: 0.75rem;
        }
        .preview-name { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
        .preview-code { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem; font-weight: 600; letter-spacing: 0.05em; }
        .preview-plan-badge {
          margin-top: 0.5rem; padding: 0.25rem 0.75rem; border-radius: var(--radius-full);
          font-size: 0.72rem; font-weight: 700; border: 1px solid;
          text-transform: uppercase; letter-spacing: 0.04em;
        }

        .preview-capital-box {
          margin: 1.25rem 0; width: 100%;
          background: linear-gradient(135deg, #ECFDF5 0%, #EEF2FF 100%);
          border: 1px solid #A7F3D0; border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .pc-sub { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; }
        .pc-amt { font-size: 2.2rem; font-weight: 800; color: var(--emerald); margin: 0.2rem 0; letter-spacing: -0.02em; }
        .pc-note { font-size: 0.75rem; color: #047857; font-weight: 600; }

        .preview-meta-list {
          width: 100%; display: flex; flex-direction: column; gap: 0.65rem;
          border-top: 1px solid var(--border-color); padding-top: 1rem;
        }
        .pm-row { display: flex; justify-content: space-between; font-size: 0.82rem; }
        .pm-row span { color: var(--text-secondary); }
        .pm-row strong { color: var(--text-primary); }
      `}</style>
    </div>
  );
};
