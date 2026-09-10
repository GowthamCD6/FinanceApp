import {
  MOCK_USERS,
  MOCK_FUND_SUMMARY,
  MOCK_CUSTOMERS,
} from './mockData';

// Initial Users/Borrowers with Multi-Loan support matching Fund App specifications
const INITIAL_USERS = [
  {
    id: 1,
    customer_code: 'CUST-001',
    name: 'Kumar S',
    phone: '9876543210',
    email: 'kumar@gmail.com',
    role: 'COMMON_CUSTOMER',
    type_label: 'Borrower (Weekly)',
    status: 'ACTIVE',
    credit_limit: 50000,
    occupation: 'Fabrication Technician',
    city: 'Triplicane, Chennai',
    address: '42, North Car Street, Triplicane, Chennai',
    joined_date: '2025-05-12',
    loans: [
      {
        loan_code: 'LN-2026-004',
        loan_name: 'Workshop Machinery Expansion',
        principal: 20000,
        total_repayable: 22000,
        installment_amount: 2200,
        frequency: 'WEEKLY',
        paid_installments: 4,
        total_installments: 10,
        disbursed_date: '2026-08-15',
        next_due_date: '2026-09-15',
        remaining_balance: 13200,
        status: 'ACTIVE',
      },
      {
        loan_code: 'LN-2026-018',
        loan_name: 'Raw Material Purchase (Concurrent)',
        principal: 10000,
        total_repayable: 11000,
        installment_amount: 1100,
        frequency: 'WEEKLY',
        paid_installments: 1,
        total_installments: 10,
        disbursed_date: '2026-09-01',
        next_due_date: '2026-09-15',
        remaining_balance: 9900,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      loan_code: 'LN-2026-004',
      principal: 20000,
      total_repayable: 22000,
      installment_amount: 2200,
      frequency: 'WEEKLY',
      paid_installments: 4,
      total_installments: 10,
      next_due_date: '2026-09-15',
      remaining_balance: 13200,
      status: 'ACTIVE',
    },
    lifecycle_completed: 3,
    repayment_discipline: '100% On-Time (Multi-Loan Active)',
  },
  {
    id: 2,
    customer_code: 'CUST-002',
    name: 'Murugan Supermarket',
    shop_name: 'Murugan Supermarket & Provisions',
    market_location: 'Saidapet Bazaar Route',
    stall_no: 'Shop #12-B',
    phone: '9840112233',
    email: 'murugan.retail@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'ACTIVE',
    credit_limit: 80000,
    occupation: 'Retail Grocery Store Owner',
    city: 'Saidapet, Chennai',
    address: '12 Bazaar Road, Saidapet, Chennai',
    joined_date: '2025-07-04',
    loans: [
      {
        loan_code: 'LN-2026-005',
        loan_name: 'Daily Grocery Stocking',
        principal: 40000,
        total_repayable: 45000,
        installment_amount: 1800,
        frequency: 'DAILY',
        paid_installments: 15,
        total_installments: 25,
        disbursed_date: '2026-08-20',
        next_due_date: '2026-09-10',
        remaining_balance: 18000,
        status: 'ACTIVE',
      },
      {
        loan_code: 'LN-2026-019',
        loan_name: 'Festival Inventory Loan (2nd Loan)',
        principal: 20000,
        total_repayable: 22500,
        installment_amount: 900,
        frequency: 'DAILY',
        paid_installments: 4,
        total_installments: 25,
        disbursed_date: '2026-09-05',
        next_due_date: '2026-09-10',
        remaining_balance: 18900,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      loan_code: 'LN-2026-005',
      principal: 40000,
      total_repayable: 45000,
      installment_amount: 1800,
      frequency: 'DAILY',
      paid_installments: 15,
      total_installments: 25,
      next_due_date: '2026-09-10',
      remaining_balance: 18000,
      status: 'ACTIVE',
    },
    lifecycle_completed: 2,
    repayment_discipline: 'Flawless Daily Track (2 Active Loans)',
  },
  {
    id: 3,
    customer_code: 'CUST-003',
    name: 'Anitha Lakshmi',
    phone: '9790887766',
    email: 'anitha.l@outlook.com',
    role: 'COMMON_CUSTOMER',
    type_label: 'Borrower (Weekly)',
    status: 'ACTIVE',
    credit_limit: 30000,
    occupation: 'Tailoring & Garment Works',
    city: 'Mylapore, Chennai',
    address: '78 Temple View, Mylapore, Chennai',
    joined_date: '2025-09-18',
    loans: [
      {
        loan_code: 'LN-2026-006',
        loan_name: 'Embroidery Machine Loan',
        principal: 10000,
        total_repayable: 11000,
        installment_amount: 1100,
        frequency: 'WEEKLY',
        paid_installments: 5,
        total_installments: 10,
        disbursed_date: '2026-08-10',
        next_due_date: '2026-09-12',
        remaining_balance: 5500,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      loan_code: 'LN-2026-006',
      principal: 10000,
      total_repayable: 11000,
      installment_amount: 1100,
      frequency: 'WEEKLY',
      paid_installments: 5,
      total_installments: 10,
      next_due_date: '2026-09-12',
      remaining_balance: 5500,
      status: 'ACTIVE',
    },
    lifecycle_completed: 1,
    repayment_discipline: 'Good (1 Late)',
  },
  {
    id: 4,
    customer_code: 'CUST-004',
    name: 'Selvam Tea Stall',
    shop_name: 'Selvam Hot Tea & Tiffin Stall',
    market_location: 'T. Nagar Bus Terminus',
    stall_no: 'Stall #05',
    phone: '9444123456',
    email: 'selvamtea@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'DEFAULTER',
    credit_limit: 20000,
    occupation: 'Tea Stall Owner',
    city: 'T. Nagar, Chennai',
    address: '5 Bus Stand Corner, T. Nagar, Chennai',
    joined_date: '2025-11-02',
    loans: [
      {
        loan_code: 'LN-2026-007',
        loan_name: 'Tea Stall Renovation',
        principal: 15000,
        total_repayable: 16875,
        installment_amount: 675,
        frequency: 'DAILY',
        paid_installments: 6,
        total_installments: 25,
        disbursed_date: '2026-08-01',
        next_due_date: '2026-08-25',
        remaining_balance: 12825,
        status: 'OVERDUE',
      },
    ],
    active_loan: {
      loan_code: 'LN-2026-007',
      principal: 15000,
      total_repayable: 16875,
      installment_amount: 675,
      frequency: 'DAILY',
      paid_installments: 6,
      total_installments: 25,
      next_due_date: '2026-08-25',
      remaining_balance: 12825,
      status: 'OVERDUE',
    },
    lifecycle_completed: 0,
    repayment_discipline: 'Overdue > 14 Days',
  },
  {
    id: 5,
    customer_code: 'CUST-005',
    name: 'Venkatesh Fast Food',
    shop_name: 'Venkatesh Fast Food & Chinese',
    market_location: 'Triplicane High Road',
    stall_no: 'Shop #88',
    phone: '9841238901',
    email: 'venkat.food@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'ACTIVE',
    credit_limit: 40000,
    occupation: 'Street Fast Food Stall',
    city: 'Triplicane, Chennai',
    address: '88 High Road, Triplicane, Chennai',
    joined_date: '2026-01-10',
    loans: [
      {
        loan_code: 'LN-2026-010',
        loan_name: 'Daily Kitchen Stock & Gas',
        principal: 25000,
        total_repayable: 28125,
        installment_amount: 1125,
        frequency: 'DAILY',
        paid_installments: 11,
        total_installments: 25,
        disbursed_date: '2026-08-22',
        next_due_date: '2026-09-10',
        remaining_balance: 15750,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      loan_code: 'LN-2026-010',
      principal: 25000,
      total_repayable: 28125,
      installment_amount: 1125,
      frequency: 'DAILY',
      paid_installments: 11,
      total_installments: 25,
      next_due_date: '2026-09-10',
      remaining_balance: 15750,
      status: 'ACTIVE',
    },
    lifecycle_completed: 1,
    repayment_discipline: 'On Track',
  },
  {
    id: 6,
    customer_code: 'CUST-006',
    name: 'Revathi Flower Stall',
    shop_name: 'Revathi Traditional Flowers & Garlands',
    market_location: 'Mylapore Temple Market',
    stall_no: 'Stall #14',
    phone: '9789123450',
    email: 'revathi.flowers@gmail.com',
    role: 'COMMON_CUSTOMER',
    type_label: 'Borrower (Weekly)',
    status: 'ACTIVE',
    credit_limit: 20000,
    occupation: 'Flower Vendor',
    city: 'Mylapore, Chennai',
    address: 'Near Kapaleeshwarar Temple, Mylapore',
    joined_date: '2026-02-05',
    loans: [
      {
        loan_code: 'LN-2026-011',
        loan_name: 'Festival Flower Procurement',
        principal: 10000,
        total_repayable: 11000,
        installment_amount: 1100,
        frequency: 'WEEKLY',
        paid_installments: 2,
        total_installments: 10,
        disbursed_date: '2026-08-28',
        next_due_date: '2026-09-14',
        remaining_balance: 8800,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      loan_code: 'LN-2026-011',
      principal: 10000,
      total_repayable: 11000,
      installment_amount: 1100,
      frequency: 'WEEKLY',
      paid_installments: 2,
      total_installments: 10,
      next_due_date: '2026-09-14',
      remaining_balance: 8800,
      status: 'ACTIVE',
    },
    lifecycle_completed: 0,
    repayment_discipline: 'Regular',
  },
  {
    id: 7,
    customer_code: 'CUST-007',
    name: 'Sri Krishna Sweets Corner',
    shop_name: 'Sri Krishna Sweets & Bakery',
    market_location: 'Saidapet Bazaar Route',
    stall_no: 'Shop #34',
    phone: '9840776655',
    email: 'krishna.sweets@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'ACTIVE',
    credit_limit: 50000,
    occupation: 'Bakery & Sweets Shop Owner',
    city: 'Saidapet, Chennai',
    address: '34 Bazaar Road, Saidapet',
    joined_date: '2026-02-15',
    loans: [
      {
        loan_code: 'LN-2026-015',
        loan_name: 'Ghee & Dairy Batch Procurement',
        principal: 30000,
        total_repayable: 33750,
        installment_amount: 1350,
        frequency: 'DAILY',
        paid_installments: 19,
        total_installments: 25,
        disbursed_date: '2026-08-16',
        next_due_date: '2026-09-10',
        remaining_balance: 8100,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      loan_code: 'LN-2026-015',
      principal: 30000,
      total_repayable: 33750,
      installment_amount: 1350,
      frequency: 'DAILY',
      paid_installments: 19,
      total_installments: 25,
      next_due_date: '2026-09-10',
      remaining_balance: 8100,
      status: 'ACTIVE',
    },
    lifecycle_completed: 1,
    repayment_discipline: '95% On-Time',
  },
  {
    id: 8,
    customer_code: 'CUST-008',
    name: 'Balaji Mobile Accessories',
    shop_name: 'Balaji Telecom & Mobile Care',
    market_location: 'Triplicane High Road',
    stall_no: 'Stall #102',
    phone: '9884112299',
    email: 'balaji.mobiles@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'ACTIVE',
    credit_limit: 35000,
    occupation: 'Mobile Repair & Accessories',
    city: 'Triplicane, Chennai',
    address: '102 High Road, Triplicane',
    joined_date: '2026-03-01',
    loans: [
      {
        loan_code: 'LN-2026-016',
        loan_name: 'Screen & Battery Stocking',
        principal: 20000,
        total_repayable: 22500,
        installment_amount: 900,
        frequency: 'DAILY',
        paid_installments: 8,
        total_installments: 25,
        disbursed_date: '2026-08-29',
        next_due_date: '2026-09-10',
        remaining_balance: 15300,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      loan_code: 'LN-2026-016',
      principal: 20000,
      total_repayable: 22500,
      installment_amount: 900,
      frequency: 'DAILY',
      paid_installments: 8,
      total_installments: 25,
      next_due_date: '2026-09-10',
      remaining_balance: 15300,
      status: 'ACTIVE',
    },
    lifecycle_completed: 0,
    repayment_discipline: 'Regular',
  },
];

// Initial Weekly Dues ("Who need to pay for this week")
const INITIAL_WEEKLY_DUES = [
  {
    id: 101,
    customer_id: 1,
    customer_name: 'Kumar S',
    customer_code: 'CUST-001',
    phone: '9876543210',
    loan_code: 'LN-2026-004',
    installment_week: 'Week 4 of 10',
    due_date: '2026-09-15',
    due_amount: 2200,
    remaining_balance: 13200,
    status: 'PAID',
    paid_date: '2026-09-10',
    payment_mode: 'CASH',
    receipt_no: 'RCP-9230',
  },
  {
    id: 102,
    customer_id: 3,
    customer_name: 'Anitha Lakshmi',
    customer_code: 'CUST-003',
    phone: '9790887766',
    loan_code: 'LN-2026-006',
    installment_week: 'Week 5 of 10',
    due_date: '2026-09-12',
    due_amount: 1100,
    remaining_balance: 5500,
    status: 'PENDING',
    paid_date: null,
    payment_mode: null,
    receipt_no: null,
  },
  {
    id: 103,
    customer_id: 6,
    customer_name: 'Revathi Flower Stall',
    customer_code: 'CUST-006',
    phone: '9789123450',
    loan_code: 'LN-2026-011',
    installment_week: 'Week 3 of 10',
    due_date: '2026-09-14',
    due_amount: 1100,
    remaining_balance: 8800,
    status: 'PENDING',
    paid_date: null,
    payment_mode: null,
    receipt_no: null,
  },
  {
    id: 104,
    customer_id: 1,
    customer_name: 'Kumar S (2nd Loan)',
    customer_code: 'CUST-001',
    phone: '9876543210',
    loan_code: 'LN-2026-018',
    installment_week: 'Week 2 of 10',
    due_date: '2026-09-15',
    due_amount: 1100,
    remaining_balance: 9900,
    status: 'PENDING',
    paid_date: null,
    payment_mode: null,
    receipt_no: null,
  },
];

// Initial Daily Collections for today
const INITIAL_DAILY_COLLECTIONS = [
  {
    id: 201,
    customer_id: 2,
    customer_name: 'Murugan Supermarket',
    shop_name: 'Murugan Supermarket & Provisions',
    market_location: 'Saidapet Bazaar Route',
    stall_no: 'Shop #12-B',
    phone: '9840112233',
    loan_code: 'LN-2026-005',
    installment_day: 'Day 15 of 25',
    due_amount: 1800,
    collected_amount: 1800,
    payment_mode: 'UPI',
    status: 'COLLECTED',
    collected_time: '11:30 AM',
    receipt_no: 'DLY-8801',
    agent: 'Admin Field Manager',
  },
  {
    id: 202,
    customer_id: 2,
    customer_name: 'Murugan Supermarket (2nd Loan)',
    shop_name: 'Murugan Supermarket & Provisions',
    market_location: 'Saidapet Bazaar Route',
    stall_no: 'Shop #12-B',
    phone: '9840112233',
    loan_code: 'LN-2026-019',
    installment_day: 'Day 4 of 25',
    due_amount: 900,
    collected_amount: 900,
    payment_mode: 'UPI',
    status: 'COLLECTED',
    collected_time: '11:30 AM',
    receipt_no: 'DLY-8802',
    agent: 'Admin Field Manager',
  },
  {
    id: 203,
    customer_id: 5,
    customer_name: 'Venkatesh Fast Food',
    shop_name: 'Venkatesh Fast Food & Chinese',
    market_location: 'Triplicane High Road',
    stall_no: 'Shop #88',
    phone: '9841238901',
    loan_code: 'LN-2026-010',
    installment_day: 'Day 11 of 25',
    due_amount: 1125,
    collected_amount: 1125,
    payment_mode: 'CASH',
    status: 'COLLECTED',
    collected_time: '01:15 PM',
    receipt_no: 'DLY-8803',
    agent: 'Admin Field Manager',
  },
  {
    id: 204,
    customer_id: 7,
    customer_name: 'Sri Krishna Sweets Corner',
    shop_name: 'Sri Krishna Sweets & Bakery',
    market_location: 'Saidapet Bazaar Route',
    stall_no: 'Shop #34',
    phone: '9840776655',
    loan_code: 'LN-2026-015',
    installment_day: 'Day 19 of 25',
    due_amount: 1350,
    collected_amount: 0,
    payment_mode: null,
    status: 'PENDING_VISIT',
    collected_time: null,
    receipt_no: null,
    agent: 'Admin Field Manager',
  },
  {
    id: 205,
    customer_id: 8,
    customer_name: 'Balaji Mobile Accessories',
    shop_name: 'Balaji Telecom & Mobile Care',
    market_location: 'Triplicane High Road',
    stall_no: 'Stall #102',
    phone: '9884112299',
    loan_code: 'LN-2026-016',
    installment_day: 'Day 8 of 25',
    due_amount: 900,
    collected_amount: 0,
    payment_mode: null,
    status: 'PENDING_VISIT',
    collected_time: null,
    receipt_no: null,
    agent: 'Admin Field Manager',
  },
  {
    id: 206,
    customer_id: 4,
    customer_name: 'Selvam Tea Stall',
    shop_name: 'Selvam Hot Tea & Tiffin Stall',
    market_location: 'T. Nagar Bus Terminus',
    stall_no: 'Stall #05',
    phone: '9444123456',
    loan_code: 'LN-2026-007',
    installment_day: 'Day 7 of 25',
    due_amount: 675,
    collected_amount: 0,
    payment_mode: null,
    status: 'MISSED',
    collected_time: null,
    receipt_no: null,
    agent: 'Admin Field Manager',
  },
];

// Admin Profile Data
const INITIAL_ADMIN_PROFILE = {
  id: 2,
  name: 'Admin Field Manager',
  email: 'ops@fundlending.com',
  phone: '+91 88888 88888',
  employee_id: 'EMP-ADM-02',
  role: 'Branch Operations Officer',
  role_tag: 'BRANCH ADMIN / OPERATIONS',
  organization: 'Apex Finance Ltd',
  org_code: 'ORG-APEX',
  branch: 'Triplicane Main Branch',
  assigned_route: 'Triplicane & Saidapet Field Route',
  joined_date: '15 Jan 2025',
  status: 'ACTIVE',
  today_collections: 3825,
  lifetime_collections: 512000,
  active_borrowers_assigned: 86,
  compliance_score: 99.4,
  permissions: [
    'User Enrollment & Multi-Loan Onboarding',
    'Loan Application & Concurrent Disbursal',
    'Rapid Repayment Collection (Cash / UPI)',
    'Shopkeeper Daily Ledger & Route Reconciliation',
    'Net Profit & Capital Yield Accounting',
    'Weekly Dues Inspection & Reports',
  ],
};

const MOCK_ORGANIZATIONS = [
  {
    id: 1,
    name: 'Apex Finance Ltd',
    code: 'ORG-APEX',
    status: 'ACTIVE',
    plan: 'ENTERPRISE',
    branch_count: 8,
    total_customers: 342,
    active_portfolio: 1850000,
    initial_capital: 2500000,
    currency: 'INR',
    admin_name: 'Rajesh Kumar',
    admin_email: 'rajesh@apexfinance.com',
    admin_phone: '9840011223',
    address: 'Anna Salai, Chennai, Tamil Nadu',
    created_at: '2025-01-15',
  },
  {
    id: 2,
    name: 'Metro City Credit Society',
    code: 'ORG-METRO',
    status: 'ACTIVE',
    plan: 'PRO',
    branch_count: 3,
    total_customers: 128,
    active_portfolio: 720000,
    initial_capital: 1000000,
    currency: 'INR',
    admin_name: 'Suresh Babu',
    admin_email: 'suresh@metrocredit.in',
    admin_phone: '9841122334',
    address: 'Bazaar Road, Saidapet, Chennai',
    created_at: '2025-03-20',
  },
  {
    id: 3,
    name: 'Rural Growth Microfinance',
    code: 'ORG-RURAL',
    status: 'ACTIVE',
    plan: 'STARTER',
    branch_count: 1,
    total_customers: 54,
    active_portfolio: 280000,
    initial_capital: 500000,
    currency: 'INR',
    admin_name: 'Meenakshi Sundaram',
    admin_email: 'meenakshi@ruralgrowth.org',
    admin_phone: '9789944332',
    address: 'Main Road, Kanchipuram',
    created_at: '2025-06-10',
  },
];

class ApiService {
  constructor() {
    this.baseUrl = '/api';
    this.token = localStorage.getItem('finance_token') || null;

    // In-memory state
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.weeklyDues = JSON.parse(JSON.stringify(INITIAL_WEEKLY_DUES));
    this.dailyCollections = JSON.parse(JSON.stringify(INITIAL_DAILY_COLLECTIONS));
    this.adminProfile = { ...INITIAL_ADMIN_PROFILE };
    this.organizations = JSON.parse(JSON.stringify(MOCK_ORGANIZATIONS));
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('finance_token', token);
    } else {
      localStorage.removeItem('finance_token');
    }
  }

  // AUTH
  async login(identifier, password) {
    const fakeToken = `mock-admin-token-${Date.now()}`;
    this.setToken(fakeToken);
    return {
      token: fakeToken,
      user: MOCK_USERS.admin,
    };
  }

  // 1. MANAGE USERS & CUSTOMERS
  async getUsers() {
    return this.users;
  }

  async getUserById(id) {
    return this.users.find((u) => u.id === Number(id)) || this.users[0];
  }

  async addUser(data) {
    const nextId = this.users.length + 1;
    const isMerchant = data.role === 'SHOPKEEPER';
    const newUser = {
      id: nextId,
      customer_code: `CUST-00${nextId}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : `${data.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      role: data.role || 'COMMON_CUSTOMER',
      type_label: isMerchant ? 'Merchant (Daily)' : 'Borrower (Weekly)',
      shop_name: data.shop_name ? data.shop_name.trim() : (isMerchant ? `${data.name.trim()} Store` : null),
      market_location: data.market_location ? data.market_location.trim() : (isMerchant ? 'Local Market' : null),
      stall_no: data.stall_no ? data.stall_no.trim() : (isMerchant ? `Shop #${nextId}` : null),
      status: 'ACTIVE',
      credit_limit: parseFloat(data.credit_limit) || (isMerchant ? 50000 : 30000),
      occupation: data.occupation ? data.occupation.trim() : (isMerchant ? 'Retail Merchant' : 'Self-Employed'),
      city: data.city ? data.city.trim() : 'Chennai',
      address: data.address ? data.address.trim() : 'Chennai, Tamil Nadu',
      joined_date: new Date().toISOString().split('T')[0],
      loans: [],
      active_loan: null,
      lifecycle_completed: 0,
      repayment_discipline: 'Newly Enrolled',
    };

    this.users.unshift(newUser);
    return newUser;
  }

  async updateUserStatus(id, status) {
    const user = this.users.find((u) => u.id === Number(id));
    if (user) {
      user.status = status;
    }
    return user;
  }

  async updateUserDetails(id, updatedFields) {
    const user = this.users.find((u) => u.id === Number(id));
    if (user) {
      Object.assign(user, updatedFields);
    }
    return user;
  }

  // 1.1 MULTI-LOAN MANAGEMENT & DISBURSAL
  async getLoans() {
    const loans = [];
    this.users.forEach((u) => {
      const userLoans = u.loans && u.loans.length > 0 ? u.loans : (u.active_loan ? [u.active_loan] : []);
      userLoans.forEach((loan, idx) => {
        loans.push({
          ...loan,
          loan_index: idx + 1,
          total_user_loans: userLoans.length,
          borrower_id: u.id,
          borrower_name: u.name,
          shop_name: u.shop_name || null,
          market_location: u.market_location || null,
          stall_no: u.stall_no || null,
          borrower_phone: u.phone,
          customer_code: u.customer_code,
          occupation: u.occupation,
          credit_limit: u.credit_limit,
          is_shopkeeper: u.role === 'SHOPKEEPER',
        });
      });
    });
    return loans;
  }

  async createLoan(data) {
    const user = this.users.find((u) => u.id === Number(data.borrower_id));
    if (!user) throw new Error('Borrower not found');

    if (!user.loans) user.loans = [];
    const loanSeq = user.loans.length + 1;

    const nextLoanCode = `LN-2026-${Math.floor(100 + Math.random() * 900)}`;
    const principal = parseFloat(data.principal) || 10000;
    const frequency = data.frequency || 'WEEKLY';
    const totalInstallments = frequency === 'DAILY' ? (parseInt(data.total_installments, 10) || 25) : 10;
    
    // 10% for weekly (10-week), 12.5% for 25-day daily
    const interestRate = frequency === 'DAILY' ? 0.125 : 0.10;
    const totalRepayable = Math.round(principal * (1 + interestRate));
    const installmentAmount = Math.round(totalRepayable / totalInstallments);

    const newLoan = {
      loan_code: nextLoanCode,
      loan_name: data.loan_name ? data.loan_name.trim() : (user.loans.length > 0 ? `Loan #${loanSeq} (${frequency})` : `Primary Loan (${frequency})`),
      principal,
      total_repayable: totalRepayable,
      installment_amount: installmentAmount,
      frequency,
      paid_installments: 0,
      total_installments: totalInstallments,
      next_due_date: new Date(Date.now() + 86400000 * (frequency === 'DAILY' ? 1 : 7)).toISOString().split('T')[0],
      remaining_balance: totalRepayable,
      status: 'ACTIVE',
      disbursed_date: new Date().toISOString().split('T')[0],
    };

    user.loans.unshift(newLoan);
    user.active_loan = newLoan; // point to latest
    user.status = 'ACTIVE';

    // Also inject into dues/collections
    if (frequency === 'DAILY') {
      this.dailyCollections.unshift({
        id: Date.now(),
        customer_id: user.id,
        customer_name: `${user.name}${user.loans.length > 1 ? ` (Loan #${user.loans.length})` : ''}`,
        shop_name: user.shop_name || user.name,
        market_location: user.market_location || 'Field Route',
        stall_no: user.stall_no || '',
        phone: user.phone,
        loan_code: nextLoanCode,
        installment_day: `Day 1 of ${totalInstallments}`,
        due_amount: installmentAmount,
        collected_amount: 0,
        payment_mode: null,
        status: 'PENDING_VISIT',
        collected_time: null,
        receipt_no: null,
        agent: 'Admin Field Manager',
      });
    } else {
      this.weeklyDues.unshift({
        id: Date.now(),
        customer_id: user.id,
        customer_name: `${user.name}${user.loans.length > 1 ? ` (Loan #${user.loans.length})` : ''}`,
        customer_code: user.customer_code,
        phone: user.phone,
        loan_code: nextLoanCode,
        installment_week: `Week 1 of ${totalInstallments}`,
        due_date: newLoan.next_due_date,
        due_amount: installmentAmount,
        remaining_balance: totalRepayable,
        status: 'PENDING',
        paid_date: null,
        payment_mode: null,
        receipt_no: null,
      });
    }

    return {
      ...newLoan,
      borrower_id: user.id,
      borrower_name: user.name,
      borrower_phone: user.phone,
      customer_code: user.customer_code,
      occupation: user.occupation,
    };
  }

  // 1.2 FINANCIAL ACCOUNTING & NET PROFIT ENGINE
  async getFinancialProfitSummary() {
    const allLoans = await this.getLoans();

    // 1. Total Capital Given / Invested / Outflow
    const totalCapitalInvested = allLoans.reduce((sum, l) => sum + (l.principal || 0), 0);

    // 2. Total Collected So Far (Inflow from paid installments)
    let totalAmountCollected = 0;
    let totalPrincipalRecovered = 0;
    let totalInterestEarnedSoFar = 0;

    allLoans.forEach((loan) => {
      const collectedForLoan = (loan.paid_installments || 0) * (loan.installment_amount || 0);
      totalAmountCollected += collectedForLoan;

      // Calculate principal vs interest portion
      const principalPortionPerInstallment = loan.principal / loan.total_installments;
      const interestPortionPerInstallment = (loan.total_repayable - loan.principal) / loan.total_installments;

      totalPrincipalRecovered += Math.round((loan.paid_installments || 0) * principalPortionPerInstallment);
      totalInterestEarnedSoFar += Math.round((loan.paid_installments || 0) * interestPortionPerInstallment);
    });

    // 3. Outstanding Capital & Debt Remaining in Market
    const totalOutstandingBalance = allLoans.reduce((sum, l) => sum + (l.remaining_balance || 0), 0);
    const outstandingPrincipalInMarket = Math.max(0, totalCapitalInvested - totalPrincipalRecovered);

    // 4. Projected Total Returns & Projected Net Profit
    const projectedTotalReturn = allLoans.reduce((sum, l) => sum + (l.total_repayable || 0), 0);
    const projectedTotalNetProfit = Math.max(0, projectedTotalReturn - totalCapitalInvested);

    // 5. Net Profit Realized (Cash-in-hand profit = interest/yield pocketed so far)
    const realizedNetProfit = totalInterestEarnedSoFar;

    // 6. Net Profit Margin & ROI %
    const realizedRoiPercent = totalCapitalInvested > 0 ? ((realizedNetProfit / totalCapitalInvested) * 100).toFixed(1) : 0;
    const projectedRoiPercent = totalCapitalInvested > 0 ? ((projectedTotalNetProfit / totalCapitalInvested) * 100).toFixed(1) : 0;
    const recoveryProgressPercent = projectedTotalReturn > 0 ? Math.round((totalAmountCollected / projectedTotalReturn) * 100) : 0;

    // 7. Counts
    const activeLoans = allLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    const completedLoans = allLoans.filter((l) => l.status === 'PAID_OFF' || l.remaining_balance === 0);
    const overdueLoans = allLoans.filter((l) => l.status === 'OVERDUE');

    return {
      totalCapitalInvested, // Total amount given / spent out of fund
      totalAmountCollected, // Total repayments collected so far
      totalPrincipalRecovered, // Principal portion recovered
      realizedNetProfit, // Net Profit cash pocketed
      outstandingPrincipalInMarket, // Principal at risk remaining with borrowers
      totalOutstandingBalance, // Total remaining debt to collect
      projectedTotalReturn, // Total expected revenue
      projectedTotalNetProfit, // Total expected net profit on full cycle
      realizedRoiPercent: parseFloat(realizedRoiPercent),
      projectedRoiPercent: parseFloat(projectedRoiPercent),
      recoveryProgressPercent,
      activeLoansCount: activeLoans.length,
      completedLoansCount: completedLoans.length,
      overdueLoansCount: overdueLoans.length,
      totalLoansCount: allLoans.length,
    };
  }

  // 1.3 SHOPKEEPER DIRECTORY & DAILY LEDGER
  async getShopkeepers() {
    const shopkeepers = this.users.filter((u) => u.role === 'SHOPKEEPER');

    return shopkeepers.map((shop) => {
      const shopLoans = shop.loans && shop.loans.length > 0 ? shop.loans : (shop.active_loan ? [shop.active_loan] : []);
      const activeDailyLoans = shopLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
      
      const dailyTarget = activeDailyLoans.reduce((sum, l) => sum + (l.installment_amount || 0), 0);
      const totalOutstanding = activeDailyLoans.reduce((sum, l) => sum + (l.remaining_balance || 0), 0);
      const totalPrincipalGiven = shopLoans.reduce((sum, l) => sum + (l.principal || 0), 0);

      // Find today's collection entries for this shop
      const todayCollections = this.dailyCollections.filter((c) => c.customer_id === shop.id);
      const isCollectedToday = todayCollections.length > 0 && todayCollections.every((c) => c.status === 'COLLECTED');
      const isMissedToday = todayCollections.some((c) => c.status === 'MISSED');

      return {
        ...shop,
        loans: shopLoans,
        active_loans_count: activeDailyLoans.length,
        daily_collection_target: dailyTarget,
        total_outstanding: totalOutstanding,
        total_principal_given: totalPrincipalGiven,
        today_collection_status: isCollectedToday ? 'COLLECTED' : isMissedToday ? 'MISSED' : 'PENDING',
        today_entries: todayCollections,
      };
    });
  }

  async recordShopkeeperCollection(shopId, loanCode, paymentMode = 'CASH') {
    const shop = this.users.find((u) => u.id === Number(shopId));
    if (!shop) throw new Error('Shopkeeper not found');

    const loan = shop.loans ? shop.loans.find((l) => l.loan_code === loanCode) : (shop.active_loan && shop.active_loan.loan_code === loanCode ? shop.active_loan : null);
    if (!loan) throw new Error('Loan contract not found');

    const installmentAmount = loan.installment_amount;
    loan.paid_installments = Math.min(loan.total_installments, (loan.paid_installments || 0) + 1);
    loan.remaining_balance = Math.max(0, loan.remaining_balance - installmentAmount);

    if (loan.remaining_balance === 0 || loan.paid_installments >= loan.total_installments) {
      loan.status = 'PAID_OFF';
    }

    // Update or insert daily collection record
    const existing = this.dailyCollections.find((c) => c.customer_id === shop.id && c.loan_code === loanCode);
    const receiptNo = `DLY-${Math.floor(8800 + Math.random() * 999)}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (existing) {
      existing.status = 'COLLECTED';
      existing.collected_amount = installmentAmount;
      existing.payment_mode = paymentMode;
      existing.collected_time = currentTime;
      existing.receipt_no = receiptNo;
    } else {
      this.dailyCollections.unshift({
        id: Date.now(),
        customer_id: shop.id,
        customer_name: shop.name,
        shop_name: shop.shop_name || shop.name,
        market_location: shop.market_location || 'Field Route',
        stall_no: shop.stall_no || '',
        phone: shop.phone,
        loan_code: loanCode,
        installment_day: `Day ${loan.paid_installments} of ${loan.total_installments}`,
        due_amount: installmentAmount,
        collected_amount: installmentAmount,
        payment_mode: paymentMode,
        status: 'COLLECTED',
        collected_time: currentTime,
        receipt_no: receiptNo,
        agent: 'Admin Field Manager',
      });
    }

    this.adminProfile.today_collections += installmentAmount;

    return {
      success: true,
      receipt_no: receiptNo,
      collected_amount: installmentAmount,
      remaining_balance: loan.remaining_balance,
      paid_installments: loan.paid_installments,
      total_installments: loan.total_installments,
    };
  }

  // 2. REPORTS - WEEKLY DUES
  async getWeeklyDues() {
    return this.weeklyDues;
  }

  async collectWeeklyDue(dueId, paymentMode = 'CASH') {
    const target = this.weeklyDues.find((d) => d.id === Number(dueId));
    if (target) {
      target.status = 'PAID';
      target.paid_date = new Date().toISOString().split('T')[0];
      target.payment_mode = paymentMode;
      target.receipt_no = `RCP-${Math.floor(9000 + Math.random() * 999)}`;
      target.remaining_balance = Math.max(0, target.remaining_balance - target.due_amount);

      // Update user state too
      const u = this.users.find((user) => user.id === target.customer_id);
      if (u) {
        const matchingLoan = u.loans ? u.loans.find((l) => l.loan_code === target.loan_code) : u.active_loan;
        if (matchingLoan) {
          matchingLoan.paid_installments += 1;
          matchingLoan.remaining_balance = Math.max(0, matchingLoan.remaining_balance - target.due_amount);
          if (matchingLoan.remaining_balance === 0) matchingLoan.status = 'PAID_OFF';
        }
      }

      // Update Admin performance
      this.adminProfile.today_collections += target.due_amount;
    }
    return target;
  }

  // 3. REPORTS - DAILY COLLECTIONS
  async getDailyCollections() {
    return this.dailyCollections;
  }

  async recordDailyCollection(collectionId, paymentMode = 'CASH') {
    const target = this.dailyCollections.find((c) => c.id === Number(collectionId));
    if (target) {
      target.status = 'COLLECTED';
      target.collected_amount = target.due_amount;
      target.payment_mode = paymentMode;
      target.collected_time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      target.receipt_no = `DLY-${Math.floor(8800 + Math.random() * 999)}`;

      // Update loan balance
      const u = this.users.find((user) => user.id === target.customer_id);
      if (u) {
        const matchingLoan = u.loans ? u.loans.find((l) => l.loan_code === target.loan_code) : u.active_loan;
        if (matchingLoan) {
          matchingLoan.paid_installments += 1;
          matchingLoan.remaining_balance = Math.max(0, matchingLoan.remaining_balance - target.due_amount);
          if (matchingLoan.remaining_balance === 0) matchingLoan.status = 'PAID_OFF';
        }
      }

      this.adminProfile.today_collections += target.due_amount;
    }
    return target;
  }

  // 4. ADMIN PROFILE
  async getAdminProfile() {
    return this.adminProfile;
  }

  async updateAdminProfile(updated) {
    Object.assign(this.adminProfile, updated);
    return this.adminProfile;
  }

  // 5. ADMIN DASHBOARD METRICS
  async getAdminDashboardMetrics() {
    const profitSummary = await this.getFinancialProfitSummary();

    const totalWeeklyTarget = this.weeklyDues.reduce((sum, d) => sum + d.due_amount, 0);
    const collectedWeekly = this.weeklyDues.filter((d) => d.status === 'PAID').reduce((sum, d) => sum + d.due_amount, 0);

    const totalDailyTarget = this.dailyCollections.reduce((sum, c) => sum + c.due_amount, 0);
    const collectedDaily = this.dailyCollections.filter((c) => c.status === 'COLLECTED').reduce((sum, c) => sum + c.collected_amount, 0);

    const overdueCount = this.weeklyDues.filter((d) => d.status === 'OVERDUE').length +
      this.dailyCollections.filter((c) => c.status === 'MISSED').length;

    return {
      todayDailyTarget: totalDailyTarget,
      todayDailyCollected: collectedDaily,
      todayWeeklyTarget: totalWeeklyTarget,
      weeklyCollected: collectedWeekly,
      totalActiveUsers: this.users.filter((u) => u.status === 'ACTIVE').length,
      overdueBorrowersCount: overdueCount,
      repaymentRate: 98.4,
      profitSummary,
    };
  }

  // 6. ORGANIZATIONS (MULTI-TENANT GOVERNANCE)
  async getOrganizations() {
    return this.organizations;
  }

  async createOrganization(data) {
    const nextId = this.organizations.length + 1;
    const newOrg = {
      id: nextId,
      name: data.name,
      code: data.code || `ORG-0${nextId}`,
      status: 'ACTIVE',
      plan: data.plan || 'PRO',
      branch_count: 1,
      total_customers: 0,
      active_portfolio: 0,
      initial_capital: parseFloat(data.initial_capital) || 500000,
      currency: 'INR',
      admin_name: data.admin_name,
      admin_email: data.admin_email,
      admin_phone: data.admin_phone,
      address: data.address,
      created_at: new Date().toISOString().split('T')[0],
    };
    this.organizations.unshift(newOrg);
    return newOrg;
  }

  async updateOrgStatus(orgId, status) {
    const org = this.organizations.find((o) => o.id === Number(orgId));
    if (org) org.status = status;
    return org;
  }
}

export const api = new ApiService();
export default api;
