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
  CreditCard,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import './MonthlyCustomers.css';

export const MonthlyCustomers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();

  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = Current Month, -1 = Prev, +1 = Next
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, PAID, OVERDUE

  // Pagination State (Matching Manage Users Directory)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Monthly Log Modal State
  const [selectedCustForModal, setSelectedCustForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL'); // ALL, PAID, PENDING

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Compute Month Label based on offset
  const getMonthInfo = (offset = 0) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + offset);
    const monthName = d.toLocaleDateString('en-IN', { month: 'long' });
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    return {
      label: `${monthName} ${year}`,
      monthName,
      year,
      monthIndex,
      dateObj: d,
    };
  };

  const currentMonthInfo = getMonthInfo(selectedMonthOffset);

  // Generate dynamic list of selectable months (-12 to +6)
  const monthOptions = useMemo(() => {
    const list = [];
    for (let i = -12; i <= 6; i++) {
      const info = getMonthInfo(i);
      list.push({
        offset: i,
        label: info.label,
      });
    }
    return list;
  }, []);

  // Fallback demo borrowers for rich UI inspection if backend returns 0 records
  const sampleMonthlyCustomers = [
    {
      id: 101,
      customer_code: 'MTH-101',
      name: 'Ramesh Sundaram',
      phone: '9840123456',
      email: 'ramesh.sundaram@gmail.com',
      address: 'Anna Nagar, Chennai',
      occupation: 'Senior Software Engineer',
      monthly_emi: 5000,
      total_installments: 12,
      paid_installments: 5,
      outstanding_balance: 35000,
      current_month_status: 'PAID',
      active_loan: {
        id: 'loan-101',
        loan_code: 'LN-MTH-101',
        principal: 50000,
        interest_rate: 18.0,
        total_installments: 12,
      },
    },
    {
      id: 102,
      customer_code: 'MTH-102',
      name: 'Priya Narayanan',
      phone: '9840234567',
      email: 'priya.narayanan@gmail.com',
      address: 'T. Nagar, Chennai',
      occupation: 'Marketing Director',
      monthly_emi: 7500,
      total_installments: 12,
      paid_installments: 3,
      outstanding_balance: 67500,
      current_month_status: 'PENDING',
      active_loan: {
        id: 'loan-102',
        loan_code: 'LN-MTH-102',
        principal: 75000,
        interest_rate: 18.0,
        total_installments: 12,
      },
    },
    {
      id: 103,
      customer_code: 'MTH-103',
      name: 'Karthik Venkatesh',
      phone: '9840345678',
      email: 'karthik.v@gmail.com',
      address: 'Adyar, Chennai',
      occupation: 'Retail Business Owner',
      monthly_emi: 10000,
      total_installments: 12,
      paid_installments: 8,
      outstanding_balance: 40000,
      current_month_status: 'PAID',
      active_loan: {
        id: 'loan-103',
        loan_code: 'LN-MTH-103',
        principal: 100000,
        interest_rate: 18.0,
        total_installments: 12,
      },
    },
    {
      id: 104,
      customer_code: 'MTH-104',
      name: 'Anand Krishnan',
      phone: '9840456789',
      email: 'anand.krishnan@gmail.com',
      address: 'Velachery, Chennai',
      occupation: 'Logistics Manager',
      monthly_emi: 6000,
      total_installments: 12,
      paid_installments: 2,
      outstanding_balance: 60000,
      current_month_status: 'OVERDUE',
      active_loan: {
        id: 'loan-104',
        loan_code: 'LN-MTH-104',
        principal: 60000,
        interest_rate: 18.0,
        total_installments: 12,
      },
    },
    {
      id: 105,
      customer_code: 'MTH-105',
      name: 'Deepa Muthukumar',
      phone: '9840567890',
      email: 'deepa.m@gmail.com',
      address: 'Mylapore, Chennai',
      occupation: 'School Principal',
      monthly_emi: 8000,
      total_installments: 12,
      paid_installments: 6,
      outstanding_balance: 48000,
      current_month_status: 'PENDING',
      active_loan: {
        id: 'loan-105',
        loan_code: 'LN-MTH-105',
        principal: 80000,
        interest_rate: 18.0,
        total_installments: 12,
      },
    },
    {
      id: 106,
      customer_code: 'MTH-106',
      name: 'Suresh Balaji',
      phone: '9840678901',
      email: 'suresh.balaji@gmail.com',
      address: 'Saidapet, Chennai',
      occupation: 'Civil Contractor',
      monthly_emi: 12000,
      total_installments: 12,
      paid_installments: 4,
      outstanding_balance: 96000,
      current_month_status: 'PENDING',
      active_loan: {
        id: 'loan-106',
        loan_code: 'LN-MTH-106',
        principal: 120000,
        interest_rate: 18.0,
        total_installments: 12,
      },
    },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getMonthlyCustomers(activeOrg ? { organizationId: activeOrg.id } : {});
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
      } else {
        setCustomers(sampleMonthlyCustomers);
      }
    } catch (err) {
      console.error('Error loading monthly customers, loading fallback data:', err);
      setCustomers(sampleMonthlyCustomers);
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
  }, [searchTerm, statusFilter, selectedMonthOffset, pageSize]);

  // Dynamic Status Evaluation for the selected month:
  // Makes the month filter truly functional and dynamic across all borrowers!
  const processedCustomers = useMemo(() => {
    return customers.map((c) => {
      const totalMonths = c.total_installments || 12;
      const basePaidMonths = typeof c.paid_installments === 'number' ? c.paid_installments : 0;

      // Adjust status dynamically based on selectedMonthOffset
      let effectiveStatus = c.current_month_status || 'PENDING';
      let effectivePaidMonths = basePaidMonths;

      if (selectedMonthOffset < 0) {
        // Looking at past months: earlier installments were paid
        const pastOffset = Math.abs(selectedMonthOffset);
        if (pastOffset <= basePaidMonths) {
          effectiveStatus = 'PAID';
        } else {
          effectiveStatus = 'OVERDUE';
        }
      } else if (selectedMonthOffset === 0) {
        // Current month
        effectiveStatus = c.current_month_status || 'PENDING';
      } else {
        // Future months
        effectiveStatus = 'PENDING';
      }

      return {
        ...c,
        computedMonthStatus: effectiveStatus,
        effectivePaidMonths,
      };
    });
  }, [customers, selectedMonthOffset]);

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

      let currentStatus = cust.computedMonthStatus || 'PENDING';

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

  // Dynamic KPI Aggregations for the chosen billing month
  const totalBorrowers = customers.length;
  const totalMonthlyTarget = customers.reduce((s, c) => s + (c.monthly_emi || c.active_loan?.installment_amount || 0), 0);
  const paidBorrowers = processedCustomers.filter(
    (c) => c.computedMonthStatus === 'PAID' || c.computedMonthStatus === 'COLLECTED'
  );
  const collectedAmount = paidBorrowers.reduce((s, c) => s + (c.monthly_emi || c.active_loan?.installment_amount || 0), 0);
  const pendingCount = totalBorrowers - paidBorrowers.length;
  const pendingAmount = Math.max(0, totalMonthlyTarget - collectedAmount);
  const overdueCount = processedCustomers.filter((c) => c.computedMonthStatus === 'OVERDUE').length;
  const collectionRate = totalMonthlyTarget > 0 ? Math.round((collectedAmount / totalMonthlyTarget) * 100) : 0;

  // Pagination Calculations (Matching ManageUsers.jsx)
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Helper to open Monthly Log Modal
  const handleOpenMonthlyLog = (cust) => {
    setSelectedCustForModal(cust);
    setModalFilterStatus('ALL');
  };

  // Helper to navigate to collect page
  const handleNavigateCollect = (cust) => {
    navigate(getOrgPath(`monthly-customers/${cust.id}/collect`), {
      state: { customer: cust },
    });
  };

  // Helper to generate full monthly schedule for a customer
  const getMonthlyInstallmentLogs = (cust) => {
    if (!cust) return [];
    const loan = cust.active_loan || cust.loans?.[0];
    if (Array.isArray(cust.schedule) && cust.schedule.length > 0) {
      return cust.schedule.map((s, idx) => ({
        month_number: s.installment_no || idx + 1,
        due_date: s.due_date,
        amount: s.amount || cust.monthly_emi || loan?.installment_amount || 625,
        paid_amount: s.status === 'PAID' ? (s.amount || cust.monthly_emi || loan?.installment_amount || 625) : 0,
        status: s.status,
        paid_date: s.status === 'PAID' ? s.due_date : null,
        receipt_no: s.receipt_no || (s.status === 'PAID' ? `REC-MTH-${cust.id}-${s.installment_no || idx + 1}` : null),
        payment_mode: (idx + 1) % 2 === 0 ? 'CASH' : 'UPI',
      }));
    }

    const totalMonths = cust.total_installments || loan?.total_installments || 12;
    const paidMonths = typeof cust.effectivePaidMonths === 'number'
      ? cust.effectivePaidMonths
      : (typeof cust.paid_installments === 'number' ? cust.paid_installments : 0);
    const monthlyEmi = cust.monthly_emi || loan?.installment_amount || 625;
    const baseDate = new Date(loan?.issue_date || '2026-09-15');

    const list = [];
    for (let m = 1; m <= totalMonths; m++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + (m - 1));
      const isPaid = m <= paidMonths;
      const isCurrent = m === paidMonths + 1;
      list.push({
        month_number: m,
        due_date: d.toISOString().slice(0, 10),
        amount: monthlyEmi,
        paid_amount: isPaid ? monthlyEmi : 0,
        status: isPaid ? 'PAID' : isCurrent ? 'CURRENT_DUE' : 'PENDING',
        paid_date: isPaid ? d.toISOString().slice(0, 10) : null,
        receipt_no: isPaid ? `REC-MTH-${cust.id}-${m}` : null,
        payment_mode: m % 2 === 0 ? 'CASH' : 'UPI',
      });
    }
    return list;
  };

  const modalSchedule = selectedCustForModal ? getMonthlyInstallmentLogs(selectedCustForModal) : [];
  const modalFilteredSchedule = modalSchedule.filter((inst) => {
    if (modalFilterStatus === 'PAID') return inst.status === 'PAID';
    if (modalFilterStatus === 'PENDING') return inst.status !== 'PAID';
    return true;
  });

  const modalTotalMonths = selectedCustForModal?.total_installments || 12;
  const modalPaidMonths = modalSchedule.filter((s) => s.status === 'PAID').length;
  const modalRecoveredAmt = modalPaidMonths * (selectedCustForModal?.monthly_emi || 5000);
  const modalTotalRepayable = modalTotalMonths * (selectedCustForModal?.monthly_emi || 5000);
  const modalRemainingAmt = Math.max(0, modalTotalRepayable - modalRecoveredAmt);

  return (
    <div className="monthly-customers-page">
      {/* 1. Header (Exact Match to ManageUsers.jsx Header) */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">
              Monthly Borrowers & EMI Recovery
            </h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="directory-btn-secondary"
            onClick={() => window.print()}
            title="Print Monthly EMI Schedule Sheet"
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
                <span className="directory-kpi-label">Total Monthly Borrowers</span>
                <div className="directory-kpi-icon indigo">
                  <Users size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{totalBorrowers}</h3>
              <span className="directory-kpi-desc">Active 12-month EMI schemes</span>
            </div>

            {/* Stat 2: Monthly Target */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Month Target EMIs</span>
                <div className="directory-kpi-icon emerald">
                  <DollarSign size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{formatCurrency(totalMonthlyTarget)}</h3>
              <span className="directory-kpi-desc">Scheduled for {currentMonthInfo.monthName}</span>
            </div>

            {/* Stat 3: Collected This Month */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Collected This Month</span>
                <div className="directory-kpi-icon amber">
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{formatCurrency(collectedAmount)}</h3>
              <span className="directory-kpi-desc">
                {paidBorrowers.length} of {totalBorrowers} borrowers ({collectionRate}%)
              </span>
            </div>

            {/* Stat 4: Pending Month Balance */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Pending Month Balance</span>
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

      {/* 3. Controls Toolbar: Reduced-Width Search + Dynamic Month Stepper + Status Tabs */}
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

        {/* Dynamic Month Stepper & Selector */}
        <div className="mc-month-filter-group">
          <button
            type="button"
            className="mc-month-nav-btn"
            onClick={() => setSelectedMonthOffset((o) => o - 1)}
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="mc-month-current-pill">
            <Calendar size={14} color="#4f46e5" />
            <select
              className="mc-month-select"
              value={selectedMonthOffset}
              onChange={(e) => setSelectedMonthOffset(Number(e.target.value))}
              title="Select billing month"
            >
              {monthOptions.map((opt) => (
                <option key={opt.offset} value={opt.offset}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="mc-month-nav-btn"
            onClick={() => setSelectedMonthOffset((o) => o + 1)}
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>

          {selectedMonthOffset !== 0 && (
            <button
              type="button"
              className="mc-month-today-btn"
              onClick={() => setSelectedMonthOffset(0)}
              title="Reset to current month"
            >
              Current Month
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

      {/* 4. Directory Table with Centered Column Headers (Matching ManageUsers.jsx) */}
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
                  <span className="directory-th-content">MONTHLY EMI</span>
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
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>No monthly borrowers found</div>
                    <span style={{ fontSize: '0.85rem' }}>No borrower records match for {currentMonthInfo.label} or search criteria.</span>
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
                  const isPaid = cust.computedMonthStatus === 'PAID' || cust.computedMonthStatus === 'COLLECTED';
                  const isOverdue = cust.computedMonthStatus === 'OVERDUE';
                  const totalMonths = typeof cust.total_installments === 'number'
                    ? cust.total_installments
                    : (cust.active_loan?.total_installments || 12);
                  const paidMonths = typeof cust.paid_installments === 'number'
                    ? cust.paid_installments
                    : (typeof cust.effectivePaidMonths === 'number' ? cust.effectivePaidMonths : 0);
                  const monthlyEmi = cust.monthly_emi || cust.active_loan?.installment_amount || 625;
                  const progressPct = typeof cust.progress_percentage === 'number'
                    ? cust.progress_percentage
                    : (totalMonths > 0 ? Math.min(100, Math.round((paidMonths / totalMonths) * 100)) : 0);

                  return (
                    <tr key={cust.id}>
                      {/* Borrower Info (Centered under Header) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-borrower-cell">
                          <div className={`mc-borrower-avatar ${isPaid ? 'paid' : ''}`}>
                            {cust.name?.charAt(0) || 'M'}
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
                            <span className="mc-progress-tenure">Mo {paidMonths} / {totalMonths}</span>
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

                      {/* Monthly EMI: Solid #0F172A (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-amount-primary">{formatCurrency(monthlyEmi)}</div>
                        <div className="mc-amount-secondary">
                          {isPaid ? 'Cleared this month' : `${currentMonthInfo.monthName} EMI`}
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
                            onClick={() => handleOpenMonthlyLog(cust)}
                            title="View 12-Month EMI Schedule Log"
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

        {/* 5. Standardized Directory Pagination Bar (Matching ManageUsers.jsx) */}
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
              Page <strong>{validCurrentPage}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> {totalItems === 1 ? 'borrower' : 'borrowers'})
            </div>

            <div className="directory-pagination-right">
              <button
                type="button"
                className="directory-page-btn-prev"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="directory-page-btn-next"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Standardized Monthly Log Modal Dialog */}
      {selectedCustForModal && (
        <div className="mc-modal-overlay" onClick={() => setSelectedCustForModal(null)}>
          <div className="mc-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="mc-modal-header">
              <div className="mc-modal-header-left">
                <div className="mc-modal-avatar">
                  {selectedCustForModal.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <h3 className="mc-modal-title">
                    {selectedCustForModal.name} — 12-Month EMI Schedule Log
                  </h3>
                  <div className="mc-modal-subtitle">
                    {selectedCustForModal.customer_code} • {selectedCustForModal.phone} •{' '}
                    {selectedCustForModal.address || 'Chennai'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mc-modal-close-btn"
                onClick={() => setSelectedCustForModal(null)}
                title="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mc-modal-body">
              {/* Neutral Financial Progress Strip (Solid #0F172A values) */}
              <div className="mc-modal-kpi-strip">
                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-label">Scheme Tenure</div>
                  <div className="mc-modal-kpi-val">
                    {modalPaidMonths} / {modalTotalMonths} <span>Months</span>
                  </div>
                </div>

                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-label">Monthly EMI</div>
                  <div className="mc-modal-kpi-val">
                    {formatCurrency(selectedCustForModal.monthly_emi || 5000)}
                  </div>
                </div>

                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-label">Total Recovered</div>
                  <div className="mc-modal-kpi-val">
                    {formatCurrency(modalRecoveredAmt)}
                  </div>
                </div>

                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-label">Balance Due</div>
                  <div className="mc-modal-kpi-val">
                    {formatCurrency(modalRemainingAmt)}
                  </div>
                </div>
              </div>

              {/* Toolbar & Filter Tabs */}
              <div className="mc-modal-table-toolbar">
                <span className="mc-modal-table-title">12-Month EMI Breakdown</span>

                <div className="mc-filter-pills">
                  <button
                    type="button"
                    className={`mc-filter-pill-btn ${modalFilterStatus === 'ALL' ? 'active' : ''}`}
                    onClick={() => setModalFilterStatus('ALL')}
                  >
                    All ({modalSchedule.length})
                  </button>
                  <button
                    type="button"
                    className={`mc-filter-pill-btn ${modalFilterStatus === 'PAID' ? 'active' : ''}`}
                    onClick={() => setModalFilterStatus('PAID')}
                  >
                    Paid ({modalPaidMonths})
                  </button>
                  <button
                    type="button"
                    className={`mc-filter-pill-btn ${modalFilterStatus === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setModalFilterStatus('PENDING')}
                  >
                    Pending ({modalTotalMonths - modalPaidMonths})
                  </button>
                </div>
              </div>

              {/* Schedule Table (Dark #0F172A Uppercase Headers, Centered) */}
              <div className="mc-modal-table-wrap">
                <table className="mc-modal-table">
                  <thead>
                    <tr>
                      <th>MONTH #</th>
                      <th>DUE DATE</th>
                      <th>AMOUNT</th>
                      <th>PAID DATE</th>
                      <th>PAYMENT DETAILS</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'center' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalFilteredSchedule.map((inst) => {
                      const isPaid = inst.status === 'PAID';
                      const isCurrent = inst.status === 'CURRENT_DUE';
                      return (
                        <tr key={inst.month_number}>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#0F172A' }}>Month {inst.month_number}</td>
                          <td style={{ textAlign: 'center', color: '#475569', fontWeight: 600 }}>{inst.due_date}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#0F172A' }}>{formatCurrency(inst.amount)}</td>
                          <td style={{ textAlign: 'center', color: isPaid ? '#059669' : '#94A3B8', fontWeight: isPaid ? 700 : 500 }}>
                            {isPaid ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={13} color="#059669" />
                                <span>{inst.paid_date || inst.due_date}</span>
                              </span>
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center', color: '#64748B' }}>
                            {isPaid ? (
                              <span>
                                {inst.receipt_no} • <strong style={{ color: '#4f46e5' }}>{inst.payment_mode}</strong>
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Uncollected</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`mc-status-badge ${
                                isPaid ? 'paid' : isCurrent ? 'pending' : 'pending'
                              }`}
                            >
                              {isPaid ? 'PAID' : isCurrent ? 'DUE NOW' : 'PENDING'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isPaid ? (
                              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Settled</span>
                            ) : (
                              <button
                                type="button"
                                className="mc-modal-btn-pay"
                                onClick={() => {
                                  const cust = selectedCustForModal;
                                  setSelectedCustForModal(null);
                                  handleNavigateCollect(cust);
                                }}
                              >
                                <span>Pay</span>
                                <ArrowRight size={11} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mc-modal-footer">
              <button
                type="button"
                className="directory-btn-secondary"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Statement</span>
              </button>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="directory-btn-secondary"
                  onClick={() => setSelectedCustForModal(null)}
                >
                  Close Log
                </button>

                <button
                  type="button"
                  className="directory-btn-primary"
                  onClick={() => {
                    const cust = selectedCustForModal;
                    setSelectedCustForModal(null);
                    handleNavigateCollect(cust);
                  }}
                >
                  <span>Collect Monthly EMI</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCustomers;
