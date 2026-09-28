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
  CalendarDays,
  Clock,
  UserPlus,
  Receipt,
  User,
  Percent,
  Server,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOrg } from "../../context/OrgContext";
import logoImg from "../../assets/logo-tight.png";
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
    lendingConfig,
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
  useEffect(() => {
    if (pathOrgId && organizations.length > 0) {
      if (!activeOrg || String(activeOrg.id) !== String(pathOrgId)) {
        setActiveOrg(pathOrgId);
      }
    }
  }, [pathOrgId, activeOrg, organizations, setActiveOrg]);

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

    // Dynamic scheme checks from database lending config
  const isDailyEnabled =
    lendingConfig?.daily_loan_enabled !== false &&
    lendingConfig?.daily_loan_enabled !== 0 &&
    lendingConfig?.daily_loan_enabled !== '0' &&
    lendingConfig?.daily_loan_enabled !== 'false';

  const isWeeklyEnabled =
    lendingConfig?.weekly_loan_enabled !== false &&
    lendingConfig?.weekly_loan_enabled !== 0 &&
    lendingConfig?.weekly_loan_enabled !== '0' &&
    lendingConfig?.weekly_loan_enabled !== 'false';

  const isMonthlyEnabled =
    lendingConfig?.monthly_loan_enabled !== false &&
    lendingConfig?.monthly_loan_enabled !== 0 &&
    lendingConfig?.monthly_loan_enabled !== '0' &&
    lendingConfig?.monthly_loan_enabled !== 'false';

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

      { label: "Customer Ledgers", section: true },
      ...(isDailyEnabled
        ? [
            {
              path: `${orgPrefix}/shopkeepers`,
              label: "Shopkeeper Ledger",
              icon: Store,
            },
          ]
        : []),
      ...(isWeeklyEnabled
        ? [
            {
              path: `${orgPrefix}/weekly-customers`,
              label: "Weekly Customers",
              icon: Calendar,
            },
          ]
        : []),
      ...(isMonthlyEnabled
        ? [
            {
              path: `${orgPrefix}/monthly-customers`,
              label: "Monthly Customers",
              icon: Clock,
            },
          ]
        : []),

      { label: "Collections & Recovery", section: true },
      {
        path: `${orgPrefix}/calendar`,
        label: "Collection Calendar",
        icon: CalendarDays,
      },
      {
        path: `${orgPrefix}/reports`,
        label: "Reports & Recovery",
        icon: Receipt,
      },

      { label: "Loan Operations", section: true },
      {
        path: `${orgPrefix}/interest-rates`,
        label: "Lending Rates & Tenures",
        icon: Percent,
      },

      { label: "Borrower Management", section: true },
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
    ],
    branch_admin: [
      { label: "Branch Overview", section: true },
      { path: `${orgPrefix}/dashboard`, label: "Branch Dashboard", icon: LayoutDashboard },

      { label: "Customer Ledgers", section: true },
      ...(isDailyEnabled
        ? [
            {
              path: `${orgPrefix}/shopkeepers`,
              label: "Shopkeeper Ledger",
              icon: Store,
            },
          ]
        : []),
      ...(isWeeklyEnabled
        ? [
            {
              path: `${orgPrefix}/weekly-customers`,
              label: "Weekly Customers",
              icon: Calendar,
            },
          ]
        : []),
      ...(isMonthlyEnabled
        ? [
            {
              path: `${orgPrefix}/monthly-customers`,
              label: "Monthly Customers",
              icon: Clock,
            },
          ]
        : []),

      { label: "Collections & Recovery", section: true },
      {
        path: `${orgPrefix}/calendar`,
        label: "Collection Calendar",
        icon: CalendarDays,
      },
      {
        path: `${orgPrefix}/reports`,
        label: "Reports & Recovery",
        icon: Receipt,
      },

      { label: "Borrower Management", section: true },
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

      { label: "Branch Administration", section: true },
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

      { label: "Customer Collections", section: true },
      ...(isDailyEnabled
        ? [
            {
              path: "/admin/shopkeepers",
              label: "Shopkeeper Collections",
              icon: Store,
            },
          ]
        : []),
      ...(isWeeklyEnabled
        ? [
            {
              path: "/admin/weekly-customers",
              label: "Weekly Collections",
              icon: Calendar,
            },
          ]
        : []),

      { label: "Collections & Recovery", section: true },
      {
        path: "/admin/calendar",
        label: "Collection Calendar",
        icon: CalendarDays,
      },
      {
        path: "/admin/reports",
        label: "Collection Reports",
        icon: Receipt,
      },
    ],
  };

  const rawMenuItems =
    roleMenus[effectiveRole?.toLowerCase()] || roleMenus.superadmin || [];

  // Filter out any empty sections that have no child items
  const menuItems = rawMenuItems.filter((item, idx, arr) => {
    if (!item.section) return true;
    for (let i = idx + 1; i < arr.length; i++) {
      if (arr[i].section) return false;
      return true;
    }
    return false;
  });

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
            <img src={logoImg} alt="FinanceWeb" className="mobile-logo-image" />
          </div>
          <span className="mobile-brand-title">
            FinanceWeb
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
              title="FinanceWeb Platform"
            >
              <div className="logo-icon">
                <img src={logoImg} alt="FinanceWeb Logo" className="logo-image" />
              </div>
              <div className="company-name">
                <div className="company-title">
                  FinanceWeb
                </div>
                <div className="company-subtitle">
                  Lending Platform
                </div>
              </div>
            </div>
          </div>
        </div>


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
                  <span>{isBranchAdmin ? "Branch Profile" : "Organization Profile"}</span>
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
