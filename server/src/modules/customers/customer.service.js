const { query } = require('../../config/database');

/**
 * Generate a unique, human-friendly customer code
 */
async function generateCustomerCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await query(`SELECT COUNT(*) AS total FROM customers WHERE customer_code LIKE ?`, [`CUST-${dateStr}-%`]);
  const seq = String((rows[0]?.total || 0) + 1).padStart(4, '0');
  return `CUST-${dateStr}-${seq}`;
}

/**
 * Create a new customer
 */
async function createCustomer(data, userId) {
  const {
    fullName,
    phone,
    alternatePhone,
    address,
    city,
    customerType,
    occupation,
    shopName,
    registrationDate,
  } = data;

  if (!fullName || !phone || !customerType) {
    throw new Error('Full name, phone, and customer type are required.');
  }

  // Check unique phone
  const existing = await query(`SELECT id FROM customers WHERE phone = ? LIMIT 1`, [phone]);
  if (existing.length > 0) {
    throw new Error(`Customer with phone number ${phone} already exists.`);
  }

  const customerCode = await generateCustomerCode();

  const [result] = await query(
    `INSERT INTO customers 
     (customer_code, full_name, phone, alternate_phone, address, city, customer_type, occupation, shop_name, status, registration_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
    [
      customerCode,
      fullName,
      phone,
      alternatePhone || null,
      address || null,
      city || null,
      customerType,
      occupation || null,
      shopName || null,
      registrationDate || new Date().toISOString().slice(0, 10),
      userId,
    ]
  );

  return { id: result.insertId, customerCode, fullName, phone, customerType };
}

/**
 * List customers with financial aggregates (active loans, outstanding balance)
 */
async function getCustomers({ search, customerType, status, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  let whereClauses = ['1=1'];
  const params = [];

  if (search) {
    whereClauses.push('(c.full_name LIKE ? OR c.phone LIKE ? OR c.customer_code LIKE ? OR c.shop_name LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (customerType) {
    whereClauses.push('c.customer_type = ?');
    params.push(customerType);
  }

  if (status) {
    whereClauses.push('c.status = ?');
    params.push(status);
  }

  const whereSql = whereClauses.join(' AND ');

  const [countRows] = await query(
    `SELECT COUNT(*) AS total FROM customers c WHERE ${whereSql}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const customers = await query(
    `SELECT 
       c.id,
       c.customer_code,
       c.full_name,
       c.phone,
       c.customer_type,
       c.shop_name,
       c.city,
       c.status,
       c.registration_date,
       COUNT(DISTINCT CASE WHEN l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID') THEN l.id END) AS activeLoansCount,
       COUNT(DISTINCT CASE WHEN l.status = 'COMPLETED' THEN l.id END) AS completedLoansCount,
       COALESCE(SUM(CASE WHEN l.status IN ('ACTIVE', 'DISBURSED', 'PARTIALLY_PAID') THEN (
         SELECT COALESCE(SUM(li.outstanding_amount), 0) FROM loan_installments li WHERE li.loan_id = l.id
       ) ELSE 0 END), 0) AS totalOutstanding,
       le.status AS eligibilityStatus,
       le.eligible_amount AS nextEligibleAmount
     FROM customers c
     LEFT JOIN loans l ON c.id = l.customer_id
     LEFT JOIN loan_eligibility le ON c.id = le.customer_id
     WHERE ${whereSql}
     GROUP BY c.id
     ORDER BY c.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { customers, total, page, totalPages: Math.ceil(total / limit) };
}

/**
 * Get detailed customer profile, including complete loan lifecycle tree and repayment history
 */
async function getCustomerById(customerId) {
  const [customers] = await query(`SELECT * FROM customers WHERE id = ? LIMIT 1`, [customerId]);
  if (customers.length === 0) return null;
  const customer = customers[0];

  // Fetch full loan history with parent links
  const loans = await query(
    `SELECT 
       l.*,
       lp.product_name,
       lp.repayment_frequency,
       (SELECT COALESCE(SUM(paid_amount), 0) FROM loan_installments WHERE loan_id = l.id) AS totalPaid,
       (SELECT COALESCE(SUM(outstanding_amount), 0) FROM loan_installments WHERE loan_id = l.id) AS outstandingTotal
     FROM loans l
     JOIN loan_products lp ON l.product_id = lp.id
     WHERE l.customer_id = ?
     ORDER BY l.id ASC`,
    [customerId]
  );

  // Fetch current eligibility
  const [eligibility] = await query(
    `SELECT * FROM loan_eligibility WHERE customer_id = ? ORDER BY evaluated_at DESC LIMIT 1`,
    [customerId]
  );

  return {
    ...customer,
    loans,
    eligibility: eligibility[0] || null,
  };
}

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
};
