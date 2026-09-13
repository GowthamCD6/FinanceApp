import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useOrg } from '../../../context/OrgContext';
import {
  Store, Search, DollarSign, Phone, MapPin, CheckCircle2, AlertTriangle,
  Users, ArrowRight, Clock,
} from 'lucide-react';

export const Shopkeepers = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [shopkeepers, setShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const getOrgPath = (sub) => (activeOrg ? `/org/${activeOrg.id}/${sub}` : `/admin/${sub}`);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getShopkeepers(activeOrg ? { organizationId: activeOrg.id } : {});
      setShopkeepers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeOrg?.id]);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  const filteredShops = shopkeepers.filter((shop) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      shop.name?.toLowerCase().includes(q) ||
      shop.shop_name?.toLowerCase().includes(q) ||
      shop.phone?.includes(q) ||
      shop.customer_code?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || shop.today_collection_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalShops = shopkeepers.length;
  const totalDailyTarget = shopkeepers.reduce((s, sh) => s + (sh.daily_collection_target || 0), 0);
  const collectedCount = shopkeepers.filter(s => s.today_collection_status === 'COLLECTED').length;
  const totalOutstanding = shopkeepers.reduce((s, sh) => s + (sh.total_outstanding || 0), 0);

  if (loading) return <div className="page-loading">Loading Shopkeepers...</div>;

  return (
    <div className="shopkeepers-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopkeeper Daily Collections</h1>
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
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Shops</span>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: '#fff' }}>{totalShops}</h3>
        </div>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Daily Target</span>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: 'var(--purple)' }}>{formatCurrency(totalDailyTarget)}</h3>
        </div>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Collected Today</span>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: 'var(--emerald)' }}>{collectedCount}/{totalShops}</h3>
        </div>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Outstanding</span>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', color: '#fbbf24' }}>{formatCurrency(totalOutstanding)}</h3>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
          <Search size={18} />
          <input type="text" placeholder="Search by shop name, owner, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 170 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COLLECTED">Collected</option>
        </select>
      </div>

      {/* Shopkeeper Cards Grid */}
      {filteredShops.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No shopkeepers match your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filteredShops.map((shop) => {
            const isCollected = shop.today_collection_status === 'COLLECTED';
            const statusColor = isCollected ? 'var(--emerald)' : '#fbbf24';
            const mainLoan = shop.loans?.[0] || null;
            const progressPct = mainLoan ? Math.round((mainLoan.paid_installments / mainLoan.total_installments) * 100) : 0;

            return (
              <div key={shop.id} className="card" style={{
                padding: '1.25rem',
                borderLeft: `3px solid ${statusColor}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Top: Shop Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(168,85,247,0.15)', color: 'var(--purple)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1rem',
                    }}>
                      <Store size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{shop.shop_name || shop.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{shop.customer_code} • {shop.stall_no}</div>
                    </div>
                  </div>
                  <span className={`badge ${isCollected ? 'badge-emerald' : 'badge-yellow'}`} style={{ fontSize: '0.7rem' }}>
                    {isCollected ? 'COLLECTED' : 'PENDING'}
                  </span>
                </div>

                {/* Contact */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} />{shop.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{shop.market_location?.split(',')[0] || 'Market'}</span>
                </div>

                {/* Loan Info */}
                {mainLoan && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '0.65rem 0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Loan: <strong style={{ color: '#fff' }}>{mainLoan.loan_code}</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(mainLoan.principal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 5 }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>Day {mainLoan.paid_installments}/{mainLoan.total_installments}</span>
                      <span style={{ color: 'var(--emerald)' }}>{progressPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 5, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--purple)', borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                {/* Due Amount & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Daily Due</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: statusColor }}>{formatCurrency(shop.daily_collection_target)}</div>
                  </div>
                  <button
                    className={`btn btn-sm ${isCollected ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => navigate(getOrgPath(`shopkeepers/${shop.id}/collect`), { state: { shop } })}
                  >
                    <DollarSign size={14} />
                    <span>{isCollected ? 'View' : 'Collect'}</span>
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

export default Shopkeepers;
