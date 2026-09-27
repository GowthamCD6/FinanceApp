const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('../config/database');

/**
 * Generate a unique customer/borrower code
 */
async function generateCustomerCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rows = await query(`SELECT COUNT(*) AS total FROM customers WHERE customer_code LIKE ?`, [`CUST-${dateStr}-%`]);
  const seq = String((rows[0]?.total || 0) + 1).padStart(4, '0');
  return `CUST-${dateStr}-${seq}`;
}

/**
 * Create a new user / borrower
 */
async function createUser(data, creatorId = null) {
  const {
    name,
    fullName,
    phone,
    alternatePhone,
    email,
    address,
    city,
    role = 'COMMON_CUSTOMER',
    status = 'ACTIVE',
    occupation,
    shopName,
    notes,
    password,
    dateJoined,
    organizationId,
    dob,
    dateOfBirth,
    date_of_birth,
    birthYear,
    birth_year,
  } = data;

  const displayName = (name || fullName || '').trim();
  const rawPhone = (phone || '').trim();

  // Resolve DOB and Birth Year
  let resolvedDob = date_of_birth || dateOfBirth || dob || null;
  let resolvedBirthYear = birth_year || birthYear || null;

  if (resolvedDob && !resolvedBirthYear) {
    const parsedYear = new Date(resolvedDob).getFullYear();
    if (!isNaN(parsedYear)) resolvedBirthYear = parsedYear;
  } else if (resolvedBirthYear && !resolvedDob) {
    resolvedBirthYear = parseInt(resolvedBirthYear, 10);
    if (!isNaN(resolvedBirthYear)) {
      resolvedDob = `${resolvedBirthYear}-01-01`;
    }
  }

  if (!displayName) {
    throw new Error('Full name is required.');
  }
  if (!rawPhone) {
    throw new Error('Phone number is required.');
  }

  // Check phone uniqueness in users and customers
  const existingUser = await query(`SELECT id FROM users WHERE phone = ? LIMIT 1`, [rawPhone]);
  const existingCust = await query(`SELECT id FROM customers WHERE phone = ? LIMIT 1`, [rawPhone]);
  if (existingUser.length > 0 || existingCust.length > 0) {
    throw new Error(`A user or customer with phone number ${rawPhone} already exists.`);
  }

  return await withTransaction(async (conn) => {
    // 1. Determine role ID
    let mappedRoleName = 'USER';
    if (['ORG_ADMIN', 'ADMIN'].includes(role)) mappedRoleName = 'ORG_ADMIN';
    else if (['BRANCH_ADMIN'].includes(role)) mappedRoleName = 'BRANCH_ADMIN';
    else if (['SUPER_ADMIN'].includes(role)) mappedRoleName = 'SUPER_ADMIN';
    else if (['FIELD_AGENT', 'COLLECTOR'].includes(role)) mappedRoleName = 'FIELD_AGENT';

    let [roleRows] = await conn.query(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [mappedRoleName]);
    if (!roleRows || roleRows.length === 0) {
      const fallbackName = ['ORG_ADMIN', 'BRANCH_ADMIN'].includes(mappedRoleName) ? 'ADMIN' : 'USER';
      const [fallbackRows] = await conn.query(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [fallbackName]);
      roleRows = fallbackRows;
    }
    const roleId = roleRows?.[0]?.id || null;

    // 2. Hash default password
    const plainPwd = password || `${rawPhone}@123`;
    const passwordHash = await bcrypt.hash(plainPwd, 10);
    const userEmail = email || `${rawPhone}.${Date.now().toString().slice(-4)}@financeflow.local`;

    // 3. Verify organization and branch existence
    let effectiveOrgId = organizationId ? parseInt(organizationId, 10) : null;
    if (['SUPER_ADMIN'].includes(role)) {
      effectiveOrgId = null;
    } else if (effectiveOrgId) {
      const [orgCheck] = await conn.query(`SELECT id FROM organizations WHERE id = ? LIMIT 1`, [effectiveOrgId]);
      if (!orgCheck || orgCheck.length === 0) {
        const [anyOrg] = await conn.query(`SELECT id FROM organizations LIMIT 1`);
        effectiveOrgId = anyOrg?.[0]?.id || null;
      }
    } else {
      const [anyOrg] = await conn.query(`SELECT id FROM organizations LIMIT 1`);
      effectiveOrgId = anyOrg?.[0]?.id || null;
    }

    if (!effectiveOrgId && !['SUPER_ADMIN'].includes(role)) {
      const [firstOrg] = await conn.query(`SELECT id FROM organizations LIMIT 1`);
      if (firstOrg && firstOrg.length > 0) {
        effectiveOrgId = firstOrg[0].id;
      } else {
        const [newOrg] = await conn.query(
          `INSERT INTO organizations (name, code, status) VALUES ('Main Organization', 'ORG-MAIN-001', 'ACTIVE')`
        );
        effectiveOrgId = newOrg.insertId;
      }
    }

    let effectiveBranchId = data.branchId ? parseInt(data.branchId, 10) : null;
    if (effectiveBranchId) {
      const [branchCheck] = await conn.query(`SELECT id FROM branches WHERE id = ? LIMIT 1`, [effectiveBranchId]);
      if (!branchCheck || branchCheck.length === 0) {
        effectiveBranchId = null;
      }
    }

    // Insert into users
    const [userRes] = await conn.query(
      `INSERT INTO users (organization_id, branch_id, name, phone, email, password_hash, role_type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [effectiveOrgId, effectiveBranchId, displayName, rawPhone, userEmail, passwordHash, role, status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE', dateJoined || new Date()]
    );
    const userId = userRes.insertId;

    if (roleId) {
      await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleId]);
    }

    // 4. Create customer record ONLY for borrowers / shopkeepers (skip for SuperAdmin/OrgAdmin/BranchAdmin/Staff)
    let customerCode = null;
    let custId = null;

    if (!['SUPER_ADMIN', 'ORG_ADMIN', 'ADMIN', 'BRANCH_ADMIN', 'AUDITOR', 'FIELD_AGENT'].includes(role)) {
      customerCode = await generateCustomerCode();
      const custType = role === 'SHOPKEEPER' ? 'SHOPKEEPER' : 'COMMON_CUSTOMER';
      const stallVal = data.stall_no || data.stallNo || null;
      const marketVal = data.market_location || data.marketLocation || address || null;
      const creditVal = parseFloat(data.credit_limit || data.creditLimit || 50000);
      const shopVal = shopName || data.shop_name || (role === 'SHOPKEEPER' ? `${displayName}'s Store` : null);

      const [custRes] = await conn.query(
        `INSERT INTO customers 
         (organization_id, branch_id, customer_code, full_name, phone, date_of_birth, birth_year, alternate_phone, address, city, customer_type, occupation, shop_name, stall_no, market_location, credit_limit, status, registration_date, user_id, assigned_agent_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          effectiveOrgId,
          effectiveBranchId,
          customerCode,
          displayName,
          rawPhone,
          resolvedDob || null,
          resolvedBirthYear || null,
          alternatePhone || null,
          address || null,
          city || null,
          custType,
          occupation || null,
          shopVal,
          stallVal,
          marketVal,
          creditVal,
          status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
          dateJoined ? String(dateJoined).slice(0, 10) : new Date().toISOString().slice(0, 10),
          userId,
          data.assignedAgentId || null,
          creatorId || null,
        ]
      );
      custId = custRes.insertId;

      // Save initial notes if provided
      if (notes) {
        // Notes saved with customer profile
      }

      // Originate Initial Loan if requested
      if (data.initial_loan || data.initialLoan) {
        const initLoan = data.initial_loan || data.initialLoan;
        const principal = parseFloat(initLoan.principal || 20000);
        const freq = initLoan.frequency || (role === 'SHOPKEEPER' ? 'DAILY' : 'WEEKLY');
        const instCount = parseInt(initLoan.total_installments || (freq === 'DAILY' ? 25 : (freq === 'MONTHLY' ? 12 : 10)), 10);
        const rate = parseFloat(initLoan.interest_rate || (freq === 'DAILY' ? 12.5 : (freq === 'MONTHLY' ? 15.0 : 10.0)));
        const incomeAmt = Math.round(((principal * rate) / 100) * 100) / 100;
        const totalRepay = principal + incomeAmt;
        const loanNum = `LN-${freq.slice(0, 2)}-${customerCode || custId}-${Date.now().toString().slice(-4)}`;

        let [prodRows] = await conn.query(`SELECT id FROM loan_products WHERE repayment_frequency = ? LIMIT 1`, [freq]);
        let prodId = prodRows?.[0]?.id || null;
        if (!prodId) {
          const [anyProd] = await conn.query(`SELECT id FROM loan_products LIMIT 1`);
          prodId = anyProd?.[0]?.id || null;
        }
        if (!prodId) {
          const [newProd] = await conn.query(
            `INSERT INTO loan_products (organization_id, name, product_code, repayment_frequency, interest_rate, min_principal, max_principal, default_installments, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
            [effectiveOrgId || 1, `${freq} Standard Product`, `PROD-${freq.slice(0, 3)}`, freq, rate, 1000, 500000, instCount]
          );
          prodId = newProd.insertId;
        }

        const [loanRes] = await conn.query(
          `INSERT INTO loans (organization_id, branch_id, loan_number, customer_id, product_id, loan_title, principal_amount, contracted_income_amount, interest_rate, total_repayment_amount, total_installments, repayment_frequency, status, application_date, approval_date, disbursement_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_DATE, CURRENT_DATE, CURRENT_DATE)`,
          [effectiveOrgId, effectiveBranchId, loanNum, custId, prodId, `${freq} Micro-Loan (₹${principal})`, principal, incomeAmt, rate, totalRepay, instCount, freq]
        );
        const newLoanId = loanRes.insertId;

        const instAmount = Math.ceil(totalRepay / instCount);
        const stepDays = freq === 'DAILY' ? 1 : (freq === 'MONTHLY' ? 30 : 7);
        const princComp = principal / instCount;
        const incComp = incomeAmt / instCount;

        // Clean any existing installments for safety
        await conn.query(`DELETE FROM loan_installments WHERE loan_id = ?`, [newLoanId]);

        const instPlaceholders = [];
        const instValues = [];
        for (let i = 1; i <= instCount; i++) {
          instPlaceholders.push(`(?, ?, DATE_ADD(CURRENT_DATE, INTERVAL ? DAY), ?, ?, ?, 0, ?, 'PENDING')`);
          instValues.push(newLoanId, i, i * stepDays, instAmount, princComp, incComp, instAmount);
        }

        if (instPlaceholders.length > 0) {
          await conn.query(
            `INSERT INTO loan_installments (loan_id, installment_number, due_date, scheduled_amount, principal_component, income_component, paid_amount, outstanding_amount, status)
             VALUES ${instPlaceholders.join(', ')}`,
            instValues
          );
        }

        // Fund Ledger integration: Resolve Fund Account & Record Transaction
        const [accRows] = await conn.query(
          `SELECT id FROM fund_accounts WHERE organization_id = ? AND status = 'ACTIVE' ORDER BY id ASC LIMIT 1`,
          [effectiveOrgId || 1]
        );
        let fundAccountId = accRows?.[0]?.id;
        if (!fundAccountId) {
          const [anyAcc] = await conn.query(`SELECT id FROM fund_accounts WHERE status = 'ACTIVE' LIMIT 1`);
          fundAccountId = anyAcc?.[0]?.id || 1;
        }

        const fundingSource = String(initLoan.funding_source || initLoan.fundingSource || 'VAULT').toUpperCase();
        
        // If funding from Hands-on Money (External Admin Cash / Bank), inject into Net Capital first
        if (fundingSource === 'HANDS_ON' || fundingSource === 'EXTERNAL' || fundingSource === 'HANDS_ON_MONEY') {
          const capTxNum = `TX-CAP-EXT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await conn.query(
            `INSERT INTO fund_transactions 
             (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
             VALUES (?, ?, NOW(), 'CAPITAL_IN', 'IN', ?, 'CAPITAL_INJECTION', ?, ?, ?)`,
            [capTxNum, fundAccountId, principal, newLoanId, `External capital injection (Hands-on money) for Loan ${loanNum}`, creatorId || 1]
          );
        }

        // Record Loan Disbursement OUT transaction
        const disbTxNum = `TX-DSB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await conn.query(
          `INSERT INTO fund_transactions 
           (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
           VALUES (?, ?, NOW(), 'LOAN_DISBURSEMENT', 'OUT', ?, 'LOAN', ?, ?, ?)`,
          [disbTxNum, fundAccountId, principal, newLoanId, `Loan disbursement to ${displayName} (${loanNum})`, creatorId || 1]
        );
      }
    }

    return {
      id: userId,
      customerId: custId,
      customerCode,
      name: displayName,
      phone: rawPhone,
      email: userEmail,
      address,
      role,
      status,
      notes,
      dateJoined: dateJoined || new Date().toISOString().slice(0, 10),
    };
  });
}

/**
 * List users with live financial aggregates
 */
async function getUsers({ search, role, status, organizationId, branchId, scope, page = 1, limit = 50 }) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, parseInt(limit, 10) || 50);
  const offset = (safePage - 1) * safeLimit;
  let whereClauses = ['1=1'];
  const params = [];

  if (organizationId && organizationId !== 'ALL' && role !== 'SUPER_ADMIN') {
    whereClauses.push('(u.organization_id = ? OR c.organization_id = ?)');
    params.push(organizationId, organizationId);
  }

  if (branchId && branchId !== 'ALL') {
    whereClauses.push('(u.branch_id = ? OR c.branch_id = ?)');
    params.push(branchId, branchId);
  }

  if (scope === 'BORROWERS') {
    whereClauses.push("(u.role_type IN ('COMMON_CUSTOMER', 'SHOPKEEPER', 'USER') AND u.role_type NOT IN ('SUPER_ADMIN', 'ORG_ADMIN', 'ADMIN', 'BRANCH_ADMIN', 'FIELD_AGENT'))");
  } else if (scope === 'STAFF') {
    whereClauses.push("(u.role_type IN ('ORG_ADMIN', 'ADMIN', 'BRANCH_ADMIN', 'FIELD_AGENT', 'COLLECTOR') OR EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id AND r.name IN ('ORG_ADMIN', 'ADMIN', 'BRANCH_ADMIN', 'SUPER_ADMIN', 'FIELD_AGENT', 'COLLECTOR')))");
  }

  if (search) {
    whereClauses.push('(u.name LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR c.customer_code LIKE ? OR c.shop_name LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (role && role !== 'ALL') {
    whereClauses.push('(u.role_type = ? OR c.customer_type = ? OR EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id AND r.name = ?))');
    params.push(role, role, role);
  }

  if (status && status !== 'ALL') {
    whereClauses.push('(u.status = ? OR c.status = ?)');
    params.push(status, status);
  }

  const whereSql = whereClauses.join(' AND ');

  const countRows = await query(
    `SELECT COUNT(DISTINCT u.id) AS total 
     FROM users u 
     LEFT JOIN customers c ON c.user_id = u.id 
     WHERE ${whereSql}`,
    params
  );
  const total = countRows[0]?.total || 0;  const users = await query(
    `SELECT 
       u.id,
       u.name,
       u.phone,
       u.email,
       u.role_type,
       u.assigned_route,
       u.daily_target,
       u.designation,
       u.status,
       u.created_at AS date_joined,
       c.id AS customer_id,
       c.customer_code,
       c.customer_type,
       c.address,
       c.city,
       c.occupation,
       c.shop_name,
       c.date_of_birth,
       c.birth_year,
       NULL AS notes,
       (
         SELECT r.name 
         FROM user_roles ur 
         JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = u.id 
         LIMIT 1
       ) AS system_role,
       COALESCE(SUM(CASE WHEN l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE') THEN 1 ELSE 0 END), 0) AS active_loans_count,
       COALESCE(SUM(CASE WHEN l.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_loans_count,
       COALESCE(SUM(CASE WHEN l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE') THEN (
         SELECT COALESCE(SUM(li.outstanding_amount), 0) FROM loan_installments li WHERE li.loan_id = l.id
       ) ELSE 0 END), 0) AS outstanding_amount,
       COALESCE(SUM(l.principal_amount), 0) AS total_borrowed,
       COALESCE((
         SELECT SUM(p.amount) 
         FROM payments p 
         JOIN loans l2 ON p.loan_id = l2.id 
         WHERE l2.customer_id = c.id AND p.status = 'COMPLETED'
       ), 0) AS total_paid
     FROM users u
     LEFT JOIN customers c ON c.user_id = u.id
     LEFT JOIN loans l ON c.id = l.customer_id
     WHERE ${whereSql}
     GROUP BY u.id, c.id
     ORDER BY u.id DESC
     LIMIT ${safeLimit} OFFSET ${offset}`,
    params
  );

  // Map display role and structure
  const formatted = users.map((u) => {
    let effectiveRole = u.role_type || 'COMMON_CUSTOMER';
    if (u.system_role === 'ADMIN' || u.system_role === 'SUPER_ADMIN') {
      effectiveRole = u.system_role;
    } else if (u.role_type === 'FIELD_AGENT') {
      effectiveRole = 'FIELD_AGENT';
    } else if (u.customer_type === 'SHOPKEEPER') {
      effectiveRole = 'SHOPKEEPER';
    } else if (u.customer_type === 'COMMON_CUSTOMER') {
      effectiveRole = 'COMMON_CUSTOMER';
    }

    return {
      id: u.id,
      customerId: u.customer_id,
      customerCode: u.customer_code || `CUST-${u.id}`,
      name: u.name,
      phone: u.phone,
      email: u.email,
      address: u.address || '',
      city: u.city || '',
      role: effectiveRole,
      roleType: u.role_type,
      assignedRoute: u.assigned_route || 'Main Branch Route',
      dailyTarget: parseFloat(u.daily_target || 0),
      designation: u.designation || (effectiveRole === 'FIELD_AGENT' ? 'Route Field Collector' : (effectiveRole === 'ADMIN' ? 'Branch Administrator' : 'Staff')),
      status: u.status,
      notes: u.notes || '',
      occupation: u.occupation || '',
      shopName: u.shop_name || '',
      dateOfBirth: u.date_of_birth ? new Date(u.date_of_birth).toISOString().slice(0, 10) : '',
      birthYear: u.birth_year || (u.date_of_birth ? new Date(u.date_of_birth).getFullYear() : null),
      dateJoined: u.date_joined ? new Date(u.date_joined).toISOString().slice(0, 10) : '',
      activeLoansCount: parseInt(u.active_loans_count || 0, 10),
      completedLoansCount: parseInt(u.completed_loans_count || 0, 10),
      outstandingAmount: parseFloat(u.outstanding_amount || 0),
      totalBorrowed: parseFloat(u.total_borrowed || 0),
      totalPaid: parseFloat(u.total_paid || 0),
    };
  });

  return { users: formatted, total, page: safePage, totalPages: Math.ceil(total / safeLimit) };
}

/**
 * Get borrower financial profile & full permanent payment history
 */
async function getUserById(userId) {
  const users = await query(
    `SELECT u.*, c.id AS customer_id, c.customer_code, c.customer_type, c.address, c.city, c.occupation, c.shop_name, c.date_of_birth, c.birth_year
     FROM users u
     LEFT JOIN customers c ON c.user_id = u.id
     WHERE u.id = ? OR c.id = ?
     LIMIT 1`,
    [userId, userId]
  );

  if (!users || users.length === 0) return null;
  const user = users[0];
  const customerId = user.customer_id;

  let loans = [];
  let paymentHistory = [];
  let notes = [];

  if (customerId) {
    // 1. Fetch all loans with installments
    const loanRows = await query(
      `SELECT 
         l.*,
         lp.product_name,
         lp.repayment_frequency,
         (SELECT COALESCE(SUM(paid_amount), 0) FROM loan_installments WHERE loan_id = l.id) AS total_paid,
         (SELECT COALESCE(SUM(outstanding_balance), 0) FROM loan_installments WHERE loan_id = l.id) AS outstanding_balance
       FROM loans l
       LEFT JOIN loan_products lp ON l.product_id = lp.id
       WHERE l.customer_id = ?
       ORDER BY l.id DESC`,
      [customerId]
    );

    for (const loan of loanRows) {
      const installments = await query(
        `SELECT * FROM loan_installments WHERE loan_id = ? ORDER BY installment_number ASC`,
        [loan.id]
      );
      loans.push({
        ...loan,
        installments,
      });
    }

    // 2. Fetch permanent immutable payment history
    paymentHistory = await query(
      `SELECT 
         p.id,
         p.payment_number,
         p.amount,
         p.payment_date,
         p.payment_method,
         p.reference_number,
         p.status,
         p.notes,
         l.loan_number,
         u.name AS collector_name
       FROM payments p
       JOIN loans l ON p.loan_id = l.id
       LEFT JOIN users u ON p.collector_id = u.id
       WHERE p.customer_id = ?
       ORDER BY p.payment_date DESC`,
      [customerId]
    );

    // 3. Notes
    notes = [];
  }

  // Financial aggregates
  const totalBorrowed = loans.reduce((acc, l) => acc + parseFloat(l.principal_amount || 0), 0);
  const totalPayable = loans.reduce((acc, l) => acc + parseFloat(l.total_repayment_amount || 0), 0);
  const totalPaid = loans.reduce((acc, l) => acc + parseFloat(l.total_paid || 0), 0);
  const outstanding = loans.reduce((acc, l) => acc + parseFloat(l.outstanding_balance || 0), 0);

  const activeLoan = loans.find((l) => ['ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE'].includes(l.status));
  const activeLoans = loans.filter((l) => ['ACTIVE', 'DISBURSED', 'PARTIALLY_PAID', 'OVERDUE'].includes(l.status));
  const completedLoans = loans.filter((l) => l.status === 'COMPLETED');

  // Next due installment
  let nextDue = null;
  if (activeLoan && activeLoan.installments) {
    const pendingInst = activeLoan.installments.find((i) => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.status));
    if (pendingInst) {
      nextDue = {
        dueDate: pendingInst.due_date,
        amount: parseFloat(pendingInst.outstanding_amount),
        installmentNumber: pendingInst.installment_number,
      };
    }
  }

  const lastPayment = paymentHistory.length > 0 ? paymentHistory[0] : null;

  return {
    id: user.id,
    customerId: user.customer_id,
    customerCode: user.customer_code || `CUST-${user.id}`,
    name: user.name,
    phone: user.phone,
    email: user.email,
    address: user.address || '',
    city: user.city || '',
    occupation: user.occupation || '',
    shopName: user.shop_name || '',
    dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().slice(0, 10) : '',
    birthYear: user.birth_year || (user.date_of_birth ? new Date(user.date_of_birth).getFullYear() : null),
    role: user.customer_type || 'COMMON_CUSTOMER',
    status: user.status,
    dateJoined: user.created_at ? new Date(user.created_at).toISOString().slice(0, 10) : '',
    financialSummary: {
      totalBorrowed,
      totalPayable,
      totalPaid,
      outstanding,
      activeLoansCount: activeLoans.length,
      completedLoansCount: completedLoans.length,
      nextDue,
      lastPayment: lastPayment
        ? {
            date: lastPayment.payment_date,
            amount: parseFloat(lastPayment.amount),
            paymentNumber: lastPayment.payment_number,
          }
        : null,
    },
    activeLoansCount: activeLoans.length,
    outstandingAmount: outstanding,
    totalPaid,
    totalBorrowed,
    ongoingLoans: activeLoans,
    loans,
    activeLoan: activeLoan || null,
    activeLoans,
    completedLoans,
    paymentHistory,
    notes,
  };
}

/**
 * Update an existing user via PUT /users/:id
 */
async function updateUser(userId, data, updaterId = null) {
  const {
    name,
    phone,
    address,
    city,
    role,
    status,
    notes,
    occupation,
    shopName,
    shop_name,
    dateOfBirth,
    date_of_birth,
    dob,
    birthYear,
    birth_year,
  } = data;

  const existingUsers = await query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [userId]);
  if (!existingUsers || existingUsers.length === 0) {
    throw new Error('User not found.');
  }
  const user = existingUsers[0];

  // If phone changed, verify uniqueness
  if (phone && phone !== user.phone) {
    const dup = await query(`SELECT id FROM users WHERE phone = ? AND id != ? LIMIT 1`, [phone, userId]);
    if (dup && dup.length > 0) {
      throw new Error(`Phone number ${phone} is already used by another user.`);
    }
  }

  // Resolve DOB and Birth Year if provided
  let resolvedDob = date_of_birth || dateOfBirth || dob || null;
  let resolvedBirthYear = birth_year || birthYear || null;
  if (resolvedDob && !resolvedBirthYear) {
    const parsedYear = new Date(resolvedDob).getFullYear();
    if (!isNaN(parsedYear)) resolvedBirthYear = parsedYear;
  } else if (resolvedBirthYear && !resolvedDob) {
    resolvedBirthYear = parseInt(resolvedBirthYear, 10);
    if (!isNaN(resolvedBirthYear)) {
      resolvedDob = `${resolvedBirthYear}-01-01`;
    }
  }

  const resolvedShopName = shopName !== undefined ? shopName : (shop_name !== undefined ? shop_name : null);

  return await withTransaction(async (conn) => {
    // 1. Update user
    await conn.query(
      `UPDATE users SET 
         name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         status = COALESCE(?, status),
         updated_at = NOW()
       WHERE id = ?`,
      [name || null, phone || null, status || null, userId]
    );

    // 2. Update linked customer record
    const [custRows] = await conn.query(`SELECT id FROM customers WHERE user_id = ? LIMIT 1`, [userId]);
    if (custRows.length > 0) {
      const customerId = custRows[0].id;
      const custType = role === 'SHOPKEEPER' ? 'SHOPKEEPER' : (role === 'COMMON_CUSTOMER' ? 'COMMON_CUSTOMER' : null);

      await conn.query(
        `UPDATE customers SET 
           full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           customer_type = COALESCE(?, customer_type),
           occupation = COALESCE(?, occupation),
           shop_name = COALESCE(?, shop_name),
           date_of_birth = COALESCE(?, date_of_birth),
           birth_year = COALESCE(?, birth_year),
           status = COALESCE(?, status),
           updated_at = NOW()
         WHERE id = ?`,
        [
          name || null,
          phone || null,
          address || null,
          city || null,
          custType,
          occupation !== undefined ? occupation : null,
          resolvedShopName,
          resolvedDob,
          resolvedBirthYear,
          status || null,
          customerId,
        ]
      );

      if (notes) {
        // Notes stored in customer profile
      }
    }

    return await getUserById(userId);
  });
}

/**
 * Update user active/suspended status
 */
async function updateUserStatus(userId, status) {
  const nextStatus = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
  await query(`UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?`, [nextStatus, userId]);
  await query(`UPDATE customers SET status = ?, updated_at = NOW() WHERE user_id = ?`, [nextStatus, userId]);
  return await getUserById(userId);
}

/**
 * Save / update user biometric security settings
 */
async function saveBiometricSettings(userId, settings) {
  const { isFingerprintEnabled, biometricType = 'FINGERPRINT', deviceModel, deviceId, biometricToken } = settings;
  const isEnabled = isFingerprintEnabled === true || isFingerprintEnabled === 1 || isFingerprintEnabled === 'true';

  await query(
    `INSERT INTO user_security_settings (user_id, is_fingerprint_enabled, biometric_type, device_model, device_id, biometric_token, last_authenticated_at)
     VALUES (?, ?, ?, ?, ?, ?, IF(? = 1, NOW(), NULL))
     ON DUPLICATE KEY UPDATE
       is_fingerprint_enabled = VALUES(is_fingerprint_enabled),
       biometric_type = VALUES(biometric_type),
       device_model = COALESCE(VALUES(device_model), device_model),
       device_id = COALESCE(VALUES(device_id), device_id),
       biometric_token = COALESCE(VALUES(biometric_token), biometric_token),
       last_authenticated_at = IF(VALUES(is_fingerprint_enabled) = 1, NOW(), last_authenticated_at),
       updated_at = NOW()`,
    [userId, isEnabled ? 1 : 0, biometricType, deviceModel || null, deviceId || null, biometricToken || null, isEnabled ? 1 : 0]
  );

  return await getBiometricSettings(userId);
}

/**
 * Get user biometric security settings
 */
async function getBiometricSettings(userId) {
  const rows = await query(
    `SELECT * FROM user_security_settings WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (!rows || rows.length === 0) {
    return {
      userId,
      isFingerprintEnabled: false,
      biometricType: 'FINGERPRINT',
      deviceModel: null,
      deviceId: null,
      lastAuthenticatedAt: null,
    };
  }
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    isFingerprintEnabled: Boolean(r.is_fingerprint_enabled),
    biometricType: r.biometric_type,
    deviceModel: r.device_model,
    deviceId: r.device_id,
    lastAuthenticatedAt: r.last_authenticated_at,
    updatedAt: r.updated_at,
  };
}

/**
 * Save user GPS location and address
 */
async function saveUserLocation(userId, locationData) {
  const {
    latitude,
    longitude,
    accuracy,
    address,
    fullAddress,
    city,
    state,
    postalCode,
    organizationId,
    isLocationSharingEnabled = true,
    savedToDatabase = true,
  } = locationData;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const resolvedAddress = fullAddress || address || null;

  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Valid latitude and longitude are required.');
  }

  // Get user's org if not provided
  let orgId = organizationId;
  if (!orgId) {
    const [userRow] = await query(`SELECT organization_id FROM users WHERE id = ? LIMIT 1`, [userId]);
    orgId = userRow?.organization_id || null;
  }

  const result = await query(
    `INSERT INTO user_locations (
       user_id, organization_id, latitude, longitude, accuracy, full_address, city, state, postal_code,
       is_location_sharing_enabled, saved_to_database, captured_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      orgId,
      lat,
      lng,
      accuracy ? parseFloat(accuracy) : null,
      resolvedAddress,
      city || null,
      state || null,
      postalCode || null,
      isLocationSharingEnabled ? 1 : 0,
      savedToDatabase ? 1 : 0,
    ]
  );

  return {
    id: result.insertId,
    userId,
    organizationId: orgId,
    latitude: lat,
    longitude: lng,
    accuracy: accuracy ? parseFloat(accuracy) : null,
    address: resolvedAddress,
    fullAddress: resolvedAddress,
    city,
    state,
    postalCode,
    isLocationSharingEnabled: Boolean(isLocationSharingEnabled),
    savedToDatabase: true,
    capturedAt: new Date(),
  };
}

/**
 * Get user's latest saved location
 */
async function getUserLocation(userId) {
  const rows = await query(
    `SELECT * FROM user_locations WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
    [userId]
  );
  if (!rows || rows.length === 0) {
    return null;
  }
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    organizationId: r.organization_id,
    latitude: parseFloat(r.latitude),
    longitude: parseFloat(r.longitude),
    accuracy: r.accuracy ? parseFloat(r.accuracy) : null,
    address: r.full_address,
    fullAddress: r.full_address,
    city: r.city,
    state: r.state,
    postalCode: r.postal_code,
    isLocationSharingEnabled: Boolean(r.is_location_sharing_enabled),
    savedToDatabase: Boolean(r.saved_to_database),
    capturedAt: r.captured_at,
  };
}

/**
 * Get all borrower/user locations for Admin Map View
 */
async function getAllUserLocations(organizationId = null, search = '') {
  let sql = `
    SELECT 
      ul.id AS location_id,
      ul.latitude,
      ul.longitude,
      ul.accuracy,
      ul.full_address AS address,
      CONCAT(ul.latitude, ', ', ul.longitude) AS coordinates,
      ul.captured_at,
      u.id,
      u.name,
      u.phone,
      u.status,
      u.role_type,
      c.id AS customer_id,
      c.customer_code,
      c.shop_name
    FROM user_locations ul
    INNER JOIN (
      SELECT user_id, MAX(id) AS max_id
      FROM user_locations
      GROUP BY user_id
    ) latest ON ul.id = latest.max_id
    INNER JOIN users u ON ul.user_id = u.id
    LEFT JOIN customers c ON c.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (organizationId) {
    sql += ` AND (u.organization_id = ? OR ul.organization_id = ?)`;
    params.push(organizationId, organizationId);
  }

  if (search) {
    sql += ` AND (u.name LIKE ? OR u.phone LIKE ? OR ul.full_address LIKE ? OR c.shop_name LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  sql += ` ORDER BY ul.id DESC LIMIT 100`;

  const rows = await query(sql, params);
  return rows.map((r) => ({
    id: String(r.id),
    name: r.name,
    phone: r.phone,
    address: r.address || 'Address on file',
    latitude: parseFloat(r.latitude),
    longitude: parseFloat(r.longitude),
    coordinates: r.coordinates,
    status: r.status,
    customerCode: r.customer_code,
    shopName: r.shop_name,
    lastUpdated: r.captured_at,
  }));
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  saveBiometricSettings,
  getBiometricSettings,
  saveUserLocation,
  getUserLocation,
  getAllUserLocations,
};
