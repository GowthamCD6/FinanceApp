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
  } = data;

  const displayName = (name || fullName || '').trim();
  const rawPhone = (phone || '').trim();

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
    if (['ADMIN', 'BRANCH_ADMIN'].includes(role)) mappedRoleName = 'ADMIN';
    else if (['SUPER_ADMIN'].includes(role)) mappedRoleName = 'SUPER_ADMIN';
    else if (['FIELD_AGENT', 'COLLECTOR'].includes(role)) mappedRoleName = 'USER';

    const [roleRows] = await conn.query(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [mappedRoleName]);
    const roleId = roleRows.length > 0 ? roleRows[0].id : null;

    // 2. Hash default password
    const plainPwd = password || `${rawPhone}@123`;
    const passwordHash = await bcrypt.hash(plainPwd, 10);
    const userEmail = email || `${rawPhone}@financeflow.local`;

    // 3. Insert into users
    const effectiveOrgId = organizationId || 1;
    const [userRes] = await conn.query(
      `INSERT INTO users (organization_id, branch_id, name, phone, email, password_hash, role_type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [effectiveOrgId, data.branchId || null, displayName, rawPhone, userEmail, passwordHash, role, status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE', dateJoined || new Date()]
    );
    const userId = userRes.insertId;

    if (roleId) {
      await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleId]);
    }

    // 4. Create customer record ONLY for borrowers / shopkeepers (skip for SuperAdmin/Admin)
    let customerCode = null;
    let custId = null;

    if (!['SUPER_ADMIN', 'ADMIN', 'AUDITOR'].includes(role)) {
      customerCode = await generateCustomerCode();
      const custType = role === 'SHOPKEEPER' ? 'SHOPKEEPER' : 'COMMON_CUSTOMER';

      const [custRes] = await conn.query(
        `INSERT INTO customers 
         (organization_id, branch_id, customer_code, full_name, phone, alternate_phone, address, city, customer_type, occupation, shop_name, status, registration_date, user_id, assigned_agent_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          effectiveOrgId,
          data.branchId || null,
          customerCode,
          displayName,
          rawPhone,
          alternatePhone || null,
          address || null,
          city || null,
          custType,
          occupation || null,
          shopName || null,
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
        await conn.query(
          `INSERT INTO customer_notes (customer_id, note, created_by) VALUES (?, ?, ?)`,
          [custId, notes, creatorId || null]
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
async function getUsers({ search, role, status, organizationId, page = 1, limit = 50 }) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, parseInt(limit, 10) || 50);
  const offset = (safePage - 1) * safeLimit;
  let whereClauses = ['1=1'];
  const params = [];

  if (organizationId) {
    whereClauses.push('(u.organization_id = ? OR c.organization_id = ?)');
    params.push(organizationId, organizationId);
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
  const total = countRows[0]?.total || 0;

  const users = await query(
    `SELECT 
       u.id,
       u.name,
       u.phone,
       u.email,
       u.status,
       u.created_at AS date_joined,
       c.id AS customer_id,
       c.customer_code,
       c.customer_type,
       c.address,
       c.city,
       c.occupation,
       c.shop_name,
       (SELECT note FROM customer_notes WHERE customer_id = c.id ORDER BY id DESC LIMIT 1) AS notes,
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
    let effectiveRole = 'COMMON_CUSTOMER';
    if (u.system_role === 'ADMIN' || u.system_role === 'SUPER_ADMIN') {
      effectiveRole = u.system_role;
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
      status: u.status,
      notes: u.notes || '',
      occupation: u.occupation || '',
      shopName: u.shop_name || '',
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
    `SELECT u.*, c.id AS customer_id, c.customer_code, c.customer_type, c.address, c.city, c.occupation, c.shop_name
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
         (SELECT COALESCE(SUM(outstanding_amount), 0) FROM loan_installments WHERE loan_id = l.id) AS outstanding_balance
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
    notes = await query(
      `SELECT cn.*, u.name AS author_name 
       FROM customer_notes cn 
       LEFT JOIN users u ON cn.created_by = u.id 
       WHERE cn.customer_id = ? 
       ORDER BY cn.created_at DESC`,
      [customerId]
    );
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
  const { name, phone, address, city, role, status, notes, occupation, shopName } = data;

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
           status = COALESCE(?, status),
           updated_at = NOW()
         WHERE id = ?`,
        [
          name || null,
          phone || null,
          address || null,
          city || null,
          custType,
          occupation || null,
          shopName || null,
          status || null,
          customerId,
        ]
      );

      if (notes) {
        await conn.query(
          `INSERT INTO customer_notes (customer_id, note, created_by) VALUES (?, ?, ?)`,
          [customerId, notes, updaterId || null]
        );
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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};
