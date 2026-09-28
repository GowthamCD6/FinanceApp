import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  DollarSign,
  Receipt,
  Users,
  Search,
  Filter,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import { useAuth } from '../../../context/AuthContext';
import './CollectionCalendar.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CollectionCalendar = () => {
  const navigate = useNavigate();
  const { orgId: paramOrgId } = useParams();
  const { activeOrg, branches, activeBranchId, setActiveBranchId, lendingConfig } = useOrg();
  const { isBranchAdmin, userBranchId } = useAuth();

  const orgId = activeOrg?.id || paramOrgId || 1;
  const orgPrefix = paramOrgId ? `/org/${paramOrgId}` : '/admin';

  // Calendar Date State
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());

  // Filters
  const [selectedBranch, setSelectedBranch] = useState(
    isBranchAdmin && userBranchId ? String(userBranchId) : activeBranchId || 'ALL'
  );
  const [selectedFrequency, setSelectedFrequency] = useState('ALL');
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [recordSearch, setRecordSearch] = useState('');

  // Data Loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState({ summary: {}, records: [] });

  useEffect(() => {
    if (isBranchAdmin && userBranchId) {
      setSelectedBranch(String(userBranchId));
    } else if (activeBranchId) {
      setSelectedBranch(String(activeBranchId));
    }
  }, [activeBranchId, isBranchAdmin, userBranchId]);

  // Compute Month Boundaries
  const { monthStartStr, monthEndStr, daysInMonth, startWeekday } = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const pad = (n) => String(n).padStart(2, '0');
    const startStr = `${currentYear}-${pad(currentMonth + 1)}-01`;
    const endStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(lastDay.getDate())}`;

    return {
      monthStartStr: startStr,
      monthEndStr: endStr,
      daysInMonth: lastDay.getDate(),
      startWeekday: firstDay.getDay(),
    };
  }, [currentYear, currentMonth]);

  // Fetch Report Data
  const fetchMonthData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const branchParam = selectedBranch === 'ALL' ? undefined : selectedBranch;
      const freqParam = selectedFrequency === 'ALL' ? undefined : selectedFrequency;

      const res = await api.getPaymentReport({
        startDate: monthStartStr,
        endDate: monthEndStr,
        organizationId: orgId,
        branchId: branchParam,
        frequency: freqParam,
      });

      if (res) {
        setReportData({
          summary: res.summary || {},
          records: Array.isArray(res.records) ? res.records : [],
        });
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [monthStartStr, monthEndStr, orgId, selectedBranch, selectedFrequency]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  // Day Aggregations
  const dayAggregates = useMemo(() => {
    const map = {};
    const pad = (n) => String(n).padStart(2, '0');

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`;
      map[dStr] = {
        dateStr: dStr,
        dayNum: d,
        expected: 0,
        collected: 0,
        balance: 0,
        count: 0,
        paidCount: 0,
        records: [],
      };
    }

    (reportData.records || []).forEach((r) => {
      const dateKey = r.dueDate ? String(r.dueDate).slice(0, 10) : '';
      if (!dateKey) return;

      if (!map[dateKey]) {
        map[dateKey] = {
          dateStr: dateKey,
          dayNum: parseInt(dateKey.slice(8), 10) || 1,
          expected: 0,
          collected: 0,
          balance: 0,
          count: 0,
          paidCount: 0,
          records: [],
        };
      }

      const exp = parseFloat(r.expectedAmount || 0);
      const paid = parseFloat(r.paidAmount || 0);
      const bal = parseFloat(r.balance != null ? r.balance : Math.max(0, exp - paid));

      map[dateKey].expected += exp;
      map[dateKey].collected += paid;
      map[dateKey].balance += bal;
      map[dateKey].count += 1;
      if (r.status === 'PAID' || bal <= 0) {
        map[dateKey].paidCount += 1;
      }
      map[dateKey].records.push(r);
    });

    return map;
  }, [reportData.records, currentYear, currentMonth, daysInMonth]);

  // Month Totals
  const monthTally = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let balance = 0;
    let totalDues = 0;
    let completedDues = 0;

    Object.values(dayAggregates).forEach((day) => {
      expected += day.expected;
      collected += day.collected;
      balance += day.balance;
      totalDues += day.count;
      completedDues += day.paidCount;
    });

    const efficiency = expected > 0 ? Math.min(100, Math.round((collected / expected) * 100)) : 0;

    return {
      expected,
      collected,
      balance: Math.max(0, balance),
      totalDues,
      completedDues,
      efficiency,
    };
  }, [dayAggregates]);

  // Selected Day Details
  const selectedDayData = useMemo(() => {
    return (
      dayAggregates[selectedDateStr] || {
        dateStr: selectedDateStr,
        dayNum: parseInt(selectedDateStr.slice(8), 10) || 1,
        expected: 0,
        collected: 0,
        balance: 0,
        count: 0,
        paidCount: 0,
        records: [],
      }
    );
  }, [dayAggregates, selectedDateStr]);

  // Filtered Day Records
  const filteredDayRecords = useMemo(() => {
    if (!recordSearch.trim()) return selectedDayData.records;
    const term = recordSearch.toLowerCase();
    return selectedDayData.records.filter((r) => {
      const name = (r.customerName || '').toLowerCase();
      const phone = (r.customerPhone || '').toLowerCase();
      const loan = (r.loanNumber || '').toLowerCase();
      return name.includes(term) || phone.includes(term) || loan.includes(term);
    });
  }, [selectedDayData.records, recordSearch]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  const formatCurrency = (amount) => {
    const num = Math.round(Number(amount) || 0);
    return '₹' + num.toLocaleString('en-IN');
  };

  const handleCollectAction = (record) => {
    const customerId = record.customerId || record.customer_id;
    const freq = (record.frequency || record.repaymentFrequency || '').toUpperCase();
    if (!customerId) return;

    if (freq === 'DAILY') {
      navigate(`${orgPrefix}/shopkeepers/${customerId}/collect`);
    } else if (freq === 'MONTHLY') {
      navigate(`${orgPrefix}/monthly-customers/${customerId}/collect`);
    } else {
      navigate(`${orgPrefix}/weekly-customers/${customerId}/collect`);
    }
  };

  return (
    <div className="collection-calendar-page">
      {/* 1. Standard Page Header */}
      <div className="directory-page-header">
        <div className="directory-title-area">
          <div className="directory-title-row">
            <h1 className="directory-page-title">Daily Collection Calendar</h1>
          </div>
          <p className="directory-page-subtitle">
            Daily collection targets vs. actual recoveries — reconcile and tally the total month receipts.
          </p>
        </div>

        <div className="directory-header-actions">
          {/* Month Stepper */}
          <div className="cal-stepper">
            <button
              type="button"
              className="cal-step-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="cal-step-label">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              className="cal-step-btn"
              onClick={handleNextMonth}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Today Button */}
          <button
            type="button"
            className="directory-btn-secondary"
            onClick={handleJumpToday}
          >
            Today
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            className={`directory-btn-secondary ${refreshing ? 'cal-spinning' : ''}`}
            onClick={() => fetchMonthData(true)}
            disabled={refreshing || loading}
            title="Refresh Live Tally"
          >
            <RefreshCw size={15} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {/* Branch Dropdown */}
          {branches && branches.length > 0 && (
            <select
              className="cal-filter-select"
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                if (!isBranchAdmin) setActiveBranchId(e.target.value);
              }}
              disabled={isBranchAdmin}
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Scheme Filter */}
          <select
            className="cal-filter-select"
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
          >
            <option value="ALL">All Schemes</option>
            {lendingConfig?.daily_loan_enabled !== false && (
              <option value="DAILY">Daily (Shopkeeper)</option>
            )}
            {lendingConfig?.weekly_loan_enabled !== false && (
              <option value="WEEKLY">Weekly Loans</option>
            )}
            {lendingConfig?.monthly_loan_enabled !== false && (
              <option value="MONTHLY">Monthly Loans</option>
            )}
          </select>
        </div>
      </div>

      {/* 2. Standard 4 KPI Metric Cards */}
      <div className="directory-kpi-grid">
        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Month Total Target</span>
            <div className="directory-kpi-icon indigo">
              <Receipt size={16} />
            </div>
          </div>
          <div className="directory-kpi-value">{formatCurrency(monthTally.expected)}</div>
          <div className="directory-kpi-desc">{monthTally.totalDues} scheduled installments</div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Total Amount Received</span>
            <div className="directory-kpi-icon emerald">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="directory-kpi-value" style={{ color: '#059669' }}>
            {formatCurrency(monthTally.collected)}
          </div>
          <div className="directory-kpi-desc">{monthTally.completedDues} dues cleared</div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Month Pending to Tally</span>
            <div className="directory-kpi-icon amber">
              <Clock size={16} />
            </div>
          </div>
          <div className="directory-kpi-value" style={{ color: '#d97706' }}>
            {formatCurrency(monthTally.balance)}
          </div>
          <div className="directory-kpi-desc">Remaining recovery balance</div>
        </div>

        <div className="directory-kpi-card">
          <div className="directory-kpi-top">
            <span className="directory-kpi-label">Month Recovery Rate</span>
            <div className="directory-kpi-icon purple">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="directory-kpi-value" style={{ color: '#4f46e5' }}>
            {monthTally.efficiency}%
          </div>
          <div className="directory-kpi-desc">
            {monthTally.completedDues} of {monthTally.totalDues} collected
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Calendar Grid + Day Details Drawer */}
      <div className="cal-workspace">
        {/* Calendar Grid Container */}
        <div className="cal-card">
          <div className="cal-card-header">
            <div className="cal-card-title">
              <CalendarDays size={18} color="#4f46e5" />
              <span>
                {MONTH_NAMES[currentMonth]} {currentYear} Breakdown
              </span>
            </div>
            <div className="cal-legend">
              <span className="legend-item">
                <span className="legend-dot bg-cleared" /> Cleared
              </span>
              <span className="legend-item">
                <span className="legend-dot bg-partial" /> Partial
              </span>
              <span className="legend-item">
                <span className="legend-dot bg-due" /> Due
              </span>
              <span className="legend-item">
                <span className="legend-dot bg-overdue" /> Overdue
              </span>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="cal-weekdays">
            {WEEKDAYS.map((w, idx) => (
              <div key={idx} className={`cal-weekday ${idx === 0 ? 'cal-sun' : ''}`}>
                {w}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="cal-grid">
            {/* Empty Lead Days */}
            {[...Array(startWeekday)].map((_, i) => (
              <div key={`lead-${i}`} className="cal-cell cal-empty" />
            ))}

            {/* Month Day Cells */}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const pad = (n) => String(n).padStart(2, '0');
              const dateKey = `${currentYear}-${pad(currentMonth + 1)}-${pad(dayNum)}`;
              const data = dayAggregates[dateKey] || {
                expected: 0,
                collected: 0,
                balance: 0,
                count: 0,
                paidCount: 0,
              };

              const isToday = dateKey === todayStr;
              const isSelected = dateKey === selectedDateStr;
              const isPast = dateKey < todayStr;
              const hasDues = data.count > 0;
              const isFullyCollected = hasDues && data.collected >= data.expected;
              const isPartial = hasDues && data.collected > 0 && data.collected < data.expected;
              const isOverdue = hasDues && isPast && data.balance > 0;

              let statusCls = 'no-dues';
              if (hasDues) {
                if (isFullyCollected) statusCls = 'cleared';
                else if (isOverdue) statusCls = 'overdue';
                else if (isPartial) statusCls = 'partial';
                else statusCls = 'due';
              }

              const dayPct =
                data.expected > 0
                  ? Math.min(100, Math.round((data.collected / data.expected) * 100))
                  : 0;

              return (
                <div
                  key={dateKey}
                  className={`cal-cell ${statusCls} ${isToday ? 'is-today' : ''} ${
                    isSelected ? 'is-selected' : ''
                  }`}
                  onClick={() => setSelectedDateStr(dateKey)}
                >
                  <div className="cell-top">
                    <span className="cell-day-num">{dayNum}</span>
                    {isToday && <span className="cell-today-pill">Today</span>}
                    {hasDues && (
                      <span className="cell-count">{data.count}</span>
                    )}
                  </div>

                  {hasDues ? (
                    <div className="cell-body">
                      <div className="cell-row">
                        <span className="cell-lbl">Target:</span>
                        <span className="cell-val">{formatCurrency(data.expected)}</span>
                      </div>
                      <div className="cell-row">
                        <span className="cell-lbl">Recv:</span>
                        <span className="cell-val text-green">{formatCurrency(data.collected)}</span>
                      </div>
                      <div className="cell-bar-track">
                        <div
                          className={`cell-bar-fill bar-${statusCls}`}
                          style={{ width: `${dayPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="cell-empty-lbl">—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Queue Panel */}
        <div className="cal-detail-card">
          <div className="detail-header">
            <div>
              <span className="detail-tag">Selected Date</span>
              <h3 className="detail-title">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </h3>
            </div>
            {selectedDateStr === todayStr && <span className="today-chip">Today</span>}
          </div>

          {/* Quick Metrics */}
          <div className="detail-stats-row">
            <div className="detail-stat-box">
              <span className="dsb-label">Target Due</span>
              <span className="dsb-value">{formatCurrency(selectedDayData.expected)}</span>
            </div>
            <div className="detail-stat-box">
              <span className="dsb-label">Collected</span>
              <span className="dsb-value text-green">
                {formatCurrency(selectedDayData.collected)}
              </span>
            </div>
            <div className="detail-stat-box">
              <span className="dsb-label">Remaining</span>
              <span className="dsb-value text-amber">
                {formatCurrency(selectedDayData.balance)}
              </span>
            </div>
          </div>

          {/* Search inside Day Records */}
          {selectedDayData.records.length > 0 && (
            <div className="detail-search">
              <Search size={14} className="detail-search-icon" />
              <input
                type="text"
                placeholder="Search borrower or loan #..."
                value={recordSearch}
                onChange={(e) => setRecordSearch(e.target.value)}
                className="detail-search-input"
              />
              {recordSearch && (
                <button
                  type="button"
                  className="detail-clear-btn"
                  onClick={() => setRecordSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Records List */}
          <div className="detail-records-wrap">
            {selectedDayData.records.length === 0 ? (
              <div className="detail-empty">
                <CalendarIcon size={32} color="#cbd5e1" />
                <p>No installments scheduled for this date.</p>
              </div>
            ) : filteredDayRecords.length === 0 ? (
              <div className="detail-empty">
                <Search size={28} color="#cbd5e1" />
                <p>No borrowers matched "{recordSearch}".</p>
              </div>
            ) : (
              <div className="detail-list">
                {filteredDayRecords.map((r, idx) => {
                  const exp = parseFloat(r.expectedAmount || 0);
                  const paid = parseFloat(r.paidAmount || 0);
                  const bal = parseFloat(r.balance != null ? r.balance : Math.max(0, exp - paid));
                  const isPaid = r.status === 'PAID' || bal <= 0;
                  const isOverdue = !isPaid && selectedDateStr < todayStr;
                  const isPartial = !isPaid && paid > 0;
                  const freq = (r.frequency || r.repaymentFrequency || 'LOAN').toUpperCase();

                  return (
                    <div
                      key={r.scheduleId || idx}
                      className={`detail-item ${isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending'}`}
                    >
                      <div className="di-top">
                        <div>
                          <strong className="di-name">{r.customerName || 'Borrower'}</strong>
                          <div className="di-phone">{r.customerPhone || '—'}</div>
                        </div>
                        <div className="di-chips">
                          <span className={`freq-chip freq-${freq.toLowerCase()}`}>{freq}</span>
                          <span
                            className={`status-chip ${
                              isPaid
                                ? 'status-paid'
                                : isOverdue
                                ? 'status-overdue'
                                : isPartial
                                ? 'status-partial'
                                : 'status-pending'
                            }`}
                          >
                            {isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : isPartial ? 'PARTIAL' : 'DUE'}
                          </span>
                        </div>
                      </div>

                      <div className="di-meta">
                        <span>Loan #{r.loanNumber || `LN-${r.loanId || idx}`}</span>
                        {r.installmentNumber && <span>Inst. #{r.installmentNumber}</span>}
                      </div>

                      <div className="di-amounts">
                        <div>
                          <span className="amt-lbl">Due</span>
                          <span className="amt-val">{formatCurrency(exp)}</span>
                        </div>
                        <div>
                          <span className="amt-lbl">Paid</span>
                          <span className="amt-val text-green">{formatCurrency(paid)}</span>
                        </div>
                        <div>
                          <span className="amt-lbl">Balance</span>
                          <span
                            className={`amt-val ${
                              bal > 0 ? (isOverdue ? 'text-red' : 'text-amber') : 'text-muted'
                            }`}
                          >
                            {formatCurrency(bal)}
                          </span>
                        </div>
                      </div>

                      {!isPaid && (
                        <button
                          type="button"
                          className="di-collect-btn"
                          onClick={() => handleCollectAction(r)}
                        >
                          <span>Collect</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCalendar;
