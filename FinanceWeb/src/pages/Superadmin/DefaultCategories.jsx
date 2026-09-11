import React, { useState } from 'react';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Layers,
  Users,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Save,
  DollarSign,
  Percent,
  Calendar,
  Briefcase,
  Store,
  UserCheck,
} from 'lucide-react';

export const DefaultCategories = () => {
  const [categories, setCategories] = useState([
    {
      id: 'COMMON_CUSTOMER',
      name: 'Borrower (Weekly Installment)',
      code: 'CAT-BORROWER-WK',
      description: 'Standard individual and worker micro-loans with 10-week recurring repayments.',
      maxUsersPerBranch: 500,
      currentActiveUsers: 248,
      defaultMinLoan: 10000,
      defaultMaxLoan: 50000,
      defaultInterestRate: 10.0,
      repaymentFrequency: 'WEEKLY',
      tenureInstallments: 10,
      gracePeriodDays: 3,
      status: 'ACTIVE',
    },
    {
      id: 'SHOPKEEPER',
      name: 'Merchant (Daily Installment)',
      code: 'CAT-MERCHANT-DLY',
      description: 'Retail shopkeepers and stall merchants with 25-day rapid daily collections.',
      maxUsersPerBranch: 200,
      currentActiveUsers: 86,
      defaultMinLoan: 15000,
      defaultMaxLoan: 100000,
      defaultInterestRate: 12.5,
      repaymentFrequency: 'DAILY',
      tenureInstallments: 25,
      gracePeriodDays: 1,
      status: 'ACTIVE',
    },
    {
      id: 'FIELD_AGENT',
      name: 'Field Collection Agent',
      code: 'CAT-FIELD-AGENT',
      description: 'Mobile route officers equipped with mobile app for daily & weekly cash/UPI recovery.',
      maxUsersPerBranch: 15,
      currentActiveUsers: 6,
      defaultMinLoan: 0,
      defaultMaxLoan: 0,
      defaultInterestRate: 0.0,
      repaymentFrequency: 'N/A',
      tenureInstallments: 0,
      gracePeriodDays: 0,
      status: 'ACTIVE',
    },
    {
      id: 'ADMIN',
      name: 'Branch Manager / Staff',
      code: 'CAT-BRANCH-ADMIN',
      description: 'Branch operational staff managing customer KYC, disbursements, and reconciliation.',
      maxUsersPerBranch: 5,
      currentActiveUsers: 2,
      defaultMinLoan: 0,
      defaultMaxLoan: 0,
      defaultInterestRate: 0.0,
      repaymentFrequency: 'N/A',
      tenureInstallments: 0,
      gracePeriodDays: 0,
      status: 'ACTIVE',
    },
  ]);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [feedback, setFeedback] = useState(null);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ ...cat });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setCategories((prev) =>
      prev.map((c) => (c.id === formData.id ? { ...c, ...formData } : c))
    );
    setEditingCategory(null);
    setFeedback(`Default category "${formData.name}" rules updated!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="default-categories-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">ROLE & CAPACITY POLICY ENGINE</div>
          <h1 className="page-title">Default Categories & Role Capacities</h1>
          <p className="page-subtitle">
            Configure default user limits, max allowed capacity per role, and default loan interest terms across the platform.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {cat.id === 'SHOPKEEPER' ? (
                      <Store size={20} color="var(--purple)" />
                    ) : cat.id === 'COMMON_CUSTOMER' ? (
                      <Users size={20} color="var(--accent-primary)" />
                    ) : cat.id === 'FIELD_AGENT' ? (
                      <UserCheck size={20} color="var(--emerald)" />
                    ) : (
                      <ShieldCheck size={20} color="#fbbf24" />
                    )}
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{cat.name}</h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.code}</span>
                </div>
                <StatusBadge status={cat.status} />
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {cat.description}
              </p>

              {/* User Capacity Bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>User Capacity Limit</span>
                  <strong style={{ color: '#fff' }}>
                    {cat.currentActiveUsers} / {cat.maxUsersPerBranch} Allocated ({Math.round((cat.currentActiveUsers / cat.maxUsersPerBranch) * 100)}%)
                  </strong>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (cat.currentActiveUsers / cat.maxUsersPerBranch) * 100)}%`,
                      background: cat.id === 'SHOPKEEPER' ? 'var(--purple)' : 'var(--accent-primary)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>

              {/* Rules Specs Grid */}
              {cat.defaultMinLoan > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '0.75rem',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loan Limits</span>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{formatCurrency(cat.defaultMinLoan)} – {formatCurrency(cat.defaultMaxLoan)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Default Rate</span>
                    <div style={{ color: 'var(--emerald)', fontWeight: 600 }}>{cat.defaultInterestRate}% Flat</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tenure</span>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{cat.tenureInstallments} {cat.repaymentFrequency.toLowerCase()}</div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Staff Account • Max {cat.maxUsersPerBranch} seats per branch organization
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={() => openEditModal(cat)}>
                <Edit2 size={15} />
                Configure Role Limits
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <Modal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          title={`Configure Role Capacity: ${editingCategory.name}`}
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Role Display Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Max Allowed Users / Branch *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.maxUsersPerBranch || ''}
                  onChange={(e) => setFormData({ ...formData, maxUsersPerBranch: parseInt(e.target.value, 10) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grace Period (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.gracePeriodDays || 0}
                  onChange={(e) => setFormData({ ...formData, gracePeriodDays: parseInt(e.target.value, 10) })}
                />
              </div>
            </div>

            {formData.defaultMinLoan > 0 && (
              <>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Default Min Loan (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.defaultMinLoan || ''}
                      onChange={(e) => setFormData({ ...formData, defaultMinLoan: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Max Loan (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.defaultMaxLoan || ''}
                      onChange={(e) => setFormData({ ...formData, defaultMaxLoan: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Default Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.defaultInterestRate || ''}
                      onChange={(e) => setFormData({ ...formData, defaultInterestRate: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Installments</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.tenureInstallments || ''}
                      onChange={(e) => setFormData({ ...formData, tenureInstallments: parseInt(e.target.value, 10) })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Description / Guidelines</label>
              <textarea
                className="form-input"
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={15} />
                Save Category Policy
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DefaultCategories;
