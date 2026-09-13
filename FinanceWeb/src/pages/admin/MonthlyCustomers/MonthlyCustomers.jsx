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
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const MonthlyCustomers = () => {
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
      const data = await api.getMonthlyCustomers(activeOrg ? { organizationId: activeOrg.id } : {});
      setCustomers(data);
    } catch (err) {
      console.error('Error loading monthly customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOrg?.id]);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const filteredCustomers = customers.filter((cust) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      cust.name?.toLowerCase().includes(q) ||
      cust.customer_code?.toLowerCase().includes(q) ||
      cust.phone?.includes(q);
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PAID' && cust.current_month_status === 'PAID') ||
      (statusFilter === 'UNPAID' && cust.current_month_status !== 'PAID');
    return matchSearch && matchStatus;
  });

  const totalMonthlyTarget = customers.reduce((sum, c) => sum + (c.monthly_emi || 0), 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);
  const paidThisMonth = customers.filter((c) => c.current_month_status === 'PAID').length;

  return (
    <div className="weekly-customers-page" style={{ padding: '0 0.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            Monthly Customers (EMI)
            {activeOrg && (
              <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--accent-primary)', marginLeft: '0.75rem' }}>
                • {activeOrg.name}
              </span>
            )}
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Card-based monthly installment tracker with real-time payment schedule
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(getOrgPath('users'))}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={16} />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Monthly Borrowers</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.4rem', color: '#fff' }}>{customers.length}</h3>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly EMI Target</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.4rem', color: 'var(--accent-primary)' }}>{formatCurrency(totalMonthlyTarget)}</h3>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Outstanding</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.4rem', color: '#fbbf24' }}>{formatCurrency(totalOutstanding)}</h3>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Collected This Month</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.4rem', color: 'var(--emerald)' }}>
            {paidThisMonth} / {customers.length}
          </h3>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by customer name, code, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-input"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid This Month</option>
          <option value="UNPAID">Pending EMI</option>
        </select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading Monthly Customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <UserCheck size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p>No monthly installment borrowers found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredCustomers.map((cust) => {
            const isPaid = cust.current_month_status === 'PAID';
            const isOverdue = cust.current_month_status === 'OVERDUE';
            const progress = cust.total_installments > 0 ? Math.round((cust.paid_installments / cust.total_installments) * 100) : 0;

            return (
              <div
                key={cust.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isPaid ? '4px solid var(--emerald)' : isOverdue ? '4px solid var(--danger)' : '4px solid var(--accent-primary)',
                }}
              >
                <div>
                  {/* Top Row: Name & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 600 }}>{cust.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cust.customer_code} • {cust.occupation}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 4,
                        background: isPaid ? 'rgba(16, 185, 129, 0.15)' : isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isPaid ? 'var(--emerald)' : isOverdue ? 'var(--danger)' : '#fbbf24',
                      }}
                    >
                      {isPaid ? 'PAID THIS MONTH' : isOverdue ? 'OVERDUE' : 'DUE THIS MONTH'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={13} />
                      <span>{cust.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={13} />
                      <span>{cust.address}</span>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly EMI:</span>
                      <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{formatCurrency(cust.monthly_emi)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outstanding Balance:</span>
                      <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{formatCurrency(cust.outstanding_balance)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progress:</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {cust.paid_installments} / {cust.total_installments} months ({progress}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: '0.4rem', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Collect Button */}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                  onClick={() => navigate(getOrgPath(`monthly-customers/collect/${cust.id}`), { state: { customer: cust } })}
                >
                  <DollarSign size={16} />
                  <span>{isPaid ? 'View / Extra Payment' : `Collect ${formatCurrency(cust.monthly_emi)}`}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonthlyCustomers;
