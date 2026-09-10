-- ==============================================================================
-- Fund Circulation & Lending Management Engine — Strict 3-Role Seed Data
-- ==============================================================================

-- 1. STRICT ROLES: SUPER_ADMIN, ADMIN, USER
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN', 'Complete control of the system'),
('ADMIN', 'Manages day-to-day lending and collections'),
('USER', 'Customer - sees own loans, payments, and pending amount')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 2. System Permissions
INSERT INTO permissions (name, description) VALUES
('SYSTEM_ALL', 'Full system administration and configuration'),
('CUSTOMER_CREATE', 'Create and register new borrowers'),
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

-- 3. Role-Permission Assignments
-- Super Admin: ALL permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'SUPER_ADMIN';

-- Admin: Day-to-day operations
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'ADMIN' AND p.name IN (
    'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
    'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
    'PAYMENT_CREATE', 'PAYMENT_READ',
    'FUND_READ', 'EXPENSE_CREATE', 'REPORT_VIEW'
);

-- User (Customer): View own records only
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'USER' AND p.name IN (
    'CUSTOMER_READ', 'LOAN_READ', 'PAYMENT_READ'
);

-- 4. Loan Products (Weekly for Common Customers, Daily for Shopkeepers)
INSERT INTO loan_products (product_code, product_name, customer_type, repayment_frequency, description) VALUES
('WEEKLY_STANDARD', 'Weekly Loan - Common Customers', 'COMMON_CUSTOMER', 'WEEKLY', '10-week installment loans designed for common borrowers with weekly collections'),
('DAILY_SHOP', 'Daily Loan - Shopkeepers', 'SHOPKEEPER', 'DAILY', '25-day rapid installment loans tailored for retail merchants with daily collections')
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name), description=VALUES(description);

-- 5. Configurable Loan Policies
INSERT INTO loan_policies (product_id, minimum_amount, maximum_amount, number_of_installments, waiting_period_days, income_type, income_value, effective_from)
SELECT id, 5000.00, 50000.00, 10, 0, 'PERCENTAGE', 0.1000, CURRENT_DATE
FROM loan_products WHERE product_code = 'WEEKLY_STANDARD'
LIMIT 1;

INSERT INTO loan_policies (product_id, minimum_amount, maximum_amount, number_of_installments, waiting_period_days, income_type, income_value, effective_from)
SELECT id, 10000.00, 100000.00, 25, 0, 'PERCENTAGE', 0.1250, CURRENT_DATE
FROM loan_products WHERE product_code = 'DAILY_SHOP'
LIMIT 1;

-- 6. Central Fund Accounts
INSERT INTO fund_accounts (account_code, account_name, account_type) VALUES
('CASH_MAIN', 'Central Cash Vault (Physical Field Cash)', 'CASH'),
('BANK_MAIN', 'Primary Business Current Account', 'BANK'),
('UPI_MAIN', 'Merchant UPI Collection Account', 'UPI')
ON DUPLICATE KEY UPDATE account_name=VALUES(account_name);

-- 7. Operational Expense Categories
INSERT INTO expense_categories (name, description) VALUES
('Office', 'Office rent, utilities, stationery and paperwork'),
('Transport', 'Fuel, transit costs, and field route maintenance'),
('Salary', 'Operational employee and administrative staff salary'),
('Other', 'Tea, refreshments, and miscellaneous daily overhead')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 8. Chart of Accounts (Double-Entry Layer)
INSERT INTO accounting_accounts (account_code, account_name, account_type) VALUES
('1000', 'Available Cash Vault', 'ASSET'),
('1010', 'Bank Operating Account', 'ASSET'),
('1100', 'Loan Principal Receivables', 'ASSET'),
('3000', 'Central Fund Capital', 'EQUITY'),
('4000', 'Lending Contract Income', 'INCOME'),
('5000', 'Operational Expenses', 'EXPENSE')
ON DUPLICATE KEY UPDATE account_name=VALUES(account_name);
