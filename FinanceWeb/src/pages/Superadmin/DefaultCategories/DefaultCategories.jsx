import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Layers,
  Users,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Store,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  Search,
  Power,
  ArrowRight,
  Navigation,
  LayoutGrid,
  List,
  RotateCw,
  X,
  BadgePercent,
  Calculator,
  Save,
  Tag,
  Briefcase,
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    id: 'WEEKLY_CUSTOMER',
    name: 'Weekly Customer / Borrower',
    customer_type: 'COMMON_CUSTOMER',
    category_code: 'CAT-BORROWER-WK',
    description: '10-week micro-loans with recurring weekly installments for personal & trade financing.',
    repayment_frequency: 'WEEKLY',
    default_min_loan: 10000,
    default_max_loan: 50000,
    default_interest_rate: 10.0,
    tenure_installments: 10,
    grace_period_days: 3,
    status: 'ACTIVE',
    badgeText: 'Weekly Loan Model',
    badgeColor: '#1976d2',
    icon: Calendar,
  },
  {
    id: 'DAILY_MERCHANT',
    name: 'Daily Lender / Merchant',
    customer_type: 'SHOPKEEPER',
    category_code: 'CAT-MERCHANT-DLY',
    description: 'Rapid 25-day daily market collections for retail stall owners and shopkeepers.',
    repayment_frequency: 'DAILY',
    default_min_loan: 15000,
    default_max_loan: 100000,
    default_interest_rate: 12.5,
    tenure_installments: 25,
    grace_period_days: 1,
    status: 'ACTIVE',
    badgeText: 'Daily Loan Model',
    badgeColor: '#7c3aed',
    icon: Store,
  },
  {
    id: 'MONTHLY_LENDER',
    name: 'Monthly Lender / Term Borrower',
    customer_type: 'COMMON_CUSTOMER',
    category_code: 'CAT-LENDER-MO',
    description: 'Medium-term business enterprise financing with monthly installment repayments over 12 months.',
    repayment_frequency: 'MONTHLY',
    default_min_loan: 25000,
    default_max_loan: 500000,
    default_interest_rate: 15.0,
    tenure_installments: 12,
    grace_period_days: 5,
    status: 'ACTIVE',
    badgeText: 'Monthly Loan Model',
    badgeColor: '#0891b2',
    icon: Clock,
  },
  {
    id: 'FIELD_COLLECTOR',
    name: 'Collector from Users (Field Agent)',
    customer_type: 'FIELD_AGENT',
    category_code: 'CAT-FIELD-COLLECTOR',
    description: 'Field route officers collecting cash and UPI payments door-to-door using the mobile app.',
    repayment_frequency: 'N/A',
    default_min_loan: 0,
    default_max_loan: 0,
    default_interest_rate: 0,
    tenure_installments: 0,
    grace_period_days: 0,
    status: 'ACTIVE',
    badgeText: 'Field Collector Role',
    badgeColor: '#059669',
    icon: Navigation,
  },
  {
    id: 'BRANCH_ADMIN',
    name: 'Branch Staff / Operations Admin',
    customer_type: 'ADMIN',
    category_code: 'CAT-BRANCH-ADMIN',
    description: 'Branch operational staff handling approvals, KYC verification, disbursements, and accounting.',
    repayment_frequency: 'N/A',
    default_min_loan: 0,
    default_max_loan: 0,
    default_interest_rate: 0,
    tenure_installments: 0,
    grace_period_days: 0,
    status: 'ACTIVE',
    badgeText: 'Operations Staff Role',
    badgeColor: '#d97706',
    icon: ShieldCheck,
  },
];

export const DefaultCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'WEEKLY' | 'DAILY' | 'MONTHLY' | 'STAFF' | 'ACTIVE'
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Forms
  const [formData, setFormData] = useState({});
  const [createFormData, setCreateFormData] = useState({
    name: '',
    category_code: '',
    customer_type: 'COMMON_CUSTOMER',
    description: '',
    default_min_loan: 10000,
    default_max_loan: 50000,
    default_interest_rate: 10.0,
    repayment_frequency: 'WEEKLY',
    tenure_installments: 10,
    grace_period_days: 3,
    status: 'ACTIVE',
  });

  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCategories();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Open Create Modal
  const openCreateModal = (preset = null) => {
    setFormError('');
    if (preset) {
      setCreateFormData({
        name: preset.name,
        category_code: preset.category_code + '-' + Math.floor(100 + Math.random() * 900),
        customer_type: preset.customer_type,
        description: preset.description,
        default_min_loan: preset.default_min_loan,
        default_max_loan: preset.default_max_loan,
        default_interest_rate: preset.default_interest_rate,
        repayment_frequency: preset.repayment_frequency,
        tenure_installments: preset.tenure_installments,
        grace_period_days: preset.grace_period_days,
        status: preset.status,
      });
    } else {
      setCreateFormData({
        name: '',
        category_code: '',
        customer_type: 'COMMON_CUSTOMER',
        description: '',
        default_min_loan: 10000,
        default_max_loan: 50000,
        default_interest_rate: 10.0,
        repayment_frequency: 'WEEKLY',
        tenure_installments: 10,
        grace_period_days: 3,
        status: 'ACTIVE',
      });
    }
    setIsCreateModalOpen(true);
  };

  // Apply Template in Create Modal
  const handleApplyTemplate = (templateId) => {
    const tpl = PRESET_TEMPLATES.find((p) => p.id === templateId);
    if (tpl) {
      setCreateFormData((prev) => ({
        ...prev,
        name: tpl.name,
        customer_type: tpl.customer_type,
        category_code: tpl.category_code + '-' + Math.floor(100 + Math.random() * 900),
        description: tpl.description,
        default_min_loan: tpl.default_min_loan,
        default_max_loan: tpl.default_max_loan,
        default_interest_rate: tpl.default_interest_rate,
        repayment_frequency: tpl.repayment_frequency,
        tenure_installments: tpl.tenure_installments,
        grace_period_days: tpl.grace_period_days,
        status: tpl.status,
      }));
    }
  };

  // Submit New Category
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!createFormData.name.trim()) {
      setFormError('Category Display Name is required.');
      return;
    }

    setSaving(true);
    try {
      await api.governance.createDefaultCategory(createFormData);
      await fetchCategories();
      setIsCreateModalOpen(false);
      showToast(`Category & Role "${createFormData.name}" successfully created!`);
    } catch (err) {
      setFormError(err.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormError('');
    setFormData({
      id: cat.id,
      category_code: cat.category_code,
      name: cat.name,
      customer_type: cat.customer_type || 'COMMON_CUSTOMER',
      description: cat.description || '',
      default_min_loan: cat.default_min_loan || 0,
      default_max_loan: cat.default_max_loan || 0,
      default_interest_rate: cat.default_interest_rate || 0,
      repayment_frequency: cat.repayment_frequency || 'N/A',
      tenure_installments: cat.tenure_installments || 0,
      grace_period_days: cat.grace_period_days || 0,
      status: cat.status || 'ACTIVE',
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.governance.updateDefaultCategory(formData.category_code, formData);
      await fetchCategories();
      setEditingCategory(null);
      showToast(`Category "${formData.name}" policy updated!`);
    } catch (err) {
      setFormError(err.message || 'Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Category Status (Active / Inactive)
  const handleToggleStatus = async (cat) => {
    const nextStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.governance.updateDefaultCategory(cat.category_code, {
        ...cat,
        status: nextStatus,
      });
      await fetchCategories();
      showToast(`Category "${cat.name}" marked as ${nextStatus}`);
    } catch (err) {
      alert(err.message || 'Failed to update category status.');
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setSaving(true);
    try {
      await api.governance.deleteDefaultCategory(deletingCategory.category_code);
      await fetchCategories();
      showToast(`Category "${deletingCategory.name}" removed successfully.`);
      setDeletingCategory(null);
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    } finally {
      setSaving(false);
    }
  };

  // Compute filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        (cat.name || '').toLowerCase().includes(search) ||
        (cat.category_code || '').toLowerCase().includes(search) ||
        (cat.description || '').toLowerCase().includes(search) ||
        (cat.customer_type || '').toLowerCase().includes(search);

      if (!matchSearch) return false;

      if (filterType === 'WEEKLY') return cat.repayment_frequency === 'WEEKLY';
      if (filterType === 'DAILY') return cat.repayment_frequency === 'DAILY';
      if (filterType === 'MONTHLY') return cat.repayment_frequency === 'MONTHLY';
      if (filterType === 'STAFF') return cat.customer_type === 'FIELD_AGENT' || cat.customer_type === 'ADMIN';
      if (filterType === 'ACTIVE') return cat.status === 'ACTIVE';
      return true;
    });
  }, [categories, searchTerm, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const activeCount = categories.filter((c) => c.status === 'ACTIVE').length;
    const weeklyCount = categories.filter((c) => c.repayment_frequency === 'WEEKLY').length;
    const dailyCount = categories.filter((c) => c.repayment_frequency === 'DAILY').length;
    const monthlyCount = categories.filter((c) => c.repayment_frequency === 'MONTHLY').length;
    const staffCount = categories.filter((c) => c.customer_type === 'FIELD_AGENT' || c.customer_type === 'ADMIN').length;
    return { total, activeCount, weeklyCount, dailyCount, monthlyCount, staffCount };
  }, [categories]);

  // Calculate live preview inside create/edit modal
  const calcModalPreview = (targetForm) => {
    const isLending = targetForm.repayment_frequency && targetForm.repayment_frequency !== 'N/A';
    if (!isLending) return null;
    const minLoan = Number(targetForm.default_min_loan) || 10000;
    const rate = Number(targetForm.default_interest_rate) || 10;
    const tenure = Number(targetForm.tenure_installments) || 10;
    const totalRepay = minLoan + (minLoan * rate) / 100;
    const instAmt = tenure > 0 ? Math.ceil(totalRepay / tenure) : 0;
    return {
      minLoan,
      rate,
      tenure,
      totalRepay,
      instAmt,
      freq: targetForm.repayment_frequency,
    };
  };

  return (
    <div className="cat-page-container">
      {/* Page Header */}
      <div className="cat-header-row">
        <div className="cat-header-left">
          <div className="header-title-wrap">
            <h1 className="cat-main-title">Default Categories & Interest Rate Engine</h1>
            <span className="cat-count-badge">
              {loading ? (
                <span className="skeleton-pill" style={{ width: 45, height: 20 }} />
              ) : (
                `${categories.length} Categories`
              )}
            </span>
          </div>
        </div>

        <div className="cat-header-actions">
          <button
            type="button"
            className={`btn-refresh-data ${isRefreshing || loading ? 'refreshing' : ''}`}
            onClick={handleManualRefresh}
            title="Refresh Live Data"
            disabled={loading || isRefreshing}
          >
            <RotateCw size={16} />
          </button>

          <button
            type="button"
            className="btn-create-cat"
            onClick={() => openCreateModal()}
          >
            <Plus size={18} />
            <span>Create New Category</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="cat-feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Summary KPI Strip (4-column responsive grid) */}
      <div className="cat-kpi-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cat-kpi-card skeleton-card">
                <div className="cat-kpi-top">
                  <div className="skeleton-bar" style={{ width: '45%', height: 14 }} />
                  <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
                </div>
                <div className="skeleton-bar" style={{ width: '60%', height: 28, margin: '10px 0' }} />
                <div className="skeleton-bar" style={{ width: '75%', height: 12 }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="cat-kpi-card">
              <div className="cat-kpi-top">
                <span className="cat-kpi-label">Total Categories</span>
                <div className="cat-kpi-icon icon-blue">
                  <Layers size={20} />
                </div>
              </div>
              <div className="cat-kpi-value">{stats.total}</div>
              <div className="cat-kpi-footer">
                <span className="dot-green" />
                <span>{stats.activeCount} Active Policy Rules</span>
              </div>
            </div>

            <div className="cat-kpi-card">
              <div className="cat-kpi-top">
                <span className="cat-kpi-label">Weekly Lending Models</span>
                <div className="cat-kpi-icon icon-indigo">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="cat-kpi-value">{stats.weeklyCount}</div>
              <div className="cat-kpi-footer">
                <span>Standard 10-Week Installments</span>
              </div>
            </div>

            <div className="cat-kpi-card">
              <div className="cat-kpi-top">
                <span className="cat-kpi-label">Daily & Monthly Models</span>
                <div className="cat-kpi-icon icon-purple">
                  <BadgePercent size={20} />
                </div>
              </div>
              <div className="cat-kpi-value">{stats.dailyCount + stats.monthlyCount}</div>
              <div className="cat-kpi-footer">
                <span>{stats.dailyCount} Daily / {stats.monthlyCount} Monthly</span>
              </div>
            </div>

            <div className="cat-kpi-card">
              <div className="cat-kpi-top">
                <span className="cat-kpi-label">Staff & Collector Roles</span>
                <div className="cat-kpi-icon icon-amber">
                  <Users size={20} />
                </div>
              </div>
              <div className="cat-kpi-value">{stats.staffCount}</div>
              <div className="cat-kpi-footer">
                <span>Field Agents & Branch Staff</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="cat-filter-row">
        <div className="filter-pills-group">
          {[
            { id: 'ALL', label: 'All Roles' },
            { id: 'WEEKLY', label: 'Weekly' },
            { id: 'DAILY', label: 'Daily' },
            { id: 'MONTHLY', label: 'Monthly' },
            { id: 'STAFF', label: 'Collectors & Staff' },
            { id: 'ACTIVE', label: 'Active Only' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`pill-filter-btn ${filterType === tab.id ? 'active' : ''}`}
              onClick={() => setFilterType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="filter-right-controls">
          <div className="cat-search-box">
            <Search size={15} className="cat-search-icon" />
            <input
              type="text"
              className="cat-search-input"
              placeholder="Search category code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="view-toggle-wrap">
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'GRID' ? 'active' : ''}`}
              title="Grid Card View"
              onClick={() => setViewMode('GRID')}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'TABLE' ? 'active' : ''}`}
              title="Table Directory View"
              onClick={() => setViewMode('TABLE')}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {loading ? (
        <div className="cat-cards-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="cat-card skeleton-card">
              <div className="cat-card-header">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="skeleton-circle" style={{ width: 38, height: 38 }} />
                  <div>
                    <div className="skeleton-bar" style={{ width: 140, height: 16, marginBottom: 6 }} />
                    <div className="skeleton-bar" style={{ width: 90, height: 12 }} />
                  </div>
                </div>
                <div className="skeleton-pill" style={{ width: 65, height: 22 }} />
              </div>
              <div className="skeleton-bar" style={{ width: '90%', height: 12, margin: '14px 0 6px 0' }} />
              <div className="skeleton-bar" style={{ width: '70%', height: 12, marginBottom: 14 }} />
              <div className="skeleton-bar" style={{ width: '100%', height: 50, borderRadius: 8, marginBottom: 14 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
                <div className="skeleton-bar" style={{ width: 80, height: 28 }} />
                <div className="skeleton-bar" style={{ width: 90, height: 28 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-state-card">
          <AlertCircle size={42} color="#94a3b8" />
          <h4>No Categories Matching Filter</h4>
          <p>Try adjusting your search term or switch filter tabs.</p>
          <button className="btn-create-cat" style={{ marginTop: '0.85rem' }} onClick={() => openCreateModal()}>
            <Plus size={16} /> Create Category
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW */
        <div className="cat-cards-grid">
          {filteredCategories.map((cat) => {
            const isDaily = cat.repayment_frequency === 'DAILY';
            const isWeekly = cat.repayment_frequency === 'WEEKLY';
            const isMonthly = cat.repayment_frequency === 'MONTHLY';
            const isCollector = cat.customer_type === 'FIELD_AGENT';
            const isAdmin = cat.customer_type === 'ADMIN';
            const isLending = Number(cat.default_min_loan) > 0 || Number(cat.default_max_loan) > 0;

            const themeColor = isWeekly
              ? '#1976d2'
              : isDaily
              ? '#7c3aed'
              : isMonthly
              ? '#0891b2'
              : isCollector
              ? '#059669'
              : '#d97706';

            return (
              <div
                key={cat.id || cat.category_code}
                className={`cat-card ${cat.status === 'INACTIVE' ? 'inactive' : ''}`}
              >
                <div>
                  {/* Card Top */}
                  <div className="cat-card-header">
                    <div className="cat-card-header-left">
                      <div
                        className="cat-icon-badge"
                        style={{ background: `${themeColor}12`, color: themeColor, borderColor: `${themeColor}28` }}
                      >
                        {isCollector ? (
                          <Navigation size={18} />
                        ) : isAdmin ? (
                          <ShieldCheck size={18} />
                        ) : isDaily ? (
                          <Store size={18} />
                        ) : isMonthly ? (
                          <Clock size={18} />
                        ) : (
                          <Calendar size={18} />
                        )}
                      </div>

                      <div>
                        <h3 className="cat-title">{cat.name}</h3>
                        <div className="cat-code-strip">
                          <span className="cat-code-text">{cat.category_code}</span>
                          <span
                            className="cat-freq-badge"
                            style={{ background: `${themeColor}14`, color: themeColor }}
                          >
                            {cat.repayment_frequency !== 'N/A' ? `${cat.repayment_frequency} CYCLE` : isCollector ? 'COLLECTOR' : 'STAFF'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={cat.status} />
                  </div>

                  {/* Description */}
                  <p className="cat-desc-text">
                    {cat.description || 'System standard role & lending term configuration.'}
                  </p>

                  {/* Metrics Box (Interest Rate Focused) */}
                  {isLending ? (
                    <div className="cat-metrics-box">
                      <div className="metric-item">
                        <span className="metric-label">Loan Limits</span>
                        <strong className="metric-val">{formatCurrency(cat.default_min_loan)} – {formatCurrency(cat.default_max_loan)}</strong>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Interest Rate</span>
                        <strong className="metric-val rate-val">{cat.default_interest_rate}% Flat</strong>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Tenure & Grace</span>
                        <strong className="metric-val">{cat.tenure_installments} {cat.repayment_frequency?.toLowerCase()} • {cat.grace_period_days || 0}d</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="cat-staff-notice">
                      {isCollector ? <Navigation size={15} color="#059669" /> : <ShieldCheck size={15} color="#d97706" />}
                      <span>
                        {isCollector ? 'Field route recovery staff. Admin assigns daily/weekly borrower routes.' : 'Branch operations officer account for KYC & disbursement approvals.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="cat-card-footer">
                  <div className="cat-footer-left">
                    <button
                      type="button"
                      className={`btn-status-toggle ${cat.status === 'ACTIVE' ? 'active' : 'inactive'}`}
                      title="Toggle Active Status"
                      onClick={() => handleToggleStatus(cat)}
                    >
                      <Power size={13} />
                      <span>{cat.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-delete-cat"
                      title="Delete Category"
                      onClick={() => setDeletingCategory(cat)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn-edit-rules"
                    onClick={() => openEditModal(cat)}
                  >
                    <Edit2 size={13} />
                    <span>Configure Rules</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="cat-table-card">
          <div className="cat-table-wrapper">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>CATEGORY & CODE</th>
                  <th>ROLE TYPE</th>
                  <th>CYCLE FREQUENCY</th>
                  <th>LOAN BOUNDARIES</th>
                  <th>INTEREST RATE</th>
                  <th>TENURE</th>
                  <th>STATUS</th>
                  <th className="th-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id || cat.category_code} className="cat-row">
                    <td>
                      <strong className="table-cat-name">{cat.name}</strong>
                      <span className="table-cat-code">{cat.category_code}</span>
                    </td>
                    <td>
                      <span className="table-role-tag">{cat.customer_type}</span>
                    </td>
                    <td>
                      <span className="table-freq-tag">{cat.repayment_frequency}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {Number(cat.default_min_loan) > 0 ? `${formatCurrency(cat.default_min_loan)} – ${formatCurrency(cat.default_max_loan)}` : '—'}
                    </td>
                    <td style={{ color: '#059669', fontWeight: 700, fontSize: '0.92rem' }}>
                      {Number(cat.default_interest_rate) > 0 ? `${cat.default_interest_rate}% Flat` : '—'}
                    </td>
                    <td>
                      {cat.tenure_installments > 0 ? `${cat.tenure_installments} ${cat.repayment_frequency?.toLowerCase()}` : '—'}
                    </td>
                    <td>
                      <StatusBadge status={cat.status} />
                    </td>
                    <td className="td-actions">
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn-icon-action btn-edit"
                          title="Edit Rules"
                          onClick={() => openEditModal(cat)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-action btn-suspend"
                          title="Delete Category"
                          onClick={() => setDeletingCategory(cat)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Category & Interest Policy"
        >
          <form onSubmit={handleCreateSubmit} className="cat-modal-form">
            {formError && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{formError}</span>
              </div>
            )}

            {/* Quick Template Selector */}
            <div className="modal-form-group">
              <label className="modal-form-label">
                <Sparkles size={14} color="#1976d2" />
                <span>Quick Preset Template (Optional):</span>
              </label>
              <select
                className="modal-form-select"
                onChange={(e) => {
                  if (e.target.value) handleApplyTemplate(e.target.value);
                }}
                defaultValue=""
              >
                <option value="">-- Choose a Preset to Autofill Terms --</option>
                <option value="WEEKLY_CUSTOMER">Weekly Customer / Borrower (10 Weeks @ 10.0% Flat Rate)</option>
                <option value="DAILY_MERCHANT">Daily Lender / Shopkeeper (25 Days @ 12.5% Flat Rate)</option>
                <option value="MONTHLY_LENDER">Monthly Lender / Borrower (12 Months @ 15.0% Flat Rate)</option>
                <option value="FIELD_COLLECTOR">Collector from Users (Field Route Recovery Officer)</option>
                <option value="BRANCH_ADMIN">Branch Operations Staff / Admin</option>
              </select>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Tag size={14} />
                  <span>Category Name *</span>
                </label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="e.g. Weekly Customer / Borrower"
                  value={createFormData.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 14);
                    setCreateFormData({
                      ...createFormData,
                      name,
                      category_code: createFormData.category_code || `CAT-${slug}`,
                    });
                  }}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Briefcase size={14} />
                  <span>Category Unique Code</span>
                </label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="CAT-CODE-01"
                  value={createFormData.category_code || ''}
                  onChange={(e) => setCreateFormData({ ...createFormData, category_code: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Role Target Type</label>
                <select
                  className="modal-form-select"
                  value={createFormData.customer_type || 'COMMON_CUSTOMER'}
                  onChange={(e) => setCreateFormData({ ...createFormData, customer_type: e.target.value })}
                >
                  <option value="COMMON_CUSTOMER">COMMON_CUSTOMER (Borrower)</option>
                  <option value="SHOPKEEPER">SHOPKEEPER (Merchant / Daily Stall)</option>
                  <option value="FIELD_AGENT">FIELD_AGENT (Collector from Users)</option>
                  <option value="ADMIN">ADMIN (Branch Operations Staff)</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Repayment Frequency</label>
                <select
                  className="modal-form-select"
                  value={createFormData.repayment_frequency || 'WEEKLY'}
                  onChange={(e) => setCreateFormData({ ...createFormData, repayment_frequency: e.target.value })}
                >
                  <option value="WEEKLY">WEEKLY (Weekly Cycle)</option>
                  <option value="DAILY">DAILY (Daily Cycle)</option>
                  <option value="MONTHLY">MONTHLY (Monthly Cycle)</option>
                  <option value="CUSTOM">CUSTOM (Flexible)</option>
                  <option value="N/A">N/A (Staff / Collector Non-lending)</option>
                </select>
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Description & Policy Scope</label>
              <textarea
                className="modal-form-textarea"
                rows={2}
                placeholder="Explain the category purpose, eligibility, and loan terms..."
                value={createFormData.description || ''}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              />
            </div>

            {/* Financial Parameters Section */}
            {createFormData.repayment_frequency !== 'N/A' && (
              <div className="financial-rules-box">
                <div className="financial-rules-header">
                  <BadgePercent size={16} color="#1976d2" />
                  <span>Financial Lending & Interest Rate Rules</span>
                </div>

                <div className="financial-rules-grid">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Min Loan (₹)</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      value={createFormData.default_min_loan || 0}
                      onChange={(e) => setCreateFormData({ ...createFormData, default_min_loan: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="modal-form-group">
                    <label className="modal-form-label">Max Loan (₹)</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      value={createFormData.default_max_loan || 0}
                      onChange={(e) => setCreateFormData({ ...createFormData, default_max_loan: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="modal-form-group">
                    <label className="modal-form-label">Interest Rate (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="modal-form-input highlight-rate"
                      value={createFormData.default_interest_rate || 0}
                      onChange={(e) => setCreateFormData({ ...createFormData, default_interest_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="financial-rules-grid-2">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Tenure Installments</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      placeholder="e.g. 10 (weeks), 25 (days), 12 (months)"
                      value={createFormData.tenure_installments || 0}
                      onChange={(e) => setCreateFormData({ ...createFormData, tenure_installments: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                  <div className="modal-form-group">
                    <label className="modal-form-label">Grace Period (Days)</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      placeholder="e.g. 3"
                      value={createFormData.grace_period_days || 0}
                      onChange={(e) => setCreateFormData({ ...createFormData, grace_period_days: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>

                {/* Live Simulation Inside Modal */}
                {(() => {
                  const p = calcModalPreview(createFormData);
                  if (!p) return null;
                  return (
                    <div className="simulation-preview-box">
                      <Calculator size={15} color="#1976d2" />
                      <span>
                        <strong>Sample Loan Calculation:</strong> {formatCurrency(p.minLoan)} principal @ {p.rate}% flat = Total Repayable <strong>{formatCurrency(p.totalRepay)}</strong> ({formatCurrency(p.instAmt)} / {p.freq?.toLowerCase() === 'daily' ? 'day' : p.freq?.toLowerCase() === 'monthly' ? 'month' : 'week'}).
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Status</label>
                <select
                  className="modal-form-select"
                  value={createFormData.status || 'ACTIVE'}
                  onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-row">
              <button type="button" className="btn-cancel" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-save-primary" disabled={saving}>
                {saving ? 'Publishing...' : 'Save & Publish Category'}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <Modal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          title={`Configure Category: ${editingCategory.name}`}
        >
          <form onSubmit={handleSaveEdit} className="cat-modal-form">
            {formError && (
              <div className="modal-error-alert">
                <AlertCircle size={16} color="#ef4444" />
                <span>{formError}</span>
              </div>
            )}

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Category Name</label>
                <input
                  type="text"
                  className="modal-form-input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Category Code</label>
                <input
                  type="text"
                  className="modal-form-input"
                  value={formData.category_code || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed', background: '#f1f5f9' }}
                />
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Role Target Type</label>
                <select
                  className="modal-form-select"
                  value={formData.customer_type || 'COMMON_CUSTOMER'}
                  onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                >
                  <option value="COMMON_CUSTOMER">COMMON_CUSTOMER (Borrower)</option>
                  <option value="SHOPKEEPER">SHOPKEEPER (Merchant / Daily Stall)</option>
                  <option value="FIELD_AGENT">FIELD_AGENT (Collector from Users)</option>
                  <option value="ADMIN">ADMIN (Branch Operations Staff)</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Repayment Frequency</label>
                <select
                  className="modal-form-select"
                  value={formData.repayment_frequency || 'WEEKLY'}
                  onChange={(e) => setFormData({ ...formData, repayment_frequency: e.target.value })}
                >
                  <option value="WEEKLY">WEEKLY (Weekly Cycle)</option>
                  <option value="DAILY">DAILY (Daily Cycle)</option>
                  <option value="MONTHLY">MONTHLY (Monthly Cycle)</option>
                  <option value="CUSTOM">CUSTOM (Flexible)</option>
                  <option value="N/A">N/A (Staff / Collector Non-lending)</option>
                </select>
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Role Description</label>
              <textarea
                className="modal-form-textarea"
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {formData.repayment_frequency !== 'N/A' && (
              <div className="financial-rules-box">
                <div className="financial-rules-header">
                  <BadgePercent size={16} color="#1976d2" />
                  <span>Financial Lending & Interest Rate Rules</span>
                </div>

                <div className="financial-rules-grid">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Min Loan (₹)</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      value={formData.default_min_loan || 0}
                      onChange={(e) => setFormData({ ...formData, default_min_loan: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="modal-form-group">
                    <label className="modal-form-label">Max Loan (₹)</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      value={formData.default_max_loan || 0}
                      onChange={(e) => setFormData({ ...formData, default_max_loan: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="modal-form-group">
                    <label className="modal-form-label">Interest Rate (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="modal-form-input highlight-rate"
                      value={formData.default_interest_rate || 0}
                      onChange={(e) => setFormData({ ...formData, default_interest_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="financial-rules-grid-2">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Tenure Installments</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      value={formData.tenure_installments || 0}
                      onChange={(e) => setFormData({ ...formData, tenure_installments: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                  <div className="modal-form-group">
                    <label className="modal-form-label">Grace Period (Days)</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      value={formData.grace_period_days || 0}
                      onChange={(e) => setFormData({ ...formData, grace_period_days: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>

                {(() => {
                  const p = calcModalPreview(formData);
                  if (!p) return null;
                  return (
                    <div className="simulation-preview-box">
                      <Calculator size={15} color="#1976d2" />
                      <span>
                        <strong>Sample Loan Calculation:</strong> {formatCurrency(p.minLoan)} principal @ {p.rate}% flat = Total Repayable <strong>{formatCurrency(p.totalRepay)}</strong> ({formatCurrency(p.instAmt)} / {p.freq?.toLowerCase() === 'daily' ? 'day' : p.freq?.toLowerCase() === 'monthly' ? 'month' : 'week'}).
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">Status</label>
                <select
                  className="modal-form-select"
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-row">
              <button type="button" className="btn-cancel" onClick={() => setEditingCategory(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-save-primary" disabled={saving}>
                <Save size={15} />
                <span>{saving ? 'Updating...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCategory && (
        <Modal
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          title="Delete Category Policy"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Are you sure you want to delete category{' '}
              <strong style={{ color: '#ef4444' }}>"{deletingCategory.name}"</strong> (
              <span style={{ fontFamily: 'monospace' }}>{deletingCategory.category_code}</span>)?
            </p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.45 }}>
              This will remove default lending templates. Existing registered customers will preserve their historical loan records.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn-cancel" onClick={() => setDeletingCategory(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-delete-confirm"
                disabled={saving}
                onClick={handleDeleteCategory}
              >
                {saving ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Embedded Component Styles Matching Organization.jsx */}
      <style>{`
        .cat-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          color: #0f172a;
          font-family: inherit;
        }

        .cat-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .header-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .cat-main-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }

        .cat-count-badge {
          display: inline-flex;
          align-items: center;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1976d2;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
        }

        .cat-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-refresh-data {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh-data:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1976d2;
          border-color: #93c5fd;
        }

        .btn-refresh-data.refreshing svg {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-create-cat {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #1976d2;
          color: #ffffff;
          border: none;
          padding: 0.65rem 1.15rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
          transition: all 0.2s ease;
        }

        .btn-create-cat:hover {
          background: #1565c0;
          box-shadow: 0 4px 10px rgba(25, 118, 210, 0.35);
          transform: translateY(-1px);
        }

        .cat-feedback-banner {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 0.85rem;
          font-weight: 600;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* KPI Grid: Exactly 4-Columns Horizontal on Desktop */
        .cat-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .cat-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .cat-kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .cat-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.15rem 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cat-kpi-card:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
          transform: translateY(-2px);
        }

        .cat-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cat-kpi-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.03em;
        }

        .cat-kpi-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-blue { background: #eff6ff; color: #1976d2; }
        .icon-indigo { background: #eef2ff; color: #4f46e5; }
        .icon-purple { background: #f5f3ff; color: #7c3aed; }
        .icon-amber { background: #fffbeb; color: #d97706; }

        .cat-kpi-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0.35rem 0 0.25rem 0;
          letter-spacing: -0.02em;
        }

        .cat-kpi-footer {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: #64748b;
        }

        .dot-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #059669;
        }

        /* Filter Row */
        .cat-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .filter-pills-group {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .pill-filter-btn {
          padding: 0.4rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .pill-filter-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .pill-filter-btn.active {
          background: #1976d2;
          color: #ffffff;
          border-color: #1976d2;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
        }

        .filter-right-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .cat-search-box {
          position: relative;
          width: 250px;
        }

        .cat-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .cat-search-input {
          width: 100%;
          padding: 0.45rem 1.8rem 0.45rem 2rem;
          font-size: 0.82rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
          outline: none;
        }

        .cat-search-input:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
        }

        .clear-search-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
        }

        .view-toggle-wrap {
          display: flex;
          background: #f1f5f9;
          padding: 2px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .btn-view-toggle {
          padding: 0.35rem 0.55rem;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          display: flex;
        }

        .btn-view-toggle.active {
          background: #ffffff;
          color: #1976d2;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        }

        /* Card Grid View */
        .cat-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 860px) {
          .cat-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .cat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: all 0.2s ease;
        }

        .cat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.07);
        }

        .cat-card.inactive {
          opacity: 0.72;
          border-style: dashed;
        }

        .cat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.65rem;
        }

        .cat-card-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .cat-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
        }

        .cat-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .cat-code-strip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 2px;
        }

        .cat-code-text {
          font-size: 0.72rem;
          font-family: monospace;
          color: #64748b;
          background: #f1f5f9;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .cat-freq-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 6px;
        }

        .cat-desc-text {
          font-size: 0.83rem;
          color: #475569;
          line-height: 1.45;
          margin: 0.6rem 0 0.85rem 0;
          min-height: 2.4rem;
        }

        .cat-metrics-box {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 0.85rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .metric-val {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }

        .metric-val.rate-val {
          color: #059669;
        }

        .cat-staff-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #475569;
          margin-bottom: 0.75rem;
        }

        .cat-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .cat-footer-left {
          display: flex;
          gap: 0.4rem;
        }

        .btn-status-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          background: #ffffff;
          transition: all 0.15s ease;
        }

        .btn-status-toggle.active {
          color: #059669;
        }

        .btn-status-toggle.inactive {
          color: #64748b;
          background: #f8fafc;
        }

        .btn-delete-cat {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #fee2e2;
          background: #fff5f5;
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-delete-cat:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .btn-edit-rules {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.38rem 0.85rem;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1976d2;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-edit-rules:hover {
          background: #1976d2;
          border-color: #1976d2;
          color: #ffffff;
        }

        /* Table View */
        .cat-table-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          margin-bottom: 2rem;
        }

        .cat-table-wrapper {
          overflow-x: auto;
        }

        .cat-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .cat-table thead {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .cat-table th {
          padding: 0.85rem 1rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: left;
        }

        .cat-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #0f172a;
        }

        .table-cat-name {
          display: block;
          font-size: 0.88rem;
          color: #0f172a;
        }

        .table-cat-code {
          font-size: 0.72rem;
          font-family: monospace;
          color: #64748b;
        }

        .table-role-tag {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          background: #f1f5f9;
          color: #334155;
        }

        .table-freq-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: #eff6ff;
          color: #1976d2;
        }

        .th-actions, .td-actions {
          text-align: right;
        }

        .action-buttons-group {
          display: inline-flex;
          gap: 0.4rem;
        }

        .btn-icon-action {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-icon-action.btn-edit:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1976d2;
        }

        .btn-icon-action.btn-suspend:hover {
          background: #fff5f5;
          border-color: #fca5a5;
          color: #ef4444;
        }

        /* Modal Forms Matching Organization.jsx Modal Style */
        .cat-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .modal-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .modal-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        @media (max-width: 560px) {
          .modal-form-row {
            grid-template-columns: 1fr;
          }
        }

        .modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .modal-form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .modal-form-input, .modal-form-select, .modal-form-textarea {
          padding: 0.55rem 0.85rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .modal-form-input:focus, .modal-form-select:focus, .modal-form-textarea:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
        }

        .modal-form-input.highlight-rate {
          border-color: #10b981;
          font-weight: 700;
          color: #047857;
          background: #f0fdf4;
        }

        .modal-form-input.highlight-rate:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }

        .financial-rules-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 1rem 1.15rem;
          border-radius: 10px;
        }

        .financial-rules-header {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: #1976d2;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.85rem;
        }

        .financial-rules-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        @media (max-width: 560px) {
          .financial-rules-grid {
            grid-template-columns: 1fr;
          }
        }

        .financial-rules-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-top: 0.65rem;
        }

        @media (max-width: 560px) {
          .financial-rules-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .simulation-preview-box {
          margin-top: 0.85rem;
          padding: 0.65rem 0.95rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #1e40af;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          line-height: 1.4;
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .btn-cancel {
          padding: 0.6rem 1.15rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-cancel:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .btn-save-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 1.35rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          background: #1976d2;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
          transition: all 0.2s ease;
        }

        .btn-save-primary:hover:not(:disabled) {
          background: #1565c0;
          box-shadow: 0 4px 10px rgba(25, 118, 210, 0.35);
          transform: translateY(-1px);
        }

        .btn-delete-confirm {
          padding: 0.6rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          background: #ef4444;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete-confirm:hover {
          background: #dc2626;
        }

        /* Shimmer Skeletons Matching Organization.jsx */
        .skeleton-bar {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-circle {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 50%;
          animation: shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        .skeleton-pill {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 9999px;
          animation: shimmer 1.5s infinite;
          display: inline-block;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .empty-state-card {
          padding: 3.5rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .empty-state-card h4 {
          font-size: 1.15rem;
          color: #0f172a;
          margin: 0.65rem 0 0.25rem 0;
        }

        .empty-state-card p {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default DefaultCategories;
