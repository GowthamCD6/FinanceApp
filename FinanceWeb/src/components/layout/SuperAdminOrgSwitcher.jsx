import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import {
  Building,
  ChevronDown,
  ArrowLeft,
  Search,
  Check,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SuperAdminOrgSwitcher = () => {
  const { isSuperAdmin } = useAuth();
  const { organizations, activeOrg, setActiveOrg, clearActiveOrg } = useOrg();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isSuperAdmin) return null;

  const isInsideOrg = location.pathname.startsWith('/org/') || location.pathname.startsWith('/admin');

  // Filter organizations
  const filteredOrgs = organizations.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.name?.toLowerCase().includes(q) ||
      o.code?.toLowerCase().includes(q) ||
      (o.admin_name || '').toLowerCase().includes(q)
    );
  });

  const handleSelectOrg = (org) => {
    setActiveOrg(org.id);
    setDropdownOpen(false);
    setSearch('');
    // If currently on an org route, preserve sub-page
    const subPath = location.pathname.replace(/^\/org\/[^/]+/, '').replace(/^\/admin/, '');
    const targetPath = subPath ? `/org/${org.id}${subPath}` : `/org/${org.id}/dashboard`;
    navigate(targetPath);
  };

  const handleExitToSuperAdmin = () => {
    clearActiveOrg();
    setDropdownOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="sa-org-switcher-bar">
      <div className="sa-switcher-left">
        <div className="sa-switcher-tag">
          <Shield size={14} className="sa-shield-icon" />
          <span>SuperAdmin Multi-Tenant Authority</span>
        </div>

        {isInsideOrg && (
          <span className="sa-current-context">
            Managing: <strong>{activeOrg ? activeOrg.name : 'All Tenants'}</strong>
            {activeOrg?.code && <span className="sa-org-code-pill">{activeOrg.code}</span>}
          </span>
        )}
      </div>

      <div className="sa-switcher-actions" ref={dropdownRef}>
        {/* Organization Switcher Dropdown */}
        <div className="sa-dropdown-wrap">
          <button
            type="button"
            className="btn-switch-org"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Switch Organization Context"
          >
            <Building size={14} />
            <span>{activeOrg ? `Org: ${activeOrg.name}` : 'Switch Organization'}</span>
            <ChevronDown size={14} className={`caret-icon ${dropdownOpen ? 'rotate' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="sa-org-dropdown-menu">
              <div className="dropdown-search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search tenant by name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="dropdown-org-list">
                {filteredOrgs.length === 0 ? (
                  <div className="dropdown-empty">No matching organizations</div>
                ) : (
                  filteredOrgs.map((org) => {
                    const isSelected = activeOrg && String(activeOrg.id) === String(org.id);
                    return (
                      <div
                        key={org.id}
                        className={`dropdown-org-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectOrg(org)}
                      >
                        <div className="org-item-avatar">
                          {org.name?.charAt(0).toUpperCase() || 'O'}
                        </div>
                        <div className="org-item-info">
                          <div className="org-item-name">{org.name}</div>
                          <div className="org-item-sub">
                            <span>{org.code}</span>
                            <span>•</span>
                            <span>{org.total_customers || 0} Borrowers</span>
                            <span>•</span>
                            <span className={`status-tag status-${org.status?.toLowerCase() || 'active'}`}>
                              {org.status || 'ACTIVE'}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="item-check-icon" />}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="dropdown-footer-actions">
                <button
                  type="button"
                  className="btn-dropdown-hub"
                  onClick={handleExitToSuperAdmin}
                >
                  <Layers size={13} />
                  <span>Platform Organizations Hub</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Exit Button */}
        {isInsideOrg && (
          <button
            type="button"
            className="btn-exit-org-view"
            onClick={handleExitToSuperAdmin}
            title="Return to SuperAdmin Governance Hub"
          >
            <ArrowLeft size={14} />
            <span>Return to SuperAdmin</span>
          </button>
        )}
      </div>

      <style>{`
        .sa-org-switcher-bar {
          background: linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%);
          color: #ffffff;
          padding: 8px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 13px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .sa-switcher-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .sa-switcher-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: #a5b4fc;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-size: 11px;
        }

        .sa-shield-icon {
          color: #818cf8;
        }

        .sa-current-context {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e2e8f0;
          font-size: 13px;
        }

        .sa-org-code-pill {
          background: rgba(255, 255, 255, 0.15);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #f8fafc;
        }

        .sa-switcher-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .sa-dropdown-wrap {
          position: relative;
        }

        .btn-switch-org {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-switch-org:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.35);
        }

        .caret-icon {
          transition: transform 0.2s;
        }

        .caret-icon.rotate {
          transform: rotate(180deg);
        }

        .btn-exit-org-view {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #4f46e5;
          border: none;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-exit-org-view:hover {
          background: #4338ca;
        }

        /* Dropdown Menu */
        .sa-org-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
          z-index: 1000;
          overflow: hidden;
          color: #1e293b;
        }

        .dropdown-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
        }

        .dropdown-search-box input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 12.5px;
          outline: none;
          color: #0f172a;
        }

        .dropdown-org-list {
          max-height: 240px;
          overflow-y: auto;
          padding: 6px;
        }

        .dropdown-org-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .dropdown-org-item:hover {
          background: #f1f5f9;
        }

        .dropdown-org-item.selected {
          background: #e0e7ff;
        }

        .org-item-avatar {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: #4f46e5;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          flex-shrink: 0;
        }

        .org-item-info {
          flex: 1;
          min-width: 0;
        }

        .org-item-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .org-item-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .item-check-icon {
          color: #4f46e5;
          flex-shrink: 0;
        }

        .dropdown-empty {
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }

        .dropdown-footer-actions {
          padding: 8px;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
        }

        .btn-dropdown-hub {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-dropdown-hub:hover {
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminOrgSwitcher;
