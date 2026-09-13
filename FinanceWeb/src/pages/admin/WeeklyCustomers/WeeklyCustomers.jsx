import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  Calendar,
  Search,
  DollarSign,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const WeeklyCustomers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getWeeklyCustomers(activeOrg ? { organizationId: activeOrg.id } : {});
      setCustomers(data);
    } catch (err) {
      console.error('Error loading weekly customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeOrg?.id]);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const filteredCustomers = customers.filter((cust) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      cust.name?.toLowerCase().includes(q) ||
      cust.customer_code?.toLowerCase().includes(q) ||
      cust.phone?.includes(q);
    const matchStatus =
      statusFilter === 'ALL' || cust.current_week_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBorrowers = customers.length;
  const totalExpected = customers.reduce((s, c) => s + (c.current_week_due || 0), 0);
  const totalCollected = customers.filter(c => c.current_week_status === 'PAID').reduce((s, c) => s + (c.current_week_due || 0), 0);
  const overdueCount = customers.filter(c => c.current_week_status === 'OVERDUE').length;

  if (loading) return <div className="page-loading">Loading Weekly Customers...</div>;

  return (
    <div className="weekly-customers-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Customers</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate(getOrgPath('users'))}>
            <Users size={16} />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Borrowers</span>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: '#fff' }}>{totalBorrowers}</h3>
        </div>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Week Target</span>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: 'var(--purple)' }}>{formatCurrency(totalExpected)}</h3>
        </div>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Collected</span>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: 'var(--emerald)' }}>{formatCurrency(totalCollected)}</h3>
        </div>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Overdue</span>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: overdueCount > 0 ? 'var(--red)' : 'var(--text-muted)' }}>{overdueCount}</h3>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
          <Search size={18} />
          <input type="text" placeholder="Search by name, code or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No weekly customers match your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filteredCustomers.map((cust) => {
            const isPaid = cust.current_week_status === 'PAID';
            const isOverdue = cust.current_week_status === 'OVERDUE';
            const progressPct = cust.total_installments > 0 ? Math.round((cust.paid_installments / cust.total_installments) * 100) : 0;
            const statusColor = isPaid ? 'var(--emerald)' : isOverdue ? 'var(--red)' : '#fbbf24';

            return (
              <div key={cust.id} className="card" style={{
                padding: '1.25rem',
                borderLeft: `3px solid ${statusColor}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Top: Customer Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1rem',
                    }}>
                      {cust.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{cust.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cust.customer_code}</div>
                    </div>
                  </div>
                  <span className={`badge ${isPaid ? 'badge-emerald' : isOverdue ? 'badge-red' : 'badge-yellow'}`} style={{ fontSize: '0.7rem' }}>
                    {cust.current_week_status}
                  </span>
                </div>

                {/* Contact */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} />{cust.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{cust.address?.split(',')[0] || 'Chennai'}</span>
                </div>

                {/* Loan Info */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '0.65rem 0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Loan: <strong style={{ color: '#fff' }}>{cust.active_loan?.loan_code || 'N/A'}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>Principal: <strong style={{ color: '#fff' }}>{formatCurrency(cust.active_loan?.principal)}</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 5 }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{cust.paid_installments}/{cust.total_installments} Weeks</span>
                    <span style={{ color: 'var(--emerald)' }}>{progressPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--emerald)', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>

                {/* Due Amount & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>This Week Due</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: statusColor }}>{formatCurrency(cust.current_week_due)}</div>
                  </div>
                  <button
                    className={`btn btn-sm ${isPaid ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => navigate(getOrgPath(`weekly-customers/${cust.id}/collect`), { state: { customer: cust } })}
                  >
                    <DollarSign size={14} />
                    <span>{isPaid ? 'View' : 'Collect'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeeklyCustomers;
