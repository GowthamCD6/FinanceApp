import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { StatusBadge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Smartphone,
  CheckCircle2,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export const MobileAppUpdates = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewReleaseModalOpen, setIsNewReleaseModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    version_name: 'v2.5.0',
    version_code: 25,
    platform: 'ANDROID',
    force_update: false,
    min_supported_version: 'v2.3.0',
    download_url: '',
    release_title: 'v2.5.0 Feature Release',
    release_notes: 'New feature release with speed improvements',
  });

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const data = await api.governance.getAppVersions();
      setReleases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load app releases from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const activeRelease = releases[0];

  const handleCreateRelease = async (e) => {
    e.preventDefault();
    try {
      await api.governance.createAppVersion({
        platform: formData.platform,
        version_name: formData.version_name,
        version_code: parseInt(formData.version_code, 10),
        release_title: formData.release_title || `${formData.version_name} Release`,
        release_notes: formData.release_notes,
        download_url: formData.download_url || `https://downloads.fundlending.com/builds/financeflow-${formData.version_name}.apk`,
        min_supported_version: formData.min_supported_version,
        force_update: formData.force_update,
        status: 'ACTIVE',
      });
      setIsNewReleaseModalOpen(false);
      setFeedback(`Mobile release ${formData.version_name} published to database!`);
      await fetchReleases();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to create release:', err);
    }
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
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>{activeRelease.version_name}</h2>
                  <span className="badge badge-emerald">Active Production Live</span>
                  {activeRelease.force_update && <span className="badge badge-red">Force Update Mandatory</span>}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Build #{activeRelease.version_code} • Released: {activeRelease.created_at ? new Date(activeRelease.created_at).toISOString().slice(0, 10) : 'Active'} • Min Supported: {activeRelease.min_supported_version || 'v2.0.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Release Notes */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 8 }}>
            <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
              Release Title & Changelog:
            </strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {activeRelease.release_notes || activeRelease.release_title || 'Optimized offline synchronization and field route management.'}
            </p>
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
                <th>Force Update</th>
                <th>Release Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading releases from database...</td>
                </tr>
              ) : releases.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No release history recorded yet.</td>
                </tr>
              ) : (
                releases.map((rel) => (
                  <tr key={rel.id}>
                    <td><strong style={{ color: '#fff' }}>{rel.version_name}</strong></td>
                    <td><code>#{rel.version_code}</code></td>
                    <td><span className="badge badge-purple">{rel.platform}</span></td>
                    <td>{rel.min_supported_version || 'N/A'}</td>
                    <td>
                      {rel.force_update ? (
                        <span className="badge badge-red">MANDATORY</span>
                      ) : (
                        <span className="badge badge-blue">OPTIONAL</span>
                      )}
                    </td>
                    <td>{rel.created_at ? new Date(rel.created_at).toISOString().slice(0, 10) : 'Live'}</td>
                    <td>
                      <StatusBadge status={rel.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Release Modal */}
      {isNewReleaseModalOpen && (
        <Modal
          isOpen={isNewReleaseModalOpen}
          onClose={() => setIsNewReleaseModalOpen(false)}
          title="Publish New Mobile Build (FinanceApp)"
        >
          <form onSubmit={handleCreateRelease}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Version Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.version_name}
                  onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
                  placeholder="e.g. v2.5.0"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Build Number</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.version_code}
                  onChange={(e) => setFormData({ ...formData, version_code: e.target.value })}
                  placeholder="e.g. 25"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Platform</label>
                <select
                  className="form-input"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="ANDROID">Android APK</option>
                  <option value="IOS">iOS IPA</option>
                  <option value="WEB">Web App</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Min Supported Version</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.min_supported_version}
                  onChange={(e) => setFormData({ ...formData, min_supported_version: e.target.value })}
                  placeholder="e.g. v2.2.0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Release Title</label>
              <input
                type="text"
                className="form-input"
                value={formData.release_title}
                onChange={(e) => setFormData({ ...formData, release_title: e.target.value })}
                placeholder="Release summary..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Release Notes / Changelog</label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.release_notes}
                onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                placeholder="List major changes..."
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.force_update}
                  onChange={(e) => setFormData({ ...formData, force_update: e.target.checked })}
                />
                Force Update Mandatory (Block older versions on app launch)
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsNewReleaseModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Publish to TiDB
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MobileAppUpdates;
