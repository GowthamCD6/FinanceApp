import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Server,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Cpu,
  Database,
  Lock,
} from 'lucide-react';

export const ApiAnalytics = () => {
  const [timeRange, setTimeRange] = useState('24H');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const endpointStats = [
    { method: 'POST', endpoint: '/api/payments', calls: '48,210', latency: '42ms', errors: '0.01%', status: 'HEALTHY' },
    { method: 'GET', endpoint: '/api/reports/payments', calls: '32,190', latency: '65ms', errors: '0.00%', status: 'HEALTHY' },
    { method: 'POST', endpoint: '/api/users', calls: '14,800', latency: '58ms', errors: '0.04%', status: 'HEALTHY' },
    { method: 'GET', endpoint: '/api/users', calls: '64,900', latency: '35ms', errors: '0.00%', status: 'HEALTHY' },
    { method: 'POST', endpoint: '/api/loans', calls: '8,420', latency: '78ms', errors: '0.02%', status: 'HEALTHY' },
    { method: 'GET', endpoint: '/api/loans', calls: '41,200', latency: '44ms', errors: '0.00%', status: 'HEALTHY' },
    { method: 'POST', endpoint: '/api/auth/login', calls: '18,600', latency: '92ms', errors: '0.12%', status: 'HEALTHY' },
    { method: 'GET', endpoint: '/health', calls: '120,400', latency: '4ms', errors: '0.00%', status: 'OPTIMAL' },
  ];

  const recentLogs = [
    { time: '15:40:12', method: 'POST', path: '/api/payments', status: 201, latency: '41ms', ip: '103.21.144.12', org: 'ORG-APEX' },
    { time: '15:40:08', method: 'GET', path: '/api/reports/payments?frequency=WEEKLY', status: 200, latency: '54ms', ip: '49.207.201.88', org: 'ORG-APEX' },
    { time: '15:39:55', method: 'PUT', path: '/api/users/3', status: 200, latency: '62ms', ip: '117.214.32.10', org: 'ORG-METRO' },
    { time: '15:39:41', method: 'POST', path: '/api/users', status: 201, latency: '68ms', ip: '103.21.144.12', org: 'ORG-APEX' },
    { time: '15:39:20', method: 'GET', path: '/api/loans', status: 200, latency: '38ms', ip: '49.207.201.88', org: 'ORG-APEX' },
  ];

  return (
    <div className="api-analytics-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">SYSTEM TELEMETRY & API GATEWAY</div>
          <h1 className="page-title">API Analytics & Server Health</h1>
          <p className="page-subtitle">
            Real-time backend API traffic throughput, response latency, idempotency verification, and microservice health.
          </p>
        </div>

        <div className="header-actions">
          <button className={`btn btn-secondary ${refreshing ? 'loading' : ''}`} onClick={handleRefresh}>
            <RefreshCw size={16} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* KPI System Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Requests (24h)</span>
            <Activity size={18} color="var(--accent-primary)" />
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem', color: '#fff' }}>348,720</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>+8.4% throughput</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Latency (p95)</span>
            <Zap size={18} color="#fbbf24" />
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem', color: '#fbbf24' }}>46 ms</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Optimal sub-100ms response</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Server Uptime</span>
            <Server size={18} color="var(--emerald)" />
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem', color: 'var(--emerald)' }}>99.98%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TiDB MySQL Pool Connected</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Idempotency Deduplication</span>
            <Lock size={18} color="var(--purple)" />
          </div>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem', color: 'var(--purple)' }}>100% Safe</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Zero duplicate payments</span>
        </div>
      </div>

      {/* Latency & Server Metrics Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Endpoint Performance Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Endpoint Throughput & Performance Breakdown</h3>
            <span className="badge badge-emerald">Live Monitored</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Method & Endpoint</th>
                  <th>Calls</th>
                  <th>Avg Latency</th>
                  <th>Error Rate</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {endpointStats.map((ep, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${ep.method === 'POST' ? 'badge-emerald' : (ep.method === 'PUT' ? 'badge-purple' : 'badge-blue')}`}>
                          {ep.method}
                        </span>
                        <code style={{ fontSize: '0.85rem' }}>{ep.endpoint}</code>
                      </div>
                    </td>
                    <td>{ep.calls}</td>
                    <td><strong style={{ color: '#fff' }}>{ep.latency}</strong></td>
                    <td><span style={{ color: ep.errors === '0.00%' ? 'var(--emerald)' : '#fbbf24' }}>{ep.errors}</span></td>
                    <td>
                      <span className="badge badge-emerald">{ep.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server Health Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Server Infrastructure</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                <span>Node.js / Express Core</span>
                <span className="badge badge-emerald">v20.x Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                <span>Database Connection Pool</span>
                <strong style={{ color: 'var(--emerald)' }}>10/10 Healthy</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                <span>JWT Authentication Layer</span>
                <span className="badge badge-blue">HMAC-SHA256</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                <span>CORS & Security Middleware</span>
                <span className="badge badge-purple">Enabled</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--emerald)', fontSize: '0.95rem' }}>
              ⚡ Real-time Idempotency Shield
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All mobile agent payment submissions use <code>idempotency_keys</code> to guarantee that flaky field networks never record duplicate payment deductions.
            </p>
          </div>
        </div>
      </div>

      {/* Live Request Stream */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Real-time Request Stream (Last 5 API Hits)</h3>
          <span className="badge badge-blue">WebSocket Live</span>
        </div>

        <div className="table-responsive">
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Method</th>
                <th>Route Path</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Client IP</th>
                <th>Tenant Org</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log, lIdx) => (
                <tr key={lIdx}>
                  <td><code>{log.time}</code></td>
                  <td>
                    <span className={`badge ${log.method === 'POST' ? 'badge-emerald' : 'badge-blue'}`}>{log.method}</span>
                  </td>
                  <td><code>{log.path}</code></td>
                  <td>
                    <span className="badge badge-emerald">{log.status} OK</span>
                  </td>
                  <td><strong style={{ color: '#fff' }}>{log.latency}</strong></td>
                  <td><span style={{ color: 'var(--text-muted)' }}>{log.ip}</span></td>
                  <td><span className="badge badge-purple">{log.org}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiAnalytics;
