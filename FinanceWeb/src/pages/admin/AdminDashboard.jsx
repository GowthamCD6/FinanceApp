import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import {
  Users,
  UserPlus,
  Receipt,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building,
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [weeklyDues, setWeeklyDues] = useState([]);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [m, w, d] = await Promise.all([
          api.getAdminDashboardMetrics(),
          api.getWeeklyDues(),
          api.getDailyCollections(),
        ]);
        setMetrics(m);
        setWeeklyDues(w);
        setDailyCollections(d);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  if (loading || !metrics) return <div className="page-loading">Loading Field Operations Hub...</div>;

  const dailyProgress = metrics.todayDailyTarget > 0 ? Math.round((metrics.todayDailyCollected / metrics.todayDailyTarget) * 100) : 0;
  const weeklyProgress = metrics.todayWeeklyTarget > 0 ? Math.round((metrics.weeklyCollected / metrics.todayWeeklyTarget) * 100) : 0;

  return (
    <div className="admin-dash-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="org-pill">
            <Building size={14} />
            <span>Apex Finance Ltd • Triplicane & Saidapet Territory</span>
          </div>
          <h1 className="page-title">Admin Operations Command</h1>
          <p className="page-subtitle">
            Daily collection monitoring, borrower governance, and weekly dues execution.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-emerald" onClick={() => navigate('/users/add')}>
            <UserPlus size={16} />
            <span>Onboard User</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/reports')}>
            <Receipt size={16} />
            <span>Open Collection Sheets</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          label="Today's Daily Target"
          value={formatCurrency(metrics.todayDailyTarget)}
          icon={Receipt}
          trend={`${dailyProgress}% Collected`}
          trendDirection="up"
          meta={`Collected: ${formatCurrency(metrics.todayDailyCollected)}`}
          accentColor="#10B981"
          accentBg="rgba(16, 185, 129, 0.15)"
        />

        <StatCard
          label="This Week's Dues"
          value={formatCurrency(metrics.todayWeeklyTarget)}
          icon={Calendar}
          trend={`${weeklyProgress}% Recovered`}
          trendDirection="up"
          meta={`Received: ${formatCurrency(metrics.weeklyCollected)}`}
          accentColor="#6366F1"
          accentBg="rgba(99, 102, 241, 0.15)"
        />

        <StatCard
          label="Active Borrowers"
          value={`${metrics.totalActiveUsers} Clients`}
          icon={Users}
          trend="Field Route"
          trendDirection="up"
          meta="100% Enrolled"
          accentColor="#F59E0B"
          accentBg="rgba(245, 158, 11, 0.15)"
        />

        <StatCard
          label="Action Overdues"
          value={`${metrics.overdueBorrowersCount} Overdue`}
          icon={AlertTriangle}
          trend="Requires Visit"
          trendDirection="down"
          meta="Priority follow-up"
          accentColor="#EF4444"
          accentBg="rgba(239, 68, 68, 0.15)"
        />
      </div>

      {/* Two Column Section: Quick Actions & Today's Field Route */}
      <div className="dash-grid">
        {/* Left: Quick Actions & Management Shortcuts */}
        <div className="card shortcuts-card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={20} color="var(--emerald)" />
              Operational Modules
            </h3>
            <span className="badge badge-emerald">Field Ready</span>
          </div>

          <div className="modules-list">
            <div className="module-item" onClick={() => navigate('/users')}>
              <div className="mod-icon blue">
                <Users size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Manage Users & Borrowers</span>
                <span className="mod-desc">Audit borrower credit limits, loan progress, and toggle active/suspended status</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>

            <div className="module-item" onClick={() => navigate('/users/add')}>
              <div className="mod-icon green">
                <UserPlus size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Onboard New User</span>
                <span className="mod-desc">Register weekly borrower or daily merchant with KYC and credit limits</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>

            <div className="module-item" onClick={() => navigate('/reports')}>
              <div className="mod-icon amber">
                <Calendar size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Weekly Dues Sheet</span>
                <span className="mod-desc">View full list of clients who need to pay this week with quick collection</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>

            <div className="module-item" onClick={() => navigate('/reports')}>
              <div className="mod-icon purple">
                <Receipt size={20} />
              </div>
              <div className="mod-info">
                <span className="mod-title">Daily Collections Sheet</span>
                <span className="mod-desc">Record rapid shopkeeper daily collections with Cash / UPI receipt vouchers</span>
              </div>
              <ArrowRight size={16} className="mod-arrow" />
            </div>
          </div>
        </div>

        {/* Right: Urgent Pending Collections Today */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Clock size={20} color="var(--primary)" />
                Urgent Field Follow-ups Today
              </h3>
              <p className="card-subtitle">Pending daily visits and this week's scheduled collections</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/reports')}>
              View All Dues
            </button>
          </div>

          <div className="urgent-list">
            {weeklyDues.filter((d) => d.status !== 'PAID').slice(0, 3).map((due) => (
              <div key={due.id} className="urgent-item">
                <div className="urgent-left">
                  <span className="urgent-name">{due.customer_name}</span>
                  <span className="urgent-sub">{due.installment_week} • Due: {due.due_date}</span>
                </div>
                <div className="urgent-right">
                  <span className="urgent-amt">{formatCurrency(due.due_amount)}</span>
                  <StatusBadge status={due.status} />
                </div>
              </div>
            ))}

            {dailyCollections.filter((c) => c.status !== 'COLLECTED').slice(0, 2).map((col) => (
              <div key={col.id} className="urgent-item">
                <div className="urgent-left">
                  <span className="urgent-name">{col.customer_name} (Shop)</span>
                  <span className="urgent-sub">{col.installment_day} • Today's Visit</span>
                </div>
                <div className="urgent-right">
                  <span className="urgent-amt">{formatCurrency(col.due_amount)}</span>
                  <StatusBadge status={col.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .admin-dash-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .org-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.4rem;
        }

        .dash-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 960px) {
          .dash-grid {
            grid-template-columns: 1fr;
          }
        }

        .modules-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .module-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .module-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateX(3px);
        }

        .mod-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mod-icon.blue { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .mod-icon.green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .mod-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .mod-icon.purple { background: rgba(139, 92, 246, 0.15); color: #c4b5fd; }

        .mod-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .mod-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .mod-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .mod-arrow {
          color: var(--text-muted);
          transition: transform var(--transition-fast);
        }

        .module-item:hover .mod-arrow {
          color: var(--text-primary);
          transform: translateX(3px);
        }

        .urgent-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .urgent-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.85rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .urgent-left {
          display: flex;
          flex-direction: column;
        }

        .urgent-name {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-primary);
        }

        .urgent-sub {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        .urgent-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .urgent-amt {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--emerald);
        }
      `}</style>
    </div>
  );
};
