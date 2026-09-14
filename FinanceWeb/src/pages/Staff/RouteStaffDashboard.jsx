import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  MapPin,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Store,
  Calendar,
  Phone,
  Navigation,
  ShieldCheck,
  RefreshCw,
  LogOut,
  QrCode,
  ArrowRight,
  UserCheck,
  Layers,
  Radio
} from 'lucide-react';

export const RouteStaffDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    todayTarget: 18500,
    collectedToday: 12400,
    activeMerchants: 28,
    cashInHand: 12400,
    visitedCount: 19,
    pendingCount: 9,
  });

  const [loading, setLoading] = useState(false);

  // Mock Route Merchants for field execution
  const routeMerchants = [
    {
      id: 1,
      shop_name: 'Murugan Grocery & Provisions',
      owner_name: 'Murugan R',
      location: 'No. 12, Market Main Rd, Stall 4',
      due_amount: 500,
      status: 'PAID',
      time: '09:15 AM',
      type: 'DAILY',
      phone: '9876543214',
    },
    {
      id: 2,
      shop_name: 'Selvi Flower & Pooja Stall',
      owner_name: 'Selvi M',
      location: 'Bus Stand Complex, Shop 2',
      due_amount: 300,
      status: 'PAID',
      time: '09:40 AM',
      type: 'DAILY',
      phone: '9840192831',
    },
    {
      id: 3,
      shop_name: 'Annapurna Tea & Snacks',
      owner_name: 'Ramu K',
      location: 'Opposite Railway Station',
      due_amount: 600,
      status: 'PENDING',
      time: 'Scheduled 11:30 AM',
      type: 'DAILY',
      phone: '9443210987',
    },
    {
      id: 4,
      shop_name: 'Sri Krishna Veg & Fruits',
      owner_name: 'Krishnan G',
      location: 'Weekly Market Row B',
      due_amount: 1500,
      status: 'PENDING',
      time: 'Scheduled 12:15 PM',
      type: 'WEEKLY',
      phone: '9789012345',
    },
    {
      id: 5,
      shop_name: 'Modern Tailoring & Fabrics',
      owner_name: 'Kavitha P',
      location: 'Bazaar Street #44',
      due_amount: 1000,
      status: 'PENDING',
      time: 'Scheduled 01:00 PM',
      type: 'WEEKLY',
      phone: '9876500112',
    },
  ];

  return (
    <div className="staff-portal-container">
      {/* 1. Header Bar */}
      <div className="staff-header-card">
        <div className="staff-profile-row">
          <div className="staff-avatar-box">
            <UserCheck size={28} color="#0284c7" />
          </div>
          <div className="staff-title-wrap">
            <div className="staff-name-row">
              <h1 className="staff-main-title">{user?.name || 'Field Route Officer'}</h1>
              <span className="staff-badge-pill">Route Staff</span>
              <span className="staff-live-badge">
                <span className="staff-live-dot" /> GPS Route Active
              </span>
            </div>
            <div className="staff-meta-row">
              <span>
                <MapPin size={13} /> Assigned Route: <strong>Tambaram - Chromepet Market Sector 1</strong>
              </span>
              <span>•</span>
              <span>
                <Store size={13} /> Branch: <strong>Chennai Central Hub (BR-APX-01)</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="staff-header-actions">
          <button
            type="button"
            className="btn-staff-action btn-refresh"
            onClick={() => setLoading(true)}
          >
            <RefreshCw size={15} />
            <span>Sync Route</span>
          </button>
          <button
            type="button"
            className="btn-staff-action btn-logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="staff-kpi-grid">
        <div className="staff-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Today's Collection Target</span>
            <div className="kpi-icon-wrap icon-blue">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-val">₹{stats.todayTarget.toLocaleString('en-IN')}</div>
          <div className="kpi-progress-bar-bg">
            <div
              className="kpi-progress-fill"
              style={{
                width: `${(stats.collectedToday / stats.todayTarget) * 100}%`,
                background: '#0284c7',
              }}
            />
          </div>
          <div className="kpi-sub">
            {( (stats.collectedToday / stats.todayTarget) * 100).toFixed(0)}% Collected (₹{stats.collectedToday.toLocaleString('en-IN')})
          </div>
        </div>

        <div className="staff-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Cash in Hand (Safe Vault)</span>
            <div className="kpi-icon-wrap icon-green">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-val">₹{stats.cashInHand.toLocaleString('en-IN')}</div>
          <div className="kpi-sub highlight-green">
            Ready for End-of-Day Branch Handover
          </div>
        </div>

        <div className="staff-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Route Stops & Merchants</span>
            <div className="kpi-icon-wrap icon-amber">
              <Navigation size={18} />
            </div>
          </div>
          <div className="kpi-val">{stats.visitedCount} / {stats.activeMerchants} Visited</div>
          <div className="kpi-sub">
            {stats.pendingCount} collections remaining on current circuit
          </div>
        </div>
      </div>

      {/* 3. Operational Quick Actions Banner */}
      <div className="staff-actions-banner">
        <div className="banner-left">
          <QrCode size={36} color="#0284c7" />
          <div>
            <h3 className="banner-title">Mobile Route Execution & Field Collections</h3>
            <p className="banner-sub">
              Field agents can instantly record daily shopkeeper cash/UPI collections, generate SMS receipts, and synchronize live ledger records.
            </p>
          </div>
        </div>
        <div className="banner-buttons">
          <button
            type="button"
            className="btn-action-primary"
            onClick={() => navigate('/admin/shopkeepers')}
          >
            <Store size={16} />
            <span>Open Shopkeeper Ledger</span>
          </button>
          <button
            type="button"
            className="btn-action-secondary"
            onClick={() => navigate('/admin/weekly-customers')}
          >
            <Calendar size={16} />
            <span>Open Weekly Customers</span>
          </button>
        </div>
      </div>

      {/* 4. Today's Field Visit Schedule */}
      <div className="staff-schedule-card">
        <div className="schedule-header">
          <div className="schedule-header-left">
            <Clock size={18} color="#0284c7" />
            <h3 className="schedule-title">Assigned Field Route Schedule ({routeMerchants.length} Stops)</h3>
          </div>
          <span className="schedule-tag">Route Sector: Alpha-104</span>
        </div>

        <div className="schedule-table-wrap">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Merchant / Borrower</th>
                <th>Category</th>
                <th>Location & Stall</th>
                <th>Due Amount</th>
                <th>Schedule Time</th>
                <th>Collection Status</th>
                <th className="th-actions">Action</th>
              </tr>
            </thead>
            <tbody>
              {routeMerchants.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="merchant-name">{item.shop_name}</div>
                    <div className="owner-sub">Owner: {item.owner_name} • {item.phone}</div>
                  </td>
                  <td>
                    <span className={`cat-badge ${item.type === 'DAILY' ? 'cat-daily' : 'cat-weekly'}`}>
                      {item.type} LOAN
                    </span>
                  </td>
                  <td className="location-cell">
                    <MapPin size={13} className="loc-icon" />
                    <span>{item.location}</span>
                  </td>
                  <td>
                    <strong className="due-amount">₹{item.due_amount}</strong>
                  </td>
                  <td>
                    <span className="time-text">{item.time}</span>
                  </td>
                  <td>
                    {item.status === 'PAID' ? (
                      <span className="status-pill status-paid">
                        <CheckCircle2 size={13} /> Collected
                      </span>
                    ) : (
                      <span className="status-pill status-pending">
                        <Clock size={13} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="cell-action-btn">
                    {item.status === 'PAID' ? (
                      <button className="btn-collect-done" disabled>
                        Done
                      </button>
                    ) : (
                      <button
                        className="btn-collect-action"
                        onClick={() =>
                          navigate(
                            item.type === 'DAILY'
                              ? `/admin/shopkeepers`
                              : `/admin/weekly-customers`
                          )
                        }
                      >
                        Collect Cash
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Styles */}
      <style>{`
        .staff-portal-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* 1. Header Card */
        .staff-header-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .staff-profile-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .staff-avatar-box {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .staff-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .staff-main-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .staff-badge-pill {
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .staff-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ecfdf5;
          color: #059669;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #a7f3d0;
        }

        .staff-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }

        .staff-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }

        .staff-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-staff-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-refresh {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        .btn-refresh:hover { background: #e2e8f0; }

        .btn-logout {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }
        .btn-logout:hover { background: #fca5a5; }

        /* 2. KPI Grid */
        .staff-kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .staff-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .kpi-title {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .kpi-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-blue { background: #e0f2fe; color: #0284c7; }
        .icon-green { background: #dcfce7; color: #16a34a; }
        .icon-amber { background: #fef3c7; color: #d97706; }

        .kpi-val {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .kpi-progress-bar-bg {
          width: 100%;
          height: 6px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .kpi-progress-fill {
          height: 100%;
          border-radius: 999px;
        }

        .kpi-sub {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .highlight-green {
          color: #16a34a;
          font-weight: 600;
        }

        /* 3. Actions Banner */
        .staff-actions-banner {
          background: #ffffff;
          border: 1px solid #bae6fd;
          border-left: 4px solid #0284c7;
          border-radius: 12px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .banner-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .banner-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .banner-sub {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .banner-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .btn-action-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-action-primary:hover { background: #0369a1; }

        .btn-action-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-action-secondary:hover { background: #e2e8f0; }

        /* 4. Schedule Table */
        .staff-schedule-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .schedule-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .schedule-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .schedule-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .schedule-tag {
          font-size: 12px;
          font-weight: 600;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 4px 8px;
          border-radius: 6px;
          color: #475569;
        }

        .schedule-table-wrap {
          overflow-x: auto;
        }

        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .schedule-table thead th {
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .schedule-table thead .th-actions {
          text-align: right;
        }

        .schedule-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
        }

        .schedule-table tbody tr:hover {
          background: #f8fafc;
        }

        .schedule-table tbody td {
          padding: 14px 16px;
          font-size: 13px;
          color: #334155;
          vertical-align: middle;
        }

        .merchant-name {
          font-weight: 600;
          color: #0f172a;
        }

        .owner-sub {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .cat-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .cat-daily { background: #eff6ff; color: #1d4ed8; }
        .cat-weekly { background: #f0fdf4; color: #15803d; }

        .location-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
        }

        .loc-icon {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .due-amount {
          color: #0f172a;
          font-size: 14px;
        }

        .time-text {
          font-size: 12px;
          color: #64748b;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .status-paid { background: #ecfdf5; color: #059669; }
        .status-pending { background: #fffbeb; color: #b45309; }

        .cell-action-btn {
          text-align: right;
        }

        .btn-collect-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-collect-action:hover { background: #0369a1; }

        .btn-collect-done {
          background: #f1f5f9;
          color: #94a3b8;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: default;
        }

        @media (max-width: 900px) {
          .staff-kpi-grid { grid-template-columns: 1fr; }
          .staff-header-card, .staff-actions-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .staff-header-actions, .banner-buttons {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default RouteStaffDashboard;
