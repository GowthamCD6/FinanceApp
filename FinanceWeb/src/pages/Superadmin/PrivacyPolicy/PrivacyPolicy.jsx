import React, { useState } from 'react';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  ShieldCheck,
  FileText,
  Save,
  CheckCircle2,
  Clock,
  Lock,
  Eye,
  History,
  AlertCircle,
  Globe,
} from 'lucide-react';

export const PrivacyPolicy = () => {
  const [activeVersion, setActiveVersion] = useState('v2.1');
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [policyData, setPolicyData] = useState({
    title: 'FinanceFlow Platform Privacy & Financial Data Governance Policy',
    version: 'v2.1 (Production Active)',
    effectiveDate: '2026-09-01',
    lastUpdated: '2026-09-10',
    status: 'PUBLISHED_ACTIVE',
    content: `1. DATA COLLECTION & CONSENT
FinanceFlow operates as a fund circulation and microfinance ledger platform. We collect borrower identifying data (Full Name, Phone, Aadhaar / Voter ID KYC, Residential Address, Shop / Stall Location) solely for loan underwriting, repayment schedule monitoring, and receipt generation.

2. IMMUTABLE TRANSACTION AUDITABILITY
In accordance with central financial standards and microfinance audit regulations, all payment transactions, principal recoveries, and lending fee allocations are stored as permanent, immutable ledger records. Repayment records are never erased upon loan completion and remain permanently accessible to borrowers and organization auditors.

3. FIELD COLLECTION & GEO-VISIT DATA
When field agents perform on-site merchant collections, GPS coordinates and visit timestamps may be recorded to verify route compliance and prevent cash reconciliation disputes.

4. DATA ENCRYPTION & MULTI-TENANT ISOLATION
All borrower and organization records are isolated by tenant identifier (organization_id). Data in transit is protected using TLS 1.3 encryption, and passwords/sensitive credentials are encrypted using industry-standard bcrypt hashing.

5. RETENTION PERIOD
Financial transaction history is retained for a mandatory minimum of 7 (seven) years from the date of loan closure in compliance with financial ledger auditing standards.`,
  });

  const [previewModal, setPreviewModal] = useState(false);

  const handleSavePolicy = () => {
    setIsEditing(false);
    setFeedback('Privacy Policy updated and published across all platform apps & web portals!');
    setTimeout(() => setFeedback(null), 3500);
  };

  const versionHistory = [
    { version: 'v2.1', date: '2026-09-01', status: 'ACTIVE', author: 'Priya Narayanan (Compliance Head)' },
    { version: 'v2.0', date: '2026-01-15', status: 'ARCHIVED', author: 'Super Admin Root' },
    { version: 'v1.0', date: '2025-06-10', status: 'ARCHIVED', author: 'Super Admin Root' },
  ];

  return (
    <div className="privacy-policy-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">LEGAL, KYC & COMPLIANCE GOVERNANCE</div>
          <h1 className="page-title">Platform Privacy & Data Governance Policy</h1>
          <p className="page-subtitle">
            Configure data retention policies, KYC consent terms, and statutory regulatory compliance across all tenant organizations.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setPreviewModal(true)}>
            <Eye size={16} />
            Borrower App Preview
          </button>
          {isEditing ? (
            <button className="btn btn-primary" onClick={handleSavePolicy}>
              <Save size={16} />
              Publish Updated Policy
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Edit Policy Content
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

      {/* Compliance Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Policy Status</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.4rem', color: 'var(--emerald)' }}>Published & Active</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Version {policyData.version}</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audit Retention Period</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.4rem', color: '#fff' }}>7 Years Minimum</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>RBI / Statutory Compliant</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tenant Isolation</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.4rem', color: 'var(--accent-primary)' }}>100% Enforced</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strict org-level segregation</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Borrower Consent Acceptance</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.4rem', color: '#fbbf24' }}>99.8%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Onboarding digital signatures</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
        {/* Editor / Policy Viewer */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Policy Documentation Terms</h3>
            <span className="badge badge-emerald">Effective: {policyData.effectiveDate}</span>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                className="form-input"
                rows={16}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}
                value={policyData.content}
                onChange={(e) => setPolicyData({ ...policyData, content: e.target.value })}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSavePolicy}>
                  <Save size={16} />
                  Save & Publish
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '1.25rem',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
              }}
            >
              {policyData.content}
            </div>
          )}
        </div>

        {/* Version History & Statutory Framework */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Policy Version History</h3>
            </div>

            <div className="table-responsive">
              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Effective Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {versionHistory.map((v, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: '#fff' }}>{v.version}</strong></td>
                      <td>{v.date}</td>
                      <td>
                        <StatusBadge status={v.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
              🔒 Statutory Compliance Check
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              All modifications automatically propagate to the Mobile Agent companion app and the Borrower Web Portal upon their next login session.
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewModal && (
        <Modal
          isOpen={previewModal}
          onClose={() => setPreviewModal(false)}
          title="Borrower App View Preview"
        >
          <div style={{ maxHeight: 420, overflowY: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>{policyData.title}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
              Version {policyData.version} • Effective {policyData.effectiveDate}
            </span>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {policyData.content}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PrivacyPolicy;
