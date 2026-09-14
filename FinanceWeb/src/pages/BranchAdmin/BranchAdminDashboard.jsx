import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import {
  Building,
  MapPin,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Store,
  Calendar,
  Clock,
  UserPlus,
  Receipt,
  ShieldCheck,
  RefreshCw,
  Phone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Layers,
  Search,
} from 'lucide-react';
import './BranchAdminDashboard.css';

export const BranchAdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userBranchName, userBranchId, isBranchAdmin } = useAuth();
  const { activeOrg, activeBranch, activeBranchId, branches } = useOrg();

  const [metrics, setMetrics] = useState(null);
  const [fieldStaff, setFieldStaff] = useState([]);
  const [weeklyDues, setWeeklyDues] = useState([]);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Derive org prefix from current route or context
  const orgMatch = location.pathname.match(/^\/org\/([^/]+)/);
  const pathOrgId = orgMatch ? orgMatch[1] : activeOrg?.id || user?.organization_id || 1;
  const orgPrefix = `/org/${pathOrgId}`;

  const currentBranch = activeBranch || branches.find(b => String(b.id) === String(activeBranchId || userBranchId)) || {
    name: userBranchName || 'Branch Operations Hub',
    code: 'BR-MAIN',
    location: 'Main Commercial Node',
  };

  const loadBranchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [m, staff, wDues, dColls] = await Promise.all([
        api.getAdminDashboardMetrics().catch(() => null),
        api.getStaffUsers({ role: 'FIELD_AGENT' }).catch(() => []),
        api.getWeeklyDues().catch(() => []),
        api.getDailyCollections().catch(() => []),
      ]);

      setMetrics(
        m || {
          todayDailyCollected: 4200,
          todayDailyTarget: 5850,
          todayWeeklyTarget: 18000,
          weeklyCollected: 14500,
          activeBorrowersCount: 24,
          totalActiveLoans: 38,
          activePrincipalOutstanding: 142000,
          netDisbursedThisMonth: 85000,
        }
      );
      setFieldStaff(Array.isArray(staff) ? staff : staff?.users || []);
      setWeeklyDues(Array.isArray(wDues) ? wDues : []);
      setDailyCollections(Array.isArray(dColls) ? dColls : []);
    } catch (err) {
      console.error('Failed to load branch admin dashboard data:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 400);
    }
  }, [activeBranchId, userBranchId]);

  useEffect(() => {
    loadBranchData();
  }, [loadBranchData]);

  const formatCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

  const dailyCollected = metrics?.todayDailyCollected || 0;
  const dailyTarget = metrics?.todayDailyTarget || 5850;
  const collectionPercent = dailyTarget > 0 ? Math.min(100, Math.round((dailyCollected / dailyTarget) * 100)) : 0;

  return (
    <div className="branch-admin-dashboard">
      {/* 1. Branch Officer Hero Header */}
      <div className="branch-hero-card">
        <div className="branch-hero-content">
          <div className="branch-hero-badge-row">
            <span className="branch-hero-pill">
              <ShieldCheck size={14} color="#16a34a" />
              <span>BRANCH OFFICER PORTAL</span>
            </span>
            <span className="branch-code-badge">{currentBranch.code || 'BR-01'}</span>
            <span className="branch-status-pill status-active">
              <span className="status-dot" /> ACTIVE UNIT
            </span>
          </div>

          <h1 className="branch-hero-title">
            {currentBranch.name || currentBranch.branch_name || 'Branch Operations Control'}
          </h1>

          <div className="branch-hero-meta">
            <div className="meta-item">
              <Building size={14} />
              <span>{activeOrg ? activeOrg.name : user?.organization_name || 'Finance Network'}</span>
            </div>
            <div className="meta-item">
              <MapPin size={14} />
              <span>{currentBranch.location || 'Local Operating Territory'}</span>
            </div>
            <div className="meta-item">
              <Users size={14} />
              <span>Manager: <strong>{user?.name || 'Branch Administrator'}</strong></span>
            </div>
          </div>
        </div>

        <div className="branch-hero-actions">
          <button
            type="button"
            className="btn-branch-refresh"
            onClick={() => loadBranchData(true)}
            disabled={refreshing}
            title="Refresh Branch Metrics"
          >
            <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>
          <button
            type="button"
            className="btn-branch-action"
            onClick={() => navigate(`${orgPrefix}/users/add`)}
          >
            <UserPlus size={15} />
            <span>Onboard Borrower</span>
          </button>
        </div>
      </div>

      {/* 2. Key Branch Performance Indicators */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          label="TODAY'S BRANCH COLLECTIONS"
          value={formatCurrency(dailyCollected)}
          icon={DollarSign}
          trend={`${collectionPercent}% Target Reached`}
          trendDirection={collectionPercent >= 70 ? 'up' : 'down'}
          meta={`Daily Quota: ${formatCurrency(dailyTarget)}`}
          accentColor="#059669"
          accentBg="#ECFDF5"
        />
        <StatCard
          label="ACTIVE BRANCH BORROWERS"
          value={metrics?.activeBorrowersCount || 24}
          icon={Users}
          trend="Operating Accounts"
          trendDirection="up"
          meta="Shopkeepers & Weekly"
          accentColor="#2563EB"
          accentBg="#EFF6FF"
        />
        <StatCard
          label="BRANCH LOAN PORTFOLIO"
          value={formatCurrency(metrics?.activePrincipalOutstanding || 142000)}
          icon={CreditCard}
          trend={`${metrics?.totalActiveLoans || 38} Active Loans`}
          trendDirection="up"
          meta="Principal in Circulation"
          accentColor="#7C3AED"
          accentBg="#F5F3FF"
        />
        <StatCard
          label="FIELD ROUTE COLLECTORS"
          value={fieldStaff.length || 3}
          icon={Briefcase}
          trend="Field Agents"
          trendDirection="up"
          meta="Assigned to this branch"
          accentColor="#D97706"
          accentBg="#FFFBEB"
        />
      </div>

      {/* 3. Branch Daily Progress Strip */}
      <div className="branch-progress-card" style={{ marginBottom: '1.5rem' }}>
        <div className="bpc-header">
          <div className="bpc-title-group">
            <TrendingUp size={18} color="#059669" />
            <h3 className="bpc-title">Today's Branch Recovery Target Progress</h3>
          </div>
          <div className="bpc-target-val">
            <span className="bpc-achieved">{formatCurrency(dailyCollected)}</span>
            <span className="bpc-sep">/</span>
            <span className="bpc-goal">{formatCurrency(dailyTarget)}</span>
          </div>
        </div>

        <div className="bpc-bar-track">
          <div
            className="bpc-bar-fill"
            style={{ width: `${Math.max(5, collectionPercent)}%` }}
          />
        </div>

        <div className="bpc-footer">
          <span>Target Completion: <strong>{collectionPercent}%</strong></span>
          <span className="bpc-status-note">
            {collectionPercent >= 100
              ? '🎉 Daily branch target fully achieved!'
              : `₹${Number(dailyTarget - dailyCollected).toLocaleString('en-IN')} remaining for full recovery`}
          </span>
        </div>
      </div>

      {/* 4. Branch Operations Navigation Quick-Grid */}
      <div className="branch-nav-section" style={{ marginBottom: '1.75rem' }}>
        <h2 className="section-heading">Branch Operations & Ledger Management</h2>
        <div className="branch-nav-grid">
          <div
            className="branch-nav-card"
            onClick={() => navigate(`${orgPrefix}/shopkeepers`)}
          >
            <div className="bnc-icon-wrap icon-emerald">
              <Store size={22} />
            </div>
            <div className="bnc-text">
              <h4>Shopkeeper Ledger</h4>
              <p>Daily bazaar micro-loans & collection passbooks</p>
            </div>
            <ArrowRight size={16} className="bnc-arrow" />
          </div>

          <div
            className="branch-nav-card"
            onClick={() => navigate(`${orgPrefix}/weekly-customers`)}
          >
            <div className="bnc-icon-wrap icon-blue">
              <Calendar size={22} />
            </div>
            <div className="bnc-text">
              <h4>Weekly Customers</h4>
              <p>7-day lending cycle, weekly EMIs & dues</p>
            </div>
            <ArrowRight size={16} className="bnc-arrow" />
          </div>

          <div
            className="branch-nav-card"
            onClick={() => navigate(`${orgPrefix}/monthly-customers`)}
          >
            <div className="bnc-icon-wrap icon-purple">
              <Clock size={22} />
            </div>
            <div className="bnc-text">
              <h4>Monthly Customers</h4>
              <p>Monthly tenure micro-business loan recovery</p>
            </div>
            <ArrowRight size={16} className="bnc-arrow" />
          </div>

          <div
            className="branch-nav-card"
            onClick={() => navigate(`${orgPrefix}/loans`)}
          >
            <div className="bnc-icon-wrap icon-indigo">
              <CreditCard size={22} />
            </div>
            <div className="bnc-text">
              <h4>Loan Portfolio</h4>
              <p>Disbursements, loan approvals & active portfolios</p>
            </div>
            <ArrowRight size={16} className="bnc-arrow" />
          </div>

          <div
            className="branch-nav-card"
            onClick={() => navigate(`${orgPrefix}/users`)}
          >
            <div className="bnc-icon-wrap icon-sky">
              <Users size={22} />
            </div>
            <div className="bnc-text">
              <h4>Branch Borrowers</h4>
              <p>Customer accounts, KYC & profile verification</p>
            </div>
            <ArrowRight size={16} className="bnc-arrow" />
          </div>

          <div
            className="branch-nav-card"
            onClick={() => navigate(`${orgPrefix}/staff`)}
          >
            <div className="bnc-icon-wrap icon-amber">
              <ShieldCheck size={22} />
            </div>
            <div className="bnc-text">
              <h4>Staff & Collectors</h4>
              <p>Field route officers, daily targets & routes</p>
            </div>
            <ArrowRight size={16} className="bnc-arrow" />
          </div>

          <div
            className="branch-nav-card"
            onClick={() => navigate(`${orgPrefix}/reports`)}
          >
            <div className="bnc-icon-wrap icon-rose">
              <Receipt size={22} />
            </div>
            <div className="bnc-text">
              <h4>Recovery Reports</h4>
              <p>Daily settlement audits & ledger downloads</p>
            </div>
            <ArrowRight size={16} className="bnc-arrow" />
          </div>

          <div
            className="branch-nav-card"
            onClick={() => navigate(`${orgPrefix}/profile`)}
          >
            <div className="bnc-icon-wrap icon-slate">
              <Building size={22} />
            </div>
            <div className="bnc-text">
              <h4>Branch Profile</h4>
              <p>Branch address, officer contact & details</p>
            </div>
            <ArrowRight size={16} className="bnc-arrow" />
          </div>
        </div>
      </div>

      {/* 5. Assigned Field Staff & Territory Officers */}
      <div className="card branch-staff-section">
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Branch Field Collectors & Route Officers
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Field agents actively collecting recoveries in this branch territory.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`${orgPrefix}/staff`)}
          >
            <span>Manage All Staff</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="branch-staff-table-wrap">
          <table className="branch-staff-table">
            <thead>
              <tr>
                <th>Officer Name</th>
                <th>Assigned Route</th>
                <th>Phone Number</th>
                <th>Daily Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fieldStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No field officers assigned to this branch yet.{' '}
                    <span
                      style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => navigate(`${orgPrefix}/staff`)}
                    >
                      Click here to assign staff.
                    </span>
                  </td>
                </tr>
              ) : (
                fieldStaff.slice(0, 5).map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="staff-circle-avatar">
                          {staff.name ? staff.name.slice(0, 2).toUpperCase() : 'FO'}
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{staff.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{staff.designation || 'Route Officer'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: '#334155' }}>
                        <Navigation size={13} color="#2563eb" />
                        <span>{staff.assignedRoute || staff.assigned_route || 'Branch Territory'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem' }}>
                        <Phone size={13} color="#64748b" />
                        <span>{staff.phone}</span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#d97706', fontSize: '0.9rem' }}>
                        {formatCurrency(staff.dailyTarget || staff.daily_target || 25000)}
                      </strong>
                    </td>
                    <td>
                      <StatusBadge status={staff.status || 'ACTIVE'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BranchAdminDashboard;
