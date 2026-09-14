-- ==============================================================================
-- Fund Circulation & Lending Management Engine — Clean Base Seed Data
-- Retains System Roles, Granular Permissions, System Settings & Super Admin
-- ==============================================================================

-- 1. SYSTEM ROLES
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN', 'Complete platform administration across all organizations'),
('ORG_ADMIN', 'Organization Master Administrator managing all branches, staff, loans, and settings'),
('ADMIN', 'Organization Administrator managing branches, loans, and users'),
('BRANCH_ADMIN', 'Branch Administrator strictly managing operations, staff, borrowers, and collections for their assigned branch only'),
('FIELD_AGENT', 'Field executive managing routes, disbursements, and physical collections'),
('SHOPKEEPER', 'Merchant borrower with daily micro-credit facility'),
('USER', 'Borrower / Customer with loan portfolio and schedule visibility')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 2. GRANULAR SYSTEM PERMISSIONS
INSERT INTO permissions (name, description) VALUES
('SYSTEM_ALL', 'Full system administration and configuration'),
('ORG_MANAGE', 'Create, edit, suspend, and view tenant organizations'),
('BRANCH_MANAGE', 'Create and configure organizational branches'),
('CUSTOMER_CREATE', 'Create and register new borrowers and shopkeepers'),
('CUSTOMER_READ', 'View customer details and lending lifecycles'),
('CUSTOMER_UPDATE', 'Modify borrower information'),
('LOAN_CREATE', 'Initiate weekly and daily loan applications'),
('LOAN_APPROVE', 'Approve pending loan applications'),
('LOAN_DISBURSE', 'Disburse loans from central fund'),
('LOAN_READ', 'View loan portfolio and schedules'),
('PAYMENT_CREATE', 'Collect repayments and split principal vs income'),
('PAYMENT_READ', 'View repayment receipts and history'),
('FUND_MANAGE', 'Inject capital and manage vault balances'),
('FUND_READ', 'View central fund circulation and cash position'),
('EXPENSE_CREATE', 'Log operational expenses with immediate cash/profit impact'),
('REPORT_VIEW', 'Access collections, outstanding, loan, profit, and cash flow reports'),
('USER_MANAGE', 'Manage employee credentials and access levels')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 3. ROLE PERMISSION MAPPINGS
-- Super Admin: ALL permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'SUPER_ADMIN';

-- Org Admin: All Org and Branch operations
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name IN ('ORG_ADMIN', 'ADMIN') AND p.name IN (
    'ORG_MANAGE', 'BRANCH_MANAGE',
    'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
    'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
    'PAYMENT_CREATE', 'PAYMENT_READ',
    'FUND_READ', 'EXPENSE_CREATE', 'REPORT_VIEW', 'USER_MANAGE'
);

-- Branch Admin: Branch-scoped operations
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'BRANCH_ADMIN' AND p.name IN (
    'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
    'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
    'PAYMENT_CREATE', 'PAYMENT_READ',
    'FUND_READ', 'REPORT_VIEW', 'USER_MANAGE'
);

-- Field Agent: Collections and Customer Creation
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'FIELD_AGENT' AND p.name IN (
    'CUSTOMER_CREATE', 'CUSTOMER_READ',
    'LOAN_READ', 'PAYMENT_CREATE', 'PAYMENT_READ'
);

-- User / Shopkeeper: View own records
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name IN ('USER', 'SHOPKEEPER') AND p.name IN (
    'CUSTOMER_READ', 'LOAN_READ', 'PAYMENT_READ'
);

-- 4. DEFAULT CATEGORIES (WEB & MOBILE CONFIG)
INSERT INTO default_category_configs 
(category_code, name, customer_type, description, max_users_per_branch, default_min_loan, default_max_loan, default_interest_rate, repayment_frequency, tenure_installments, grace_period_days, status) 
VALUES
('CAT-BORROWER-WK', 'Borrower (Weekly Installment)', 'COMMON_CUSTOMER', 'Standard individual and worker micro-loans with 10-week recurring repayments.', 500, 10000.00, 50000.00, 10.00, 'WEEKLY', 10, 3, 'ACTIVE'),
('CAT-MERCHANT-DLY', 'Merchant (Daily Installment)', 'SHOPKEEPER', 'Retail shopkeepers and stall merchants with 25-day rapid daily collections.', 200, 15000.00, 100000.00, 12.50, 'DAILY', 25, 1, 'ACTIVE'),
('CAT-FIELD-AGENT', 'Field Collection Agent', 'FIELD_AGENT', 'Mobile route officers equipped with mobile app for daily & weekly cash/UPI recovery.', 15, 0.00, 0.00, 0.00, 'N/A', 0, 0, 'ACTIVE'),
('CAT-BRANCH-ADMIN', 'Branch Manager / Staff', 'ADMIN', 'Branch operational staff managing customer KYC, disbursements, and reconciliation.', 5, 0.00, 0.00, 0.00, 'N/A', 0, 0, 'ACTIVE'),
('CAT-BORROWER-MO', 'Monthly Salaried Borrower (EMI)', 'COMMON_CUSTOMER', '12-Month structured EMI micro-loans for salaried individuals and established businesses (15% flat interest).', 300, 25000.00, 500000.00, 15.00, 'MONTHLY', 12, 5, 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 5. SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES
('PLATFORM_NAME', 'FinanceFlow Microfinance Engine', 'GENERAL', 'Platform branding name'),
('DEFAULT_CURRENCY', 'INR', 'FINANCIAL', 'Default system currency'),
('MAX_CONCURRENT_LOANS_DEFAULT', '2', 'LENDING', 'Default maximum active loans per borrower'),
('MAINTENANCE_MODE', 'false', 'SYSTEM', 'Platform-wide maintenance toggle')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), description=VALUES(description);

-- 6. PRIMARY SUPER ADMIN USER
-- Password hash for 'Admin@123'
INSERT INTO users (id, organization_id, branch_id, name, phone, email, password_hash, role_type, status)
VALUES
(1, NULL, NULL, 'GOWTHAM', '9999999999', 'gowthamnaveen124@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPER_ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  phone=VALUES(phone), 
  email=VALUES(email), 
  role_type=VALUES(role_type), 
  status=VALUES(status);

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 1, id FROM roles WHERE name = 'SUPER_ADMIN';
