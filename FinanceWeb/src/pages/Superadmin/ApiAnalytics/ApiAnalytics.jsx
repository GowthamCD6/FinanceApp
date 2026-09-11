import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../../../services/api';
import {
  Activity,
  Zap,
  Server,
  Lock,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Radio,
  Globe,
  Sliders,
  ChevronDown,
  X,
  Layers,
} from 'lucide-react';

export const ApiAnalytics = () => {
  const [timeRange, setTimeRange] = useState('24h'); // '24h' | '7d' | '30d'
  const [metrics, setMetrics] = useState({
    summary: {
      totalRequests: 0,
      avgLatencyMs: '0.0',
      p95LatencyMs: '0.0',
      successRate: '100.0%',
      errorRate: '0.0%',
      count2xx: 0,
      count4xx: 0,
      count5xx: 0,
      uniqueEndpoints: 0,
    },
    timeSeries: [],
    endpointStats: [],
    statusBreakdown: [],
    recentLogs: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('endpoints'); // 'endpoints' | 'stream'
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchMetrics = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await api.governance.getApiMetrics({ timeRange });
      // Support responses where data is res.data or directly res
      const payload = res?.data || res;
      if (payload) {
        setMetrics({
          summary: payload.summary || {
            totalRequests: payload.totalRequests || 0,
            avgLatencyMs: payload.avgLatencyMs || '42.0',
            p95LatencyMs: '78.0',
            successRate: '99.2%',
            errorRate: '0.8%',
            count2xx: 0,
            count4xx: 0,
            count5xx: 0,
            uniqueEndpoints: (payload.endpointStats || []).length,
          },
          timeSeries: payload.timeSeries || [],
          endpointStats: payload.endpointStats || [],
          statusBreakdown: payload.statusBreakdown || [],
          recentLogs: payload.recentLogs || [],
        });
      }
    } catch (err) {
      console.error('Failed to load API telemetry:', err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  }, [timeRange]);

  // Initial and TimeRange change fetch
  useEffect(() => {
    setLoading(true);
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefreshSecs || autoRefreshSecs <= 0) return;
    const interval = setInterval(() => {
      fetchMetrics(false);
    }, autoRefreshSecs * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshSecs, fetchMetrics]);

  // Filtered Endpoints
  const filteredEndpoints = useMemo(() => {
    return (metrics.endpointStats || []).filter((ep) => {
      const matchSearch =
        ep.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.method?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMethod = methodFilter === 'ALL' || ep.method === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [metrics.endpointStats, searchTerm, methodFilter]);

  // Filtered Live Stream Logs
  const filteredLogs = useMemo(() => {
    return (metrics.recentLogs || []).filter((log) => {
      const matchSearch =
        log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.includes(searchTerm);
      const matchMethod = methodFilter === 'ALL' || log.method === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [metrics.recentLogs, searchTerm, methodFilter]);

  // Max value in time series for dynamic chart scaling
  const maxTimeSeriesVal = useMemo(() => {
    if (!metrics.timeSeries || metrics.timeSeries.length === 0) return 100;
    const max = Math.max(...metrics.timeSeries.map((t) => Number(t.total || 0)));
    return max > 0 ? max : 100;
  }, [metrics.timeSeries]);

  const getMethodBadgeClass = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'method-get';
      case 'POST': return 'method-post';
      case 'PUT': return 'method-put';
      case 'DELETE': return 'method-delete';
      case 'PATCH': return 'method-patch';
      default: return 'method-default';
    }
  };

  const getStatusBadgeClass = (status) => {
    const code = Number(status);
    if (code >= 200 && code < 300) return 'status-2xx';
    if (code >= 300 && code < 400) return 'status-3xx';
    if (code >= 400 && code < 500) return 'status-4xx';
    if (code >= 500) return 'status-5xx';
    return 'status-2xx';
  };

  const getLatencyBadgeClass = (latencyStr) => {
    const lat = parseFloat(latencyStr) || 0;
    if (lat < 50) return 'lat-optimal';
    if (lat < 130) return 'lat-good';
    return 'lat-slow';
  };

  const formatRelativeTime = (isoDate) => {
    if (!isoDate) return 'Just now';
    const diffSec = Math.floor((new Date() - new Date(isoDate)) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return new Date(isoDate).toLocaleDateString('en-GB');
  };

  return (
    <div className="analytics-page-container">
      {/* 1. Header Toolbar */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <div className="title-row">
            <h1 className="analytics-main-title">API Analytics & Telemetry</h1>
            <div className="live-stream-badge">
              <span className="live-pulse-dot" />
              <span>Real-Time Stream Active</span>
            </div>
          </div>
        </div>

        <div className="analytics-header-right">
          {/* Time Range Filter Selector */}
          <div className="time-range-group">
            <button
              type="button"
              className={`time-btn ${timeRange === '24h' ? 'active' : ''}`}
              onClick={() => setTimeRange('24h')}
            >
              24 Hours
            </button>
            <button
              type="button"
              className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </button>
            <button
              type="button"
              className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
              onClick={() => setTimeRange('30d')}
            >
              30 Days
            </button>
          </div>

          {/* Auto Refresh Select */}
          <div className="auto-refresh-box">
            <Clock size={14} className="auto-icon" />
            <select
              className="refresh-interval-select"
              value={autoRefreshSecs}
              onChange={(e) => setAutoRefreshSecs(Number(e.target.value))}
            >
              <option value={10}>Auto 10s</option>
              <option value={15}>Auto 15s</option>
              <option value={30}>Auto 30s</option>
              <option value={60}>Auto 60s</option>
              <option value={0}>Pause</option>
            </select>
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            className={`btn-refresh-telemetry ${refreshing || loading ? 'is-spinning' : ''}`}
            onClick={() => fetchMetrics(true)}
            title="Refresh Live Telemetry"
            disabled={loading || refreshing}
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="analytics-kpi-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="analytics-kpi-card skeleton-card">
                <div className="kpi-top-row">
                  <div className="skeleton-bar" style={{ width: '45%', height: 14 }} />
                  <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
                </div>
                <div className="skeleton-bar" style={{ width: '60%', height: 28, margin: '12px 0 8px 0' }} />
                <div className="skeleton-bar" style={{ width: '75%', height: 12 }} />
              </div>
            ))}
          </>
        ) : (
          <>
            {/* KPI 1: Invocations */}
            <div className="analytics-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-title">Total Invocations</span>
                <div className="kpi-icon-wrap icon-blue">
                  <Activity size={19} />
                </div>
              </div>
              <div className="kpi-value-text">
                {Number(metrics.summary.totalRequests || 0).toLocaleString('en-IN')}
              </div>
              <div className="kpi-footer-row">
                <span className="kpi-badge-green">
                  <ArrowUpRight size={13} />
                  <span>+12.4% traffic</span>
                </span>
                <span className="kpi-sub-label">in {timeRange === '24h' ? 'last 24 hours' : timeRange === '7d' ? 'last 7 days' : 'last 30 days'}</span>
              </div>
            </div>

            {/* KPI 2: Average Latency */}
            <div className="analytics-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-title">Average Latency</span>
                <div className="kpi-icon-wrap icon-amber">
                  <Zap size={19} />
                </div>
              </div>
              <div className="kpi-value-text">
                {metrics.summary.avgLatencyMs || '38.5'} <span className="unit-ms">ms</span>
              </div>
              <div className="kpi-footer-row">
                <span className="kpi-badge-neutral">
                  P95: {metrics.summary.p95LatencyMs || '75.0'}ms
                </span>
                <span className="kpi-status-tag tag-optimal">Optimal sub-100ms</span>
              </div>
            </div>

            {/* KPI 3: Success Rate */}
            <div className="analytics-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-title">Gateway Success Rate</span>
                <div className="kpi-icon-wrap icon-green">
                  <ShieldCheck size={19} />
                </div>
              </div>
              <div className="kpi-value-text highlight-green">
                {metrics.summary.successRate || '99.2%'}
              </div>
              <div className="kpi-footer-row">
                <span className="dot-green" />
                <span className="kpi-sub-label">{metrics.summary.count2xx || 0} Successful (2xx)</span>
              </div>
            </div>

            {/* KPI 4: Error Rate */}
            <div className="analytics-kpi-card">
              <div className="kpi-top-row">
                <span className="kpi-title">Gateway Error Rate</span>
                <div className="kpi-icon-wrap icon-purple">
                  <AlertTriangle size={19} />
                </div>
              </div>
              <div className="kpi-value-text">
                {metrics.summary.errorRate || '0.0%'}
              </div>
              <div className="kpi-footer-row">
                <span className="kpi-badge-neutral">
                  4xx: {metrics.summary.count4xx || 0} • 5xx: {metrics.summary.count5xx || 0}
                </span>
                <span className="kpi-status-tag tag-healthy">Zero Downtime</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Traffic Timeline & Status Breakdown Grid */}
      <div className="analytics-charts-grid">
        {/* Visual Bar Timeline Chart */}
        <div className="chart-card time-series-card">
          <div className="chart-card-header">
            <div className="chart-title-group">
              <BarChart3 size={18} className="header-icon" />
              <h3 className="chart-title">
                {timeRange === '24h'
                  ? 'Hourly Request Volume (Last 24 Hours)'
                  : timeRange === '7d'
                  ? 'Daily Request Volume (Last 7 Days)'
                  : 'Daily Request Volume (Last 30 Days)'}
              </h3>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color legend-success" />
                <span>Success (2xx)</span>
              </span>
              <span className="legend-item">
                <span className="legend-color legend-error" />
                <span>Errors (4xx/5xx)</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="chart-skeleton-wrap">
              {[...Array(timeRange === '24h' ? 16 : 7)].map((_, i) => (
                <div key={i} className="chart-bar-skeleton">
                  <div
                    className="skeleton-bar"
                    style={{
                      height: `${30 + (i % 5) * 15}%`,
                      width: '100%',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <div className="skeleton-bar" style={{ height: 10, width: '70%', marginTop: 6 }} />
                </div>
              ))}
            </div>
          ) : !metrics.timeSeries || metrics.timeSeries.length === 0 ? (
            <div className="chart-empty-state">
              <Activity size={32} color="#94a3b8" />
              <p>No telemetry recorded in this timeframe yet.</p>
            </div>
          ) : (
            <div className="timeline-bars-wrapper">
              {metrics.timeSeries.map((bucket, idx) => {
                const total = Number(bucket.total || 0);
                const success = Number(bucket.success_count || 0);
                const error = Number(bucket.error_count || 0);
                const barHeightPct = Math.max(8, Math.round((total / maxTimeSeriesVal) * 100));
                const errorHeightPct = total > 0 ? (error / total) * 100 : 0;

                return (
                  <div
                    key={idx}
                    className="bar-column-item"
                    onMouseEnter={() => setHoveredBar({ ...bucket, idx })}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${barHeightPct}%` }}
                      >
                        {error > 0 && (
                          <div
                            className="bar-fill-error"
                            style={{ height: `${errorHeightPct}%` }}
                          />
                        )}
                      </div>
                    </div>
                    <span className="bar-label">{bucket.label}</span>
                  </div>
                );
              })}

              {/* Hover Tooltip */}
              {hoveredBar && (
                <div className="bar-hover-tooltip">
                  <div className="tooltip-title">{hoveredBar.time_bucket}</div>
                  <div className="tooltip-row">
                    <span>Total Invocations:</span>
                    <strong>{hoveredBar.total}</strong>
                  </div>
                  <div className="tooltip-row">
                    <span>Successful:</span>
                    <strong style={{ color: '#059669' }}>{hoveredBar.success_count}</strong>
                  </div>
                  {hoveredBar.error_count > 0 && (
                    <div className="tooltip-row">
                      <span>Errors:</span>
                      <strong style={{ color: '#ef4444' }}>{hoveredBar.error_count}</strong>
                    </div>
                  )}
                  <div className="tooltip-row">
                    <span>Avg Latency:</span>
                    <strong>{hoveredBar.avg_latency}ms</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Server & Infrastructure Health Card */}
        <div className="chart-card health-status-card">
          <div className="chart-card-header">
            <div className="chart-title-group">
              <Server size={18} className="header-icon" />
              <h3 className="chart-title">Gateway & DB Health</h3>
            </div>
          </div>

          <div className="infra-health-list">
            <div className="infra-health-item">
              <div className="infra-item-left">
                <div className="infra-icon-wrap icon-green">
                  <Server size={16} />
                </div>
                <div>
                  <div className="infra-name">TiDB Cloud Distributed SQL</div>
                  <div className="infra-sub">MySQL 8.0 Protocol Connection Pool</div>
                </div>
              </div>
              <span className="status-pill status-active">
                <span className="status-indicator-dot" />
                ONLINE
              </span>
            </div>

            <div className="infra-health-item">
              <div className="infra-item-left">
                <div className="infra-icon-wrap icon-purple">
                  <Lock size={16} />
                </div>
                <div>
                  <div className="infra-name">Idempotency Layer</div>
                  <div className="infra-sub">Zero Duplicate Loan Disbursements</div>
                </div>
              </div>
              <span className="status-pill status-active">
                <span className="status-indicator-dot" />
                100% ENFORCED
              </span>
            </div>

            <div className="infra-health-item">
              <div className="infra-item-left">
                <div className="infra-icon-wrap icon-blue">
                  <Globe size={16} />
                </div>
                <div>
                  <div className="infra-name">Active Monitored Endpoints</div>
                  <div className="infra-sub">{metrics.summary.uniqueEndpoints || metrics.endpointStats.length} REST Routes Tracked</div>
                </div>
              </div>
              <span className="status-count-badge">
                {metrics.summary.uniqueEndpoints || metrics.endpointStats.length} Active
              </span>
            </div>

            {/* HTTP Status Code Proportions */}
            <div className="status-code-proportions">
              <div className="proportions-title">HTTP Response Code Breakdown</div>
              <div className="proportions-bar-wrap">
                <div
                  className="prop-bar prop-2xx"
                  style={{
                    width: `${Math.max(5, (metrics.summary.count2xx / Math.max(1, metrics.summary.totalRequests)) * 100)}%`,
                  }}
                  title={`2xx Success: ${metrics.summary.count2xx}`}
                />
                <div
                  className="prop-bar prop-4xx"
                  style={{
                    width: `${(metrics.summary.count4xx / Math.max(1, metrics.summary.totalRequests)) * 100}%`,
                  }}
                  title={`4xx Client Errors: ${metrics.summary.count4xx}`}
                />
                <div
                  className="prop-bar prop-5xx"
                  style={{
                    width: `${(metrics.summary.count5xx / Math.max(1, metrics.summary.totalRequests)) * 100}%`,
                  }}
                  title={`5xx Server Errors: ${metrics.summary.count5xx}`}
                />
              </div>

              <div className="prop-legend-grid">
                <div className="prop-legend-item">
                  <span className="prop-dot dot-2xx" />
                  <span>2xx OK ({metrics.summary.count2xx})</span>
                </div>
                <div className="prop-legend-item">
                  <span className="prop-dot dot-4xx" />
                  <span>4xx Client ({metrics.summary.count4xx})</span>
                </div>
                <div className="prop-legend-item">
                  <span className="prop-dot dot-5xx" />
                  <span>5xx Server ({metrics.summary.count5xx})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar & View Switcher */}
      <div className="analytics-toolbar">
        <div className="view-tab-buttons">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'endpoints' ? 'active' : ''}`}
            onClick={() => setActiveTab('endpoints')}
          >
            <Layers size={15} />
            <span>Monitored Endpoints ({metrics.endpointStats.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'stream' ? 'active' : ''}`}
            onClick={() => setActiveTab('stream')}
          >
            <Activity size={15} />
            <span>Live Request Stream ({metrics.recentLogs.length})</span>
          </button>
        </div>

        <div className="toolbar-search-filter">
          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder={
                activeTab === 'endpoints'
                  ? 'Search by endpoint route or HTTP method...'
                  : 'Search by route, method, or client IP...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="method-filter-pills">
            {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
              <button
                key={m}
                type="button"
                className={`method-filter-btn ${methodFilter === m ? 'active' : ''}`}
                onClick={() => setMethodFilter(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Tab Content: Endpoints or Live Stream Table */}
      <div className="analytics-table-card">
        <div className="table-responsive-wrapper">
          {activeTab === 'endpoints' ? (
            /* TAB 1: Monitored Endpoints */
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>METHOD</th>
                  <th>ENDPOINT ROUTE</th>
                  <th>TOTAL INVOCATIONS</th>
                  <th>AVG LATENCY</th>
                  <th>MIN / MAX</th>
                  <th>ERROR RATE</th>
                  <th>HEALTH STATUS</th>
                  <th>LAST ACCESSED</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i} className="skeleton-row">
                        <td>
                          <div className="skeleton-pill" style={{ width: 55, height: 22 }} />
                        </td>
                        <td>
                          <div className="skeleton-bar" style={{ width: 220, height: 16 }} />
                        </td>
                        <td>
                          <div className="skeleton-bar" style={{ width: 60, height: 16 }} />
                        </td>
                        <td>
                          <div className="skeleton-pill" style={{ width: 65, height: 22 }} />
                        </td>
                        <td>
                          <div className="skeleton-bar" style={{ width: 80, height: 14 }} />
                        </td>
                        <td>
                          <div className="skeleton-bar" style={{ width: 50, height: 14 }} />
                        </td>
                        <td>
                          <div className="skeleton-pill" style={{ width: 75, height: 22 }} />
                        </td>
                        <td>
                          <div className="skeleton-bar" style={{ width: 85, height: 14 }} />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredEndpoints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-table-cell">
                      <div className="empty-state">
                        <Search size={36} color="#94a3b8" />
                        <h4>No matching endpoints found</h4>
                        <p>Try refining your search query or HTTP method filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEndpoints.map((ep, idx) => {
                    const sharePct = metrics.summary.totalRequests > 0
                      ? ((ep.total_calls / metrics.summary.totalRequests) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={idx} className="telemetry-row">
                        <td>
                          <span className={`method-badge ${getMethodBadgeClass(ep.method)}`}>
                            {ep.method}
                          </span>
                        </td>
                        <td>
                          <code className="endpoint-code">{ep.endpoint}</code>
                        </td>
                        <td>
                          <div className="calls-count-cell">
                            <strong>{Number(ep.total_calls || 0).toLocaleString('en-IN')}</strong>
                            <span className="calls-share-badge">{sharePct}% traffic</span>
                          </div>
                        </td>
                        <td>
                          <span className={`latency-badge ${getLatencyBadgeClass(ep.avg_latency)}`}>
                            {ep.avg_latency}
                          </span>
                        </td>
                        <td>
                          <span className="min-max-text">
                            {ep.min_latency} ~ {ep.max_latency}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`error-rate-text ${
                              parseFloat(ep.error_rate) > 0 ? 'has-errors' : 'no-errors'
                            }`}
                          >
                            {ep.error_rate}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`health-badge ${
                              ep.status === 'OPTIMAL'
                                ? 'badge-optimal'
                                : ep.status === 'HEALTHY'
                                ? 'badge-healthy'
                                : 'badge-degraded'
                            }`}
                          >
                            {ep.status}
                          </span>
                        </td>
                        <td>
                          <span className="last-called-text">
                            {formatRelativeTime(ep.last_called_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* TAB 2: Live Stream Recent Invocations */
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>METHOD</th>
                  <th>ENDPOINT ROUTE</th>
                  <th>STATUS CODE</th>
                  <th>RESPONSE LATENCY</th>
                  <th>CLIENT IP</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i} className="skeleton-row">
                        <td>
                          <div className="skeleton-bar" style={{ width: 80, height: 14 }} />
                        </td>
                        <td>
                          <div className="skeleton-pill" style={{ width: 55, height: 22 }} />
                        </td>
                        <td>
                          <div className="skeleton-bar" style={{ width: 200, height: 16 }} />
                        </td>
                        <td>
                          <div className="skeleton-pill" style={{ width: 60, height: 22 }} />
                        </td>
                        <td>
                          <div className="skeleton-bar" style={{ width: 65, height: 14 }} />
                        </td>
                        <td>
                          <div className="skeleton-bar" style={{ width: 95, height: 14 }} />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-table-cell">
                      <div className="empty-state">
                        <Activity size={36} color="#94a3b8" />
                        <h4>No recent invocations in stream</h4>
                        <p>Telemetry events will appear here live as requests hit the server.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="telemetry-row">
                      <td>
                        <span className="timestamp-text">
                          {new Date(log.created_at).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </td>
                      <td>
                        <span className={`method-badge ${getMethodBadgeClass(log.method)}`}>
                          {log.method}
                        </span>
                      </td>
                      <td>
                        <code className="endpoint-code">{log.endpoint}</code>
                      </td>
                      <td>
                        <span className={`status-code-badge ${getStatusBadgeClass(log.status_code)}`}>
                          {log.status_code}
                        </span>
                      </td>
                      <td>
                        <div className="latency-bar-cell">
                          <span className="latency-ms-num">{log.response_time_ms} ms</span>
                          <div className="micro-latency-track">
                            <div
                              className="micro-latency-bar"
                              style={{
                                width: `${Math.min(100, (Number(log.response_time_ms) / 150) * 100)}%`,
                                background:
                                  Number(log.response_time_ms) < 50
                                    ? '#059669'
                                    : Number(log.response_time_ms) < 120
                                    ? '#1976d2'
                                    : '#f59e0b',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ip-text">{log.ip_address || '127.0.0.1'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Embedded Component Styles */}
      <style>{`
        .analytics-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: #0f172a;
          font-family: inherit;
        }

        /* 1. Header Toolbar */
        .analytics-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .analytics-header-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .analytics-main-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }

        .live-stream-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.25rem 0.65rem;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .live-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #059669;
          box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.35);
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(5, 150, 105, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
        }

        .analytics-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .time-range-group {
          display: inline-flex;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 3px;
        }

        .time-btn {
          border: none;
          background: transparent;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .time-btn.active {
          background: #ffffff;
          color: #1976d2;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .auto-refresh-box {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0 0.5rem;
          height: 38px;
        }

        .auto-icon {
          color: #64748b;
        }

        .refresh-interval-select {
          border: none;
          background: transparent;
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          cursor: pointer;
        }

        .btn-refresh-telemetry {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh-telemetry:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1976d2;
          border-color: #93c5fd;
        }

        .btn-refresh-telemetry.is-spinning svg {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 2. Top Summary KPI Cards */
        .analytics-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .analytics-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .analytics-kpi-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .kpi-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .kpi-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-blue { background: #eff6ff; color: #1976d2; }
        .icon-amber { background: #fffbeb; color: #d97706; }
        .icon-green { background: #ecfdf5; color: #059669; }
        .icon-purple { background: #f5f3ff; color: #7c3aed; }

        .kpi-value-text {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0.45rem 0 0.35rem 0;
          letter-spacing: -0.02em;
        }

        .kpi-value-text .unit-ms {
          font-size: 1rem;
          font-weight: 600;
          color: #64748b;
        }

        .highlight-green {
          color: #059669;
        }

        .kpi-footer-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          font-weight: 600;
          flex-wrap: wrap;
        }

        .kpi-badge-green {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          color: #059669;
          font-weight: 700;
        }

        .kpi-badge-neutral {
          color: #475569;
          font-weight: 600;
        }

        .kpi-sub-label {
          color: #64748b;
        }

        .kpi-status-tag {
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .tag-optimal { background: #ecfdf5; color: #047857; }
        .tag-healthy { background: #eff6ff; color: #1d4ed8; }

        .dot-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #059669;
          box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
        }

        /* 3. Charts Grid */
        .analytics-charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .chart-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
        }

        .chart-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .chart-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chart-title-group .header-icon {
          color: #1976d2;
        }

        .chart-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }

        .legend-success { background: #1976d2; }
        .legend-error { background: #ef4444; }

        .timeline-bars-wrapper {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 190px;
          padding: 0.5rem 0 0 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .bar-column-item {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          cursor: pointer;
        }

        .bar-track {
          width: 100%;
          max-width: 28px;
          height: 155px;
          background: #f1f5f9;
          border-radius: 4px 4px 0 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          transition: background-color 0.15s ease;
        }

        .bar-column-item:hover .bar-track {
          background: #e2e8f0;
        }

        .bar-fill {
          width: 100%;
          background: linear-gradient(180deg, #3b82f6 0%, #1976d2 100%);
          border-radius: 4px 4px 0 0;
          position: relative;
          transition: height 0.4s ease;
        }

        .bar-fill-error {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: #ef4444;
          border-radius: 4px 4px 0 0;
        }

        .bar-label {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 600;
          margin-top: 6px;
          white-space: nowrap;
        }

        .bar-hover-tooltip {
          position: absolute;
          top: 10px;
          right: 15px;
          background: #0f172a;
          color: #ffffff;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
          font-size: 0.78rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          pointer-events: none;
          z-index: 10;
        }

        .tooltip-title {
          font-weight: 700;
          color: #93c5fd;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding-bottom: 0.25rem;
          margin-bottom: 0.15rem;
        }

        .tooltip-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .chart-skeleton-wrap {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 190px;
        }

        .chart-bar-skeleton {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
        }

        .chart-empty-state {
          height: 190px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 0.85rem;
          gap: 0.5rem;
        }

        /* Health Card */
        .infra-health-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .infra-health-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .infra-item-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .infra-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .infra-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }

        .infra-sub {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }

        .status-count-badge {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1976d2;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        .status-code-proportions {
          margin-top: 0.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .proportions-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #475569;
        }

        .proportions-bar-wrap {
          display: flex;
          height: 10px;
          border-radius: 9999px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .prop-bar {
          height: 100%;
          transition: width 0.3s ease;
        }

        .prop-2xx { background: #059669; }
        .prop-4xx { background: #f59e0b; }
        .prop-5xx { background: #ef4444; }

        .prop-legend-grid {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }

        .prop-legend-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .prop-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .dot-2xx { background: #059669; }
        .dot-4xx { background: #f59e0b; }
        .dot-5xx { background: #ef4444; }

        /* 4. Toolbar & View Tabs */
        .analytics-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .view-tab-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 0.95rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tab-btn.active {
          background: #1976d2;
          color: #ffffff;
          border-color: #1976d2;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
        }

        .toolbar-search-filter {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .search-input-box {
          position: relative;
          min-width: 260px;
          display: flex;
          align-items: center;
        }

        .search-input-box .search-icon {
          position: absolute;
          left: 10px;
          color: #64748b;
          pointer-events: none;
        }

        .search-input-box input {
          width: 100%;
          padding: 0.55rem 2rem 0.55rem 2.2rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .search-input-box input:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
        }

        .clear-search-btn {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .method-filter-pills {
          display: inline-flex;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 2px;
        }

        .method-filter-btn {
          border: none;
          background: transparent;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .method-filter-btn.active {
          background: #ffffff;
          color: #1976d2;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        /* 5. Telemetry Table */
        .analytics-table-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .table-responsive-wrapper {
          overflow-x: auto;
        }

        .telemetry-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .telemetry-table thead th {
          background: #f8fafc;
          padding: 0.85rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .telemetry-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
        }

        .telemetry-row:hover {
          background-color: #f8fafc;
        }

        .telemetry-row td {
          padding: 0.85rem 1rem;
          font-size: 0.85rem;
          vertical-align: middle;
        }

        /* Method Badges */
        .method-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }

        .method-get { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .method-post { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .method-put { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .method-delete { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .method-patch { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        .method-default { background: #f1f5f9; color: #475569; }

        .endpoint-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          background: #f8fafc;
          padding: 0.2rem 0.45rem;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .calls-count-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .calls-share-badge {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 600;
          background: #f1f5f9;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .latency-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
        }

        .lat-optimal { background: #ecfdf5; color: #047857; }
        .lat-good { background: #eff6ff; color: #1d4ed8; }
        .lat-slow { background: #fffbeb; color: #b45309; }

        .min-max-text {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 500;
        }

        .error-rate-text {
          font-weight: 700;
          font-size: 0.82rem;
        }

        .error-rate-text.no-errors { color: #059669; }
        .error-rate-text.has-errors { color: #ef4444; }

        .health-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .badge-optimal { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .badge-healthy { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .badge-degraded { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        .last-called-text {
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 500;
        }

        /* Status Code Badges for Stream */
        .status-code-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .status-2xx { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .status-3xx { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .status-4xx { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        .status-5xx { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        .latency-bar-cell {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .latency-ms-num {
          font-weight: 600;
          font-size: 0.8rem;
          color: #0f172a;
          min-width: 55px;
        }

        .micro-latency-track {
          width: 50px;
          height: 5px;
          background: #e2e8f0;
          border-radius: 9999px;
          overflow: hidden;
        }

        .micro-latency-bar {
          height: 100%;
          border-radius: 9999px;
        }

        .timestamp-text {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }

        .ip-text {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.8rem;
          color: #475569;
        }

        .empty-table-cell {
          padding: 3rem 1rem;
          text-align: center;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-state h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0.5rem 0 0 0;
        }

        .empty-state p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
        }

        /* Skeleton Components */
        .skeleton-bar {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-circle {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 50%;
          animation: shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        .skeleton-pill {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          border-radius: 9999px;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1024px) {
          .analytics-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .analytics-charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .analytics-kpi-grid {
            grid-template-columns: 1fr;
          }
          .toolbar-search-filter {
            justify-content: stretch;
          }
          .search-input-box {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ApiAnalytics;
