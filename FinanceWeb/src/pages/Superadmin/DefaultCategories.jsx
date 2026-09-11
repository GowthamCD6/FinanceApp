import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Layers,
  Users,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Store,
  UserCheck,
} from 'lucide-react';

export const DefaultCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({});
  const [feedback, setFeedback] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.governance.getDefaultCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      category_code: cat.category_code,
      name: cat.name,
      description: cat.description,
      max_users_per_branch: cat.max_users_per_branch,
      default_min_loan: cat.default_min_loan,
      default_max_loan: cat.default_max_loan,
      default_interest_rate: cat.default_interest_rate,
      repayment_frequency: cat.repayment_frequency,
      tenure_installments: cat.tenure_installments,
      grace_period_days: cat.grace_period_days,
      status: cat.status,
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.governance.updateDefaultCategory(formData.category_code, formData);
      await fetchCategories();
      setEditingCategory(null);
      setFeedback(`Default category "${formData.name}" rules updated in database!`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to update category:', err);
    }
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

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading live category policies from TiDB Cloud...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {categories.map((cat) => (
            <div
              key={cat.id || cat.category_code}
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
                      {cat.customer_type === 'SHOPKEEPER' ? (
                        <Store size={20} color="var(--purple)" />
                      ) : cat.customer_type === 'COMMON_CUSTOMER' ? (
                        <Users size={20} color="var(--accent-primary)" />
                      ) : cat.customer_type === 'FIELD_AGENT' ? (
                        <UserCheck size={20} color="var(--emerald)" />
                      ) : (
                        <ShieldCheck size={20} color="#fbbf24" />
                      )}
                      <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{cat.name}</h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.category_code}</span>
                  </div>
                  <StatusBadge status={cat.status} />
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {cat.description}
                </p>

                {/* User Capacity */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Branch Max Capacity Limit</span>
                    <strong style={{ color: '#fff' }}>
                      Max {cat.max_users_per_branch} Allocated
                    </strong>
                  </div>
                </div>

                {/* Rules Specs Grid */}
                {Number(cat.default_min_loan) > 0 ? (
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
                      <div style={{ color: '#fff', fontWeight: 600 }}>{formatCurrency(cat.default_min_loan)} – {formatCurrency(cat.default_max_loan)}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Default Rate</span>
                      <div style={{ color: 'var(--emerald)', fontWeight: 600 }}>{cat.default_interest_rate}% Flat</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tenure</span>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{cat.tenure_installments} {cat.repayment_frequency?.toLowerCase()}</div>
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
                    Staff Account • Max {cat.max_users_per_branch} seats per branch organization
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
      )}

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

            <div className="form-group">
              <label className="form-label">Role Description</label>
              <textarea
                className="form-input"
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Max Users per Branch</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.max_users_per_branch || 0}
                  onChange={(e) => setFormData({ ...formData, max_users_per_branch: parseInt(e.target.value, 10) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            {formData.default_min_loan > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Min Loan (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.default_min_loan || 0}
                    onChange={(e) => setFormData({ ...formData, default_min_loan: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Loan (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.default_max_loan || 0}
                    onChange={(e) => setFormData({ ...formData, default_max_loan: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.default_interest_rate || 0}
                    onChange={(e) => setFormData({ ...formData, default_interest_rate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Update TiDB
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
