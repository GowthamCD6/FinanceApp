# 💼 FinanceFlow Web Portal

A modern, high-performance web dashboard built with **React 18**, **Vite**, and a custom **Glassmorphism Design System** for managing microfinance, shopkeeper loans, field agent collections, and multi-tenant organization governance.

---

## 🚀 Key Features & Implemented Modules

### 1. 🔐 Authentication & Session Management
- **`LoginPage.jsx`**:
  - Secure role-based login (SuperAdmin, Admin, Field Agent).
  - Demo mode credentials toggle with instant role switching.
  - JWT token storage and authenticated request interceptors.
  - Form validation with error handling and feedback alerts.

---

### 2. 👑 SuperAdmin Portal (Multi-Tenant Governance & Platform Operations)
- **`Dashboard/Dashboard.jsx`**: Platform-wide consolidated financial metrics, organization registry, and direct workspace drill-down.
- **`Organization/CreateOrganization.jsx`**: Multi-step branch onboarding wizard for lending rules and initial admin assignment.
- **`UserPaymentOverview/UserPaymentOverview.jsx`**: Global cross-organization payment transaction ledger, collection volumes, settlement auditing, and digital receipt generation.
- **`ApiAnalytics/ApiAnalytics.jsx`**: Real-time API telemetry, request throughput, response latency distributions (p50, p95), server uptime (99.98%), and idempotency deduplication status.
- **`SuperAdmin/SuperAdminUsers.jsx`**: Root platform administrators management, RBAC privilege sets, 2FA security enforcement, and session logs.
- **`DefaultCategories.jsx`**: Role and capacity policy configuration: set max user counts per role, default loan limits, default interest rates, and installment tenures.
- **`MobileUpdates/MobileAppUpdates.jsx`**: Mobile companion app (`FinanceApp`) OTA release center with build numbers, force update toggles, rollout percentage sliders, and APK download URLs.
- **`PrivacyPolicy/PrivacyPolicy.jsx`**: Platform privacy policy and statutory financial data retention compliance manager with live borrower preview.
- **`AditLog/AuditLogsBroadcast.jsx`**: Dual-tabbed security surveillance suite with immutable system activity audit trail and platform-wide broadcast notification dispatcher.

---

### 3. 🏢 Admin & Branch Management Portal
- **`AdminDashboard.jsx`**:
  - Real-time KPI cards: Total Disbursed, Daily Collections, Outstanding Balance, Default Rate.
  - Visual collection progress tracker with target goals.
  - Live activity feed of recent transactions and overdue alerts.
- **`Shopkeepers.jsx` (Borrower CRM)**:
  - Complete borrower management for shopkeepers and small merchants.
  - Search, filter by loan status (Active, Overdue, Settled), and KYC status.
  - Detailed modal view with repayment history, active loan schedules, and customer ledger.
  - Quick action to issue new loans directly to selected merchants.
- **`AdminLoans.jsx` (Loan Portfolio & EMI Operations)**:
  - Full loan lifecycle management: Application, Approval, Active, Settled, and Defaulted.
  - Loan disbursement workflow with interest, tenure, and installment schedule calculation.
  - Fast repayment entry modal with instant balance recalculation and receipt view.
- **`ManageUsers.jsx` & `AddUser.jsx` (Staff & Field Agent Management)**:
  - Agent and employee directory with role-based permissions (Branch Admin, Field Agent, Collector).
  - Performance tracking (Total collections handled, recovery rate, assigned routes).
  - Seamless form to invite and configure new staff accounts.
- **`AdminReports.jsx` (Financial Analytics & Reporting)**:
  - Comprehensive revenue, collection, and NPA (Non-Performing Asset) reports.
  - Custom date-range filtering (Today, This Week, This Month, Custom).
  - Agent collection efficiency breakdown.
  - Data export to CSV / formatted printable views.
- **`AdminProfile.jsx`**:
  - Organization and branch profile settings, notification toggles, and security configurations.

---

### 4. 🎨 Design System & Layout Components
- **`Sidebar.jsx` & `Navbar.jsx`**:
  - Responsive collapsible sidebar with dynamic route links based on active role and organization context.
  - Top navigation bar featuring search, notification bells, quick action buttons, active organization switcher, and user profile menu.
- **`AppLayout.jsx` & `OrgAdminLayout.jsx`**:
  - Flexible layout wrappers supporting global SuperAdmin routes and branch-specific scoped routes (`/org/:orgId/*`).
- **`StatCard.jsx`, `Badge.jsx`, `Modal.jsx`**:
  - Reusable, accessible UI components with smooth micro-interactions, dark glassmorphism styling, and glowing accent states.
- **Design Foundation (`tokens.css` & `index.css`)**:
  - Cohesive dark-mode theme with vibrant accents, custom gradient cards, custom scrollbars, and modern typography.

---

### 5. 🔌 Data & State Layer
- **`AuthContext.jsx`**: Global authentication state, JWT user session, and permission helpers.
- **`OrgContext.jsx`**: Multi-tenant state handling for switching active branches and organization context seamlessly.
- **`api.js`**:
  - Live production REST API client communicating directly with the backend server and TiDB Cloud database (`http://localhost:5000/api`).

---

## 📁 Project Directory Structure

```text
FinanceWeb/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx            # Status indicators & chip components
│   │   │   ├── Modal.jsx            # Dynamic glassmorphic dialog modal
│   │   │   └── StatCard.jsx         # KPI summary card with trend indicators
│   │   └── layout/
│   │       ├── AppLayout.jsx        # Root application layout
│   │       ├── Navbar.jsx           # Topbar with org switcher & profile menu
│   │       ├── OrgAdminLayout.jsx   # Branch-scoped layout wrapper
│   │       └── Sidebar.jsx          # Collapsible responsive sidebar
│   ├── context/
│   │   ├── AuthContext.jsx          # Auth state & token management
│   │   └── OrgContext.jsx           # Organization / tenant switcher state
│   ├── pages/
│   │   ├── Admin/                   # Branch Admin operational pages
│   │   ├── Superadmin/              # Platform SuperAdmin governance pages
│   │   └── auth/                    # Login and onboarding
│   ├── services/
│   │   └── api.js                   # Live Backend REST API client
│   ├── styles/
│   │   ├── index.css                # Global styles, layout utilities, animations
│   │   └── tokens.css               # Color variables, gradients, spacing tokens
│   ├── App.jsx                      # Route definitions and application tree
│   └── main.jsx                     # Application entry point
├── package.json
└── vite.config.js
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```
