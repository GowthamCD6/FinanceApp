-- ==============================================================================
-- Fund Circulation & Lending Management Engine — Complete Enterprise Multi-Tenant Schema
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ORGANIZATIONS & TENANT MANAGEMENT
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    plan ENUM('STARTER', 'PRO', 'ENTERPRISE') NOT NULL DEFAULT 'PRO',
    status ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    initial_capital DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    available_cash DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_lent DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    admin_name VARCHAR(150),
    admin_phone VARCHAR(20),
    admin_email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    logo_url VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org_code (code),
    INDEX idx_org_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    branch_code VARCHAR(50) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(20),
    manager_name VARCHAR(150),
    manager_phone VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_branches_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_org_branch (organization_id, branch_code),
    INDEX idx_branch_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS organization_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL UNIQUE,
    daily_loan_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_loan_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    max_active_loans_per_customer INT UNSIGNED NOT NULL DEFAULT 1,
    auto_eligibility_check BOOLEAN NOT NULL DEFAULT TRUE,
    grace_period_days INT UNSIGNED NOT NULL DEFAULT 0,
    default_interest_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    currency_symbol VARCHAR(10) NOT NULL DEFAULT '₹',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS, ROLES & ACCESS CONTROL (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL,
    branch_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_type ENUM('SUPER_ADMIN', 'ADMIN', 'FIELD_AGENT', 'SHOPKEEPER', 'COMMON_CUSTOMER', 'USER') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    occupation VARCHAR(150),
    designation VARCHAR(100),
    avatar_url VARCHAR(500),
    address TEXT,
    assigned_route VARCHAR(150),
    daily_target DECIMAL(15,2) DEFAULT 0.00,
    last_login_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    INDEX idx_users_org (organization_id),
    INDEX idx_users_phone (phone),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CUSTOMERS (BORROWERS & SHOPKEEPERS)
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NULL,
    customer_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    customer_type ENUM('COMMON_CUSTOMER', 'SHOPKEEPER') NOT NULL,
    occupation VARCHAR(150),
    shop_name VARCHAR(200),
    stall_no VARCHAR(50),
    market_location VARCHAR(150),
    aadhaar_number VARCHAR(20),
    pan_number VARCHAR(20),
    guarantor_name VARCHAR(150),
    guarantor_phone VARCHAR(20),
    guarantor_relation VARCHAR(50),
    credit_rating ENUM('A', 'B', 'C', 'D', 'UNRATED') NOT NULL DEFAULT 'UNRATED',
    credit_limit DECIMAL(15,2) NOT NULL DEFAULT 50000.00,
    total_borrowed DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_repaid DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    current_outstanding DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNDER_REVIEW') NOT NULL DEFAULT 'ACTIVE',
    registration_date DATE NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    assigned_agent_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_customers_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_customers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_customers_agent FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_org_customer_code (organization_id, customer_code),
    INDEX idx_cust_org (organization_id),
    INDEX idx_cust_phone (phone),
    INDEX idx_cust_type (customer_type),
    INDEX idx_cust_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    note TEXT NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_notes_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_notes_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    document_type ENUM('AADHAAR', 'PAN', 'VOTER_ID', 'SHOP_REGISTRATION', 'RATION_CARD', 'OTHER') NOT NULL,
    document_number VARCHAR(100),
    document_url VARCHAR(500),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_docs_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LOAN PRODUCTS & POLICIES
CREATE TABLE IF NOT EXISTS loan_products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    customer_type ENUM('COMMON_CUSTOMER', 'SHOPKEEPER', 'BOTH') NOT NULL,
    repayment_frequency ENUM('DAILY', 'WEEKLY') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_org (organization_id),
    INDEX idx_product_code (product_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loan_policies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    minimum_amount DECIMAL(15,2) NOT NULL,
    maximum_amount DECIMAL(15,2) NOT NULL,
    number_of_installments INT UNSIGNED NOT NULL,
    waiting_period_days INT UNSIGNED NOT NULL DEFAULT 0,
    income_type ENUM('NONE', 'FIXED_FEE', 'PERCENTAGE') NOT NULL DEFAULT 'NONE',
    income_value DECIMAL(15,4) NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    effective_from DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_policies_product FOREIGN KEY (product_id) REFERENCES loan_products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. LOANS & REPEAT-LOAN PROGRESSION
CREATE TABLE IF NOT EXISTS loans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NULL,
    loan_number VARCHAR(50) NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    policy_id BIGINT UNSIGNED NULL,
    parent_loan_id BIGINT UNSIGNED NULL,
    loan_title VARCHAR(200) NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    contracted_income_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    interest_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    total_repayment_amount DECIMAL(15,2) NOT NULL,
    total_installments INT UNSIGNED NOT NULL,
    paid_installments INT UNSIGNED NOT NULL DEFAULT 0,
    repayment_frequency ENUM('DAILY', 'WEEKLY') NOT NULL,
    disbursement_method ENUM('CASH', 'BANK_TRANSFER', 'UPI') NOT NULL DEFAULT 'CASH',
    status ENUM(
        'PENDING',
        'APPROVED',
        'DISBURSED',
        'ACTIVE',
        'PARTIALLY_PAID',
        'COMPLETED',
        'OVERDUE',
        'DEFAULTED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',
    application_date DATE NOT NULL,
    approval_date DATE NULL,
    disbursement_date DATE NULL,
    maturity_date DATE NULL,
    closed_at DATETIME NULL,
    approved_by BIGINT UNSIGNED NULL,
    disbursed_by BIGINT UNSIGNED NULL,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_loans_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_loans_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_loans_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_loans_product FOREIGN KEY (product_id) REFERENCES loan_products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_loans_policy FOREIGN KEY (policy_id) REFERENCES loan_policies(id) ON DELETE SET NULL,
    CONSTRAINT fk_loans_parent FOREIGN KEY (parent_loan_id) REFERENCES loans(id) ON DELETE SET NULL,
    CONSTRAINT fk_loans_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_loans_disbursed_by FOREIGN KEY (disbursed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_org_loan_number (organization_id, loan_number),
    INDEX idx_loans_org (organization_id),
    INDEX idx_loans_customer (customer_id),
    INDEX idx_loans_status (status),
    INDEX idx_loans_disbursement_date (disbursement_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loan_installments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT UNSIGNED NOT NULL,
    installment_number INT UNSIGNED NOT NULL,
    due_date DATE NOT NULL,
    scheduled_amount DECIMAL(15,2) NOT NULL,
    principal_component DECIMAL(15,2) NOT NULL DEFAULT 0,
    income_component DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    outstanding_amount DECIMAL(15,2) NOT NULL,
    status ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_installments_loan FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    UNIQUE KEY uk_loan_installment (loan_id, installment_number),
    INDEX idx_installments_due_date (due_date),
    INDEX idx_installments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loan_eligibility (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    previous_loan_id BIGINT UNSIGNED NULL,
    next_product_id BIGINT UNSIGNED NULL,
    eligible_amount DECIMAL(15,2) NULL,
    status ENUM('ELIGIBLE', 'NOT_ELIGIBLE', 'UNDER_REVIEW') NOT NULL,
    eligible_from DATE NULL,
    reason VARCHAR(500),
    evaluated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluated_by BIGINT UNSIGNED NULL,
    CONSTRAINT fk_eligibility_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_eligibility_prev_loan FOREIGN KEY (previous_loan_id) REFERENCES loans(id) ON DELETE SET NULL,
    CONSTRAINT fk_eligibility_product FOREIGN KEY (next_product_id) REFERENCES loan_products(id) ON DELETE SET NULL,
    CONSTRAINT fk_eligibility_evaluator FOREIGN KEY (evaluated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_eligibility_customer (customer_id),
    INDEX idx_eligibility_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PAYMENTS & ALLOCATIONS
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NULL,
    payment_number VARCHAR(50) NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    loan_id BIGINT UNSIGNED NOT NULL,
    payment_date DATETIME NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER') NOT NULL DEFAULT 'CASH',
    reference_number VARCHAR(100),
    receipt_number VARCHAR(100),
    collected_latitude DECIMAL(10,8) NULL,
    collected_longitude DECIMAL(11,8) NULL,
    collector_id BIGINT UNSIGNED NULL,
    status ENUM('COMPLETED', 'REVERSED', 'PENDING') NOT NULL DEFAULT 'COMPLETED',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_loan FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_collector FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_org_payment_number (organization_id, payment_number),
    INDEX idx_payment_org (organization_id),
    INDEX idx_payment_customer (customer_id),
    INDEX idx_payment_loan (loan_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_allocations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT UNSIGNED NOT NULL,
    installment_id BIGINT UNSIGNED NULL,
    allocation_type ENUM('PRINCIPAL', 'LENDING_INCOME', 'PENALTY', 'OTHER') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_allocations_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    CONSTRAINT fk_allocations_installment FOREIGN KEY (installment_id) REFERENCES loan_installments(id) ON DELETE SET NULL,
    INDEX idx_payment_allocation_payment (payment_id),
    INDEX idx_payment_allocation_type (allocation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. CENTRAL FUND LEDGER (THE CIRCULATION CORE)
CREATE TABLE IF NOT EXISTS fund_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    branch_id BIGINT UNSIGNED NULL,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    account_type ENUM('CASH', 'BANK', 'UPI', 'OTHER') NOT NULL,
    current_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fund_accounts_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_fund_accounts_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    UNIQUE KEY uk_org_fund_account (organization_id, account_code),
    INDEX idx_fund_acc_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fund_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    transaction_number VARCHAR(50) NOT NULL,
    fund_account_id BIGINT UNSIGNED NOT NULL,
    transaction_date DATETIME NOT NULL,
    transaction_type ENUM(
        'CAPITAL_IN',
        'LOAN_DISBURSEMENT',
        'PRINCIPAL_COLLECTION',
        'LENDING_INCOME',
        'OTHER_INCOME',
        'EXPENSE',
        'REFUND',
        'REVERSAL',
        'ADJUSTMENT',
        'TRANSFER_IN',
        'TRANSFER_OUT'
    ) NOT NULL,
    direction ENUM('IN', 'OUT') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT UNSIGNED,
    description VARCHAR(500),
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fund_tx_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_fund_tx_account FOREIGN KEY (fund_account_id) REFERENCES fund_accounts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_fund_tx_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_org_fund_tx (organization_id, transaction_number),
    INDEX idx_fund_tx_org (organization_id),
    INDEX idx_fund_account (fund_account_id),
    INDEX idx_fund_date (transaction_date),
    INDEX idx_fund_type (transaction_type),
    INDEX idx_fund_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. EXPENSES
CREATE TABLE IF NOT EXISTS expense_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    INDEX idx_exp_cat_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    expense_number VARCHAR(50) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    fund_account_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATETIME NOT NULL,
    description TEXT,
    status ENUM('PENDING', 'APPROVED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PAID',
    created_by BIGINT UNSIGNED NULL,
    approved_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_expenses_fund_account FOREIGN KEY (fund_account_id) REFERENCES fund_accounts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_expenses_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_org_expense_number (organization_id, expense_number),
    INDEX idx_exp_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ACCOUNTING & JOURNAL ENTRIES (DOUBLE-ENTRY LAYER)
CREATE TABLE IF NOT EXISTS accounting_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type ENUM('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE') NOT NULL,
    parent_account_id BIGINT UNSIGNED NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_acc_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_acc_parent FOREIGN KEY (parent_account_id) REFERENCES accounting_accounts(id) ON DELETE SET NULL,
    UNIQUE KEY uk_org_acc_code (organization_id, account_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journal_entries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATETIME NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT UNSIGNED,
    description VARCHAR(500),
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_journal_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_journal_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_org_journal_entry (organization_id, entry_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id BIGINT UNSIGNED NOT NULL,
    account_id BIGINT UNSIGNED NOT NULL,
    debit DECIMAL(15,2) NOT NULL DEFAULT 0,
    credit DECIMAL(15,2) NOT NULL DEFAULT 0,
    description VARCHAR(255),
    CONSTRAINT fk_journal_lines_entry FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_journal_lines_account FOREIGN KEY (account_id) REFERENCES accounting_accounts(id) ON DELETE RESTRICT,
    CONSTRAINT chk_debit_or_credit CHECK (
        (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. PRODUCTION SAFEGUARDS & FIELD OPERATIONS
CREATE TABLE IF NOT EXISTS loan_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT UNSIGNED NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    reason VARCHAR(500),
    changed_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lsh_loan FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    CONSTRAINT fk_lsh_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_lsh_loan (loan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loan_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT UNSIGNED NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NULL,
    performed_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_loan FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_user FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_events_loan (loan_id),
    INDEX idx_events_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collection_visits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    collector_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    loan_id BIGINT UNSIGNED NOT NULL,
    installment_id BIGINT UNSIGNED NULL,
    payment_id BIGINT UNSIGNED NULL,
    expected_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    collected_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    pending_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    visit_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visit_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_visit_collector FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_visit_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_visit_loan FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT,
    CONSTRAINT fk_visit_installment FOREIGN KEY (installment_id) REFERENCES loan_installments(id) ON DELETE SET NULL,
    CONSTRAINT fk_visit_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_visits_org (organization_id),
    INDEX idx_visits_collector (collector_id),
    INDEX idx_visits_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reconciliations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    fund_account_id BIGINT UNSIGNED NOT NULL,
    reconciliation_date DATETIME NOT NULL,
    system_cash DECIMAL(15,2) NOT NULL,
    actual_cash DECIMAL(15,2) NOT NULL,
    discrepancy DECIMAL(15,2) NOT NULL,
    status ENUM('BALANCED', 'DISCREPANCY_PENDING', 'ADJUSTED') NOT NULL DEFAULT 'BALANCED',
    reconciled_by BIGINT UNSIGNED NOT NULL,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_account FOREIGN KEY (fund_account_id) REFERENCES fund_accounts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rec_user FOREIGN KEY (reconciled_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_rec_org (organization_id),
    INDEX idx_rec_date (reconciliation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reconciliation_adjustments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reconciliation_id BIGINT UNSIGNED NOT NULL,
    adjustment_type ENUM('SHORTAGE', 'SURPLUS') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fund_transaction_id BIGINT UNSIGNED NULL,
    reason VARCHAR(500) NOT NULL,
    authorized_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_adj_rec FOREIGN KEY (reconciliation_id) REFERENCES reconciliations(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_adj_tx FOREIGN KEY (fund_transaction_id) REFERENCES fund_transactions(id) ON DELETE SET NULL,
    CONSTRAINT fk_rec_adj_auth FOREIGN KEY (authorized_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    response_status INT NULL,
    response_body JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_idem_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_idem_key (idempotency_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. AUDIT LOGS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT UNSIGNED,
    old_values JSON NULL,
    new_values JSON NULL,
    reason VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_org (organization_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    reference_type VARCHAR(50),
    reference_id BIGINT UNSIGNED,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_org (organization_id),
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. SYSTEM GOVERNANCE, POLICIES & MOBILE PLATFORM
CREATE TABLE IF NOT EXISTS privacy_policies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    effective_date DATE NOT NULL,
    status ENUM('DRAFT', 'PUBLISHED_ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED_ACTIVE',
    author_name VARCHAR(150),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_privacy_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_versions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    platform ENUM('ANDROID', 'IOS', 'WEB') NOT NULL,
    version_name VARCHAR(50) NOT NULL,
    version_code INT NOT NULL,
    release_title VARCHAR(200) NOT NULL,
    release_notes TEXT,
    download_url VARCHAR(500),
    min_supported_version VARCHAR(50),
    force_update BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('ACTIVE', 'ROLLOUT', 'DEPRECATED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_app_ver_platform (platform, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS api_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT NOT NULL,
    response_time_ms DECIMAL(10,2) NOT NULL,
    organization_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_api_endpoint (endpoint),
    INDEX idx_api_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_group VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    description VARCHAR(255),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sys_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS default_category_configs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    customer_type VARCHAR(50) NOT NULL,
    description TEXT,
    max_users_per_branch INT UNSIGNED NOT NULL DEFAULT 500,
    default_min_loan DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    default_max_loan DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    default_interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    repayment_frequency VARCHAR(20) NOT NULL DEFAULT 'N/A',
    tenure_installments INT UNSIGNED NOT NULL DEFAULT 0,
    grace_period_days INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cat_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
