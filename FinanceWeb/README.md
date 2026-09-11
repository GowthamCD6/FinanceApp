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

### 2. 👑 SuperAdmin Portal (Multi-Tenant Governance)
- **`SuperAdminDashboard.jsx`**:
  - Platform-wide consolidated financial metrics (Total Disbursed, Collections, Active Borrowers).
  - Organization directory with status monitoring, branch statistics, and direct workspace drill-down.
  - Real-time revenue insights and aggregated portfolio health checks.
- **`CreateOrganization.jsx`**:
  - Multi-step onboarding for new branches/companies.
  - Configuration of lending terms, interest rules, collection cycles (Daily / Weekly / Monthly), and initial admin assignment.

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
- **`AuthContext.jsx`**: Global authentication state, user session, and permission helpers.
- **`OrgContext.jsx`**: Multi-tenant state handling for switching active branches and organization context seamlessly.
- **`api.js` & `mockData.js`**:
  - Resilient API client configured for backend integration (`http://localhost:5000/api`).
  - Automatic fallback to rich mock data when backend services are offline, enabling full offline exploration and UI testing.

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
│   │   ├── Admin/
│   │   │   ├── AddUser.jsx          # Staff onboarding form
│   │   │   ├── AdminDashboard.jsx    # Branch KPI & financial overview
│   │   │   ├── AdminLoans.jsx       # Loan issuance & repayment ledger
│   │   │   ├── AdminProfile.jsx     # Branch profile & preferences
│   │   │   ├── AdminReports.jsx     # Financial audit & collection reports
│   │   │   ├── ManageUsers.jsx      # Agent & staff management table
│   │   │   └── Shopkeepers.jsx      # Merchant directory & CRM profile
│   │   ├── Superadmin/
│   │   │   ├── Organization/
│   │   │   │   └── CreateOrganization.jsx # Organization creation wizard
│   │   │   └── SuperAdminDashboard.jsx    # Multi-tenant oversight dashboard
│   │   └── auth/
│   │       └── LoginPage.jsx        # Glassmorphic auth portal
│   ├── services/
│   │   ├── api.js                   # REST API service client with fallback
│   │   └── mockData.js              # Comprehensive demo dataset
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
