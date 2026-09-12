import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Shield,
  Bell,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  RotateCw,
  Download,
  AlertTriangle,
  UserCheck,
  Smartphone,
  Radio,
  FileText,
  Activity,
  Layers,
  Trash2,
  Filter,
  Check,
  Copy,
  Plus,
  ArrowRight,
  Info,
  Server,
  Lock,
  Globe,
  Tag,
  Users,
} from 'lucide-react';

export const AuditLogsBroadcast = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'broadcast'
  const [auditLogs, setAuditLogs] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL'); // 'ALL' | 'AUTH' | 'LOAN' | 'PAYMENT' | 'GOVERNANCE'
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Broadcast modal & form
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [deletingBroadcast, setDeletingBroadcast] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  const [broadcastAudienceFilter, setBroadcastAudienceFilter] = useState('ALL');

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    audience: 'ALL_USERS',
    priority: 'NORMAL',
    channels: ['PUSH', 'BANNER'],
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, bcastRes] = await Promise.all([
        api.governance.getAuditLogs({ search: auditSearch }),
        api.governance.getBroadcasts(),
      ]);

      const logList = Array.isArray(logsRes) ? logsRes : (logsRes?.data || []);
      const bcastList = Array.isArray(bcastRes) ? bcastRes : (bcastRes?.data || []);

      setAuditLogs(logList);
      setBroadcasts(bcastList);
    } catch (err) {
      console.error('Failed to load audit logs/broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auditSearch]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const search = auditSearch.toLowerCase();
      const matchesSearch =
        !search ||
        (log.user_name || '').toLowerCase().includes(search) ||
        (log.user_email || '').toLowerCase().includes(search) ||
        (log.action || '').toLowerCase().includes(search) ||
        (log.entity_type || '').toLowerCase().includes(search) ||
        (log.ip_address || '').toLowerCase().includes(search) ||
        (log.reason || '').toLowerCase().includes(search);

      if (!matchesSearch) return false;

      if (actionFilter === 'AUTH') return log.action?.includes('LOGIN') || log.action?.includes('AUTH') || log.entity_type === 'AUTHENTICATION';
      if (actionFilter === 'LOAN') return log.action?.includes('LOAN') || log.entity_type === 'LOAN';
      if (actionFilter === 'PAYMENT') return log.action?.includes('PAYMENT') || log.action?.includes('COLLECT') || log.entity_type === 'COLLECTION';
      if (actionFilter === 'GOVERNANCE') return log.action?.includes('POLICY') || log.action?.includes('CATEGORY') || log.action?.includes('ORG') || log.action?.includes('ROLE');

      return true;
    });
  }, [auditLogs, auditSearch, actionFilter]);

  // Filtered broadcasts
  const filteredBroadcasts = useMemo(() => {
    if (broadcastAudienceFilter === 'ALL') return broadcasts;
    return broadcasts.filter((b) => b.audience === broadcastAudienceFilter);
  }, [broadcasts, broadcastAudienceFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalLogs = auditLogs.length;
    const authCount = auditLogs.filter((l) => l.action?.includes('LOGIN') || l.action?.includes('AUTH') || l.entity_type === 'AUTHENTICATION').length;
    const financialCount = auditLogs.filter((l) => l.action?.includes('LOAN') || l.action?.includes('PAYMENT') || l.action?.includes('COLLECT')).length;
    const totalBroadcasts = broadcasts.length;
    return { totalLogs, authCount, financialCount, totalBroadcasts };
  }, [auditLogs, broadcasts]);

  // Send Broadcast handler
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      alert('Please fill out both title and broadcast message.');
      return;
    }

    setSubmittingBroadcast(true);
    try {
      const channelStr = broadcastForm.channels.join('_AND_');
      await api.governance.createBroadcast({
        title: broadcastForm.title.trim(),
        message: broadcastForm.message.trim(),
        audience: broadcastForm.audience,
        priority: broadcastForm.priority,
        channels: channelStr || 'PUSH_AND_BANNER',
        author_name: 'Super Admin',
      });

      await fetchData();
      setIsBroadcastModalOpen(false);
      showToast('System broadcast successfully dispatched to all target devices & portals!');
      setBroadcastForm({
        title: '',
        message: '',
        audience: 'ALL_USERS',
        priority: 'NORMAL',
        channels: ['PUSH', 'BANNER'],
      });
    } catch (err) {
      alert(err.message || 'Failed to dispatch broadcast.');
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  // Delete Broadcast handler
  const handleDeleteBroadcast = async () => {
    if (!deletingBroadcast) return;
    try {
      await api.governance.deleteBroadcast(deletingBroadcast.id);
      await fetchData();
      showToast('Broadcast notice archived & removed.');
      setDeletingBroadcast(null);
    } catch (err) {
      alert(err.message || 'Failed to delete broadcast.');
    }
  };

  // Export audit logs as CSV
  const handleExportCSV = () => {
    if (filteredAuditLogs.length === 0) {
      alert('No audit logs available to export.');
      return;
    }
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor Email', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Status', 'Reason'];
    const rows = filteredAuditLogs.map((l) => [
      l.id,
      l.created_at ? new Date(l.created_at).toISOString() : '',
      `"${(l.user_name || 'System').replace(/"/g, '""')}"`,
      `"${(l.user_email || '').replace(/"/g, '""')}"`,
      l.action,
      l.entity_type,
      l.entity_id || '',
      l.ip_address || '127.0.0.1',
      l.status || 'SUCCESS',
      `"${(l.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinanceFlow_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit trail exported successfully as CSV.');
  };

  // Copy structured payload
  const handleCopyPayload = (log) => {
    const payload = JSON.stringify(
      {
        logId: log.id,
        timestamp: log.created_at,
        actor: { name: log.user_name, email: log.user_email },
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        ipAddress: log.ip_address,
        status: log.status,
        description: log.reason,
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="audit-page-container">
      {/* Header */}
      <div className="audit-header-row">
        <div className="audit-header-left">
          <div className="header-title-wrap">
            <h1 className="audit-main-title">Audit Trail & System Broadcasts</h1>
            <span className="audit-count-badge">
              {loading ? (
                <span className="skeleton-pill" style={{ width: 45, height: 20 }} />
              ) : activeTab === 'audit' ? (
                `${filteredAuditLogs.length} Events`
              ) : (
                `${broadcasts.length} Broadcasts`
              )}
            </span>
          </div>
        </div>

        <div className="audit-header-actions">
          <button
            type="button"
            className={`btn-refresh-data ${isRefreshing || loading ? 'refreshing' : ''}`}
            onClick={handleManualRefresh}
            title="Refresh Live Data"
            disabled={loading || isRefreshing}
          >
            <RotateCw size={16} />
          </button>

          {activeTab === 'audit' ? (
            <button
              type="button"
              className="btn-export-csv"
              onClick={handleExportCSV}
              disabled={loading || filteredAuditLogs.length === 0}
            >
              <Download size={16} />
              <span>Export Audit CSV</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-create-broadcast"
              onClick={() => setIsBroadcastModalOpen(true)}
            >
              <Send size={16} />
              <span>Send Broadcast Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="audit-feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 4-Column KPI Summary Strip */}
      <div className="audit-kpi-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="audit-kpi-card skeleton-card">
                <div className="audit-kpi-top">
                  <div className="skeleton-bar" style={{ width: '45%', height: 14 }} />
                  <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
                </div>
                <div className="skeleton-bar" style={{ width: '60%', height: 28, margin: '10px 0' }} />
                <div className="skeleton-bar" style={{ width: '75%', height: 12 }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="audit-kpi-card">
              <div className="audit-kpi-top">
                <span className="audit-kpi-label">Total Audit Events</span>
                <div className="audit-kpi-icon icon-blue">
                  <Shield size={20} />
                </div>
              </div>
              <div className="audit-kpi-value">{stats.totalLogs}</div>
              <div className="audit-kpi-footer">
                <span className="dot-green" />
                <span>Immutable Cryptographic Ledger</span>
              </div>
            </div>

            <div className="audit-kpi-card">
              <div className="audit-kpi-top">
                <span className="audit-kpi-label">Security & Auth Logs</span>
                <div className="audit-kpi-icon icon-purple">
                  <Lock size={20} />
                </div>
              </div>
              <div className="audit-kpi-value">{stats.authCount}</div>
              <div className="audit-kpi-footer">
                <span>Logins & Credential Changes</span>
              </div>
            </div>

            <div className="audit-kpi-card">
              <div className="audit-kpi-top">
                <span className="audit-kpi-label">Financial Operations</span>
                <div className="audit-kpi-icon icon-emerald">
                  <Activity size={20} />
                </div>
              </div>
              <div className="audit-kpi-value">{stats.financialCount}</div>
              <div className="audit-kpi-footer">
                <span>Disbursements & Repayments</span>
              </div>
            </div>

            <div className="audit-kpi-card">
              <div className="audit-kpi-top">
                <span className="audit-kpi-label">System Broadcasts</span>
                <div className="audit-kpi-icon icon-amber">
                  <Bell size={20} />
                </div>
              </div>
              <div className="audit-kpi-value">{stats.totalBroadcasts}</div>
              <div className="audit-kpi-footer">
                <span>Active Network Alerts</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Main Navigation Tabs */}
      <div className="audit-tab-switcher">
        <button
          type="button"
          className={`tab-switch-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <Shield size={16} />
          <span>Immutable Audit Trail ({auditLogs.length})</span>
        </button>
        <button
          type="button"
          className={`tab-switch-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcast')}
        >
          <Bell size={16} />
          <span>System Broadcast Alerts ({broadcasts.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: IMMUTABLE AUDIT TRAIL                             */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <>
          {/* Filter and Search Row */}
          <div className="audit-filter-row">
            <div className="filter-pills-group">
              {[
                { id: 'ALL', label: 'All Events' },
                { id: 'AUTH', label: 'Authentication & Logins' },
                { id: 'LOAN', label: 'Disbursements & Loans' },
                { id: 'PAYMENT', label: 'Collections & Payments' },
                { id: 'GOVERNANCE', label: 'Policies & Roles' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  className={`pill-filter-btn ${actionFilter === pill.id ? 'active' : ''}`}
                  onClick={() => setActionFilter(pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="audit-search-box">
              <Search size={15} className="audit-search-icon" />
              <input
                type="text"
                className="audit-search-input"
                placeholder="Search action, actor, entity, or IP..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
              {auditSearch && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setAuditSearch('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="audit-table-card">
            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>ACTOR / USER</th>
                    <th>ACTION EXECUTED</th>
                    <th>ENTITY TARGET</th>
                    <th>IP ADDRESS</th>
                    <th>STATUS</th>
                    <th>EVENT SUMMARY</th>
                    <th className="th-actions">INSPECT</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                          <span className="skeleton-bar" style={{ width: 220, height: 16 }} />
                          <span className="skeleton-bar" style={{ width: 140, height: 12 }} />
                        </div>
                      </td>
                    </tr>
                  ) : filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        <div className="empty-state-wrap">
                          <Shield size={38} color="#94a3b8" />
                          <h4>No Audit Records Found</h4>
                          <p>Try adjusting your search criteria or switch category filter tabs.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const isAuth = log.action?.includes('LOGIN') || log.action?.includes('AUTH');
                      const isLoan = log.action?.includes('LOAN') || log.action?.includes('DISBURS');
                      const isPayment = log.action?.includes('PAYMENT') || log.action?.includes('COLLECT');
                      const isPolicy = log.action?.includes('POLICY') || log.action?.includes('CATEGORY') || log.action?.includes('ORG');

                      const actionBadgeClass = isAuth
                        ? 'badge-blue'
                        : isLoan
                        ? 'badge-purple'
                        : isPayment
                        ? 'badge-emerald'
                        : isPolicy
                        ? 'badge-indigo'
                        : 'badge-gray';

                      return (
                        <tr key={log.id} className="audit-row">
                          <td>
                            <div className="timestamp-cell">
                              <Clock size={13} className="time-icon" />
                              <span>
                                {log.created_at
                                  ? new Date(log.created_at).toLocaleString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })
                                  : 'Just now'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="actor-cell">
                              <strong className="actor-name">{log.user_name || 'System Engine'}</strong>
                              <span className="actor-email">{log.user_email || 'internal@fundlending.com'}</span>
                            </div>
                          </td>

                          <td>
                            <span className={`action-pill ${actionBadgeClass}`}>{log.action}</span>
                          </td>

                          <td>
                            <code className="entity-code">{log.entity_type}</code>
                          </td>

                          <td>
                            <span className="ip-text">{log.ip_address || '127.0.0.1'}</span>
                          </td>

                          <td>
                            <span className="status-pill status-success">
                              <span className="status-indicator-dot" />
                              {log.status || 'SUCCESS'}
                            </span>
                          </td>

                          <td className="details-cell">
                            <span className="details-text" title={log.reason}>
                              {log.reason || `Executed ${log.action} on ${log.entity_type}`}
                            </span>
                          </td>

                          <td className="td-actions">
                            <button
                              type="button"
                              className="btn-inspect-log"
                              title="Inspect Full Audit Payload"
                              onClick={() => setSelectedAuditLog(log)}
                            >
                              <Eye size={14} />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SYSTEM BROADCASTS                                 */}
      {/* ======================================================== */}
      {activeTab === 'broadcast' && (
        <>
          <div className="audit-filter-row">
            <div className="filter-pills-group">
              {[
                { id: 'ALL', label: 'All Audiences' },
                { id: 'ALL_USERS', label: 'Entire Network' },
                { id: 'ALL_FIELD_AGENTS', label: 'Field Collectors' },
                { id: 'BRANCH_ADMINS', label: 'Branch Admins' },
                { id: 'BORROWERS', label: 'Borrowers' },
              ].map((p) => (
                <button
                  key={p.id}
                  className={`pill-filter-btn ${broadcastAudienceFilter === p.id ? 'active' : ''}`}
                  onClick={() => setBroadcastAudienceFilter(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-create-broadcast"
              onClick={() => setIsBroadcastModalOpen(true)}
            >
              <Plus size={16} />
              <span>Compose Broadcast</span>
            </button>
          </div>

          {loading ? (
            <div className="broadcast-grid">
              {[1, 2].map((i) => (
                <div key={i} className="broadcast-card skeleton-card">
                  <div className="skeleton-bar" style={{ width: '60%', height: 20, marginBottom: 10 }} />
                  <div className="skeleton-bar" style={{ width: '90%', height: 14, marginBottom: 6 }} />
                  <div className="skeleton-bar" style={{ width: '80%', height: 14, marginBottom: 14 }} />
                  <div className="skeleton-bar" style={{ width: '100%', height: 35, borderRadius: 6 }} />
                </div>
              ))}
            </div>
          ) : filteredBroadcasts.length === 0 ? (
            <div className="empty-state-wrap">
              <Bell size={42} color="#94a3b8" />
              <h4>No Broadcast Notifications</h4>
              <p>Compose an urgent bulletin or route update for field agents and branch admins.</p>
              <button
                type="button"
                className="btn-create-broadcast"
                style={{ marginTop: '0.85rem' }}
                onClick={() => setIsBroadcastModalOpen(true)}
              >
                <Plus size={16} /> Compose Broadcast
              </button>
            </div>
          ) : (
            <div className="broadcast-grid">
              {filteredBroadcasts.map((bc) => {
                const isCritical = bc.priority === 'CRITICAL';
                const isImportant = bc.priority === 'IMPORTANT';

                const priorityColor = isCritical ? '#ef4444' : isImportant ? '#f59e0b' : '#1976d2';

                return (
                  <div key={bc.id} className="broadcast-card">
                    <div className="broadcast-card-top">
                      <div className="broadcast-title-group">
                        <div
                          className="broadcast-icon-box"
                          style={{ background: `${priorityColor}14`, color: priorityColor }}
                        >
                          <Radio size={18} />
                        </div>
                        <div>
                          <h3 className="broadcast-title">{bc.title}</h3>
                          <div className="broadcast-meta-strip">
                            <span
                              className="priority-tag"
                              style={{ background: `${priorityColor}15`, color: priorityColor }}
                            >
                              {bc.priority || 'NORMAL'}
                            </span>
                            <span className="audience-tag">{bc.audience || 'ALL_USERS'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-delete-bc"
                        title="Delete Broadcast"
                        onClick={() => setDeletingBroadcast(bc)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="broadcast-message-text">{bc.message}</p>

                    <div className="broadcast-channels-row">
                      <span className="channels-label">Dispatched via:</span>
                      <span className="channel-pill">
                        <Smartphone size={12} />
                        Push Notification
                      </span>
                      <span className="channel-pill">
                        <Globe size={12} />
                        Portal Banner
                      </span>
                    </div>

                    <div className="broadcast-footer">
                      <div className="footer-left-stat">
                        <Users size={14} color="#64748b" />
                        <span>
                          Estimated Audience: <strong>{bc.reach_count || 248} endpoints</strong>
                        </span>
                      </div>
                      <span className="broadcast-date-text">
                        {bc.created_at
                          ? new Date(bc.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: INSPECT AUDIT LOG DETAIL                        */}
      {/* ======================================================== */}
      {selectedAuditLog && (
        <Modal
          isOpen={!!selectedAuditLog}
          onClose={() => setSelectedAuditLog(null)}
          title={`Audit Event Inspection: #${selectedAuditLog.id} (${selectedAuditLog.action})`}
        >
          <div className="inspect-modal-content">
            <div className="inspect-grid">
              <div className="inspect-item">
                <span className="inspect-label">Event Timestamp</span>
                <strong className="inspect-val">
                  {selectedAuditLog.created_at ? new Date(selectedAuditLog.created_at).toLocaleString() : 'Just now'}
                </strong>
              </div>

              <div className="inspect-item">
                <span className="inspect-label">Action Signature</span>
                <strong className="inspect-val highlight-action">{selectedAuditLog.action}</strong>
              </div>

              <div className="inspect-item">
                <span className="inspect-label">Actor / Account</span>
                <strong className="inspect-val">
                  {selectedAuditLog.user_name || 'System'} ({selectedAuditLog.user_email || 'internal@fundlending.com'})
                </strong>
              </div>

              <div className="inspect-item">
                <span className="inspect-label">Client IP Address</span>
                <strong className="inspect-val">{selectedAuditLog.ip_address || '127.0.0.1'}</strong>
              </div>

              <div className="inspect-item">
                <span className="inspect-label">Target Entity</span>
                <strong className="inspect-val">
                  {selectedAuditLog.entity_type} {selectedAuditLog.entity_id ? `(${selectedAuditLog.entity_id})` : ''}
                </strong>
              </div>

              <div className="inspect-item">
                <span className="inspect-label">Ledger Status</span>
                <span className="status-pill status-success" style={{ width: 'fit-content' }}>
                  <span className="status-indicator-dot" />
                  {selectedAuditLog.status || 'SUCCESS'}
                </span>
              </div>
            </div>

            <div className="inspect-reason-box">
              <span className="inspect-label">Event Description & Summary:</span>
              <p className="inspect-reason-text">
                {selectedAuditLog.reason || `Action ${selectedAuditLog.action} recorded on ${selectedAuditLog.entity_type}.`}
              </p>
            </div>

            {/* Cryptographic Ledger JSON Payload */}
            <div className="payload-box">
              <div className="payload-header">
                <span className="payload-title">Structured Event Payload (JSON)</span>
                <button
                  type="button"
                  className="btn-copy-payload"
                  onClick={() => handleCopyPayload(selectedAuditLog)}
                >
                  {copiedPayload ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copiedPayload ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="payload-code">
                {JSON.stringify(
                  {
                    logId: selectedAuditLog.id,
                    timestamp: selectedAuditLog.created_at,
                    actor: {
                      name: selectedAuditLog.user_name || 'System',
                      email: selectedAuditLog.user_email || 'internal@fundlending.com',
                    },
                    action: selectedAuditLog.action,
                    entity: {
                      type: selectedAuditLog.entity_type,
                      id: selectedAuditLog.entity_id,
                    },
                    network: {
                      ip: selectedAuditLog.ip_address || '127.0.0.1',
                    },
                    status: selectedAuditLog.status || 'SUCCESS',
                    summary: selectedAuditLog.reason,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedAuditLog(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: COMPOSE SYSTEM BROADCAST                        */}
      {/* ======================================================== */}
      {isBroadcastModalOpen && (
        <Modal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          title="Compose Platform Broadcast Alert"
        >
          <form onSubmit={handleSendBroadcast} className="broadcast-modal-form">
            <div className="modal-form-group">
              <label className="modal-form-label">
                <Tag size={14} />
                <span>Broadcast Alert Title *</span>
              </label>
              <input
                type="text"
                className="modal-form-input"
                placeholder="e.g. Festival Holiday Route Shift / Maintenance Notice"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                required
              />
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <Users size={14} />
                  <span>Target Audience</span>
                </label>
                <select
                  className="modal-form-select"
                  value={broadcastForm.audience}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, audience: e.target.value })}
                >
                  <option value="ALL_USERS">Entire Platform (All Users & Borrowers)</option>
                  <option value="ALL_FIELD_AGENTS">Field Route Collectors Only</option>
                  <option value="BRANCH_ADMINS">Branch Operations Admins Only</option>
                  <option value="BORROWERS">Registered Borrowers Only</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  <AlertTriangle size={14} />
                  <span>Urgency Priority</span>
                </label>
                <select
                  className="modal-form-select"
                  value={broadcastForm.priority}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                >
                  <option value="NORMAL">NORMAL (Routine Notice)</option>
                  <option value="IMPORTANT">IMPORTANT (Route or Schedule Change)</option>
                  <option value="CRITICAL">CRITICAL (Urgent Compliance Mandate)</option>
                </select>
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                <FileText size={14} />
                <span>Broadcast Notification Content *</span>
              </label>
              <textarea
                className="modal-form-textarea"
                rows={4}
                placeholder="Type the announcement message to broadcast across mobile devices & web dashboard..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                required
              />
            </div>

            {/* Simulation Preview */}
            {broadcastForm.title && (
              <div className="broadcast-preview-box">
                <div className="preview-top">
                  <Radio size={15} color="#1976d2" />
                  <strong>Live Push Preview:</strong>
                </div>
                <div className="preview-card">
                  <strong className="preview-title">{broadcastForm.title}</strong>
                  <p className="preview-msg">{broadcastForm.message || 'Notification text will appear here...'}</p>
                  <span className="preview-audience">Target: {broadcastForm.audience}</span>
                </div>
              </div>
            )}

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsBroadcastModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingBroadcast}
                className="btn-modal-submit"
              >
                <Send size={15} />
                <span>{submittingBroadcast ? 'Publishing...' : 'Dispatch Broadcast'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE BROADCAST CONFIRMATION                   */}
      {/* ======================================================== */}
      {deletingBroadcast && (
        <Modal
          isOpen={!!deletingBroadcast}
          onClose={() => setDeletingBroadcast(null)}
          title="Delete Broadcast Notification"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Are you sure you want to delete broadcast alert{' '}
              <strong style={{ color: '#ef4444' }}>"{deletingBroadcast.title}"</strong>?
            </p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.45 }}>
              This will remove the bulletin from borrower and field agent mobile feeds.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeletingBroadcast(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleDeleteBroadcast}
              >
                Delete Notice
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Embedded Component Styles Matching Organization.jsx */}
      <style>{`
        .audit-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          color: #0f172a;
          font-family: inherit;
        }

        .audit-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .header-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .audit-main-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }

        .audit-count-badge {
          display: inline-flex;
          align-items: center;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1976d2;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
        }

        .audit-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-refresh-data {
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

        .btn-refresh-data:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1976d2;
          border-color: #93c5fd;
        }

        .btn-refresh-data.refreshing svg {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .btn-export-csv {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          padding: 0.6rem 1.15rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-export-csv:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .btn-create-broadcast {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #1976d2;
          color: #ffffff;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
          transition: all 0.2s ease;
        }

        .btn-create-broadcast:hover {
          background: #1565c0;
          transform: translateY(-1px);
        }

        .audit-feedback-banner {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 0.85rem;
          font-weight: 600;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 4-Column KPI Grid */
        .audit-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .audit-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .audit-kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .audit-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.15rem 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .audit-kpi-card:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
          transform: translateY(-2px);
        }

        .audit-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .audit-kpi-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.03em;
        }

        .audit-kpi-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-blue { background: #eff6ff; color: #1976d2; }
        .icon-purple { background: #f5f3ff; color: #7c3aed; }
        .icon-emerald { background: #ecfdf5; color: #059669; }
        .icon-amber { background: #fffbeb; color: #d97706; }

        .audit-kpi-value {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0.35rem 0 0.25rem 0;
          letter-spacing: -0.02em;
        }

        .audit-kpi-footer {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: #64748b;
        }

        .dot-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #059669;
        }

        /* Tab Switcher */
        .audit-tab-switcher {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 2px;
          margin-bottom: 0.5rem;
        }

        .tab-switch-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #64748b;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-switch-btn:hover {
          color: #0f172a;
        }

        .tab-switch-btn.active {
          color: #1976d2;
          border-bottom-color: #1976d2;
        }

        /* Filter Row */
        .audit-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .filter-pills-group {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .pill-filter-btn {
          padding: 0.4rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .pill-filter-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .pill-filter-btn.active {
          background: #1976d2;
          color: #ffffff;
          border-color: #1976d2;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
        }

        .audit-search-box {
          position: relative;
          width: 280px;
        }

        .audit-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .audit-search-input {
          width: 100%;
          padding: 0.45rem 1.8rem 0.45rem 2rem;
          font-size: 0.82rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
          outline: none;
        }

        .audit-search-input:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
        }

        .clear-search-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
        }

        /* Table */
        .audit-table-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          margin-bottom: 2rem;
        }

        .audit-table-wrapper {
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .audit-table thead {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .audit-table th {
          padding: 0.85rem 1rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: left;
        }

        .audit-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #0f172a;
        }

        .timestamp-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: #475569;
          white-space: nowrap;
        }

        .time-icon {
          color: #94a3b8;
        }

        .actor-cell {
          display: flex;
          flex-direction: column;
        }

        .actor-name {
          font-size: 0.86rem;
          color: #0f172a;
        }

        .actor-email {
          font-size: 0.72rem;
          color: #64748b;
        }

        .action-pill {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .badge-blue { background: #eff6ff; color: #1976d2; }
        .badge-purple { background: #f5f3ff; color: #7c3aed; }
        .badge-emerald { background: #ecfdf5; color: #059669; }
        .badge-indigo { background: #eef2ff; color: #4338ca; }
        .badge-gray { background: #f1f5f9; color: #475569; }

        .entity-code {
          font-family: monospace;
          font-size: 0.75rem;
          background: #f1f5f9;
          color: #334155;
          padding: 2px 5px;
          border-radius: 4px;
        }

        .ip-text {
          font-size: 0.78rem;
          color: #64748b;
          font-family: monospace;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .status-success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .status-indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
        }

        .details-cell {
          max-width: 260px;
        }

        .details-text {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.8rem;
          color: #475569;
        }

        .th-actions, .td-actions {
          text-align: right;
        }

        .btn-inspect-log {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.32rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-inspect-log:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1976d2;
        }

        /* Broadcasts Grid */
        .broadcast-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 860px) {
          .broadcast-grid {
            grid-template-columns: 1fr;
          }
        }

        .broadcast-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease;
        }

        .broadcast-card:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
          border-color: #cbd5e1;
        }

        .broadcast-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.85rem;
        }

        .broadcast-title-group {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .broadcast-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .broadcast-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
        }

        .broadcast-meta-strip {
          display: flex;
          gap: 0.45rem;
          align-items: center;
        }

        .priority-tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .audience-tag {
          font-size: 0.7rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .btn-delete-bc {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #fee2e2;
          background: #fff5f5;
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-delete-bc:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .broadcast-message-text {
          font-size: 0.86rem;
          color: #334155;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .broadcast-channels-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
        }

        .channels-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .channel-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .broadcast-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .footer-left-stat {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: #475569;
        }

        .broadcast-date-text {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        /* Inspect Modal */
        .inspect-modal-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .inspect-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 1rem;
          border-radius: 10px;
        }

        .inspect-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .inspect-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .inspect-val {
          font-size: 0.85rem;
          color: #0f172a;
        }

        .highlight-action {
          color: #1976d2;
          font-family: monospace;
        }

        .inspect-reason-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.85rem 1rem;
          border-radius: 8px;
        }

        .inspect-reason-text {
          margin: 0.35rem 0 0 0;
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.45;
        }

        .payload-box {
          background: #0f172a;
          color: #f8fafc;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          overflow: hidden;
        }

        .payload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .payload-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .btn-copy-payload {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f8fafc;
          font-size: 0.72rem;
          padding: 2px 7px;
          border-radius: 4px;
          cursor: pointer;
        }

        .payload-code {
          margin: 0;
          font-family: monospace;
          font-size: 0.78rem;
          max-height: 180px;
          overflow-y: auto;
          color: #38bdf8;
        }

        .btn-modal-close {
          padding: 0.55rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
        }

        /* Broadcast Compose Form */
        .broadcast-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .modal-form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .modal-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .modal-form-input, .modal-form-select, .modal-form-textarea {
          padding: 0.55rem 0.85rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          font-family: inherit;
        }

        .modal-form-input:focus, .modal-form-select:focus, .modal-form-textarea:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
        }

        .broadcast-preview-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 0.85rem 1rem;
        }

        .preview-top {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: #1e40af;
          margin-bottom: 0.4rem;
        }

        .preview-card {
          background: #ffffff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          padding: 0.65rem 0.85rem;
        }

        .preview-title {
          display: block;
          font-size: 0.88rem;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .preview-msg {
          font-size: 0.8rem;
          color: #475569;
          margin: 0 0 0.35rem 0;
        }

        .preview-audience {
          font-size: 0.72rem;
          font-weight: 600;
          color: #1976d2;
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .btn-modal-cancel {
          padding: 0.55rem 1.15rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
        }

        .btn-modal-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          background: #1976d2;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(25, 118, 210, 0.25);
        }

        .btn-modal-delete {
          padding: 0.55rem 1.15rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          background: #ef4444;
          color: #ffffff;
          cursor: pointer;
        }

        /* Shimmer Skeletons */
        .skeleton-card {
          position: relative;
          overflow: hidden;
        }

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
          display: inline-block;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .empty-state-wrap {
          padding: 3.5rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-state-wrap h4 {
          font-size: 1.15rem;
          color: #0f172a;
          margin: 0.65rem 0 0.25rem 0;
        }

        .empty-state-wrap p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default AuditLogsBroadcast;
