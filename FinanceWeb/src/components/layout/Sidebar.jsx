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
  Clock,
  UserPlus,
  CreditCard,
  Receipt,
  Landmark,
  ArrowLeft,
  User,
  Percent,
  ExternalLink,
  Server,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOrg } from "../../context/OrgContext";
import { api } from "../../services/api";
import "./Sidebar.css";

export const Sidebar = ({ userRole: propUserRole, userData: propUserData, onLogout: propOnLogout }) => {
  const {
    user,
    logout,
    isSuperAdmin,
    isOrgAdmin,
    isBranchAdmin,
    userBranchName,
    userBranchId,
    userOrgName,
  } = useAuth();
  const {
    activeOrg,
    organizations,
    setActiveOrg,
    clearActiveOrg,
    branches,
    activeBranchId,
    setActiveBranchId,
    activeBranch,
  } = useOrg();
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
  }, [isInsideOrg, activeOrg, activeBranchId]);

  const formatCurrency = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const userRoleStr = (
    user?.role_type ||
    user?.role ||
    (user?.roles && user?.roles[0]) ||
    ""
  ).toLowerCase();

  const isFieldStaff = userRoleStr === "field_agent" || (user?.roles || []).includes("FIELD_AGENT");

  const effectiveRole =
    propUserRole ||
    (isFieldStaff
      ? "field_agent"
      : isBranchAdmin
      ? "branch_admin"
      : isInsideOrg || isDirectAdmin
      ? "admin"
      : userRoleStr === "admin"
      ? "admin"
      : "superadmin");

  const orgPrefix =
    isInsideOrg && (activeOrg || pathOrgId)
      ? `/org/${activeOrg?.id || pathOrgId}`
      : "/admin";

  const effectiveUserData = propUserData || {
    username: user?.name || (isSuperAdmin ? "Super Admin" : isBranchAdmin ? "Branch Admin" : isFieldStaff ? "Route Staff" : "Org Admin"),
    roleName:
      isBranchAdmin
        ? `Branch Admin • ${userBranchName || activeBranch?.name || 'Local Branch'}`
        : isInsideOrg && activeOrg
        ? `${activeOrg.name} (${activeOrg.code})`
        : isFieldStaff
        ? "Field Route Officer"
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
    if (isBranchAdmin || (!isSuperAdmin && activeOrg)) {
      setMobileOpen(false);
      navigate(`${orgPrefix}/dashboard`);
    } else {
      clearActiveOrg();
      setMobileOpen(false);
      navigate("/dashboard");
    }
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
            path: "/superadmin/kubernetes",
            label: "Kubernetes & Infra",
            icon: Server,
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
        path: `${orgPrefix}/monthly-customers`,
        label: "Monthly Customers",
        icon: Clock,
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
        path: `${orgPrefix}/branches`,
        label: "Manage Branches",
        icon: Building,
      },
      {
        path: `${orgPrefix}/staff`,
        label: "Staff & Collectors",
        icon: ShieldCheck,
      },
      {
        path: `${orgPrefix}/profile`,
        label: "Organization Profile",
        icon: User,
      },
      ...(isSuperAdmin
        ? [
            {
              path: "/dashboard",
              label: "SuperAdmin Portal",
              icon: ArrowLeft,
              onClick: () => clearActiveOrg(),
            },
          ]
        : []),
    ],
    branch_admin: [
      { label: "Branch Overview", section: true },
      { path: `${orgPrefix}/dashboard`, label: "Branch Dashboard", icon: LayoutDashboard },
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
        path: `${orgPrefix}/monthly-customers`,
        label: "Monthly Customers",
        icon: Clock,
      },
      {
        path: `${orgPrefix}/users`,
        label: "Branch Borrowers",
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
        label: "Branch Loans",
        icon: CreditCard,
      },
      {
        path: `${orgPrefix}/reports`,
        label: "Reports & Recovery",
        icon: Receipt,
      },
      { label: "Branch Team", section: true },
      {
        path: `${orgPrefix}/staff`,
        label: "Field Staff & Collectors",
        icon: ShieldCheck,
      },
      {
        path: `${orgPrefix}/profile`,
        label: "Branch Profile",
        icon: User,
      },
    ],
    field_agent: [
      { label: "Field Operations", section: true },
      { path: "/staff/dashboard", label: "Route Staff Portal", icon: LayoutDashboard },
      { label: "Daily Collections", section: true },
      { path: "/admin/shopkeepers", label: "Shopkeeper Collections", icon: Store },
      { path: "/admin/weekly-customers", label: "Weekly Collections", icon: Calendar },
      { label: "Ledger & Reports", section: true },
      { path: "/admin/reports", label: "Collection Reports", icon: Receipt },
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

        {/* Active Org Context & Branch Scoping & Progress */}
        {isInsideOrg && activeOrg && (
          <div className="sidebar-org-card">
            <div className="sidebar-org-badge-row">
              <span className="sidebar-org-pill">
                <Building size={13} color="#1976d2" />
                {activeOrg.name}
              </span>
              <span className="sidebar-org-code">{activeOrg.code}</span>
            </div>

            {/* Branch Context Indicator / Selector */}
            {isBranchAdmin ? (
              <div className="sidebar-branch-pill">
                <MapPin size={12} color="#059669" />
                <span className="sidebar-branch-name">
                  {userBranchName || activeBranch?.name || 'Allocated Branch'}
                </span>
                <span className="sidebar-branch-tag">Locked</span>
              </div>
            ) : (
              <div className="sidebar-branch-selector-wrap">
                <div className="sidebar-branch-label-row">
                  <span className="sidebar-branch-lbl">
                    <MapPin size={11} /> Branch Scope:
                  </span>
                </div>
                <select
                  className="sidebar-branch-select"
                  value={activeBranchId || 'ALL'}
                  onChange={(e) => setActiveBranchId(e.target.value)}
                  title="Filter all ledger, loans & collections by branch"
                >
                  <option value="ALL">🏢 All Branches (Aggregated)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      📍 {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

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
    </div>
  );
};

export default Sidebar;
