import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Bell,
  Shield,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const AuditLogsBroadcast = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  const [broadcasts, setBroadcasts] = useState([
    {
      id: 1,
      title: 'Festival Collection Route Schedule Update',
      message: 'Daily collections for holidays will shift to morning 08:00 AM - 12:00 PM route.',
      audience: 'ALL_FIELD_AGENTS',
      priority: 'IMPORTANT',
      sentAt: '2026-09-10 10:00:00',
      author: 'Super Admin Root',
      reachCount: 142,
    },
  ]);

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    audience: 'ALL_USERS',
    priority: 'NORMAL',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.governance.getAuditLogs({ action: auditSearch });
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [auditSearch]);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    const newBc = {
      id: Date.now(),
      title: broadcastForm.title,
      message: broadcastForm.message,
      audience: broadcastForm.audience,
      priority: broadcastForm.priority,
      sentAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      author: 'Super Admin',
      reachCount: 248,
    };
    setBroadcasts([newBc, ...broadcasts]);
    setIsBroadcastModalOpen(false);
    setFeedback('Broadcast notification pushed to all connected mobile devices & portals!');
    setBroadcastForm({ title: '', message: '', audience: 'ALL_USERS', priority: 'NORMAL' });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="audit-logs-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">SECURITY & AUDIT TRAILS</div>
          <h1 className="page-title">Audit Logs & Platform Broadcasts</h1>
          <p className="page-subtitle">
            Permanent, immutable ledger logs of all user actions, disbursements, role changes, and system-wide broadcast alerts.
          </p>
        </div>

        <div className="header-actions">
          {activeTab === 'broadcast' && (
            <button className="btn btn-primary" onClick={() => setIsBroadcastModalOpen(true)}>
              <Send size={16} />
              Send System Broadcast
            </button>
          )}
          <button className="btn btn-secondary" onClick={fetchLogs}>
            <RefreshCw size={16} />
            Refresh Logs
          </button>
        </div>
      </div>

      {feedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-navigation" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'audit' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Shield size={16} />
          Immutable Audit Logs ({auditLogs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcast')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'broadcast' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'broadcast' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Bell size={16} />
          System Broadcasts ({broadcasts.length})
        </button>
      </div>

      {/* TAB 1: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="table-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Live System Audit Trail</h3>
            <div className="search-box" style={{ maxWidth: 320 }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="search-input"
                placeholder="Search action or entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>IP Address</th>
                  <th>Details</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading live audit trail from database...</td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No audit records matched your filter.</td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {log.created_at ? new Date(log.created_at).toISOString().slice(0, 19).replace('T', ' ') : 'Just now'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#fff' }}>{log.user_name || 'System Admin'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user_email || 'internal@fundlending.com'}</div>
                      </td>
                      <td>
                        <span className="badge badge-purple">{log.action}</span>
                      </td>
                      <td><code>{log.entity_type}</code></td>
                      <td><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.ip_address || '127.0.0.1'}</span></td>
                      <td style={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.reason || `Action ${log.action} executed on ${log.entity_type}`}
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }} onClick={() => setSelectedAuditLog(log)}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST NOTIFICATIONS */}
      {activeTab === 'broadcast' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {broadcasts.map((bc) => (
            <div key={bc.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>{bc.title}</h3>
                <span className="badge badge-emerald">{bc.priority}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {bc.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <span>Audience: <strong>{bc.audience}</strong></span>
                <span>Sent: {bc.sentAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Audit Log Detail Modal */}
      {selectedAuditLog && (
        <Modal
          isOpen={!!selectedAuditLog}
          onClose={() => setSelectedAuditLog(null)}
          title={`Audit Log #${selectedAuditLog.id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action:</span>
              <div style={{ color: '#fff', fontWeight: 600 }}>{selectedAuditLog.action}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entity:</span>
              <div style={{ color: '#fff' }}>{selectedAuditLog.entity_type} (ID: {selectedAuditLog.entity_id || 'N/A'})</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actor:</span>
              <div style={{ color: '#fff' }}>{selectedAuditLog.user_name} ({selectedAuditLog.user_email})</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IP Address:</span>
              <div style={{ color: '#fff' }}>{selectedAuditLog.ip_address || '127.0.0.1'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Details:</span>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {selectedAuditLog.reason || 'No additional payload notes'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <Modal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          title="Send Push Broadcast"
        >
          <form onSubmit={handleSendBroadcast}>
            <div className="form-group">
              <label className="form-label">Broadcast Title</label>
              <input
                type="text"
                className="form-input"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                placeholder="Alert headline..."
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notification Message</label>
              <textarea
                className="form-input"
                rows={3}
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                placeholder="Details of the announcement..."
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsBroadcastModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Send to Devices
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogsBroadcast;
