import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  Eye,
  RotateCw,
  FileText,
  Clock,
  Lock,
  Smartphone,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  UserCheck,
  Globe,
  Calendar,
  History,
  Scale,
} from 'lucide-react';

const DEFAULT_POLICY_CONTENT = `1. DATA COLLECTION & KYC CONSENT
FinanceFlow operates as an enterprise fund circulation and microfinance ledger platform. We collect borrower identifying data (Full Name, Phone Number, Aadhaar / Voter KYC, Residential Address, Shop / Stall Location) solely for loan underwriting, repayment schedule monitoring, and receipt generation.

2. IMMUTABLE TRANSACTION AUDITABILITY
All payment transactions, principal recoveries, and lending fee allocations are stored as permanent, immutable ledger records. No transaction record can be backdated, purged, or altered.

3. FIELD COLLECTION & GEO-VISIT VERIFICATION
When field agents perform on-site merchant collections, GPS coordinates and visit timestamps may be recorded to verify route compliance and customer security.

4. DATA ENCRYPTION & MULTI-TENANT ISOLATION
All borrower and ledger records are segregated by tenant identifier (organization_id). Data in transit is protected using TLS 1.3 encryption and stored within secure sovereign database clusters.

5. STATUTORY RETENTION PERIOD
Financial transaction history is retained for a mandatory minimum of 7 (seven) years in accordance with statutory microfinance banking standards and regulatory audit guidelines.

6. BORROWER RIGHTS & DISPUTE RESOLUTION
Borrowers are entitled to receive real-time digital and physical receipts for all payments made. Any discrepancy may be escalated to the branch underwriting officer.`;

const STATUTORY_STANDARDS = [
  { title: 'RBI Microfinance Lending Guidelines', desc: 'Compliant with statutory recovery and interest rate caps', status: 'COMPLIANT' },
  { title: 'DPDP Act 2023 Data Governance', desc: 'Strict purpose-limited KYC processing & storage', status: 'COMPLIANT' },
  { title: 'Immutable Transaction Ledger', desc: 'Cryptographic non-repudiation on all loan disbursements', status: 'ENFORCED' },
  { title: 'Multi-Tenant Data Isolation', desc: 'Zero data leakage between independent organizations', status: 'ENFORCED' },
];

export const PrivacyPolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [previewModal, setPreviewModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [policyData, setPolicyData] = useState({
    title: 'FinanceFlow Platform Privacy & Financial Data Governance Policy',
    version: 'v2.1',
    effectiveDate: '2026-09-01',
    status: 'PUBLISHED_ACTIVE',
    author_name: 'Super Admin',
    content: DEFAULT_POLICY_CONTENT,
  });

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await api.governance.getPrivacyPolicies();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setVersionHistory(list);

      const active = res?.active || list.find((p) => p.status === 'PUBLISHED_ACTIVE') || list[0];
      if (active) {
        setPolicyData({
          title: active.title || 'FinanceFlow Platform Privacy & Financial Data Governance Policy',
          version: active.version || 'v2.1',
          effectiveDate: active.effective_date ? new Date(active.effective_date).toISOString().slice(0, 10) : '2026-09-01',
          status: active.status || 'PUBLISHED_ACTIVE',
          author_name: active.author_name || 'Super Admin',
          content: active.content || DEFAULT_POLICY_CONTENT,
        });
      }
    } catch (err) {
      console.error('Failed to load privacy policy from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPolicy();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.governance.updatePrivacyPolicy({
        version: policyData.version,
        title: policyData.title,
        content: policyData.content,
        effective_date: policyData.effectiveDate,
        status: policyData.status,
        author_name: policyData.author_name || 'Super Admin',
      });
      setIsEditing(false);
      showToast('Privacy Policy updated & published directly to database!');
      await fetchPolicy();
    } catch (err) {
      alert(err.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  const handleBumpVersion = (type = 'minor') => {
    const current = policyData.version.replace('v', '');
    const parts = current.split('.').map((p) => parseInt(p, 10) || 0);
    let newVer = 'v2.2';
    if (type === 'minor') {
      newVer = `v${parts[0] || 2}.${(parts[1] != null ? parts[1] : 1) + 1}`;
    } else {
      newVer = `v${(parts[0] || 2) + 1}.0`;
    }
    setPolicyData({ ...policyData, version: newVer });
  };

  const handleSelectHistoryVersion = (item) => {
    setPolicyData({
      title: item.title,
      version: item.version,
      effectiveDate: item.effective_date ? new Date(item.effective_date).toISOString().slice(0, 10) : '2026-09-01',
      status: item.status,
      author_name: item.author_name || 'Super Admin',
      content: item.content || DEFAULT_POLICY_CONTENT,
    });
    showToast(`Loaded version ${item.version} into view.`);
  };

  return (
    <div className="policy-page-container">
      {/* Header */}
      <div className="policy-header-row">
        <div className="policy-header-left">
          <div className="header-title-wrap">
            <h1 className="policy-main-title">Platform Privacy & Compliance Policy</h1>
            <span className="policy-version-badge">
              {loading ? (
                <span className="skeleton-pill" style={{ width: 45, height: 20 }} />
              ) : (
                `${policyData.version} Active`
              )}
            </span>
          </div>
        </div>

        <div className="policy-header-actions">
          <button
            type="button"
            className={`btn-refresh-data ${isRefreshing || loading ? 'refreshing' : ''}`}
            onClick={handleManualRefresh}
            title="Refresh Live Data"
            disabled={loading || isRefreshing}
          >
            <RotateCw size={16} />
          </button>

          <button
            type="button"
            className="btn-preview-app"
            onClick={() => setPreviewModal(true)}
          >
            <Smartphone size={16} />
            <span>Borrower App Preview</span>
          </button>

          {isEditing ? (
            <button
              type="button"
              className="btn-save-policy"
              onClick={handleSavePolicy}
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Publishing...' : 'Publish Policy'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-edit-policy"
              onClick={() => setIsEditing(true)}
            >
              <FileText size={16} />
              <span>Edit Policy Terms</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="policy-feedback-banner">
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 4-Column Compliance KPI Cards */}
      <div className="policy-kpi-grid">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="policy-kpi-card skeleton-card">
                <div className="policy-kpi-top">
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
            <div className="policy-kpi-card">
              <div className="policy-kpi-top">
                <span className="policy-kpi-label">Active Policy Status</span>
                <div className="policy-kpi-icon icon-emerald">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="policy-kpi-value">{policyData.status === 'PUBLISHED_ACTIVE' ? 'Published' : policyData.status}</div>
              <div className="policy-kpi-footer">
                <span className="dot-green" />
                <span>Enforced on Version {policyData.version}</span>
              </div>
            </div>

            <div className="policy-kpi-card">
              <div className="policy-kpi-top">
                <span className="policy-kpi-label">Audit Retention Period</span>
                <div className="policy-kpi-icon icon-blue">
                  <Clock size={20} />
                </div>
              </div>
              <div className="policy-kpi-value">7 Years Min</div>
              <div className="policy-kpi-footer">
                <span>Statutory Microfinance Standard</span>
              </div>
            </div>

            <div className="policy-kpi-card">
              <div className="policy-kpi-top">
                <span className="policy-kpi-label">Multi-Tenant Isolation</span>
                <div className="policy-kpi-icon icon-purple">
                  <Lock size={20} />
                </div>
              </div>
              <div className="policy-kpi-value">100% Segregated</div>
              <div className="policy-kpi-footer">
                <span>Strict Database Partitioning</span>
              </div>
            </div>

            <div className="policy-kpi-card">
              <div className="policy-kpi-top">
                <span className="policy-kpi-label">KYC Consent Acceptance</span>
                <div className="policy-kpi-icon icon-amber">
                  <UserCheck size={20} />
                </div>
              </div>
              <div className="policy-kpi-value">99.8% Signatures</div>
              <div className="policy-kpi-footer">
                <span>Mobile Onboarding Verified</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Split Layout: Left Editor/Reader, Right History & Checklist */}
      <div className="policy-split-layout">
        {/* Left: Policy Document Box */}
        <div className="policy-document-card">
          <div className="document-card-header">
            <div className="doc-header-left">
              <FileText size={18} color="#1976d2" />
              <h3 className="doc-card-title">{policyData.title}</h3>
            </div>
            <div className="doc-header-right">
              <span className="doc-effective-badge">
                <Calendar size={13} />
                Effective: {policyData.effectiveDate}
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="skeleton-bar" style={{ width: '90%', height: 16 }} />
              <div className="skeleton-bar" style={{ width: '80%', height: 14 }} />
              <div className="skeleton-bar" style={{ width: '85%', height: 14 }} />
              <div className="skeleton-bar" style={{ width: '70%', height: 14 }} />
            </div>
          ) : isEditing ? (
            /* EDIT MODE */
            <form onSubmit={handleSavePolicy} className="policy-edit-form">
              <div className="edit-form-grid">
                <div className="form-group">
                  <label className="form-label">Policy Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={policyData.title}
                    onChange={(e) => setPolicyData({ ...policyData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Version String</label>
                  <div className="version-input-wrap">
                    <input
                      type="text"
                      className="form-input"
                      value={policyData.version}
                      onChange={(e) => setPolicyData({ ...policyData, version: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="btn-bump-ver"
                      title="Bump Minor Version"
                      onClick={() => handleBumpVersion('minor')}
                    >
                      + Minor
                    </button>
                    <button
                      type="button"
                      className="btn-bump-ver"
                      title="Bump Major Version"
                      onClick={() => handleBumpVersion('major')}
                    >
                      + Major
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Effective Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={policyData.effectiveDate}
                    onChange={(e) => setPolicyData({ ...policyData, effectiveDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Publication Status</label>
                  <select
                    className="form-select"
                    value={policyData.status}
                    onChange={(e) => setPolicyData({ ...policyData, status: e.target.value })}
                  >
                    <option value="PUBLISHED_ACTIVE">PUBLISHED_ACTIVE (Live Enforced)</option>
                    <option value="DRAFT">DRAFT (Under Review)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label">Full Policy Clauses & Disclosure Text</label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Standard legal clauses with numbered hierarchy
                  </span>
                </div>
                <textarea
                  className="form-textarea"
                  rows={14}
                  value={policyData.content}
                  onChange={(e) => setPolicyData({ ...policyData, content: e.target.value })}
                  required
                />
              </div>

              <div className="edit-form-actions">
                <button
                  type="button"
                  className="btn-cancel-edit"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-save-policy"
                >
                  <Save size={15} />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Policy'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* READ / DOCUMENT MODE */
            <div className="policy-document-body">
              {policyData.content.split('\n\n').map((clause, idx) => {
                const lines = clause.split('\n');
                const titleLine = lines[0];
                const bodyLines = lines.slice(1).join('\n');

                return (
                  <div key={idx} className="clause-block">
                    <div className="clause-header">
                      <div className="clause-num-badge">{idx + 1}</div>
                      <h4 className="clause-title">{titleLine.replace(/^\d+\.\s*/, '')}</h4>
                    </div>
                    <p className="clause-text">{bodyLines || titleLine}</p>
                  </div>
                );
              })}

              <div className="document-signature-strip">
                <div className="sign-item">
                  <span className="sign-label">Published By</span>
                  <strong className="sign-val">{policyData.author_name || 'Super Admin'}</strong>
                </div>
                <div className="sign-item">
                  <span className="sign-label">Governing Policy ID</span>
                  <strong className="sign-val" style={{ fontFamily: 'monospace' }}>POL-GOV-2026-IN</strong>
                </div>
                <div className="sign-item">
                  <span className="sign-label">Cryptographic Status</span>
                  <span className="sign-pill">
                    <ShieldCheck size={13} color="#059669" />
                    Verified Sovereign Record
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Version History & Statutory Checklist */}
        <div className="policy-sidebar-col">
          {/* Version History Card */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <History size={16} color="#1976d2" />
              <h3 className="sidebar-title">Policy Version History</h3>
            </div>

            <div className="version-history-list">
              {versionHistory.length === 0 ? (
                <div className="version-item active">
                  <div className="ver-item-top">
                    <span className="ver-pill active">v2.1</span>
                    <span className="ver-status-dot active" />
                  </div>
                  <strong className="ver-title">Current Published Version</strong>
                  <span className="ver-date">Effective: 01 Sep 2026</span>
                </div>
              ) : (
                versionHistory.map((v) => (
                  <div
                    key={v.id || v.version}
                    className={`version-item ${policyData.version === v.version ? 'active' : ''}`}
                    onClick={() => handleSelectHistoryVersion(v)}
                  >
                    <div className="ver-item-top">
                      <span className={`ver-pill ${policyData.version === v.version ? 'active' : ''}`}>
                        {v.version}
                      </span>
                      <span className="ver-date">
                        {v.effective_date ? new Date(v.effective_date).toLocaleDateString('en-GB') : '01/09/2026'}
                      </span>
                    </div>
                    <strong className="ver-title">{v.title}</strong>
                    <div className="ver-footer">
                      <span>By {v.author_name || 'Super Admin'}</span>
                      {policyData.version === v.version && <Check size={14} color="#1976d2" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Statutory Compliance Checklist Card */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <Scale size={16} color="#059669" />
              <h3 className="sidebar-title">Statutory Compliance Checks</h3>
            </div>

            <div className="compliance-checklist">
              {STATUTORY_STANDARDS.map((std, i) => (
                <div key={i} className="compliance-item">
                  <div className="compliance-icon-box">
                    <CheckCircle2 size={16} color="#059669" />
                  </div>
                  <div className="compliance-text-group">
                    <strong className="compliance-name">{std.title}</strong>
                    <span className="compliance-desc">{std.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: BORROWER APP ONBOARDING PREVIEW                   */}
      {/* ======================================================== */}
      {previewModal && (
        <Modal
          isOpen={previewModal}
          onClose={() => setPreviewModal(false)}
          title="Borrower Mobile App Consent Screen Preview"
        >
          <div className="mobile-preview-container">
            <div className="mobile-phone-frame">
              <div className="mobile-screen">
                {/* Mobile Top Bar */}
                <div className="mobile-top-bar">
                  <span className="mobile-time">09:41</span>
                  <div className="mobile-battery-pill" />
                </div>

                {/* Mobile App Header */}
                <div className="mobile-app-header">
                  <div className="app-logo-badge">
                    <ShieldCheck size={20} color="#1976d2" />
                  </div>
                  <h4 className="app-header-title">Loan Agreement & Consent</h4>
                  <p className="app-header-sub">Review terms before loan disbursement</p>
                </div>

                {/* Scrollable Policy Content on Mobile */}
                <div className="mobile-content-box">
                  <div className="borrower-pill-strip">
                    <span>Borrower: <strong>Kumar S</strong></span>
                    <span>Loan: <strong>₹20,000 (10 Weeks)</strong></span>
                  </div>

                  <p className="mobile-legal-text">
                    By confirming below, you acknowledge and agree to the statutory microfinance lending terms governed by{' '}
                    <strong>{policyData.version}</strong>. All cash and UPI repayments will be recorded on an immutable ledger.
                  </p>

                  <div className="mobile-clauses-summary">
                    <div className="clause-mini-item">
                      <Check size={13} color="#059669" />
                      <span>Weekly / Daily Installment Schedule</span>
                    </div>
                    <div className="clause-mini-item">
                      <Check size={13} color="#059669" />
                      <span>Zero Hidden Charges & Flat Interest Cap</span>
                    </div>
                    <div className="clause-mini-item">
                      <Check size={13} color="#059669" />
                      <span>Digital SMS Receipt on Every Payment</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Acceptance Action */}
                <div className="mobile-footer-actions">
                  <div className="checkbox-wrap">
                    <input type="checkbox" defaultChecked readOnly id="accept-check" />
                    <label htmlFor="accept-check">I agree to the Data & Repayment Terms</label>
                  </div>
                  <button type="button" className="btn-mobile-accept">
                    Accept & Disburse Loan
                  </button>
                </div>
              </div>
            </div>

            <div className="preview-explanation">
              <div className="expl-header">
                <Info size={16} color="#1976d2" />
                <strong>Live Client Simulation</strong>
              </div>
              <p>
                This preview illustrates the mobile consent prompt presented to new borrowers during KYC onboarding in field collection routes.
              </p>
              <button
                type="button"
                className="btn-close-preview"
                onClick={() => setPreviewModal(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Embedded Component Styles Matching Organization.jsx */}
      <style>{`
        .policy-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          color: #0f172a;
          font-family: inherit;
        }

        .policy-header-row {
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

        .policy-main-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }

        .policy-version-badge {
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

        .policy-header-actions {
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

        .btn-preview-app {
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

        .btn-preview-app:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .btn-edit-policy, .btn-save-policy {
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

        .btn-edit-policy:hover, .btn-save-policy:hover:not(:disabled) {
          background: #1565c0;
          transform: translateY(-1px);
        }

        .policy-feedback-banner {
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
        .policy-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .policy-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .policy-kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .policy-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.15rem 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .policy-kpi-card:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
          transform: translateY(-2px);
        }

        .policy-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .policy-kpi-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.03em;
        }

        .policy-kpi-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-emerald { background: #ecfdf5; color: #059669; }
        .icon-blue { background: #eff6ff; color: #1976d2; }
        .icon-purple { background: #f5f3ff; color: #7c3aed; }
        .icon-amber { background: #fffbeb; color: #d97706; }

        .policy-kpi-value {
          font-size: 1.55rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0.35rem 0 0.25rem 0;
          letter-spacing: -0.02em;
        }

        .policy-kpi-footer {
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

        /* Split Layout */
        .policy-split-layout {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 980px) {
          .policy-split-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Left Policy Document Card */
        .policy-document-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }

        .document-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.15rem 1.35rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .doc-header-left {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .doc-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .doc-effective-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .policy-document-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .clause-block {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 1rem;
          transition: border-color 0.15s ease;
        }

        .clause-block:hover {
          border-color: #cbd5e1;
        }

        .clause-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.45rem;
        }

        .clause-num-badge {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #eff6ff;
          color: #1976d2;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .clause-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .clause-text {
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.55;
          margin: 0;
          padding-left: 2rem;
        }

        .document-signature-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 0.5rem;
        }

        .sign-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sign-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .sign-val {
          font-size: 0.85rem;
          color: #0f172a;
        }

        .sign-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #059669;
        }

        /* Edit Form */
        .policy-edit-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .edit-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
        }

        .form-input, .form-select, .form-textarea {
          padding: 0.55rem 0.85rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          font-family: inherit;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
        }

        .version-input-wrap {
          display: flex;
          gap: 0.4rem;
        }

        .btn-bump-ver {
          padding: 0.45rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1976d2;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn-bump-ver:hover {
          background: #dbeafe;
        }

        .edit-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-cancel-edit {
          padding: 0.55rem 1.15rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
        }

        /* Right Sidebar Cards */
        .policy-sidebar-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .sidebar-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .sidebar-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        /* Version History List */
        .version-history-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .version-item {
          padding: 0.75rem 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .version-item:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .version-item.active {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .ver-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .ver-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: #e2e8f0;
          color: #334155;
        }

        .ver-pill.active {
          background: #1976d2;
          color: #ffffff;
        }

        .ver-date {
          font-size: 0.72rem;
          color: #64748b;
        }

        .ver-title {
          display: block;
          font-size: 0.82rem;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .ver-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
          color: #64748b;
        }

        /* Compliance Checklist */
        .compliance-checklist {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .compliance-item {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
        }

        .compliance-icon-box {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .compliance-text-group {
          display: flex;
          flex-direction: column;
        }

        .compliance-name {
          font-size: 0.84rem;
          color: #0f172a;
        }

        .compliance-desc {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.35;
        }

        /* Mobile Preview Modal */
        .mobile-preview-container {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0;
          flex-wrap: wrap;
        }

        .mobile-phone-frame {
          width: 290px;
          height: 480px;
          background: #0f172a;
          border-radius: 36px;
          padding: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .mobile-screen {
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 0.85rem;
          box-sizing: border-box;
          font-family: inherit;
        }

        .mobile-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.68rem;
          font-weight: 700;
          color: #0f172a;
        }

        .mobile-battery-pill {
          width: 16px;
          height: 8px;
          border: 1px solid #0f172a;
          border-radius: 2px;
        }

        .mobile-app-header {
          text-align: center;
          margin-top: 0.35rem;
        }

        .app-logo-badge {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #eff6ff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
        }

        .app-header-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .app-header-sub {
          font-size: 0.7rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .mobile-content-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.65rem;
          font-size: 0.75rem;
        }

        .borrower-pill-strip {
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: #ffffff;
          padding: 0.45rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          margin-bottom: 0.45rem;
          font-size: 0.72rem;
          color: #334155;
        }

        .mobile-legal-text {
          font-size: 0.7rem;
          color: #475569;
          line-height: 1.35;
          margin: 0 0 0.45rem 0;
        }

        .mobile-clauses-summary {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .clause-mini-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: #0f172a;
        }

        .mobile-footer-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.68rem;
          color: #334155;
        }

        .btn-mobile-accept {
          width: 100%;
          padding: 0.55rem;
          border-radius: 8px;
          border: none;
          background: #1976d2;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
        }

        .preview-explanation {
          max-width: 240px;
        }

        .expl-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: #0f172a;
          margin-bottom: 0.4rem;
        }

        .preview-explanation p {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 1rem 0;
        }

        .btn-close-preview {
          padding: 0.5rem 1rem;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
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
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
