import React, { useState } from 'react';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Bell,
  Shield,
  Send,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  Clock,
  Eye,
  Download,
  Users,
  Building,
} from 'lucide-react';

export const AuditLogsBroadcast = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'broadcast'

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 101,
      timestamp: '2026-09-11 15:38:22',
      actor: 'Admin Field Manager (ops@fundlending.com)',
      action: 'PAYMENT_RECORD',
      entity: 'Loan #LN-2026-004',
      entityType: 'LOAN_INSTALLMENT',
      ipAddress: '103.21.144.12',
      details: 'Recorded payment of ₹2,200 (Week 4) for Kumar S. Receipt: RCP-20260910-0012',
      severity: 'INFO',
    },
    {
      id: 102,
      timestamp: '2026-09-11 15:35:10',
      actor: 'Super Admin Root (admin@fundlending.com)',
      action: 'USER_UPDATE',
      entity: 'User #3 (Anitha Lakshmi)',
      entityType: 'USER_KYC',
      ipAddress: '49.207.201.88',
      details: 'Updated address and occupation to Handloom Silk Craft',
      severity: 'INFO',
    },
    {
      id: 103,
      timestamp: '2026-09-11 14:20:00',
      actor: 'Admin Field Manager (ops@fundlending.com)',
      action: 'LOAN_DISBURSE',
      entity: 'Loan #LN-2026-018',
      entityType: 'LOAN',
      ipAddress: '103.21.144.12',
      details: 'Disbursed ₹10,000 principal from Central Cash Vault. 10 weekly installments generated.',
      severity: 'FINANCIAL',
    },
    {
      id: 104,
      timestamp: '2026-09-11 11:05:45',
      actor: 'System Automation Engine',
      action: 'OVERDUE_RECALCULATION',
      entity: 'Installment #1003',
      entityType: 'PAYMENT_SCHEDULE',
      ipAddress: '127.0.0.1 (Internal)',
      details: 'Marked installment #7 for Selvam Tea Stall as OVERDUE (+14 days past due date)',
      severity: 'WARNING',
    },
  ]);

  const [auditSearch, setAuditSearch] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Broadcast Notification State
  const [broadcasts, setBroadcasts] = useState([
    {
      id: 1,
      title: 'Festival Holiday Collection Schedule Update',
      message: 'Daily collections for Ganesh Chaturthi will shift to morning 08:00 AM - 12:00 PM route.',
      audience: 'ALL_FIELD_AGENTS',
      priority: 'IMPORTANT',
      sentAt: '2026-09-10 10:00:00',
      author: 'Super Admin Root',
      reachCount: 142,
    },
    {
      id: 2,
      title: 'New QR / UPI Instant Receipt Generation Live',
      message: 'Mobile App v2.4.1 now supports direct QR display for shopkeeper collections with SMS receipt delivery.',
      audience: 'ALL_USERS',
      priority: 'NORMAL',
      sentAt: '2026-09-08 14:30:00',
      author: 'Super Admin Tech',
      reachCount: 480,
    },
  ]);

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    audience: 'ALL_USERS',
    priority: 'IMPORTANT',
  });
  const [feedback, setFeedback] = useState(null);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;

    const newBc = {
      id: broadcasts.length + 1,
      title: broadcastForm.title.trim(),
      message: broadcastForm.message.trim(),
      audience: broadcastForm.audience,
      priority: broadcastForm.priority,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      author: 'Super Admin Root',
      reachCount: 520,
    };

    setBroadcasts([newBc, ...broadcasts]);
    setIsBroadcastModalOpen(false);
    setFeedback(`Broadcast notification "${broadcastForm.title}" dispatched across all apps & portals!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const filteredAudit = auditLogs.filter(
    (log) =>
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.entity.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="audit-broadcast-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">SECURITY SURVEILLANCE & COMMUNICATION</div>
          <h1 className="page-title">Audit Logs & Broadcast Center</h1>
          <p className="page-subtitle">
            Immutable system activity audit trail and platform-wide broadcast notification dispatcher.
          </p>
        </div>

        <div className="header-actions">
          {activeTab === 'broadcast' ? (
            <button className="btn btn-primary" onClick={() => setIsBroadcastModalOpen(true)}>
              <Send size={16} />
              New Broadcast Notification
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Download size={16} />
              Export Audit Trail
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'audit' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
            color: activeTab === 'audit' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Shield size={16} />
          <span>System Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'broadcast' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
            color: activeTab === 'broadcast' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Bell size={16} />
          <span>Broadcast Notifications ({broadcasts.length})</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: SYSTEM AUDIT LOGS                   */}
      {/* ========================================== */}
      {activeTab === 'audit' && (
        <div>
          <div className="table-controls" style={{ marginBottom: '1.25rem' }}>
            <div className="search-box" style={{ maxWidth: 450 }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search audit trail by actor, action, entity, or description..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor & IP</th>
                    <th>Action</th>
                    <th>Target Entity</th>
                    <th>Details & Description</th>
                    <th style={{ textAlign: 'right' }}>Log</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.map((log) => (
                    <tr key={log.id}>
                      <td><code>{log.timestamp}</code></td>
                      <td>
                        <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{log.actor}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IP: {log.ipAddress}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            log.action === 'PAYMENT_RECORD' || log.action === 'LOAN_DISBURSE'
                              ? 'badge-emerald'
                              : log.severity === 'WARNING'
                              ? 'badge-red'
                              : 'badge-blue'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#fff' }}>{log.entity}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.entityType}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.details}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-icon"
                          title="View Raw Log"
                          onClick={() => setSelectedAuditLog(log)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: BROADCAST NOTIFICATION CENTER       */}
      {/* ========================================== */}
      {activeTab === 'broadcast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {broadcasts.map((bc) => (
            <div
              key={bc.id}
              className="card"
              style={{
                padding: '1.25rem',
                borderLeft: bc.priority === 'IMPORTANT' ? '4px solid #fbbf24' : '4px solid var(--accent-primary)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={18} color={bc.priority === 'IMPORTANT' ? '#fbbf24' : 'var(--accent-primary)'} />
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{bc.title}</h3>
                  <span className={`badge ${bc.priority === 'IMPORTANT' ? 'badge-yellow' : 'badge-blue'}`}>
                    {bc.priority}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sent on {bc.sentAt}</span>
              </div>

              <p style={{ margin: '0 0 0.85rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {bc.message}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Target Audience: <strong style={{ color: '#fff' }}>{bc.audience.replace(/_/g, ' ')}</strong></span>
                <span>Reach: <strong style={{ color: 'var(--emerald)' }}>{bc.reachCount} Active Devices Delivered</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Broadcast Modal */}
      {isBroadcastModalOpen && (
        <Modal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          title="Compose Broadcast Notification"
        >
          <form onSubmit={handleSendBroadcast}>
            <div className="form-group">
              <label className="form-label">Announcement Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. System Maintenance Window & Route Schedule"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select
                  className="form-input"
                  value={broadcastForm.audience}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, audience: e.target.value })}
                >
                  <option value="ALL_USERS">All Users (Borrowers & Agents)</option>
                  <option value="ALL_FIELD_AGENTS">Field Agents Only</option>
                  <option value="BRANCH_ADMINS">Branch Managers Only</option>
                  <option value="SHOPKEEPER_MERCHANTS">Shopkeeper Merchants</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notification Priority</label>
                <select
                  className="form-input"
                  value={broadcastForm.priority}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                >
                  <option value="NORMAL">NORMAL (In-App Notification)</option>
                  <option value="IMPORTANT">IMPORTANT (Push Banner + Bell)</option>
                  <option value="CRITICAL">CRITICAL (Instant Modal Prompt)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notification Message Body *</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Enter the broadcast message that will appear on mobile and web screens..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsBroadcastModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Send size={15} />
                Send Broadcast
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Raw Audit Log Detail Modal */}
      {selectedAuditLog && (
        <Modal
          isOpen={!!selectedAuditLog}
          onClose={() => setSelectedAuditLog(null)}
          title={`Audit Log #${selectedAuditLog.id}: ${selectedAuditLog.action}`}
        >
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <div>Timestamp: <strong>{selectedAuditLog.timestamp}</strong></div>
              <div>Actor: <strong>{selectedAuditLog.actor}</strong></div>
              <div>Client IP: <code>{selectedAuditLog.ipAddress}</code></div>
              <div>Target Entity: <strong>{selectedAuditLog.entity}</strong></div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 6, marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Log Payload & Details:</div>
              <p style={{ margin: 0, color: '#fff', fontSize: '0.85rem' }}>{selectedAuditLog.details}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setSelectedAuditLog(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogsBroadcast;
