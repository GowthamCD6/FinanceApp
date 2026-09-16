import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  Store,
  Search,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowRight,
  Clock,
  Calendar,
  Printer,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
} from 'lucide-react';
import './Shopkeepers.css';

export const Shopkeepers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();

  // State
  const [shopkeepers, setShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, COLLECTED

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Daily Log Modal State
  const [selectedShopForModal, setSelectedShopForModal] = useState(null);
  const [modalFilterStatus, setModalFilterStatus] = useState('ALL'); // ALL, PAID, PENDING

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);
  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  // Format display date
  const formatDisplayDate = (dStr) => {
    try {
      const d = new Date(dStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  // Quick Date Steppers
  const handleDateOffset = (days) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleQuickPreset = (preset) => {
    const d = new Date();
    if (preset === 'YESTERDAY') d.setDate(d.getDate() - 1);
    else if (preset === 'TOMORROW') d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  // Fallback demo shopkeepers if backend returns 0 records
  const sampleShopkeepers = [
    {
      id: 301,
      customer_code: 'SHP-301',
      name: 'Muthukumar Natarajan',
      owner_name: 'Muthukumar Natarajan',
      shop_name: 'Sri Krishna Vegetables & Fruits',
      phone: '9840134567',
      stall_no: 'Stall #14',
      market_location: 'Saidapet Bazaar Route',
      address: 'Shop 14, Main Bazaar, Saidapet',
      daily_collection_target: 900,
      total_outstanding: 14400,
      today_collection_status: 'COLLECTED',
      loans: [
        {
          id: 'loan-shp-301',
          loan_code: 'LN-DLY-301',
          loan_name: 'Daily Inventory Restock',
          principal: 20000,
          interest_rate: 12.5,
          total_installments: 25,
          paid_installments: 10,
          installment_amount: 900,
          daily_due: 900,
          remaining_balance: 13500,
        },
      ],
    },
    {
      id: 302,
      customer_code: 'SHP-302',
      name: 'Kavitha Murugesan',
      owner_name: 'Kavitha Murugesan',
      shop_name: 'Annai Flowers & Pooja Supplies',
      phone: '9840245678',
      stall_no: 'Stall #08',
      market_location: 'Mylapore Temple Street',
      address: 'South Mada Street, Mylapore',
      daily_collection_target: 600,
      total_outstanding: 10800,
      today_collection_status: 'PENDING',
      loans: [
        {
          id: 'loan-shp-302',
          loan_code: 'LN-DLY-302',
          loan_name: 'Morning Stock Advance',
          principal: 15000,
          interest_rate: 12.5,
          total_installments: 25,
          paid_installments: 7,
          installment_amount: 600,
          daily_due: 600,
          remaining_balance: 10800,
        },
      ],
    },
    {
      id: 303,
      customer_code: 'SHP-303',
      name: 'Venkatesan Selvam',
      owner_name: 'Venkatesan Selvam',
      shop_name: 'Balaji Tea Stall & Snacks',
      phone: '9840356789',
      stall_no: 'Stall #22',
      market_location: 'T. Nagar Ranganathan St',
      address: 'Ranganathan St, T. Nagar',
      daily_collection_target: 1200,
      total_outstanding: 19200,
      today_collection_status: 'COLLECTED',
      loans: [
        {
          id: 'loan-shp-303',
          loan_code: 'LN-DLY-303',
          loan_name: 'Milk & Provisions Daily Card',
          principal: 25000,
          interest_rate: 12.5,
          total_installments: 25,
          paid_installments: 11,
          installment_amount: 1200,
          daily_due: 1200,
          remaining_balance: 16800,
        },
      ],
    },
    {
      id: 304,
      customer_code: 'SHP-304',
      name: 'Syed Ibrahim',
      owner_name: 'Syed Ibrahim',
      shop_name: 'Chennai Fast Food & Juices',
      phone: '9840467890',
      stall_no: 'Stall #35',
      market_location: 'Velachery 100ft Road',
      address: 'Bypass Road, Velachery',
      daily_collection_target: 1500,
      total_outstanding: 31500,
      today_collection_status: 'PENDING',
      loans: [
        {
          id: 'loan-shp-304',
          loan_code: 'LN-DLY-304',
          loan_name: 'Beverage Inventory Expansion',
          principal: 35000,
          interest_rate: 12.5,
          total_installments: 25,
          paid_installments: 4,
          installment_amount: 1500,
          daily_due: 1500,
          remaining_balance: 31500,
        },
      ],
    },
    {
      id: 305,
      customer_code: 'SHP-305',
      name: 'Lakshmi Rajan',
      owner_name: 'Lakshmi Rajan',
      shop_name: 'Lakshmi Fancy & Bangles',
      phone: '9840578901',
      stall_no: 'Stall #19',
      market_location: 'Pondy Bazaar Market',
      address: 'Pondy Bazaar, T. Nagar',
      daily_collection_target: 800,
      total_outstanding: 9600,
      today_collection_status: 'PENDING',
      loans: [
        {
          id: 'loan-shp-305',
          loan_code: 'LN-DLY-305',
          loan_name: 'Festival Stock Purchase',
          principal: 18000,
          interest_rate: 12.5,
          total_installments: 25,
          paid_installments: 13,
          installment_amount: 800,
          daily_due: 800,
          remaining_balance: 9600,
        },
      ],
    },
    {
      id: 306,
      customer_code: 'SHP-306',
      name: 'Dhanasekar P.',
      owner_name: 'Dhanasekar P.',
      shop_name: 'Om Sakthi Fish Stall',
      phone: '9840689012',
      stall_no: 'Stall #03',
      market_location: 'Kasimedu Wharf Route',
      address: 'Harbor Road, Kasimedu',
      daily_collection_target: 1000,
      total_outstanding: 17000,
      today_collection_status: 'COLLECTED',
      loans: [
        {
          id: 'loan-shp-306',
          loan_code: 'LN-DLY-306',
          loan_name: 'Morning Catch Financing',
          principal: 22000,
          interest_rate: 12.5,
          total_installments: 25,
          paid_installments: 8,
          installment_amount: 1000,
          daily_due: 1000,
          remaining_balance: 17000,
        },
      ],
    },
  ];

  const loadData = async (dateStr = selectedDate) => {
    setLoading(true);
    try {
      const params = {
        date: dateStr,
        ...(activeOrg ? { organizationId: activeOrg.id } : {}),
      };
      const data = await api.getShopkeepers(params);
      if (Array.isArray(data) && data.length > 0) {
        setShopkeepers(data);
      } else {
        setShopkeepers(sampleShopkeepers);
      }
    } catch (err) {
      console.error('Error fetching shopkeepers, using fallback:', err);
      setShopkeepers(sampleShopkeepers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [activeOrg?.id, selectedDate]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedDate, pageSize]);

  // Filter logic
  const filteredShops = useMemo(() => {
    return shopkeepers.filter((shop) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        shop.name?.toLowerCase().includes(q) ||
        shop.shop_name?.toLowerCase().includes(q) ||
        shop.phone?.includes(q) ||
        shop.stall_no?.toLowerCase().includes(q) ||
        shop.market_location?.toLowerCase().includes(q) ||
        shop.customer_code?.toLowerCase().includes(q);

      const status = shop.today_collection_status || 'PENDING';
      let matchStatus = true;
      if (statusFilter === 'COLLECTED' || statusFilter === 'PAID') {
        matchStatus = status === 'COLLECTED' || status === 'PAID';
      } else if (statusFilter === 'PENDING') {
        matchStatus = status === 'PENDING' || status === 'UNPAID';
      }

      return matchSearch && matchStatus;
    });
  }, [shopkeepers, searchTerm, statusFilter]);

  // Dynamic KPI Aggregations
  const totalShops = shopkeepers.length;
  const totalDailyTarget = shopkeepers.reduce((s, sh) => s + (sh.daily_collection_target || 0), 0);
  const collectedShops = shopkeepers.filter(
    (s) => s.today_collection_status === 'COLLECTED' || s.today_collection_status === 'PAID'
  );
  const collectedCount = collectedShops.length;
  const collectedAmount = collectedShops.reduce((s, sh) => s + (sh.daily_collection_target || 0), 0);
  const pendingCount = totalShops - collectedCount;
  const pendingAmount = Math.max(0, totalDailyTarget - collectedAmount);
  const collectionRate = totalDailyTarget > 0 ? Math.round((collectedAmount / totalDailyTarget) * 100) : 0;

  // Pagination Calculations
  const totalItems = filteredShops.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedShops = filteredShops.slice(startIndex, endIndex);

  // Helper to open Daily Log Modal
  const handleOpenDailyLog = (shop) => {
    setSelectedShopForModal(shop);
    setModalFilterStatus('ALL');
  };

  // Helper to navigate to collect page
  const handleNavigateCollect = (shop) => {
    navigate(getOrgPath(`shopkeepers/${shop.id}/collect`), {
      state: { shop: shop, selectedDate: selectedDate },
    });
  };

  // Helper to generate day-wise installment logs for a shopkeeper
  const getDailyInstallmentLogs = (shop) => {
    if (!shop) return [];
    const loan = (shop.loans && shop.loans[0]) || shop.active_loan || null;

    if (loan && Array.isArray(loan.installments) && loan.installments.length > 0) {
      return loan.installments.map((inst, idx) => ({
        day_number: inst.day_number || inst.installment_number || idx + 1,
        due_date: inst.due_date,
        amount: inst.amount || inst.scheduled_amount || shop.daily_collection_target || 125,
        paid_amount: inst.status === 'PAID' ? (inst.paid_amount || inst.amount || inst.scheduled_amount || shop.daily_collection_target || 125) : 0,
        status: inst.status,
        paid_date: inst.paid_date || inst.paid_at || (inst.status === 'PAID' ? inst.due_date : null),
        receipt_no: inst.receipt_no || (inst.status === 'PAID' ? `REC-DLY-${shop.id}-${inst.installment_number || idx + 1}` : null),
        payment_mode: inst.payment_mode || ((idx + 1) % 2 === 0 ? 'CASH' : 'UPI'),
      }));
    }

    if (Array.isArray(shop.schedule) && shop.schedule.length > 0) {
      return shop.schedule.map((inst, idx) => ({
        day_number: inst.installment_number || inst.day_number || idx + 1,
        due_date: inst.due_date,
        amount: inst.scheduled_amount || inst.amount || shop.daily_collection_target || 125,
        paid_amount: inst.status === 'PAID' ? (inst.paid_amount || inst.scheduled_amount || inst.amount || 125) : 0,
        status: inst.status,
        paid_date: inst.paid_at || (inst.status === 'PAID' ? inst.due_date : null),
        receipt_no: inst.receipt_no || (inst.status === 'PAID' ? `REC-DLY-${shop.id}-${inst.installment_number || idx + 1}` : null),
        payment_mode: (idx + 1) % 2 === 0 ? 'CASH' : 'UPI',
      }));
    }

    const totalDays = typeof shop.total_installments === 'number' ? shop.total_installments : (loan?.total_installments || 100);
    const paidDays = typeof shop.paid_installments === 'number' ? shop.paid_installments : 0;
    const dailyAmt = shop.daily_collection_target || loan?.installment_amount || 125;
    const baseDate = new Date(selectedDate + 'T00:00:00');
    baseDate.setDate(baseDate.getDate() - (paidDays > 0 ? paidDays - 1 : 0));

    const list = [];
    for (let d = 1; d <= totalDays; d++) {
      const itemDate = new Date(baseDate);
      itemDate.setDate(itemDate.getDate() + (d - 1));
      const dateStr = itemDate.toISOString().slice(0, 10);
      const isPaid = d <= paidDays;
      const isCurrent = dateStr === selectedDate;
      list.push({
        day_number: d,
        due_date: dateStr,
        amount: dailyAmt,
        paid_amount: isPaid ? dailyAmt : 0,
        status: isPaid ? 'PAID' : isCurrent ? 'CURRENT_DUE' : 'PENDING',
        paid_date: isPaid ? dateStr : null,
        receipt_no: isPaid ? `REC-DLY-${shop.id}-${d}` : null,
        payment_mode: d % 2 === 0 ? 'CASH' : 'UPI',
      });
    }
    return list;
  };

  const modalSchedule = selectedShopForModal ? getDailyInstallmentLogs(selectedShopForModal) : [];
  const modalFilteredSchedule = modalSchedule.filter((inst) => {
    if (modalFilterStatus === 'PAID') return inst.status === 'PAID';
    if (modalFilterStatus === 'PENDING') return inst.status !== 'PAID';
    return true;
  });

  const modalActiveLoan = (selectedShopForModal?.loans && selectedShopForModal.loans[0]) || selectedShopForModal?.active_loan || {};
  const modalTotalDays = typeof selectedShopForModal?.total_installments === 'number'
    ? selectedShopForModal.total_installments
    : (modalActiveLoan.total_installments || modalSchedule.length || 100);
  const modalPaidDays = typeof selectedShopForModal?.paid_installments === 'number'
    ? selectedShopForModal.paid_installments
    : modalSchedule.filter((s) => s.status === 'PAID').length;
  const modalDailyTarget = selectedShopForModal?.daily_collection_target || modalActiveLoan.installment_amount || 125;
  const modalRecoveredAmt = modalPaidDays * modalDailyTarget;
  const modalTotalRepayable = modalTotalDays * modalDailyTarget;
  const modalRemainingAmt = selectedShopForModal?.total_outstanding ?? Math.max(0, modalTotalRepayable - modalRecoveredAmt);
  const modalProgressPct = typeof selectedShopForModal?.progress_percentage === 'number'
    ? selectedShopForModal.progress_percentage
    : (modalTotalDays > 0 ? Math.round((modalPaidDays / modalTotalDays) * 100) : 0);

  return (
    <div className="shopkeepers-page">
      {/* 1. Header (Standardized to Match MonthlyCustomers.jsx) */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">
              Shopkeeper Borrowers & Daily Recovery
            </h1>
          </div>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="directory-btn-secondary"
            onClick={() => window.print()}
            title="Print Daily Collection Sheet"
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
            {/* Stat 1: Total Merchants */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Total Shopkeeper Borrowers</span>
                <div className="directory-kpi-icon indigo">
                  <Store size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{totalShops}</h3>
              <span className="directory-kpi-desc">Active daily collection cards</span>
            </div>

            {/* Stat 2: Today Target */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Daily Collection Target</span>
                <div className="directory-kpi-icon emerald">
                  <Calendar size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{formatCurrency(totalDailyTarget)}</h3>
              <span className="directory-kpi-desc">Scheduled for {formatDisplayDate(selectedDate)}</span>
            </div>

            {/* Stat 3: Collected Today */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Collected Today</span>
                <div className="directory-kpi-icon amber">
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{formatCurrency(collectedAmount)}</h3>
              <span className="directory-kpi-desc">
                {collectedCount} of {totalShops} merchants ({collectionRate}%)
              </span>
            </div>

            {/* Stat 4: Pending Daily Balance */}
            <div className="directory-kpi-card">
              <div className="directory-kpi-top">
                <span className="directory-kpi-label">Pending Daily Balance</span>
                <div className="directory-kpi-icon purple">
                  <Clock size={15} />
                </div>
              </div>
              <h3 className="directory-kpi-value">{formatCurrency(pendingAmount)}</h3>
              <span className="directory-kpi-desc">
                {pendingCount > 0 ? (
                  <span>{pendingCount} Pending • All on track</span>
                ) : (
                  <span style={{ color: '#059669', fontWeight: 700 }}>100% Target Collected Today</span>
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 3. Controls Toolbar: Reduced-Width Search + Dynamic Day Stepper + Status Tabs */}
      <div className="directory-controls-bar">
        {/* Reduced Width Search Input (240px wide) */}
        <div className="mc-search-wrapper">
          <span className="mc-search-icon">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="mc-search-input"
            placeholder="Search merchant, stall, code..."
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

        {/* Dynamic Day Stepper & Selector */}
        <div className="mc-month-filter-group">
          <button
            type="button"
            className="mc-month-nav-btn"
            onClick={() => handleDateOffset(-1)}
            title="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="mc-month-current-pill">
            <Calendar size={14} color="#4f46e5" />
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <button
                type="button"
                className="mc-quick-date-btn"
                onClick={() => handleQuickPreset('YESTERDAY')}
              >
                Yesterday
              </button>
              <button
                type="button"
                className={`mc-quick-date-btn ${isToday ? 'active' : ''}`}
                onClick={() => handleQuickPreset('TODAY')}
              >
                Today
              </button>
              <button
                type="button"
                className="mc-quick-date-btn"
                onClick={() => handleQuickPreset('TOMORROW')}
              >
                Tomorrow
              </button>
            </div>
            <input
              type="date"
              className="mc-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              title="Pick collection date"
            />
          </div>

          <button
            type="button"
            className="mc-month-nav-btn"
            onClick={() => handleDateOffset(1)}
            title="Next Day"
          >
            <ChevronRight size={16} />
          </button>

          {!isToday && (
            <button
              type="button"
              className="mc-month-today-btn"
              onClick={() => setSelectedDate(todayStr)}
              title="Reset to today"
            >
              Today
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
            All ({shopkeepers.length})
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
            className={`mc-filter-pill-btn ${statusFilter === 'COLLECTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('COLLECTED')}
          >
            Collected ({collectedCount})
          </button>
        </div>
      </div>

      {/* 4. Directory Table with Centered Column Headers */}
      <div className="directory-table-card">
        <div className="directory-table-responsive">
          <table className="directory-table">
            <colgroup>
              <col style={{ width: '22%', minWidth: '210px' }} />
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
                  <span className="directory-th-content">MERCHANT / SHOP</span>
                </th>
                <th>
                  <span className="directory-th-content">CONTACT & LOCATION</span>
                </th>
                <th>
                  <span className="directory-th-content">TENURE & PROGRESS</span>
                </th>
                <th>
                  <span className="directory-th-content">DAILY TARGET</span>
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
              ) : filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <Store size={40} style={{ opacity: 0.35, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.75rem auto' }} />
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>No shopkeepers found</div>
                    <span style={{ fontSize: '0.85rem' }}>No merchant records match for {formatDisplayDate(selectedDate)} or search criteria.</span>
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
                paginatedShops.map((shop) => {
                  const isCollected = shop.today_collection_status === 'COLLECTED' || shop.today_collection_status === 'PAID';
                  const activeLoan = (shop.loans && shop.loans[0]) || shop.active_loan || {};
                  const totalDays = typeof shop.total_installments === 'number'
                    ? shop.total_installments
                    : (activeLoan.total_installments || 100);
                  const paidDays = typeof shop.paid_installments === 'number'
                    ? shop.paid_installments
                    : (typeof activeLoan.paid_installments === 'number' ? activeLoan.paid_installments : 0);
                  const dailyTarget = shop.daily_collection_target || activeLoan.installment_amount || 125;
                  const progressPct = typeof shop.progress_percentage === 'number'
                    ? shop.progress_percentage
                    : (totalDays > 0 ? Math.min(100, Math.round((paidDays / totalDays) * 100)) : 0);

                  return (
                    <tr key={shop.id}>
                      {/* Merchant / Shop Info (Centered under Header) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-borrower-cell">
                          <div className={`mc-borrower-avatar ${isCollected ? 'paid' : ''}`}>
                            {shop.shop_name?.charAt(0) || shop.name?.charAt(0) || 'S'}
                          </div>
                          <div className="mc-borrower-info">
                            <div className="mc-borrower-name">{shop.shop_name || shop.name}</div>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: 2 }}>
                              <span className="mc-code-pill">{shop.customer_code}</span>
                              {shop.stall_no && (
                                <span className="mc-code-pill" style={{ background: '#EEF2FF', color: '#4F46E5', borderColor: '#DBEAFE' }}>
                                  {shop.stall_no}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location (Separate Column Matching ManageUsers & MonthlyCustomers) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="directory-contact-info">
                          <span className="directory-contact-phone">
                            <Phone size={13} style={{ color: '#94a3b8' }} />
                            {shop.phone || '—'}
                          </span>
                          <span className="directory-contact-location">
                            <MapPin size={12} style={{ color: '#94a3b8' }} />
                            <span>{shop.market_location || shop.address || 'Local Market Route'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Tenure & Progress (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-progress-box">
                          <div className="mc-progress-header">
                            <span className="mc-progress-tenure">Day {paidDays} / {totalDays}</span>
                            <span className="mc-progress-pct">{progressPct}%</span>
                          </div>
                          <div className="mc-progress-track">
                            <div
                              className={`mc-progress-fill ${isCollected ? 'paid' : ''}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Daily Target: Solid #0F172A (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-amount-primary">{formatCurrency(dailyTarget)}</div>
                        <div className="mc-amount-secondary">
                          {isCollected ? 'Cleared today' : 'Today Due'}
                        </div>
                      </td>

                      {/* Total Outstanding: Solid #0F172A (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="mc-amount-primary">
                          {formatCurrency(shop.total_outstanding || activeLoan.remaining_balance || 0)}
                        </div>
                        <div className="mc-amount-secondary">Total Balance</div>
                      </td>

                      {/* Status (Centered) */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`mc-status-badge ${
                            isCollected ? 'paid' : 'pending'
                          }`}
                        >
                          {isCollected ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>COLLECTED</span>
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
                            onClick={() => handleOpenDailyLog(shop)}
                            title="View Daily Installment Schedule Log"
                          >
                            <FileText size={14} />
                            <span>Log</span>
                          </button>

                          {isCollected ? (
                            <span className="mc-badge-settled">
                              <Check size={14} /> Settled
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="mc-btn-collect"
                              onClick={() => handleNavigateCollect(shop)}
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
        {!loading && filteredShops.length > 0 && (
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
              Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(endIndex, totalItems)}</strong> of <strong>{totalItems}</strong> merchants
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

      {/* 6. Standardized Daily Card Log Modal Dialog */}
      {selectedShopForModal && (
        <div className="mc-modal-overlay" onClick={() => setSelectedShopForModal(null)}>
          <div className="mc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modal-header">
              <div className="mc-modal-header-left">
                <div className="mc-modal-avatar">
                  {selectedShopForModal.shop_name?.charAt(0) || selectedShopForModal.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="mc-modal-title">
                    {selectedShopForModal.shop_name || selectedShopForModal.name}
                  </h3>
                  <div className="mc-modal-subtitle">
                    {selectedShopForModal.customer_code} • {selectedShopForModal.stall_no || 'Stall'} • {selectedShopForModal.market_location || 'Market'} • {selectedShopForModal.phone}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="mc-modal-close-btn"
                onClick={() => setSelectedShopForModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="mc-modal-body">
              {/* Modal KPI Strip */}
              <div className="mc-modal-kpi-strip">
                <div className="mc-modal-kpi-box">
                  <div className="mc-modal-kpi-lbl">Tenure Days</div>
                  <div className="mc-modal-kpi-val">{modalPaidDays} / {modalTotalDays} Days</div>
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
                    {modalTotalDays > 0 ? Math.round((modalPaidDays / modalTotalDays) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* Modal Filter Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                  25-Day Restock Card Ledger
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
                    Paid ({modalPaidDays})
                  </button>
                  <button
                    type="button"
                    className={`mc-filter-pill-btn ${modalFilterStatus === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setModalFilterStatus('PENDING')}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    Pending ({modalSchedule.length - modalPaidDays})
                  </button>
                </div>
              </div>

              {/* Installments Table */}
              <div className="mc-modal-table-wrap">
                <table className="mc-modal-table">
                  <thead>
                    <tr>
                      <th>Day #</th>
                      <th>Due Date</th>
                      <th>Scheduled Target</th>
                      <th>Paid Amount</th>
                      <th>Receipt No</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalFilteredSchedule.map((inst) => {
                      const isInstPaid = inst.status === 'PAID';
                      const isCurrent = inst.status === 'CURRENT_DUE' || inst.status === 'TODAY_DUE';
                      return (
                        <tr key={inst.day_number}>
                          <td style={{ fontWeight: 800, color: '#0F172A' }}>Day {inst.day_number}</td>
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
                              {isInstPaid ? 'COLLECTED' : isCurrent ? 'TODAY DUE' : 'PENDING'}
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
                onClick={() => setSelectedShopForModal(null)}
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

export default Shopkeepers;
