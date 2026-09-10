-- ==============================================================================
-- Fund Circulation & Lending Management Engine — Seed Data
-- ==============================================================================

-- 1. Insert Default Roles
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN', 'Full system access and configurations'),
('ADMIN', 'Administrative management of loans, users, and funds'),
('LOAN_MANAGER', 'Customer approval, loan verification and disbursement'),
('COLLECTOR', 'Field collection recording and daily route management'),
('ACCOUNTANT', 'Financial reports, journal review, and ledger reconciliation'),
('VIEWER', 'Read-only audit and reporting access')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 2. Insert Default Permissions
INSERT INTO permissions (name, description) VALUES
('CUSTOMER_CREATE', 'Create new customer records'),
('CUSTOMER_READ', 'View customer details and history'),
('CUSTOMER_UPDATE', 'Modify customer information'),
('CUSTOMER_DELETE', 'Soft delete/deactivate customers'),
('LOAN_CREATE', 'Initiate loan applications'),
('LOAN_APPROVE', 'Approve pending loan applications'),
('LOAN_DISBURSE', 'Disburse funds for approved loans'),
('LOAN_READ', 'View loan contracts and schedules'),
('PAYMENT_CREATE', 'Record collection payments'),
('PAYMENT_REVERSE', 'Reverse incorrect payments with audit notes'),
('PAYMENT_READ', 'View payment receipts and transaction records'),
('FUND_MANAGE', 'Add capital, withdraw, or transfer funds'),
('FUND_READ', 'View central fund ledger and cash position'),
('EXPENSE_CREATE', 'Log operational expenses'),
('EXPENSE_APPROVE', 'Approve operational expenses'),
('REPORT_VIEW', 'Access dashboard, cash flow, profit, and audit reports'),
('USER_MANAGE', 'Manage employees, system users, and assign roles'),
('RECONCILIATION_VIEW', 'View physical vs system cash reconciliations'),
('RECONCILIATION_CREATE', 'Perform cash reconciliation and variance adjustments'),
('VISIT_RECORD', 'Log field collection customer visits')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 3. Assign All Permissions to SUPER_ADMIN
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'SUPER_ADMIN';

-- Assign Collector Permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'COLLECTOR' AND p.name IN (
    'CUSTOMER_READ', 'LOAN_READ', 'PAYMENT_CREATE', 'PAYMENT_READ', 'REPORT_VIEW'
);

-- Assign Loan Manager Permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'LOAN_MANAGER' AND p.name IN (
    'CUSTOMER_CREATE', 'CUSTOMER_READ', 'CUSTOMER_UPDATE',
    'LOAN_CREATE', 'LOAN_APPROVE', 'LOAN_DISBURSE', 'LOAN_READ',
    'PAYMENT_CREATE', 'PAYMENT_READ', 'REPORT_VIEW'
);

-- 4. Insert Default Loan Products
INSERT INTO loan_products (product_code, product_name, customer_type, repayment_frequency, description) VALUES
('WEEKLY_STANDARD', 'Weekly Loan - Common Customers', 'COMMON_CUSTOMER', 'WEEKLY', 'Weekly installment schedule designed for individuals and common households'),
('DAILY_SHOP', 'Daily Loan - Shopkeepers', 'SHOPKEEPER', 'DAILY', 'Daily installment collection tailored for retail store owners and daily business cash flow')
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name), description=VALUES(description);

-- 5. Insert Configurable Loan Policies
INSERT INTO loan_policies (product_id, minimum_amount, maximum_amount, number_of_installments, waiting_period_days, income_type, income_value, effective_from)
SELECT id, 5000.00, 50000.00, 10, 0, 'PERCENTAGE', 0.2000, CURRENT_DATE
FROM loan_products WHERE product_code = 'WEEKLY_STANDARD'
LIMIT 1;

INSERT INTO loan_policies (product_id, minimum_amount, maximum_amount, number_of_installments, waiting_period_days, income_type, income_value, effective_from)
SELECT id, 10000.00, 100000.00, 25, 0, 'FIXED_FEE', 2000.0000, CURRENT_DATE
FROM loan_products WHERE product_code = 'DAILY_SHOP'
LIMIT 1;

-- 6. Insert Default Fund Accounts (Cash, Bank, UPI)
INSERT INTO fund_accounts (account_code, account_name, account_type) VALUES
('CASH_MAIN', 'Main Cash Wallet (Physical Field Cash)', 'CASH'),
('BANK_MAIN', 'Primary Business Current Account', 'BANK'),
('UPI_MAIN', 'Merchant UPI Collection Account', 'UPI')
ON DUPLICATE KEY UPDATE account_name=VALUES(account_name);

-- 7. Insert Default Expense Categories
INSERT INTO expense_categories (name, description) VALUES
('STAFF_SALARY', 'Employee and field collector salaries'),
('COLLECTION_TRANSPORT', 'Fuel, vehicle maintenance, and transit costs'),
('OFFICE_RENT', 'Physical office rent and utilities'),
('TECH_AND_SOFTWARE', 'Server hosting, SMS alerts, and app maintenance'),
('BANK_CHARGES', 'IMPS/NEFT fees, cheque return charges, and terminal fees'),
('MISCELLANEOUS', 'Tea, refreshments, and ad-hoc operating expenses')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 8. Insert Standard Chart of Accounts (Double-Entry Foundation)
INSERT INTO accounting_accounts (account_code, account_name, account_type) VALUES
('1000', 'Cash on Hand', 'ASSET'),
('1010', 'Bank Current Account', 'ASSET'),
('1020', 'UPI Float Account', 'ASSET'),
('1100', 'Loan Principal Receivables', 'ASSET'),
('3000', 'Owner Business Capital', 'EQUITY'),
('4000', 'Lending Contract Income', 'INCOME'),
('4100', 'Late Fee & Other Revenue', 'INCOME'),
('5000', 'Staff Salaries', 'EXPENSE'),
('5100', 'Collection & Transport Costs', 'EXPENSE'),
('5200', 'Rent & Office Overhead', 'EXPENSE'),
('5300', 'Bank & Transaction Fees', 'EXPENSE')
ON DUPLICATE KEY UPDATE account_name=VALUES(account_name);
