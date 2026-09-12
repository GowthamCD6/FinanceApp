import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronDown,
  LogOut,
  X,
  Menu,
  Building,
  PlusCircle,
  DollarSign,
  Activity,
  ShieldCheck,
  Layers,
  Smartphone,
  Bell,
  Store,
  Calendar,
  UserPlus,
  CreditCard,
  Receipt,
  Landmark,
  ArrowLeft,
  User,
  Percent,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOrg } from "../../context/OrgContext";
import { api } from "../../services/api";
import "./Sidebar.css";
import "./SidebarUserProfile.css";

export const Sidebar = ({ userRole: propUserRole, userData: propUserData, onLogout: propOnLogout }) => {
  const { user, logout } = useAuth();
  const { activeOrg, organizations, setActiveOrg, clearActiveOrg } = useOrg();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ── Auth Guard: redirect to login if no token/user ──
  const token = localStorage.getItem('finance_token') || sessionStorage.getItem('finance_token');
  useEffect(() => {
    if (!token && !user) {
      navigate('/login', { replace: true });
    }
  }, [token, user, navigate]);

  // Sync active organization directly from URL path (/org/:orgId/...)
  const orgMatch = location.pathname.match(/^\/org\/([^/]+)/);
  const pathOrgId = orgMatch && orgMatch[1] !== "create" ? orgMatch[1] : null;

  const isInsideOrg =
    location.pathname.startsWith("/org/") &&
    !location.pathname.startsWith("/org/create");
  const isDirectAdmin = location.pathname.startsWith("/admin");

  const [metrics, setMetrics] = useState({ todayDailyCollected: 4200, todayDailyTarget: 5850 });

  useEffect(() => {
    if (pathOrgId && organizations.length > 0) {
      if (!activeOrg || String(activeOrg.id) !== String(pathOrgId)) {
        setActiveOrg(pathOrgId);
      }
    }
  }, [pathOrgId, activeOrg, organizations, setActiveOrg]);

  useEffect(() => {
    if (isInsideOrg) {
      api.getAdminDashboardMetrics()
        .then((data) => {
          if (data) setMetrics(data);
        })
        .catch(() => {});
    }
  }, [isInsideOrg, activeOrg]);

  const formatCurrency = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const effectiveRole =
    propUserRole ||
    (isInsideOrg || isDirectAdmin
      ? "admin"
      : user?.role?.toLowerCase() || "superadmin");

  const orgPrefix =
    isInsideOrg && (activeOrg || pathOrgId)
      ? `/org/${activeOrg?.id || pathOrgId}`
      : "/admin";

  const effectiveUserData = propUserData || {
    username: user?.name || (effectiveRole === "superadmin" ? "Super Admin" : "Branch Admin"),
    roleName:
      isInsideOrg && activeOrg
        ? `${activeOrg.name} (${activeOrg.code})`
        : isDirectAdmin
        ? "Branch Operations"
        : "Platform SuperAdmin",
  };

  const handleLogout = () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      logout();
      navigate("/login");
    }
  };

  const handleBrandClick = () => {
    clearActiveOrg();
    setMobileOpen(false);
    navigate("/dashboard");
  };

  const roleMenus = {
    superadmin: [
      { label: "Overview", section: true },
      { path: "/dashboard", label: "Organizations Hub", icon: Building },
      { path: "/org/create", label: "Create Organization", icon: PlusCircle },
      { label: "Financial Governance", section: true },
      { path: "/superadmin/payments", label: "User Payments", icon: DollarSign },
      { label: "System & Governance", section: true },
      {
        label: "Platform Governance",
        icon: ShieldCheck,
        isDropdown: true,
        children: [
          {
            path: "/superadmin/analytics",
            label: "API Analytics",
            icon: Activity,
          },
          {
            path: "/superadmin/users",
            label: "Super Admin Users",
            icon: Users,
          },
          {
            path: "/superadmin/categories",
            label: "Default Categories",
            icon: Layers,
          },
          {
            path: "/superadmin/app-updates",
            label: "Mobile App Updates",
            icon: Smartphone,
          },
          {
            path: "/superadmin/privacy",
            label: "Privacy Policy",
            icon: FileText,
          },
          {
            path: "/superadmin/audit",
            label: "Audit Logs & Alerts",
            icon: Bell,
          },
        ],
      },
    ],
    admin: [
      { label: "Overview", section: true },
      { path: `${orgPrefix}/dashboard`, label: "Admin Dashboard", icon: LayoutDashboard },
      { label: "Customer Ledger", section: true },
      {
        path: `${orgPrefix}/shopkeepers`,
        label: "Shopkeeper Ledger",
        icon: Store,
      },
      {
        path: `${orgPrefix}/weekly-customers`,
        label: "Weekly Customers",
        icon: Calendar,
      },
      {
        path: `${orgPrefix}/users`,
        label: "Manage Borrowers",
        icon: Users,
      },
      {
        path: `${orgPrefix}/users/add`,
        label: "Onboard Borrower",
        icon: UserPlus,
      },
      { label: "Loan Operations", section: true },
      {
        path: `${orgPrefix}/loans`,
        label: "Loan Portfolio",
        icon: CreditCard,
      },
      {
        path: `${orgPrefix}/interest-rates`,
        label: "Lending Rates & Tenures",
        icon: Percent,
      },
      {
        path: `${orgPrefix}/reports`,
        label: "Reports & Recovery",
        icon: Receipt,
      },
      { label: "Administration", section: true },
      {
        path: `${orgPrefix}/profile`,
        label: "Branch Profile",
        icon: User,
      },
      {
        path: "/dashboard",
        label: "SuperAdmin Portal",
        icon: ArrowLeft,
        onClick: () => clearActiveOrg(),
      },
    ],
  };

  const menuItems =
    roleMenus[effectiveRole?.toLowerCase()] || roleMenus.superadmin || [];

  return (
    <div className="layout-root">
      {/* Mobile Top Navigation Bar */}
      <header className="mobile-top-bar">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            <Landmark size={18} color="#ffffff" />
          </div>
          <span className="mobile-brand-title">
            {activeOrg ? activeOrg.name : "Finance Web"}
          </span>
        </div>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Header Branding */}
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>

          <div className="header-content">
            <div
              className="logo-section"
              onClick={handleBrandClick}
              title="FinanceWeb Governance"
            >
              <div className="logo-icon">
                <span className="logo-text">
                  <Landmark size={20} />
                </span>
              </div>
              <div className="company-name">
                <div className="company-title">
                  {isInsideOrg && activeOrg ? activeOrg.name : "Finance Web"}
                </div>
                <div className="company-subtitle">
                  {isInsideOrg && activeOrg
                    ? activeOrg.code
                    : "Platform Governance"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Org Context & Field Collection Progress */}
        {isInsideOrg && activeOrg && (
          <div className="sidebar-org-card">
            <div className="sidebar-org-badge-row">
              <span className="sidebar-org-pill">
                <Building size={13} color="#1976d2" />
                {activeOrg.name}
              </span>
              <span className="sidebar-org-code">{activeOrg.code}</span>
            </div>
            <div className="sidebar-ticker-stat">
              <span>Daily Recoveries:</span>
              <span className="val-green">
                {formatCurrency(metrics?.todayDailyCollected || 0)} /{" "}
                {formatCurrency(metrics?.todayDailyTarget || 5850)}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => {
            if (item.section) {
              return (
                <div key={index} className="nav-section">
                  <span className="section-label">{item.label}</span>
                </div>
              );
            }

            const Icon = item.icon;

            if (item.isDropdown) {
              const isAnyChildActive = item.children.some(
                (child) => location.pathname === child.path
              );

              return (
                <div key={index} className="nav-dropdown">
                  <div
                    className={`nav-item dropdown-trigger ${
                      isAnyChildActive ? "active" : ""
                    }`}
                    onClick={() => setGovernanceOpen(!governanceOpen)}
                    title={item.label}
                  >
                    {isAnyChildActive && <div className="active-indicator" />}
                    <Icon className="nav-icon" size={20} />
                    <span className="nav-label">{item.label}</span>
                    <ChevronDown
                      className={`dropdown-arrow ${
                        governanceOpen ? "open" : ""
                      }`}
                      size={16}
                    />
                  </div>

                  {governanceOpen && (
                    <div className="dropdown-content">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = location.pathname === child.path;

                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`nav-item sub-item ${
                              isActive ? "active" : ""
                            }`}
                            title={child.label}
                            onClick={handleLinkClick}
                          >
                            {isActive && <div className="active-indicator" />}
                            <ChildIcon className="nav-icon" size={17} />
                            <span className="nav-label">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                title={item.label}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  handleLinkClick();
                }}
              >
                {isActive && <div className="active-indicator" />}
                <Icon className="nav-icon" size={20} />
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer & Actions */}
        <div className="sidebar-footer">
          <div
            className="user-profile"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title={effectiveUserData?.username}
          >
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <div className="user-name">
                {effectiveUserData?.username || "User"}
              </div>
              <div className="user-role">
                {effectiveUserData?.roleName || "Role"}
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`user-menu-icon ${userMenuOpen ? "open" : ""}`}
            />
          </div>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="udh-name">{effectiveUserData?.username}</div>
                <div className="udh-role">{effectiveUserData?.roleName}</div>
              </div>

              {isInsideOrg && activeOrg && (
                <button
                  type="button"
                  className="dropdown-action-btn"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(`${orgPrefix}/profile`);
                  }}
                >
                  <User size={15} />
                  <span>Branch Profile</span>
                </button>
              )}

              {isInsideOrg && activeOrg && (
                <button
                  type="button"
                  className="dropdown-action-btn"
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleBrandClick();
                  }}
                >
                  <ExternalLink size={15} />
                  <span>SuperAdmin Portal</span>
                </button>
              )}

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="layout-content-wrapper">
        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .layout-root {
          min-height: 100vh;
          display: flex;
          background: #F8FAFC;
        }

        .mobile-top-bar {
          display: none;
        }

        .layout-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: var(--sidebar-width, 260px);
          min-width: 0;
          min-height: 100vh;
        }

        .layout-main {
          flex: 1;
          padding: 2rem 2.25rem;
          max-width: 1540px;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .layout-root {
            flex-direction: column;
          }

          .mobile-top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            padding: 0 16px;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          }

          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            color: #1e293b;
            cursor: pointer;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .mobile-brand-icon {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: #1976d2;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-brand-title {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
          }

          .layout-content-wrapper {
            margin-left: 0 !important;
          }

          .layout-main {
            padding: 1.25rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
