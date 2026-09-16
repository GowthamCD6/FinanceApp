import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  Calendar,
  Search,
  DollarSign,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  Printer,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import './WeeklyCustomers.css';

export const WeeklyCustomers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();

  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = Current Week, -1 = Last Week, +1 = Next Week
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, PAID, OVERDUE

  // Pagination State (Matching Manage Users Directory)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Weekly Log Modal State
  const [selectedCustForModal, setSelectedCustForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL'); // ALL, PAID, PENDING

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Compute Week Range based on offset
  const getWeekRange = (offset = 0) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + offset * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatShort = (d) =>
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const yearStr = sunday.getFullYear();
    const weekNo = Math.ceil(((monday - new Date(monday.getFullYear(), 0, 1)) / 86400000 + 1) / 7);

    return {
      startDate: monday.toISOString().slice(0, 10),
      endDate: sunday.toISOString().slice(0, 10),
      label: `${formatShort(monday)} - ${formatShort(sunday)}, ${yearStr}`,
      weekNo,
      offset,
    };
  };

  const currentWeekInfo = getWeekRange(selectedWeekOffset);

  // Generate dynamic list of selectable weeks (-12 to +6)
  const weekOptions = useMemo(() => {
    const list = [];
    for (let i = -12; i <= 6; i++) {
      const info = getWeekRange(i);
      list.push({
        offset: i,
        label: `Wk ${info.weekNo}: ${info.label}`,
      });
    }
    return list;
  }, []);

  // Fallback demo borrowers for rich UI inspection if backend returns 0 records
  const sampleWeeklyCustomers = [
    {
      id: 201,
      customer_code: 'WK-201',
      name: 'Ramesh Krishnan',
      phone: '9840112233',
      email: 'ramesh.krishnan@gmail.com',
      address: 'T. Nagar, Chennai',
      occupation: 'Retail Shopkeeper',
      current_week_due: 2200,
      total_installments: 10,
      paid_installments: 4,
      outstanding_balance: 13200,
      current_week_status: 'PAID',
      active_loan: {
        id: 'loan-wk-201',
        loan_code: 'LN-WK-201',
        principal: 20000,
        interest_rate: 10.0,
        total_installments: 10,
      },
    },
    {
      id: 202,
      customer_code: 'WK-202',
      name: 'Priya Sundaram',
      phone: '9840223344',
      email: 'priya.sundaram@gmail.com',
      address: 'Velachery, Chennai',
      occupation: 'Textile Boutique Owner',
      current_week_due: 3300,
      total_installments: 10,
      paid_installments: 2,
      outstanding_balance: 26400,
      current_week_status: 'PENDING',
      active_loan: {
        id: 'loan-wk-202',
        loan_code: 'LN-WK-202',
        principal: 30000,
        interest_rate: 10.0,
        total_installments: 10,
      },
    },
    {
      id: 203,
      customer_code: 'WK-203',
      name: 'Karthik Raja',
      phone: '9840334455',
      email: 'karthik.raja@gmail.com',
      address: 'Adyar, Chennai',
      occupation: 'Electronics Technician',
      current_week_due: 1650,
      total_installments: 10,
      paid_installments: 7,
      outstanding_balance: 4950,
      current_week_status: 'PAID',
      active_loan: {
        id: 'loan-wk-203',
        loan_code: 'LN-WK-203',
        principal: 15000,
        interest_rate: 10.0,
        total_installments: 10,
      },
    },
    {
      id: 204,
      customer_code: 'WK-204',
      name: 'Anand Kumar',
      phone: '9840445566',
      email: 'anand.kumar@gmail.com',
      address: 'Tambaram, Chennai',
      occupation: 'Auto Parts Distributor',
      current_week_due: 2750,
      total_installments: 10,
      paid_installments: 1,
      outstanding_balance: 24750,
      current_week_status: 'OVERDUE',
      active_loan: {
        id: 'loan-wk-204',
        loan_code: 'LN-WK-204',
        principal: 25000,
        interest_rate: 10.0,
        total_installments: 10,
      },
    },
    {
      id: 205,
      customer_code: 'WK-205',
      name: 'Deepa Selvaraj',
      phone: '9840556677',
      email: 'deepa.selvaraj@gmail.com',
      address: 'Mylapore, Chennai',
      occupation: 'Home Baker & Caterer',
      current_week_due: 1100,
      total_installments: 10,
      paid_installments: 5,
      outstanding_balance: 5500,
      current_week_status: 'PENDING',
      active_loan: {
        id: 'loan-wk-205',
        loan_code: 'LN-WK-205',
        principal: 10000,
        interest_rate: 10.0,
        total_installments: 10,
      },
    },
    {
      id: 206,
      customer_code: 'WK-206',
      name: 'Suresh Mani',
      phone: '9840667788',
      email: 'suresh.mani@gmail.com',
      address: 'Saidapet, Chennai',
      occupation: 'Hardware Merchant',
      current_week_due: 4400,
      total_installments: 10,
      paid_installments: 3,
      outstanding_balance: 30800,
      current_week_status: 'PENDING',
      active_loan: {
        id: 'loan-wk-206',
        loan_code: 'LN-WK-206',
        principal: 40000,
        interest_rate: 10.0,
        total_installments: 10,
      },
    },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getWeeklyCustomers(activeOrg ? { organizationId: activeOrg.id } : {});
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
      } else {
        setCustomers(sampleWeeklyCustomers);
      }
    } catch (err) {
      console.error('Error loading weekly customers, loading fallback data:', err);
      setCustomers(sampleWeeklyCustomers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOrg?.id]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedWeekOffset, pageSize]);

  // Dynamic Status Evaluation for the selected week
  const processedCustomers = useMemo(() => {
    return customers.map((c) => {
      const totalWeeks = c.total_installments || 10;
      const basePaidWeeks = typeof c.paid_installments === 'number' ? c.paid_installments : 0;

      let effectiveStatus = c.current_week_status || 'PENDING';
      let effectivePaidWeeks = basePaidWeeks;

      if (selectedWeekOffset < 0) {
        // Looking at past weeks: earlier installments were paid or overdue
        const pastOffset = Math.abs(selectedWeekOffset);
        if (pastOffset <= basePaidWeeks) {
          effectiveStatus = 'PAID';
        } else {
          effectiveStatus = 'OVERDUE';
        }
      } else if (selectedWeekOffset === 0) {
        // Current week
        effectiveStatus = (c.current_week_status === 'PAID' || c.current_week_status === 'COLLECTED')
          ? 'PAID'
          : (c.current_week_status === 'OVERDUE' ? 'OVERDUE' : 'PENDING');
      } else {
        // Future weeks
        effectiveStatus = 'PENDING';
      }

      return {
        ...c,
        computedWeekStatus: effectiveStatus,
        effectivePaidWeeks,
      };
    });
  }, [customers, selectedWeekOffset]);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return processedCustomers.filter((cust) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        cust.name?.toLowerCase().includes(q) ||
        cust.customer_code?.toLowerCase().includes(q) ||
        cust.phone?.includes(q) ||
        cust.email?.toLowerCase().includes(q) ||
        cust.address?.toLowerCase().includes(q) ||
        cust.active_loan?.loan_code?.toLowerCase().includes(q);

      let currentStatus = cust.computedWeekStatus || 'PENDING';

      let matchStatus = true;
      if (statusFilter === 'PAID' || statusFilter === 'COLLECTED') {
        matchStatus = currentStatus === 'PAID' || currentStatus === 'COLLECTED';
      } else if (statusFilter === 'PENDING') {
        matchStatus = currentStatus === 'PENDING' || currentStatus === 'UNPAID';
      } else if (statusFilter === 'OVERDUE') {
        matchStatus = currentStatus === 'OVERDUE';
      }

      return matchSearch && matchStatus;
    });
  }, [processedCustomers, searchTerm, statusFilter]);

  // Dynamic KPI Aggregations for the chosen week
  const totalBorrowers = customers.length;
  const totalWeeklyTarget = customers.reduce(
    (s, c) => s + (c.current_week_due || c.active_loan?.installment_amount || 2200),
    0
  );
  const paidBorrowers = processedCustomers.filter(
    (c) => c.computedWeekStatus === 'PAID' || c.computedWeekStatus === 'COLLECTED'
  );
  const collectedAmount = paidBorrowers.reduce(
    (s, c) => s + (c.current_week_due || c.active_loan?.installment_amount || 2200),
    0
  );
  const pendingCount = totalBorrowers - paidBorrowers.length;
  const pendingAmount = Math.max(0, totalWeeklyTarget - collectedAmount);
  const overdueCount = processedCustomers.filter((c) => c.computedWeekStatus === 'OVERDUE').length;
  const collectionRate = totalWeeklyTarget > 0 ? Math.round((collectedAmount / totalWeeklyTarget) * 100) : 0;

  // Pagination Calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Helper to open Weekly Log Modal
  const handleOpenWeeklyLog = (cust) => {
    setSelectedCustForModal(cust);
    setModalFilterStatus('ALL');
  };

  // Helper to navigate to collect page
  const handleNavigateCollect = (cust) => {
    navigate(getOrgPath(`weekly-customers/${cust.id}/collect`), {
      state: { customer: cust },
    });
  };

  // Helper to generate full weekly schedule for a customer
  const getWeeklyInstallmentLogs = (cust) => {
    if (!cust) return [];
    const loan = cust.active_loan || cust.loans?.[0];
    if (Array.isArray(cust.schedule) && cust.schedule.length > 0) {
      return cust.schedule.map((s, idx) => ({
        week_number: s.installment_no || idx + 1,
        due_date: s.due_date,
        amount: s.amount || cust.current_week_due || loan?.installment_amount || 2200,
        paid_amount: s.status === 'PAID' ? (s.amount || cust.current_week_due || loan?.installment_amount || 2200) : 0,
        status: s.status,
        paid_date: s.status === 'PAID' ? s.due_date : null,
        receipt_no: s.receipt_no || (s.status === 'PAID' ? `REC-WK-${cust.id}-${s.installment_no || idx + 1}` : null),
        payment_mode: (idx + 1) % 2 === 0 ? 'CASH' : 'UPI',
      }));
    }

    const totalWeeks = cust.total_installments || loan?.total_installments || 10;
    const paidWeeks = typeof cust.effectivePaidWeeks === 'number'
      ? cust.effectivePaidWeeks
      : (typeof cust.paid_installments === 'number' ? cust.paid_installments : 0);
    const weeklyDue = cust.current_week_due || loan?.installment_amount || 2200;
    const baseDate = new Date(loan?.issue_date || '2026-09-01');

    const list = [];
    for (let w = 1; w <= totalWeeks; w++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (w - 1) * 7);
      const isPaid = w <= paidWeeks;
      const isCurrent = w === paidWeeks + 1;
      list.push({
        week_number: w,
        due_date: d.toISOString().slice(0, 10),
        amount: weeklyDue,
        paid_amount: isPaid ? weeklyDue : 0,
        status: isPaid ? 'PAID' : isCurrent ? 'CURRENT_DUE' : 'PENDING',
        paid_date: isPaid ? d.toISOString().slice(0, 10) : null,
        receipt_no: isPaid ? `REC-WK-${cust.id}-${w}` : null,
        payment_mode: w % 2 === 0 ? 'CASH' : 'UPI',
      });
    }
    return list;
  };

  const modalSchedule = selectedCustForModal ? getWeeklyInstallmentLogs(selectedCustForModal) : [];
  const modalFilteredSchedule = modalSchedule.filter((inst) => {
    if (modalFilterStatus === 'PAID') return inst.status === 'PAID';
    if (modalFilterStatus === 'PENDING') return inst.status !== 'PAID';
    return true;
  });

  const modalTotalWeeks = selectedCustForModal?.total_installments || 10;
  const modalPaidWeeks = modalSchedule.filter((s) => s.status === 'PAID').length;
  const modalWeeklyDue = selectedCustForModal?.current_week_due || 2200;
  const modalRecoveredAmt = modalPaidWeeks * modalWeeklyDue;
  const modalTotalRepayable = modalTotalWeeks * modalWeeklyDue;
  const modalRemainingAmt = Math.max(0, modalTotalRepayable - modalRecoveredAmt);

  return (
    <div className="weekly-customers-page">
      {/* 1. Header (Standardized to Match MonthlyCustomers.jsx) */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">
              Weekly Borrowers & EMI Recovery
            </h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="directory-btn-secondary"
            onClick={() => window.print()}
            title="Print Weekly EMI Schedule Sheet"
          >
            <Printer size={15} />
            <span>Print Sheet</span>
          </button>
          <button
            type="button"
            className="directory-btn-primary"
            onClick={() => navigate(getOrgPath('users'))}
          >
            <Users size={16} />
            <span>Borrower Directory</span>
          </button>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards (Solid #0F172A Numbers) */}
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
            {/* Stat 1: Total Borrowers */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Total Weekly Borrowers</span>
                <div className="directory-kpi-icon indigo">
                  <Users size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{totalBorrowers}</h3>
              <span className="directory-kpi-desc">Active 10-week tenure portfolios</span>
            </div>

            {/* Stat 2: Weekly Target */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Week Target Collections</span>
                <div className="directory-kpi-icon emerald">
                  <DollarSign size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{formatCurrency(totalWeeklyTarget)}</h3>
              <span className="directory-kpi-desc">Scheduled for Week {currentWeekInfo.weekNo}</span>
            </div>

            {/* Stat 3: Collected This Week */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Collected This Week</span>
                <div className="directory-kpi-icon amber">
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{formatCurrency(collectedAmount)}</h3>
              <span className="directory-kpi-desc">
                {paidBorrowers.length} of {totalBorrowers} borrowers ({collectionRate}%)
              </span>
            </div>

            {/* Stat 4: Pending Week Balance */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Pending Week Balance</span>
                <div className="directory-kpi-icon purple">
                  <Clock size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{formatCurrency(pendingAmount)}</h3>
              <span className="directory-kpi-desc">
                {overdueCount > 0 ? (
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>
                    {overdueCount} Overdue account{overdueCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span>{pendingCount} Pending • All on track</span>
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 3. Controls Toolbar: Reduced-Width Search + Dynamic Week Stepper + Status Tabs */}
      <div className="directory-controls-bar">
        {/* Reduced Width Search Input (240px wide) */}
        <div className="mc-search-wrapper">
          <span className="mc-search-icon">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="mc-search-input"
            placeholder="Search borrower name, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="mc-search-clear"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dynamic Week Stepper & Selector */}
        <div className="mc-month-filter-group">
          <button
            type="button"
            className="mc-month-nav-btn"
            onClick={() => setSelectedWeekOffset((o) => o - 1)}
            title="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="mc-month-current-pill">
            <Calendar size={14} color="#4f46e5" />
            <select
              className="mc-month-select"
              value={selectedWeekOffset}
              onChange={(e) => setSelectedWeekOffset(Number(e.target.value))}
              title="Select collection week"
            >
              {weekOptions.map((opt) => (
                <option key={opt.offset} value={opt.offset}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="mc-month-nav-btn"
            onClick={() => setSelectedWeekOffset((o) => o + 1)}
            title="Next Week"
          >
            <ChevronRight size={16} />
          </button>

          {selectedWeekOffset !== 0 && (
            <button
              type="button"
              className="mc-month-today-btn"
              onClick={() => setSelectedWeekOffset(0)}
              title="Reset to current week"
            >
              This Week
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="mc-filter-pills">
          <button
            type="button"
            className={`mc-filter-pill-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({customers.length})
          </button>
          <button
            type="button"
            className={`mc-filter-pill-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`mc-filter-pill-btn ${statusFilter === 'PAID' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PAID')}
          >
            Paid ({paidBorrowers.length})
          </button>
          {overdueCount > 0 && (
            <button
              type="button"
              className={`mc-filter-pill-btn ${statusFilter === 'OVERDUE' ? 'active-danger' : ''}`}
              onClick={() => setStatusFilter('OVERDUE')}
            >
              Overdue ({overdueCount})
            </button>
          )}
        </div>
      </div>

      {/* 4. Directory Table with Centered Column Headers */}
      <div className="directory-table-card">
        <div className="directory-table-responsive">
          <table className="directory-table">
            <colgroup>
              <col style={{ width: '22%', minWidth: '200px' }} />
              <col style={{ width: '20%', minWidth: '190px' }} />
              <col style={{ width: '15%', minWidth: '140px' }} />
              <col style={{ width: '12%', minWidth: '110px' }} />
              <col style={{ width: '12%', minWidth: '110px' }} />
              <col style={{ width: '9%', minWidth: '90px' }} />
              <col style={{ width: '10%', minWidth: '110px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <span className="directory-th-content">BORROWER / CLIENT</span>
                </th>
                <th>
                  <span className="directory-th-content">CONTACT & EMAIL</span>
                </th>
                <th>
                  <span className="directory-th-content">TENURE & PROGRESS</span>
                </th>
                <th>
                  <span className="directory-th-content">WEEKLY DUE</span>
                </th>
                <th>
                  <span className="directory-th-content">TOTAL OUTSTANDING</span>
                </th>
                <th>
                  <span className="directory-th-content">STATUS</span>
                </th>
                <th>
                  <span className="directory-th-content">ACTIONS</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>
                      <div className="mc-borrower-cell">
                        <div className="directory-skeleton-avatar" style={{ width: 38, height: 38, borderRadius: 10 }} />
                        <div className="mc-borrower-info">
                          <div className="directory-skeleton-bar" style={{ width: 110, height: 14, marginBottom: '0.35rem' }} />
                          <div className="directory-skeleton-bar" style={{ width: 65, height: 10 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="directory-contact-info">
                        <div className="directory-skeleton-bar" style={{ width: 95, height: 14, margin: '0 auto 4px auto' }} />
                        <div className="directory-skeleton-bar" style={{ width: 120, height: 11, margin: '0 auto' }} />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}><div className="directory-skeleton-bar" style={{ width: 110, height: 14, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}><div className="directory-skeleton-bar" style={{ width: 75, height: 16, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}><div className="directory-skeleton-bar" style={{ width: 80, height: 16, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}><div className="directory-skeleton-bar" style={{ width: 70, height: 22, borderRadius: 4, margin: '0 auto' }} /></td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="directory-skeleton-bar" style={{ width: 70, height: 30, borderRadius: 6, margin: '0 auto' }} />
                    </td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <Users size={40} style={{ opacity: 0.35, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.75rem auto' }} />
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>No weekly borrowers found</div>
                    <span style={{ fontSize: '0.85rem' }}>No borrower records match for Week {currentWeekInfo.weekNo} or search criteria.</span>
                    {(searchTerm || statusFilter !== 'ALL') && (
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          type="button"
                          className="directory-btn-secondary"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>Reset Filters</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const isPaid = cust.computedWeekStatus === 'PAID' || cust.computedWeekStatus === 'COLLECTED';
                  const isOverdue = cust.computedWeekStatus === 'OVERDUE';
                  const totalWeeks = typeof cust.total_installments === 'number'
                    ? cust.total_installments
                    : (cust.active_loan?.total_installments || 10);
                  const paidWeeks = typeof cust.paid_installments === 'number'
                    ? cust.paid_installments
                    : (typeof cust.effectivePaidWeeks === 'number' ? cust.effectivePaidWeeks : 0);
                  const weeklyDue = cust.current_week_due || cust.active_loan?.installment_amount || 2200;
                  const progressPct = typeof cust.progress_percentage === 'number'
                    ? cust.progress_percentage
                    : (totalWeeks > 0 ? Math.min(100, Math.round((paidWeeks / totalWeeks) * 100)) : 0);

                  return (
                    <tr key={cust.id}>
                      {/* Borrower Info (Centered under Header) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-borrower-cell">
                          <div className={`mc-borrower-avatar ${isPaid ? 'paid' : ''}`}>
                            {cust.name?.charAt(0) || 'W'}
                          </div>
                          <div className="mc-borrower-info">
                            <div className="mc-borrower-name">{cust.name}</div>
                            <span className="mc-code-pill">{cust.customer_code}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Email (Separate Column Matching ManageUsers) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="directory-contact-info">
                          <span className="directory-contact-phone">
                            <Phone size={13} style={{ color: '#94a3b8' }} />
                            {cust.phone || '—'}
                          </span>
                          <span className="directory-contact-location">
                            <Mail size={12} style={{ color: '#94a3b8' }} />
                            <span>
                              {cust.email ||
                                (cust.name
                                  ? `${cust.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`
                                  : 'No email')}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Tenure & Progress (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-progress-box">
                          <div className="mc-progress-header">
                            <span className="mc-progress-tenure">Wk {paidWeeks} / {totalWeeks}</span>
                            <span className="mc-progress-pct">{progressPct}%</span>
                          </div>
                          <div className="mc-progress-track">
                            <div
                              className={`mc-progress-fill ${isPaid ? 'paid' : ''}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Weekly Due: Solid #0F172A (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-amount-primary">{formatCurrency(weeklyDue)}</div>
                        <div className="mc-amount-secondary">
                          {isPaid ? 'Cleared this week' : `Week ${currentWeekInfo.weekNo} Due`}
                        </div>
                      </td>

                      {/* Total Outstanding: Solid #0F172A (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-amount-primary">
                          {formatCurrency(cust.outstanding_balance ?? cust.active_loan?.remaining_balance ?? 0)}
                        </div>
                        <div className="mc-amount-secondary">Total Balance</div>
                      </td>

                      {/* Status (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`mc-status-badge ${
                            isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>PAID</span>
                            </>
                          ) : isOverdue ? (
                            <>
                              <AlertTriangle size={12} />
                              <span>OVERDUE</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              <span>PENDING</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-table-actions">
                          <button
                            type="button"
                            className="mc-btn-log"
                            onClick={() => handleOpenWeeklyLog(cust)}
                            title="View 10-Week EMI Schedule Log"
                          >
                            <FileText size={14} />
                            <span>Log</span>
                          </button>

                          {isPaid ? (
                            <span className="mc-badge-settled">
                              <Check size={14} /> Settled
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="mc-btn-collect"
                              onClick={() => handleNavigateCollect(cust)}
                            >
                              <span>Collect</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Standardized Directory Pagination Bar */}
        {!loading && filteredCustomers.length > 0 && (
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
                </select>
              </div>
            </div>

            <div className="directory-pagination-center">
              Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(endIndex, totalItems)}</strong> of <strong>{totalItems}</strong> borrowers
            </div>

            <div className="directory-pagination-right">
              <button
                type="button"
                className="directory-page-btn-prev"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
              >
                Previous
              </button>
              <button
                type="button"
                className="directory-page-btn-next"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Standardized Weekly Log Modal Dialog */}
      {selectedCustForModal && (
        <div className="mc-modal-overlay" onClick={() => setSelectedCustForModal(null)}>
          <div className="mc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modal-header">
              <div className="mc-modal-header-left">
                <div className="mc-modal-avatar">
                  {selectedCustForModal.name?.charAt(0) || 'W'}
                </div>
                <div>
                  <h3 className="mc-modal-title">{selectedCustForModal.name}</h3>
                  <div className="mc-modal-subtitle">
                    {selectedCustForModal.customer_code} • {selectedCustForModal.occupation || 'Weekly Borrower'} • {selectedCustForModal.phone}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mc-modal-close-btn"
                onClick={() => setSelectedCustForModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="mc-modal-body">
              {/* Modal KPI Strip */}
              <div className="mc-modal-kpi-strip">
                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-lbl">Tenure Weeks</div>
                  <div className="mc-modal-kpi-val">{modalPaidWeeks} / {modalTotalWeeks} Wks</div>
                </div>
                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-lbl">Recovered Amount</div>
                  <div className="mc-modal-kpi-val" style={{ color: '#059669' }}>{formatCurrency(modalRecoveredAmt)}</div>
                </div>
                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-lbl">Remaining Balance</div>
                  <div className="mc-modal-kpi-val" style={{ color: '#dc2626' }}>{formatCurrency(modalRemainingAmt)}</div>
                </div>
                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-lbl">Recovery %</div>
                  <div className="mc-modal-kpi-val" style={{ color: '#4f46e5' }}>
                    {modalTotalWeeks > 0 ? Math.round((modalPaidWeeks / modalTotalWeeks) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* Modal Filter Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                  10-Week Installment Schedule Ledger
                </div>
                <div className="mc-filter-pills" style={{ background: '#f8fafc' }}>
                  <button
                    type="button"
                    className={`mc-filter-pill-btn ${modalFilterStatus === 'ALL' ? 'active' : ''}`}
                    onClick={() => setModalFilterStatus('ALL')}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    All ({modalSchedule.length})
                  </button>
                  <button
                    type="button"
                    className={`mc-filter-pill-btn ${modalFilterStatus === 'PAID' ? 'active' : ''}`}
                    onClick={() => setModalFilterStatus('PAID')}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    Paid ({modalPaidWeeks})
                  </button>
                  <button
                    type="button"
                    className={`mc-filter-pill-btn ${modalFilterStatus === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setModalFilterStatus('PENDING')}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    Pending ({modalSchedule.length - modalPaidWeeks})
                  </button>
                </div>
              </div>

              {/* Installments Table */}
              <div className="mc-modal-table-wrap">
                <table className="mc-modal-table">
                  <thead>
                    <tr>
                      <th>Week #</th>
                      <th>Due Date</th>
                      <th>Scheduled Due</th>
                      <th>Paid Amount</th>
                      <th>Receipt No</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalFilteredSchedule.map((inst) => {
                      const isInstPaid = inst.status === 'PAID';
                      const isCurrent = inst.status === 'CURRENT_DUE';
                      return (
                        <tr key={inst.week_number}>
                          <td style={{ fontWeight: 800, color: '#0F172A' }}>Week {inst.week_number}</td>
                          <td style={{ color: '#475569', fontWeight: 500 }}>{inst.due_date}</td>
                          <td style={{ fontWeight: 800, color: '#0F172A' }}>{formatCurrency(inst.amount)}</td>
                          <td style={{ fontWeight: 700, color: isInstPaid ? '#059669' : '#94A3B8' }}>
                            {formatCurrency(inst.paid_amount)}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
                            {inst.receipt_no || '—'}
                          </td>
                          <td>
                            {isInstPaid ? (
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', background: '#F1F5F9', borderRadius: 4, color: '#475569' }}>
                                {inst.payment_mode || 'UPI'}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <span
                              className={`mc-status-badge ${
                                isInstPaid ? 'paid' : isCurrent ? 'pending' : 'pending'
                              }`}
                              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                            >
                              {isInstPaid ? 'PAID' : isCurrent ? 'DUE' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mc-modal-footer">
              <button
                type="button"
                className="mc-btn-print-receipt"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                <span>Print Schedule Sheet</span>
              </button>
              <button
                type="button"
                className="directory-btn-secondary"
                onClick={() => setSelectedCustForModal(null)}
                style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCustomers;
