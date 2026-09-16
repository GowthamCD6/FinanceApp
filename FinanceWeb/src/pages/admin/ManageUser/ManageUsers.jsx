import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Power,
  Eye,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Layers,
  Plus,
  DollarSign,
  ArrowRight,
  Store,
  Edit2,
  Calendar,
  Clock,
  Receipt,
  FileText,
  History,
  ArrowLeft,
  Printer,
  Sparkles,
  Building,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from 'lucide-react';
import { useOrg } from '../../../context/OrgContext';
import './ManageUsers.css';
import { BorrowerHistoryView } from './BorrowerHistoryView';

export const ManageUsers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFeedback, setStatusFeedback] = useState(null);

  // Pagination & Sorting state (Matching Image 2 specifications)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeRowId, setActiveRowId] = useState(null);

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);

  // View Mode: 'DIRECTORY' | 'VIRTUAL_PAGE'
  const [viewMode, setViewMode] = useState('DIRECTORY');
  const [virtualTab, setVirtualTab] = useState('ONGOING'); // 'ONGOING' | 'COMPLETED' | 'LEDGER' | 'KYC'
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    role: 'COMMON_CUSTOMER',
    status: 'ACTIVE',
    notes: '',
    occupation: '',
    shopName: '',
    credit_limit: 50000,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Dynamic Lending Config fetched from DB (interest rates page table)
  const [lendingConfig, setLendingConfig] = useState({
    daily_interest_rate: 25.0,
    daily_tenure_days: 100,
    daily_min_amount: 10000,
    daily_max_amount: 15000,

    weekly_interest_rate: 25.0,
    weekly_tenure_weeks: 10,
    weekly_min_amount: 2000,
    weekly_max_amount: 5000,

    monthly_interest_rate: 25.0,
    monthly_tenure_months: 12,
    monthly_min_amount: 25000,
    monthly_max_amount: 500000,
  });

  // Quick Loan Assignment Modal
  const [isQuickLoanModalOpen, setIsQuickLoanModalOpen] = useState(false);
  const [quickLoanTarget, setQuickLoanTarget] = useState(null);
  const [quickLoanForm, setQuickLoanForm] = useState({
    principal: '2000',
    frequency: 'WEEKLY',
    interest_rate: '25.0',
    tenure: '10',
  });
  const [quickLoanError, setQuickLoanError] = useState('');
  const [submittingLoan, setSubmittingLoan] = useState(false);

  // Fetch dynamic org lending configuration
  useEffect(() => {
    const fetchLendingConfig = async () => {
      try {
        const orgId = activeOrg?.id || 1;
        const data = await api.getLendingConfig(orgId);
        if (data) {
          setLendingConfig((prev) => ({
            ...prev,
            daily_interest_rate: Number(data.daily_interest_rate || 25.0),
            daily_tenure_days: Number(data.daily_tenure_days || 100),
            daily_min_amount: Number(data.daily_min_amount || 10000),
            daily_max_amount: Number(data.daily_max_amount || 15000),

            weekly_interest_rate: Number(data.weekly_interest_rate || 25.0),
            weekly_tenure_weeks: Number(data.weekly_tenure_weeks || 10),
            weekly_min_amount: Number(data.weekly_min_amount || 2000),
            weekly_max_amount: Number(data.weekly_max_amount || 5000),

            monthly_interest_rate: Number(data.monthly_interest_rate || 25.0),
            monthly_tenure_months: Number(data.monthly_tenure_months || 12),
            monthly_min_amount: Number(data.monthly_min_amount || 25000),
            monthly_max_amount: Number(data.monthly_max_amount || 500000),
          }));
        }
      } catch (err) {
        console.warn('Could not fetch org lending config:', err);
      }
    };
    fetchLendingConfig();
  }, [activeOrg?.id]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getBorrowers(activeOrg ? { organizationId: activeOrg.id } : {});
      setUsers(Array.isArray(data) ? data : (data?.users || []));
    } catch (err) {
      console.error('Failed to load borrowers:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeOrg?.id]);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Status toggle
  const handleStatusChange = async (userId, nextStatus, userName) => {
    try {
      await api.updateUserStatus(userId, nextStatus);
      setStatusFeedback(`${userName} marked as ${nextStatus}`);
      setTimeout(() => setStatusFeedback(null), 3000);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Open Virtual Borrower Page
  const openVirtualUserPage = async (u) => {
    setDetailLoading(true);
    setSelectedUser(u);
    setViewMode('VIRTUAL_PAGE');
    setVirtualTab('ONGOING');
    try {
      const fullProfile = await api.getUserById(u.id);
      if (fullProfile) {
        setSelectedUser({
          ...u,
          ...fullProfile,
          activeLoansCount: fullProfile.activeLoansCount ?? fullProfile.financialSummary?.activeLoansCount ?? u.activeLoansCount,
          outstandingAmount: fullProfile.outstandingAmount ?? fullProfile.financialSummary?.outstanding ?? u.outstandingAmount,
          totalPaid: fullProfile.totalPaid ?? fullProfile.financialSummary?.totalPaid ?? u.totalPaid,
          ongoingLoans: fullProfile.ongoingLoans || fullProfile.activeLoans || fullProfile.loans || [],
        });
      }
    } catch (err) {
      console.warn('Could not fetch full user profile, using table data:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Edit User Modal
  const openEditModal = (u) => {
    setEditError('');
    setEditFormData({
      id: u.id,
      name: u.name || '',
      phone: u.phone || '',
      email: u.email || '',
      address: u.address || '',
      city: u.city || '',
      role: u.role || 'COMMON_CUSTOMER',
      status: u.status || 'ACTIVE',
      notes: u.notes || '',
      occupation: u.occupation || '',
      shopName: u.shopName || u.shop_name || '',
      credit_limit: u.credit_limit || 50000,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit (PUT /api/users/:id)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editFormData.name.trim() || !editFormData.phone.trim()) {
      setEditError('Name and Phone number are required.');
      return;
    }

    setSavingEdit(true);
    try {
      const updatedUser = await api.updateUser(editFormData.id, editFormData);
      setStatusFeedback(`User "${updatedUser.name || editFormData.name}" updated successfully!`);
      setTimeout(() => setStatusFeedback(null), 3500);

      setUsers((prev) =>
        prev.map((u) => (u.id === editFormData.id ? { ...u, ...editFormData } : u))
      );

      if (selectedUser && selectedUser.id === editFormData.id) {
        setSelectedUser((prev) => ({ ...prev, ...editFormData }));
      }

      setIsEditModalOpen(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update user.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Quick Loan Assignment
  const handleOpenQuickLoan = (u) => {
    setQuickLoanTarget(u);
    setQuickLoanError('');
    const isMerchant = u.role === 'SHOPKEEPER';
    const isMonthly = u.role === 'MONTHLY_BORROWER';
    const initialFreq = isMerchant ? 'DAILY' : (isMonthly ? 'MONTHLY' : 'WEEKLY');

    let defaultAmount = lendingConfig.weekly_min_amount;
    let defaultRate = lendingConfig.weekly_interest_rate;
    let defaultTenure = lendingConfig.weekly_tenure_weeks;
    if (initialFreq === 'DAILY') {
      defaultAmount = lendingConfig.daily_min_amount;
      defaultRate = lendingConfig.daily_interest_rate;
      defaultTenure = lendingConfig.daily_tenure_days;
    } else if (initialFreq === 'MONTHLY') {
      defaultAmount = lendingConfig.monthly_min_amount;
      defaultRate = lendingConfig.monthly_interest_rate;
      defaultTenure = lendingConfig.monthly_tenure_months;
    }

    setQuickLoanForm({
      principal: String(defaultAmount),
      frequency: initialFreq,
      interest_rate: String(defaultRate),
      tenure: String(defaultTenure),
    });
    setIsQuickLoanModalOpen(true);
  };

  const handleQuickLoanFrequencyChange = (newFreq) => {
    setQuickLoanError('');
    let defaultAmount = lendingConfig.weekly_min_amount;
    let defaultRate = lendingConfig.weekly_interest_rate;
    let defaultTenure = lendingConfig.weekly_tenure_weeks;
    if (newFreq === 'DAILY') {
      defaultAmount = lendingConfig.daily_min_amount;
      defaultRate = lendingConfig.daily_interest_rate;
      defaultTenure = lendingConfig.daily_tenure_days;
    } else if (newFreq === 'MONTHLY') {
      defaultAmount = lendingConfig.monthly_min_amount;
      defaultRate = lendingConfig.monthly_interest_rate;
      defaultTenure = lendingConfig.monthly_tenure_months;
    }

    setQuickLoanForm((prev) => ({
      ...prev,
      frequency: newFreq,
      principal: String(defaultAmount),
      interest_rate: String(defaultRate),
      tenure: String(defaultTenure),
    }));
  };

  const handleQuickLoanSubmit = async (e) => {
    e.preventDefault();
    if (!quickLoanTarget) return;
    setQuickLoanError('');

    const principalNum = parseFloat(quickLoanForm.principal) || 0;
    const limits =
      quickLoanForm.frequency === 'DAILY'
        ? { min: lendingConfig.daily_min_amount, max: lendingConfig.daily_max_amount }
        : quickLoanForm.frequency === 'MONTHLY'
        ? { min: lendingConfig.monthly_min_amount, max: lendingConfig.monthly_max_amount }
        : { min: lendingConfig.weekly_min_amount, max: lendingConfig.weekly_max_amount };

    if (principalNum < limits.min) {
      setQuickLoanError(`Minimum principal amount for ${quickLoanForm.frequency} scheme is ₹${limits.min.toLocaleString('en-IN')}`);
      return;
    }
    if (principalNum > limits.max) {
      setQuickLoanError(`Maximum principal amount for ${quickLoanForm.frequency} scheme is ₹${limits.max.toLocaleString('en-IN')}`);
      return;
    }

    setSubmittingLoan(true);
    try {
      await api.createLoan({
        organizationId: activeOrg?.id || 1,
        userId: quickLoanTarget.id,
        customerId: quickLoanTarget.customerId || quickLoanTarget.id,
        principal: principalNum,
        frequency: quickLoanForm.frequency,
        interest_rate: parseFloat(quickLoanForm.interest_rate) || 25.0,
        tenure: parseInt(quickLoanForm.tenure) || 10,
        tenure_weeks: quickLoanForm.frequency === 'WEEKLY' ? parseInt(quickLoanForm.tenure) : undefined,
        tenure_days: quickLoanForm.frequency === 'DAILY' ? parseInt(quickLoanForm.tenure) : undefined,
        tenure_months: quickLoanForm.frequency === 'MONTHLY' ? parseInt(quickLoanForm.tenure) : undefined,
      });

      setIsQuickLoanModalOpen(false);
      setStatusFeedback(`New loan created & schedule generated for ${quickLoanTarget.name}!`);
      setTimeout(() => setStatusFeedback(null), 3500);

      if (viewMode === 'VIRTUAL_PAGE' && selectedUser?.id === quickLoanTarget.id) {
        const fullProfile = await api.getUserById(quickLoanTarget.id);
        setSelectedUser(fullProfile || selectedUser);
      }
      await loadUsers();
    } catch (err) {
      setQuickLoanError(err.message || 'Failed to create loan');
    } finally {
      setSubmittingLoan(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter, pageSize]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      (u.customerCode && u.customerCode.toLowerCase().includes(q)) ||
      (u.customer_code && u.customer_code.toLowerCase().includes(q)) ||
      u.city?.toLowerCase().includes(q) ||
      (u.shopName && u.shopName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA, valB;
    switch (sortColumn) {
      case 'id':
        valA = a.id || 0;
        valB = b.id || 0;
        break;
      case 'name':
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        break;
      case 'role':
        valA = (a.role || '').toLowerCase();
        valB = (b.role || '').toLowerCase();
        break;
      case 'dateJoined':
        valA = new Date(a.dateJoined || a.createdAt || 0).getTime();
        valB = new Date(b.dateJoined || b.createdAt || 0).getTime();
        break;
      case 'activeLoans':
        valA = a.activeLoansCount || 0;
        valB = b.activeLoansCount || 0;
        break;
      case 'outstanding':
        valA = a.outstandingAmount || 0;
        valB = b.outstandingAmount || 0;
        break;
      case 'status':
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
        break;
      default:
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
    }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalOutstanding = users.reduce((sum, u) => sum + (u.outstandingAmount || 0), 0);
  const totalActiveBorrowers = users.filter((u) => (u.activeLoansCount || 0) > 0).length;

  if (viewMode === 'VIRTUAL_PAGE') {
    return (
      <BorrowerHistoryView
        user={selectedUser}
        onBack={() => setViewMode('DIRECTORY')}
        onEdit={(u) => openEditModal(u || selectedUser)}
        onAssignLoan={(u) => handleOpenQuickLoan(u || selectedUser)}
        formatCurrency={formatCurrency}
        statusFeedback={statusFeedback}
        detailLoading={detailLoading}
      />
    );
  }

  // =========================================================================
  // VIEW 2: STANDARD USERS DIRECTORY TABLE (LIGHT FINTECH AESTHETIC)
  // =========================================================================
  // Helper for rendering sorting arrows in table header (Image 2 style)
  const renderSortIndicator = (col) => {
    if (sortColumn !== col) {
      return <ArrowUpDown size={12} className="directory-sort-icon" style={{ opacity: 0.6, marginLeft: 4 }} />;
    }
    return (
      <span className="directory-sort-icon active" style={{ marginLeft: 4, fontWeight: 800 }}>
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const isFilterActive = searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="manage-users-page">
      {/* Header */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">
              Borrower & User Directory
            </h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            className="directory-btn-primary"
            onClick={() => navigate(getOrgPath('users/add'))}
          >
            <UserPlus size={16} />
            <span>Onboard New Borrower</span>
          </button>
        </div>
      </div>

      {statusFeedback && (
        <div className="directory-feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* KPI Top Strip */}
      <div className="directory-kpi-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="directory-kpi-card">
              <div className="directory-kpi-top">
                <div className="directory-skeleton-bar" style={{ width: '50%', height: 13 }} />
                <div className="directory-skeleton-avatar" style={{ width: 28, height: 28, borderRadius: 6 }} />
              </div>
              <div className="directory-skeleton-bar" style={{ width: '65%', height: 28, margin: '0.4rem 0' }} />
              <div className="directory-skeleton-bar" style={{ width: '40%', height: 11 }} />
            </div>
          ))
        ) : (
          <>
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Total Enrolled Users</span>
                <div className="directory-kpi-icon indigo">
                  <Users size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">
                {users.length}
              </h3>
              <span className="directory-kpi-desc">All registered accounts</span>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Active Borrowers</span>
                <div className="directory-kpi-icon emerald">
                  <CreditCard size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">
                {totalActiveBorrowers}
              </h3>
              <span className="directory-kpi-desc">With running installment schemes</span>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Total Outstanding Portfolio</span>
                <div className="directory-kpi-icon amber">
                  <DollarSign size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">
                {formatCurrency(totalOutstanding)}
              </h3>
              <span className="directory-kpi-desc">Pending recovery balance</span>
            </div>

            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Completed Loans Archive</span>
                <div className="directory-kpi-icon purple">
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">
                {users.reduce((sum, u) => sum + (u.completedLoansCount || 0), 0)}
              </h3>
              <span className="directory-kpi-desc">Fully settled micro-loans</span>
            </div>
          </>
        )}
      </div>

      {/* Professional Search & Filter Bar (Matching Onboard Borrower) */}
      <div className="directory-controls-bar">
        <div className="directory-search-wrapper">
          <span className="directory-search-icon">
            <Search size={17} />
          </span>
          <input
            type="text"
            className="directory-search-input"
            placeholder="Search by name, phone, customer code, or shop name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="directory-search-clear"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="directory-filters-group">
          <div className="directory-select-wrapper">
            <select
              className="directory-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="COMMON_CUSTOMER">Borrowers (Weekly)</option>
              <option value="SHOPKEEPER">Merchants (Daily)</option>
              <option value="FIELD_AGENT">Field Agents</option>
              <option value="ADMIN">Admins / Staff</option>
            </select>
            <span className="directory-select-chevron">
              <ChevronDown size={14} />
            </span>
          </div>

          <div className="directory-select-wrapper" style={{ minWidth: 145 }}>
            <select
              className="directory-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <span className="directory-select-chevron">
              <ChevronDown size={14} />
            </span>
          </div>

          {isFilterActive && (
            <button
              className="directory-reset-filter-btn"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              title="Reset all search and filter conditions"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table (Gradient Header & Exact Image 2 Aesthetic) */}
      <div className="directory-table-card">
        <div className="directory-table-responsive">
          <table className="directory-table">
            <colgroup>
              <col style={{ width: '22%', minWidth: '200px' }} />
              <col style={{ width: '15%', minWidth: '140px' }} />
              <col style={{ width: '18%', minWidth: '160px' }} />
              <col style={{ width: '12%', minWidth: '110px' }} />
              <col style={{ width: '11%', minWidth: '100px' }} />
              <col style={{ width: '9%', minWidth: '90px' }} />
              <col style={{ width: '13%', minWidth: '120px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>
                  <span className="directory-th-content">
                    BORROWER / USER {renderSortIndicator('name')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('role')}>
                  <span className="directory-th-content">
                    CATEGORY {renderSortIndicator('role')}
                  </span>
                </th>
                <th>
                  <span className="directory-th-content">
                    CONTACT & LOCATION
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('dateJoined')}>
                  <span className="directory-th-content">
                    DATE JOINED {renderSortIndicator('dateJoined')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('activeLoans')}>
                  <span className="directory-th-content">
                    ACTIVE LOANS {renderSortIndicator('activeLoans')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('status')}>
                  <span className="directory-th-content">
                    STATUS {renderSortIndicator('status')}
                  </span>
                </th>
                <th>
                  <span className="directory-th-content">
                    ACTIONS
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: pageSize > 8 ? 8 : pageSize }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>
                      <div className="directory-user-cell">
                        <div className="directory-skeleton-avatar" />
                        <div>
                          <div className="directory-skeleton-bar" style={{ width: 130, height: 14, marginBottom: '0.35rem' }} />
                          <div className="directory-skeleton-bar" style={{ width: 80, height: 10 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="directory-skeleton-bar" style={{ width: 105, height: 20, borderRadius: 4, margin: '0 auto 4px auto' }} />
                      <div className="directory-skeleton-bar" style={{ width: 75, height: 10, margin: '0 auto' }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="directory-skeleton-bar" style={{ width: 95, height: 14, margin: '0 auto 4px auto' }} />
                      <div className="directory-skeleton-bar" style={{ width: 120, height: 11, margin: '0 auto' }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="directory-skeleton-bar" style={{ width: 85, height: 13, margin: '0 auto' }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="directory-skeleton-bar" style={{ width: 60, height: 16, borderRadius: 4, margin: '0 auto' }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="directory-skeleton-bar" style={{ width: 65, height: 20, borderRadius: 4, margin: '0 auto' }} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <div className="directory-skeleton-bar" style={{ width: 85, height: 28, borderRadius: 6 }} />
                        <div className="directory-skeleton-bar" style={{ width: 28, height: 28, borderRadius: 6 }} />
                        <div className="directory-skeleton-bar" style={{ width: 28, height: 28, borderRadius: 6 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <Users size={40} style={{ opacity: 0.35, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.75rem auto' }} />
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>No borrowers or users found</div>
                    <span style={{ fontSize: '0.85rem' }}>Try adjusting your search query or filter criteria.</span>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isShop = u.role === 'SHOPKEEPER';
                  const isWeekly = u.role === 'COMMON_CUSTOMER';
                  const isRowActive = activeRowId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={isRowActive ? 'row-highlighted' : ''}
                      onClick={() => setActiveRowId(u.id)}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <div className="directory-user-cell">
                          <div
                            className={`directory-avatar ${isShop ? 'shopkeeper' : isWeekly ? 'weekly' : 'other'}`}
                          >
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="directory-user-details">
                            <span className="directory-user-name">
                              {u.name}
                            </span>
                            <span className="directory-user-code">
                              {u.customerCode || u.customer_code || `CUST-${u.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`directory-category-badge ${isShop ? 'daily' : isWeekly ? 'weekly' : 'other'}`}
                        >
                          {isShop ? 'Merchant (Daily)' : isWeekly ? 'Borrower (Weekly)' : u.role}
                        </span>
                        {u.shopName && (
                          <div className="directory-shop-sub">
                            {u.shopName}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div className="directory-contact-info">
                          <span className="directory-contact-phone">
                            <Phone size={13} style={{ color: '#94a3b8' }} />
                            {u.phone}
                          </span>
                          <span className="directory-contact-location">
                            <MapPin size={12} style={{ color: '#94a3b8' }} />
                            <span>{u.address ? `${u.address}${u.city ? `, ${u.city}` : ''}` : (u.city || 'No address set')}</span>
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                          {u.dateJoined || '2026-09-11'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 600, color: (u.activeLoansCount || 0) > 0 ? '#059669' : '#94a3b8' }}>
                          {u.activeLoansCount || 0} active
                        </span>
                        {(u.completedLoansCount || 0) > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                            ({u.completedLoansCount} settled)
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <StatusBadge status={u.status || 'ACTIVE'} />
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div className="directory-actions-cell" onClick={(e) => e.stopPropagation()}>
                          {/* Open Virtual Page View */}
                          <button
                            className="directory-action-btn with-text"
                            title="Open Virtual Profile & Full History"
                            onClick={() => openVirtualUserPage(u)}
                          >
                            <Eye size={14} />
                            <span>View History</span>
                          </button>

                          {/* Edit User Details */}
                          <button
                            className="directory-action-btn icon-only"
                            title="Edit User Details"
                            onClick={() => openEditModal(u)}
                          >
                            <Edit2 size={13} color="#2563eb" />
                          </button>

                          {/* Quick Loan Issuance */}
                          <button
                            className="directory-action-btn icon-only"
                            title="Assign Loan / Obligation"
                            onClick={() => handleOpenQuickLoan(u)}
                          >
                            <Plus size={14} color="#059669" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            className="directory-action-btn icon-only power-btn"
                            title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                            onClick={() =>
                              handleStatusChange(u.id, u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', u.name)
                            }
                          >
                            <Power size={13} color={u.status === 'ACTIVE' ? '#e11d48' : '#059669'} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Matching Image 2 exact controls) */}
        {!loading && sortedUsers.length > 0 && (
          <div className="directory-pagination-bar">
            <div className="directory-pagination-left">
              <span>Rows per page:</span>
              <div className="directory-rows-select-wrap">
                <select
                  className="directory-rows-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="directory-pagination-center">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (Total <strong>{sortedUsers.length}</strong> {sortedUsers.length === 1 ? 'entry' : 'entries'})
            </div>

            <div className="directory-pagination-right">
              <button
                className="directory-page-btn-prev"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <button
                className="directory-page-btn-next"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 2. EDIT USER MODAL (PUT /api/users/:id)    */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Borrower: ${editFormData.name}`}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Residential / Shop Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 42 Bazaar Road, Saidapet"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Chennai / Tirupur"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Occupation / Trade</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.occupation}
                  onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Shop / Enterprise Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.shopName}
                  onChange={(e) => setEditFormData({ ...editFormData, shopName: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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

      {/* ========================================== */}
      {/* 3. QUICK LOAN ASSIGNMENT MODAL (DYNAMIC)   */}
      {/* ========================================== */}
      {isQuickLoanModalOpen && quickLoanTarget && (() => {
        const qlPrincipal = parseFloat(quickLoanForm.principal) || 0;
        const qlRate = parseFloat(quickLoanForm.interest_rate) || 0;
        const qlTenure = parseInt(quickLoanForm.tenure) || 1;
        const qlInterest = Math.round((qlPrincipal * qlRate) / 100);
        const qlTotalRepayable = qlPrincipal + qlInterest;
        const qlInstallment = qlTenure > 0 ? Math.round(qlTotalRepayable / qlTenure) : 0;

        const limits =
          quickLoanForm.frequency === 'DAILY'
            ? { min: lendingConfig.daily_min_amount, max: lendingConfig.daily_max_amount, label: 'Days' }
            : quickLoanForm.frequency === 'MONTHLY'
            ? { min: lendingConfig.monthly_min_amount, max: lendingConfig.monthly_max_amount, label: 'Months' }
            : { min: lendingConfig.weekly_min_amount, max: lendingConfig.weekly_max_amount, label: 'Weeks' };

        return (
          <Modal
            isOpen={isQuickLoanModalOpen}
            onClose={() => setIsQuickLoanModalOpen(false)}
            title={`Assign Loan: ${quickLoanTarget.name}`}
          >
            <form onSubmit={handleQuickLoanSubmit}>
              {quickLoanError && (
                <div style={{ padding: '0.75rem', background: 'rgba(225,29,72,0.1)', color: '#e11d48', borderRadius: 6, marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {quickLoanError}
                </div>
              )}

              {/* Borrower Details (Plain & Clean Format as in Edit Modal) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Borrower Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={quickLoanTarget.name}
                    readOnly
                    disabled
                    style={{ background: '#f8fafc', color: '#0f172a', fontWeight: 600, cursor: 'default' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={quickLoanTarget.phone || 'N/A'}
                    readOnly
                    disabled
                    style={{ background: '#f8fafc', color: '#0f172a', fontWeight: 600, cursor: 'default' }}
                  />
                </div>
              </div>

              {/* Lending Division Scheme (Card-like Selector) */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ marginBottom: '0.45rem', display: 'block' }}>Lending Division Scheme</label>
                <div className="quick-loan-division-grid">
                  <div
                    className={`quick-loan-division-btn ${quickLoanForm.frequency === 'WEEKLY' ? 'active' : ''}`}
                    onClick={() => handleQuickLoanFrequencyChange('WEEKLY')}
                  >
                    <span className="quick-loan-division-name">Borrower (Weekly)</span>
                    <span className="quick-loan-division-meta">{lendingConfig.weekly_interest_rate}% Flat • {lendingConfig.weekly_tenure_weeks} Wks</span>
                  </div>

                  <div
                    className={`quick-loan-division-btn ${quickLoanForm.frequency === 'DAILY' ? 'active' : ''}`}
                    onClick={() => handleQuickLoanFrequencyChange('DAILY')}
                  >
                    <span className="quick-loan-division-name">Merchant (Daily)</span>
                    <span className="quick-loan-division-meta">{lendingConfig.daily_interest_rate}% Flat • {lendingConfig.daily_tenure_days} Days</span>
                  </div>

                  <div
                    className={`quick-loan-division-btn ${quickLoanForm.frequency === 'MONTHLY' ? 'active' : ''}`}
                    onClick={() => handleQuickLoanFrequencyChange('MONTHLY')}
                  >
                    <span className="quick-loan-division-name">Salaried (Monthly)</span>
                    <span className="quick-loan-division-meta">{lendingConfig.monthly_interest_rate}% Flat • {lendingConfig.monthly_tenure_months} Mos</span>
                  </div>
                </div>
              </div>

              {/* Min - Max Range Badge */}
              <div className="quick-loan-limits-badge">
                <span>Configured Limits ({quickLoanForm.frequency}):</span>
                <span>
                  Min: <strong>₹{limits.min.toLocaleString('en-IN')}</strong> — Max: <strong>₹{limits.max.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              {/* Principal Amount & Rate & Tenure in Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Principal Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quickLoanForm.principal}
                    onChange={(e) => setQuickLoanForm({ ...quickLoanForm, principal: e.target.value })}
                    min={limits.min}
                    max={limits.max}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interest Rate (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={quickLoanForm.interest_rate}
                    onChange={(e) => setQuickLoanForm({ ...quickLoanForm, interest_rate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tenure ({limits.label}) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quickLoanForm.tenure}
                    onChange={(e) => setQuickLoanForm({ ...quickLoanForm, tenure: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Financial Calculation Breakdown Card (Plain & Clean) */}
              <div className="quick-loan-preview-card" style={{ marginBottom: '1.25rem' }}>
                <div className="quick-loan-preview-row">
                  <span>Principal Disbursed:</span>
                  <strong>₹{Number(qlPrincipal).toLocaleString('en-IN')}</strong>
                </div>
                <div className="quick-loan-preview-row">
                  <span>Flat Interest ({qlRate}%):</span>
                  <strong>+ ₹{Number(qlInterest).toLocaleString('en-IN')}</strong>
                </div>
                <div className="quick-loan-preview-row total-row">
                  <span>Total Repayable Amount:</span>
                  <strong>₹{Number(qlTotalRepayable).toLocaleString('en-IN')}</strong>
                </div>
                <div className="quick-loan-preview-row installment-row">
                  <span>Scheduled Installment:</span>
                  <strong>
                    ₹{Number(qlInstallment).toLocaleString('en-IN')} / {quickLoanForm.frequency === 'DAILY' ? 'day' : quickLoanForm.frequency === 'WEEKLY' ? 'week' : 'month'}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsQuickLoanModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingLoan}>
                  {submittingLoan ? 'Generating Schedule...' : 'Disburse & Assign Loan'}
                </button>
              </div>
            </form>
          </Modal>
        );
      })()}
    </div>
  );
};

export default ManageUsers;
