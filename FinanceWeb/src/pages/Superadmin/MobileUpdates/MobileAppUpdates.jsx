import React, { useState } from 'react';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Smartphone,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Clock,
  ShieldCheck,
  Radio,
  Plus,
  Edit2,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export const MobileAppUpdates = () => {
  const [releases, setReleases] = useState([
    {
      id: 1,
      version: 'v2.4.1',
      buildNumber: 2410,
      platform: 'ANDROID_APK',
      forceUpdate: true,
      minSupportedVersion: 'v2.2.0',
      rolloutPercent: 100,
      status: 'LIVE_PRODUCTION',
      downloadUrl: 'https://cdn.fundlending.com/apps/finance-agent-v2.4.1.apk',
      releaseDate: '2026-09-08',
      changelog: [
        'Added offline SQLite synchronization for rural route collections',
        'Direct UPI QR generation and instant receipt generation',
        'Reduced app bundle size by 35% with optimized assets',
      ],
    },
    {
      id: 2,
      version: 'v2.3.0',
      buildNumber: 2300,
      platform: 'ANDROID_APK',
      forceUpdate: false,
      minSupportedVersion: 'v2.0.0',
      rolloutPercent: 100,
      status: 'ARCHIVED',
      downloadUrl: 'https://cdn.fundlending.com/apps/finance-agent-v2.3.0.apk',
      releaseDate: '2026-08-15',
      changelog: ['Biometric fingerprint login support', 'GPS route check-in verification'],
    },
  ]);

  const [isNewReleaseModalOpen, setIsNewReleaseModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    version: 'v2.5.0',
    buildNumber: 2500,
    platform: 'ANDROID_APK',
    forceUpdate: false,
    minSupportedVersion: 'v2.3.0',
    rolloutPercent: 25,
    downloadUrl: '',
    changelogText: 'New feature release with speed improvements',
  });

  const activeRelease = releases[0];

  const handleCreateRelease = (e) => {
    e.preventDefault();
    const newRel = {
      id: releases.length + 1,
      version: formData.version,
      buildNumber: parseInt(formData.buildNumber, 10),
      platform: formData.platform,
      forceUpdate: formData.forceUpdate,
      minSupportedVersion: formData.minSupportedVersion,
      rolloutPercent: parseInt(formData.rolloutPercent, 10),
      status: 'LIVE_PRODUCTION',
      downloadUrl: formData.downloadUrl || `https://cdn.fundlending.com/apps/finance-agent-${formData.version}.apk`,
      releaseDate: new Date().toISOString().slice(0, 10),
      changelog: formData.changelogText.split('\n').filter((l) => l.trim()),
    };

    setReleases([newRel, ...releases]);
    setIsNewReleaseModalOpen(false);
    setFeedback(`Mobile release ${formData.version} published to OTA network!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggleForceUpdate = (id) => {
    setReleases((prev) =>
      prev.map((r) => (r.id === id ? { ...r, forceUpdate: !r.forceUpdate } : r))
    );
    setFeedback('Force Update policy updated!');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="mobile-app-updates-page">
      <div className="page-header">
        <div>
          <div className="welcome-tag">MOBILE COMPANION (FinanceApp) OTA</div>
          <h1 className="page-title">Mobile App Releases & Updates</h1>
          <p className="page-subtitle">
            Manage field agent mobile application versions, force update policies, and over-the-air binary rollouts.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsNewReleaseModalOpen(true)}>
            <Plus size={16} />
            Publish New Build
          </button>
        </div>
      </div>

      {feedback && (
        <div className="feedback-banner" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--emerald)" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Current Live Release Card */}
      {activeRelease && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Smartphone size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>{activeRelease.version}</h2>
                  <span className="badge badge-emerald">Active Production Live</span>
                  {activeRelease.forceUpdate && <span className="badge badge-red">Force Update Mandatory</span>}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Build #{activeRelease.buildNumber} • Released on {activeRelease.releaseDate} • Min Supported: {activeRelease.minSupportedVersion}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleToggleForceUpdate(activeRelease.id)}
              >
                <ShieldCheck size={16} />
                {activeRelease.forceUpdate ? 'Disable Force Update' : 'Enable Force Update'}
              </button>
            </div>
          </div>

          {/* Rollout progress */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Field Agent Rollout Status</span>
              <strong style={{ color: '#fff' }}>{activeRelease.rolloutPercent}% Global Coverage</strong>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${activeRelease.rolloutPercent}%`,
                  background: 'var(--emerald)',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          {/* Changelog */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 8 }}>
            <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
              Changelog & Key Improvements:
            </strong>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {activeRelease.changelog.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Release History Table */}
      <div className="table-card">
        <div className="card-header">
          <h3 className="card-title">Release History & OTA Rollout Log</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Build #</th>
                <th>Platform</th>
                <th>Min Version</th>
                <th>Rollout %</th>
                <th>Force Update</th>
                <th>Release Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((rel) => (
                <tr key={rel.id}>
                  <td><strong style={{ color: '#fff' }}>{rel.version}</strong></td>
                  <td><code>#{rel.buildNumber}</code></td>
                  <td><span className="badge badge-purple">{rel.platform}</span></td>
                  <td>{rel.minSupportedVersion}</td>
                  <td>{rel.rolloutPercent}%</td>
                  <td>
                    {rel.forceUpdate ? (
                      <span className="badge badge-red">MANDATORY</span>
                    ) : (
                      <span className="badge badge-blue">OPTIONAL</span>
                    )}
                  </td>
                  <td>{rel.releaseDate}</td>
                  <td>
                    <StatusBadge status={rel.status === 'LIVE_PRODUCTION' ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Build Modal */}
      {isNewReleaseModalOpen && (
        <Modal
          isOpen={isNewReleaseModalOpen}
          onClose={() => setIsNewReleaseModalOpen(false)}
          title="Publish New Mobile App Release"
        >
          <form onSubmit={handleCreateRelease}>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Version String *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. v2.5.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Build Number *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="2500"
                  value={formData.buildNumber}
                  onChange={(e) => setFormData({ ...formData, buildNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Min Supported Version</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="v2.3.0"
                  value={formData.minSupportedVersion}
                  onChange={(e) => setFormData({ ...formData, minSupportedVersion: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Rollout %</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  className="form-input"
                  value={formData.rolloutPercent}
                  onChange={(e) => setFormData({ ...formData, rolloutPercent: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Binary APK / Download URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://cdn.fundlending.com/apps/..."
                value={formData.downloadUrl}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Release Notes & Changelog</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="List key fixes and features (one per line)..."
                value={formData.changelogText}
                onChange={(e) => setFormData({ ...formData, changelogText: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
              <input
                type="checkbox"
                id="forceUpdateChk"
                checked={formData.forceUpdate}
                onChange={(e) => setFormData({ ...formData, forceUpdate: e.target.checked })}
              />
              <label htmlFor="forceUpdateChk" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                Require Force Update (Block outdated app versions immediately)
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsNewReleaseModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Deploy Release OTA
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MobileAppUpdates;
