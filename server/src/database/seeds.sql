-- ==============================================================================
-- Fund Circulation & Lending Management Engine — Multi-Tenant Seed Data
-- ==============================================================================

-- 1. ORGANIZATIONS (TENANTS)
INSERT INTO organizations (id, code, name, plan, status, currency, initial_capital, available_cash, total_lent, admin_name, admin_email, phone, address, city, state)
VALUES 
(1, 'ORG-APEX', 'Apex Finance Ltd', 'ENTERPRISE', 'ACTIVE', 'INR', 1000000.00, 222000.00, 760000.00, 'Rajesh Kumar', 'rajesh@apexfinance.com', '9876543210', '14, Financial District', 'Chennai', 'Tamil Nadu'),
(2, 'ORG-HORIZON', 'Horizon Microcredit', 'PRO', 'ACTIVE', 'INR', 500000.00, 185000.00, 315000.00, 'Priya Sharma', 'priya@horizoncredit.in', '9840123456', '88, Gandhi Road', 'Coimbatore', 'Tamil Nadu'),
(3, 'ORG-DELTA', 'Delta Rural Lending', 'STARTER', 'ACTIVE', 'INR', 300000.00, 120000.00, 180000.00, 'Suresh Babu', 'suresh@deltarural.in', '9443277890', '22, Bazaar Street', 'Madurai', 'Tamil Nadu')
ON DUPLICATE KEY UPDATE 
name=VALUES(name), plan=VALUES(plan), status=VALUES(status), 
initial_capital=VALUES(initial_capital), available_cash=VALUES(available_cash), total_lent=VALUES(total_lent),
admin_name=VALUES(admin_name), admin_email=VALUES(admin_email), phone=VALUES(phone);

-- 2. BRANCHES
INSERT INTO branches (id, organization_id, branch_code, branch_name, location, phone, manager_name, status)
VALUES
(1, 1, 'BR-APX-01', 'Chennai Central Hub', 'Financial District, Chennai', '9876543210', 'Rajesh Kumar', 'ACTIVE'),
(2, 1, 'BR-APX-02', 'Tambaram Field Office', 'Tambaram Market, Chennai', '9876543211', 'Venkatesh S', 'ACTIVE'),
(3, 2, 'BR-HRZ-01', 'Coimbatore Main Branch', 'Gandhi Road, Coimbatore', '9840123456', 'Priya Sharma', 'ACTIVE'),
(4, 3, 'BR-DLT-01', 'Madurai Rural Desk', 'Bazaar Street, Madurai', '9443277890', 'Suresh Babu', 'ACTIVE')
ON DUPLICATE KEY UPDATE branch_name=VALUES(branch_name), location=VALUES(location);

-- 3. ORGANIZATION SETTINGS
INSERT INTO organization_settings (organization_id, daily_loan_enabled, weekly_loan_enabled, max_active_loans_per_customer, auto_eligibility_check, default_interest_rate, currency_symbol)
VALUES
(1, TRUE, TRUE, 2, TRUE, 10.00, '₹'),
(2, TRUE, TRUE, 1, TRUE, 12.00, '₹'),
(3, FALSE, TRUE, 1, TRUE, 10.00, '₹')
ON DUPLICATE KEY UPDATE default_interest_rate=VALUES(default_interest_rate);

-- 4. ROLES & PERMISSIONS
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN', 'Complete platform administration across all organizations'),
('ADMIN', 'Organization Administrator managing branches, loans, and users'),
('FIELD_AGENT', 'Field executive managing routes, disbursements, and physical collections'),
('SHOPKEEPER', 'Merchant borrower with daily micro-credit facility'),
('USER', 'Borrower / Customer with loan portfolio and schedule visibility')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO permissions (name, description) VALUES
('SYSTEM_ALL', 'Full system administration and configuration'),
('ORG_MANAGE', 'Create, edit, suspend, and view tenant organizations'),
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

-- Super Admin: ALL permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'SUPER_ADMIN';

-- Admin: Org level operations
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'ADMIN' AND p.name IN (
    'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
    'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
    'PAYMENT_CREATE', 'PAYMENT_READ',
    'FUND_READ', 'EXPENSE_CREATE', 'REPORT_VIEW', 'USER_MANAGE'
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

-- 5. LOAN PRODUCTS
INSERT INTO loan_products (id, organization_id, product_code, product_name, customer_type, repayment_frequency, description) VALUES
(1, NULL, 'WEEKLY_STANDARD', 'Weekly Loan - Common Customers', 'COMMON_CUSTOMER', 'WEEKLY', '10-week installment loans designed for common borrowers with weekly collections'),
(2, NULL, 'DAILY_SHOP', 'Daily Loan - Shopkeepers', 'SHOPKEEPER', 'DAILY', '25-day rapid installment loans tailored for retail merchants with daily collections')
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name), description=VALUES(description);

-- 6. LOAN POLICIES
INSERT INTO loan_policies (product_id, minimum_amount, maximum_amount, number_of_installments, waiting_period_days, income_type, income_value, effective_from)
SELECT 1, 5000.00, 50000.00, 10, 0, 'PERCENTAGE', 0.1000, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM loan_policies WHERE product_id = 1);

INSERT INTO loan_policies (product_id, minimum_amount, maximum_amount, number_of_installments, waiting_period_days, income_type, income_value, effective_from)
SELECT 2, 10000.00, 100000.00, 25, 0, 'PERCENTAGE', 0.1250, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM loan_policies WHERE product_id = 2);

-- 7. CENTRAL FUND ACCOUNTS
INSERT INTO fund_accounts (id, organization_id, account_code, account_name, account_type, current_balance) VALUES
(1, 1, 'CASH_MAIN_APX', 'Apex Central Cash Vault', 'CASH', 222000.00),
(2, 1, 'BANK_MAIN_APX', 'Apex Primary Current Account', 'BANK', 500000.00),
(3, 1, 'UPI_MAIN_APX', 'Apex Merchant UPI QR', 'UPI', 50000.00),
(4, 2, 'CASH_MAIN_HRZ', 'Horizon Field Cash Vault', 'CASH', 185000.00),
(5, 3, 'CASH_MAIN_DLT', 'Delta Rural Cash Box', 'CASH', 120000.00)
ON DUPLICATE KEY UPDATE account_name=VALUES(account_name);

-- 8. EXPENSE CATEGORIES
INSERT INTO expense_categories (id, organization_id, name, description) VALUES
(1, NULL, 'Office', 'Office rent, utilities, stationery and paperwork'),
(2, NULL, 'Transport', 'Fuel, transit costs, and field route maintenance'),
(3, NULL, 'Salary', 'Operational employee and administrative staff salary'),
(4, NULL, 'Other', 'Tea, refreshments, and miscellaneous daily overhead')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 9. CHART OF ACCOUNTS (DOUBLE-ENTRY)
INSERT INTO accounting_accounts (organization_id, account_code, account_name, account_type) VALUES
(1, '1000', 'Available Cash Vault', 'ASSET'),
(1, '1010', 'Bank Operating Account', 'ASSET'),
(1, '1100', 'Loan Principal Receivables', 'ASSET'),
(1, '3000', 'Central Fund Capital', 'EQUITY'),
(1, '4000', 'Lending Contract Income', 'INCOME'),
(1, '5000', 'Operational Expenses', 'EXPENSE')
ON DUPLICATE KEY UPDATE account_name=VALUES(account_name);

-- 10. PRIVACY POLICY & COMPLIANCE
INSERT INTO privacy_policies (id, version, title, content, effective_date, status, author_name) VALUES
(1, 'v2.1', 'FinanceFlow Platform Privacy & Financial Data Governance Policy', 
'1. DATA COLLECTION & CONSENT\nFinanceFlow operates as a fund circulation and microfinance ledger platform. We collect borrower identifying data (Full Name, Phone, Aadhaar / Voter ID KYC, Residential Address, Shop / Stall Location) solely for loan underwriting, repayment schedule monitoring, and receipt generation.\n\n2. IMMUTABLE TRANSACTION AUDITABILITY\nAll payment transactions, principal recoveries, and lending fee allocations are stored as permanent, immutable ledger records.\n\n3. FIELD COLLECTION & GEO-VISIT DATA\nWhen field agents perform on-site merchant collections, GPS coordinates and visit timestamps may be recorded to verify route compliance.\n\n4. DATA ENCRYPTION & MULTI-TENANT ISOLATION\nAll records are isolated by tenant identifier (organization_id). Data in transit is protected using TLS 1.3 encryption.\n\n5. RETENTION PERIOD\nFinancial transaction history is retained for a mandatory minimum of 7 (seven) years.', 
'2026-09-01', 'PUBLISHED_ACTIVE', 'Priya Narayanan (Compliance Head)')
ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), status=VALUES(status);

-- 11. MOBILE APP RELEASES
INSERT INTO app_versions (id, platform, version_name, version_code, release_title, release_notes, download_url, min_supported_version, force_update, status) VALUES
(1, 'ANDROID', 'v2.4.0', 24, 'v2.4.0 Production Build', 'Enhanced offline payment queue with automatic background sync when reconnected.', 'https://downloads.fundlending.com/builds/financeflow-v2.4.0.apk', 'v2.2.0', FALSE, 'ACTIVE'),
(2, 'IOS', 'v2.3.8', 23, 'v2.3.8 App Store Release', 'Biometric login and QR scanner performance upgrades.', 'https://apps.apple.com/app/financeflow-agent/id123456789', 'v2.1.0', FALSE, 'ACTIVE')
ON DUPLICATE KEY UPDATE release_title=VALUES(release_title), release_notes=VALUES(release_notes), status=VALUES(status);

-- 12. SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES
('PLATFORM_NAME', 'FinanceFlow Microfinance Engine', 'GENERAL', 'Platform branding name'),
('DEFAULT_CURRENCY', 'INR', 'FINANCIAL', 'Default system currency'),
('MAX_CONCURRENT_LOANS_DEFAULT', '2', 'LENDING', 'Default maximum active loans per borrower'),
('MAINTENANCE_MODE', 'false', 'SYSTEM', 'Platform-wide maintenance toggle')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), description=VALUES(description);

-- 13. DEFAULT CATEGORIES (WEB & MOBILE MAPPING)
INSERT INTO default_category_configs 
(category_code, name, customer_type, description, max_users_per_branch, default_min_loan, default_max_loan, default_interest_rate, repayment_frequency, tenure_installments, grace_period_days, status) 
VALUES
('CAT-BORROWER-WK', 'Borrower (Weekly Installment)', 'COMMON_CUSTOMER', 'Standard individual and worker micro-loans with 10-week recurring repayments.', 500, 10000.00, 50000.00, 10.00, 'WEEKLY', 10, 3, 'ACTIVE'),
('CAT-MERCHANT-DLY', 'Merchant (Daily Installment)', 'SHOPKEEPER', 'Retail shopkeepers and stall merchants with 25-day rapid daily collections.', 200, 15000.00, 100000.00, 12.50, 'DAILY', 25, 1, 'ACTIVE'),
('CAT-FIELD-AGENT', 'Field Collection Agent', 'FIELD_AGENT', 'Mobile route officers equipped with mobile app for daily & weekly cash/UPI recovery.', 15, 0.00, 0.00, 0.00, 'N/A', 0, 0, 'ACTIVE'),
('CAT-BRANCH-ADMIN', 'Branch Manager / Staff', 'ADMIN', 'Branch operational staff managing customer KYC, disbursements, and reconciliation.', 5, 0.00, 0.00, 0.00, 'N/A', 0, 0, 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), default_min_loan=VALUES(default_min_loan), default_max_loan=VALUES(default_max_loan), default_interest_rate=VALUES(default_interest_rate);


