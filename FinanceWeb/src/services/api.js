import {
  MOCK_USERS,
  MOCK_FUND_SUMMARY,
  MOCK_CUSTOMERS,
} from './mockData';

// Initial Mock Borrowers & Users
const INITIAL_USERS = [
  {
    id: 1,
    customerId: 1,
    customer_code: 'CUST-001',
    customerCode: 'CUST-001',
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
    dateJoined: '2025-05-12',
    joined_date: '2025-05-12',
    notes: 'Long-time borrower with prompt weekly repayments.',
    activeLoansCount: 2,
    completedLoansCount: 3,
    outstandingAmount: 23100,
    totalBorrowed: 30000,
    totalPaid: 10900,
    financialSummary: {
      totalBorrowed: 60000,
      totalPayable: 66000,
      totalPaid: 42900,
      outstanding: 23100,
      activeLoansCount: 2,
      completedLoansCount: 3,
      nextDue: { dueDate: '2026-09-15', amount: 2200, installmentNumber: 5 },
      lastPayment: { date: '2026-09-08', amount: 2200, paymentNumber: 'RCP-20260908-0012' },
    },
    loans: [
      {
        id: 101,
        loan_code: 'LN-2026-004',
        loanNumber: 'LN-2026-004',
        loan_name: 'Workshop Machinery Expansion',
        principal: 20000,
        principal_amount: 20000,
        total_repayable: 22000,
        total_repayment_amount: 22000,
        installment_amount: 2200,
        frequency: 'WEEKLY',
        repayment_frequency: 'WEEKLY',
        paid_installments: 4,
        total_installments: 10,
        disbursed_date: '2026-08-15',
        next_due_date: '2026-09-15',
        remaining_balance: 13200,
        status: 'ACTIVE',
      },
      {
        id: 102,
        loan_code: 'LN-2026-018',
        loanNumber: 'LN-2026-018',
        loan_name: 'Raw Material Purchase (Concurrent)',
        principal: 10000,
        principal_amount: 10000,
        total_repayable: 11000,
        total_repayment_amount: 11000,
        installment_amount: 1100,
        frequency: 'WEEKLY',
        repayment_frequency: 'WEEKLY',
        paid_installments: 1,
        total_installments: 10,
        disbursed_date: '2026-09-01',
        next_due_date: '2026-09-15',
        remaining_balance: 9900,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      id: 101,
      loan_code: 'LN-2026-004',
      loanNumber: 'LN-2026-004',
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
    customerId: 2,
    customer_code: 'CUST-002',
    customerCode: 'CUST-002',
    name: 'Murugan Supermarket',
    shop_name: 'Murugan Supermarket & Provisions',
    shopName: 'Murugan Supermarket & Provisions',
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
    dateJoined: '2025-07-04',
    joined_date: '2025-07-04',
    notes: 'Daily merchant stall. Consistent QR collections.',
    activeLoansCount: 2,
    completedLoansCount: 2,
    outstandingAmount: 36900,
    totalBorrowed: 60000,
    totalPaid: 30600,
    financialSummary: {
      totalBorrowed: 60000,
      totalPayable: 67500,
      totalPaid: 30600,
      outstanding: 36900,
      activeLoansCount: 2,
      completedLoansCount: 2,
      nextDue: { dueDate: '2026-09-10', amount: 1800, installmentNumber: 16 },
      lastPayment: { date: '2026-09-10', amount: 1800, paymentNumber: 'RCP-20260910-0044' },
    },
    loans: [
      {
        id: 103,
        loan_code: 'LN-2026-005',
        loanNumber: 'LN-2026-005',
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
    ],
    active_loan: {
      id: 103,
      loan_code: 'LN-2026-005',
      loanNumber: 'LN-2026-005',
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
    repayment_discipline: 'Flawless Daily Merchant',
  },
  {
    id: 3,
    customerId: 3,
    customer_code: 'CUST-003',
    customerCode: 'CUST-003',
    name: 'Anitha Lakshmi',
    phone: '9790887766',
    email: 'anitha.crafts@gmail.com',
    role: 'COMMON_CUSTOMER',
    type_label: 'Borrower (Weekly)',
    status: 'ACTIVE',
    credit_limit: 30000,
    occupation: 'Handloom & Tailoring',
    city: 'Mylapore, Chennai',
    address: '18 Kutchery Road, Mylapore, Chennai',
    dateJoined: '2025-08-10',
    joined_date: '2025-08-10',
    notes: 'Tailoring business expansion loan.',
    activeLoansCount: 1,
    completedLoansCount: 1,
    outstandingAmount: 5500,
    totalBorrowed: 10000,
    totalPaid: 5500,
    financialSummary: {
      totalBorrowed: 10000,
      totalPayable: 11000,
      totalPaid: 5500,
      outstanding: 5500,
      activeLoansCount: 1,
      completedLoansCount: 1,
      nextDue: { dueDate: '2026-09-12', amount: 1100, installmentNumber: 6 },
      lastPayment: { date: '2026-09-05', amount: 1100, paymentNumber: 'RCP-20260905-0019' },
    },
    loans: [
      {
        id: 104,
        loan_code: 'LN-2026-006',
        loanNumber: 'LN-2026-006',
        loan_name: 'Handloom Silk Purchase',
        principal: 10000,
        total_repayable: 11000,
        installment_amount: 1100,
        frequency: 'WEEKLY',
        paid_installments: 5,
        total_installments: 10,
        disbursed_date: '2026-08-08',
        next_due_date: '2026-09-12',
        remaining_balance: 5500,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      id: 104,
      loan_code: 'LN-2026-006',
      loanNumber: 'LN-2026-006',
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
    repayment_discipline: 'Regular Weekly Payer',
  },
  {
    id: 4,
    customerId: 4,
    customer_code: 'CUST-004',
    customerCode: 'CUST-004',
    name: 'Selvam Tea Stall',
    shop_name: 'Selvam Hot Tea & Tiffin Stall',
    shopName: 'Selvam Hot Tea & Tiffin Stall',
    market_location: 'T. Nagar Bus Terminus',
    stall_no: 'Stall #05',
    phone: '9444123456',
    email: 'selvam.tea@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'ACTIVE',
    credit_limit: 25000,
    occupation: 'Tea Stall Owner',
    city: 'T. Nagar, Chennai',
    address: 'Near T. Nagar Bus Terminus',
    dateJoined: '2025-11-20',
    joined_date: '2025-11-20',
    notes: 'Tea stall merchant. Overdue on recent daily installments.',
    activeLoansCount: 1,
    completedLoansCount: 0,
    outstandingAmount: 12825,
    totalBorrowed: 15000,
    totalPaid: 4050,
    financialSummary: {
      totalBorrowed: 15000,
      totalPayable: 16875,
      totalPaid: 4050,
      outstanding: 12825,
      activeLoansCount: 1,
      completedLoansCount: 0,
      nextDue: { dueDate: '2026-08-25', amount: 675, installmentNumber: 7 },
      lastPayment: { date: '2026-08-20', amount: 675, paymentNumber: 'RCP-20260820-0082' },
    },
    loans: [
      {
        id: 105,
        loan_code: 'LN-2026-007',
        loanNumber: 'LN-2026-007',
        loan_name: 'Tea Stall Gas & Utensils',
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
      id: 105,
      loan_code: 'LN-2026-007',
      loanNumber: 'LN-2026-007',
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
    customerId: 5,
    customer_code: 'CUST-005',
    customerCode: 'CUST-005',
    name: 'Suresh Kumar',
    phone: '9841238901',
    email: 'suresh.k@gmail.com',
    role: 'COMMON_CUSTOMER',
    type_label: 'Borrower (Weekly)',
    status: 'ACTIVE',
    credit_limit: 40000,
    occupation: 'Mobile Technician',
    city: 'Triplicane, Chennai',
    address: '88 High Road, Triplicane, Chennai',
    dateJoined: '2026-01-10',
    joined_date: '2026-01-10',
    notes: 'New borrower for tools and workstation upgrade.',
    activeLoansCount: 1,
    completedLoansCount: 0,
    outstandingAmount: 20000,
    totalBorrowed: 20000,
    totalPaid: 4000,
    financialSummary: {
      totalBorrowed: 20000,
      totalPayable: 24000,
      totalPaid: 4000,
      outstanding: 20000,
      activeLoansCount: 1,
      completedLoansCount: 0,
      nextDue: { dueDate: '2026-09-11', amount: 2000, installmentNumber: 3 },
      lastPayment: { date: '2026-08-28', amount: 2000, paymentNumber: 'RCP-20260828-0051' },
    },
    loans: [
      {
        id: 106,
        loan_code: 'LN-2026-010',
        loanNumber: 'LN-2026-010',
        loan_name: 'Workstation Setup',
        principal: 20000,
        total_repayable: 24000,
        installment_amount: 2000,
        frequency: 'WEEKLY',
        paid_installments: 2,
        total_installments: 12,
        disbursed_date: '2026-08-20',
        next_due_date: '2026-09-11',
        remaining_balance: 20000,
        status: 'ACTIVE',
      },
    ],
    active_loan: {
      id: 106,
      loan_code: 'LN-2026-010',
      loanNumber: 'LN-2026-010',
      principal: 20000,
      total_repayable: 24000,
      installment_amount: 2000,
      frequency: 'WEEKLY',
      paid_installments: 2,
      total_installments: 12,
      next_due_date: '2026-09-11',
      remaining_balance: 20000,
      status: 'ACTIVE',
    },
    lifecycle_completed: 0,
    repayment_discipline: 'Active',
  },
];

// Initial Payment Schedule Obligations
const INITIAL_PAYMENT_SCHEDULE = [
  {
    scheduleId: 1001,
    loanId: 106,
    userId: 5,
    customerId: 5,
    customerName: 'Suresh Kumar',
    customerPhone: '9841238901',
    customerAddress: '88 High Road, Triplicane, Chennai',
    shopName: '',
    customerType: 'COMMON_CUSTOMER',
    loanNumber: 'LN-2026-010',
    frequency: 'WEEKLY',
    installmentNumber: 3,
    dueDate: '2026-09-11',
    expectedAmount: 2000,
    paidAmount: 0,
    balance: 2000,
    status: 'UNPAID',
    paidAt: null,
  },
  {
    scheduleId: 1002,
    loanId: 104,
    userId: 3,
    customerId: 3,
    customerName: 'Anitha Lakshmi',
    customerPhone: '9790887766',
    customerAddress: '18 Kutchery Road, Mylapore, Chennai',
    shopName: '',
    customerType: 'COMMON_CUSTOMER',
    loanNumber: 'LN-2026-006',
    frequency: 'WEEKLY',
    installmentNumber: 6,
    dueDate: '2026-09-12',
    expectedAmount: 1100,
    paidAmount: 500,
    balance: 600,
    status: 'PARTIAL',
    paidAt: null,
  },
  {
    scheduleId: 1003,
    loanId: 105,
    userId: 4,
    customerId: 4,
    customerName: 'Selvam Tea Stall',
    customerPhone: '9444123456',
    customerAddress: 'Near T. Nagar Bus Terminus',
    shopName: 'Selvam Hot Tea & Tiffin Stall',
    customerType: 'SHOPKEEPER',
    loanNumber: 'LN-2026-007',
    frequency: 'DAILY',
    installmentNumber: 7,
    dueDate: '2026-09-08',
    expectedAmount: 675,
    paidAmount: 0,
    balance: 675,
    status: 'OVERDUE',
    paidAt: null,
  },
  {
    scheduleId: 1004,
    loanId: 101,
    userId: 1,
    customerId: 1,
    customerName: 'Kumar S',
    customerPhone: '9876543210',
    customerAddress: '42, North Car Street, Triplicane, Chennai',
    shopName: '',
    customerType: 'COMMON_CUSTOMER',
    loanNumber: 'LN-2026-004',
    frequency: 'WEEKLY',
    installmentNumber: 4,
    dueDate: '2026-09-10',
    expectedAmount: 2200,
    paidAmount: 2200,
    balance: 0,
    status: 'PAID',
    paidAt: '2026-09-10 14:30:00',
  },
  {
    scheduleId: 1005,
    loanId: 103,
    userId: 2,
    customerId: 2,
    customerName: 'Murugan Supermarket',
    customerPhone: '9840112233',
    customerAddress: '12 Bazaar Road, Saidapet, Chennai',
    shopName: 'Murugan Supermarket & Provisions',
    customerType: 'SHOPKEEPER',
    loanNumber: 'LN-2026-005',
    frequency: 'DAILY',
    installmentNumber: 15,
    dueDate: '2026-09-10',
    expectedAmount: 1800,
    paidAmount: 1800,
    balance: 0,
    status: 'PAID',
    paidAt: '2026-09-10 11:30:00',
  },
  {
    scheduleId: 1006,
    loanId: 101,
    userId: 1,
    customerId: 1,
    customerName: 'Kumar S',
    customerPhone: '9876543210',
    customerAddress: '42, North Car Street, Triplicane, Chennai',
    shopName: '',
    customerType: 'COMMON_CUSTOMER',
    loanNumber: 'LN-2026-004',
    frequency: 'WEEKLY',
    installmentNumber: 3,
    dueDate: '2026-09-03',
    expectedAmount: 2200,
    paidAmount: 2200,
    balance: 0,
    status: 'PAID',
    paidAt: '2026-09-03 12:00:00',
  },
  {
    scheduleId: 1007,
    loanId: 106,
    userId: 5,
    customerId: 5,
    customerName: 'Suresh Kumar',
    customerPhone: '9841238901',
    customerAddress: '88 High Road, Triplicane, Chennai',
    shopName: '',
    customerType: 'COMMON_CUSTOMER',
    loanNumber: 'LN-2026-010',
    frequency: 'WEEKLY',
    installmentNumber: 2,
    dueDate: '2026-09-04',
    expectedAmount: 2000,
    paidAmount: 2000,
    balance: 0,
    status: 'PAID',
    paidAt: '2026-09-04 10:15:00',
  },
];

// Initial Immutable Payments
const INITIAL_PAYMENTS = [
  {
    id: 1,
    payment_number: 'RCP-20260910-0044',
    customer_id: 2,
    loan_id: 103,
    schedule_id: 1005,
    amount: 1800,
    payment_date: '2026-09-10 11:30:00',
    payment_method: 'UPI',
    reference_number: 'UPI-984011-88',
    status: 'COMPLETED',
    notes: 'Daily merchant collection',
    loan_number: 'LN-2026-005',
    collector_name: 'Admin Field Manager',
  },
  {
    id: 2,
    payment_number: 'RCP-20260910-0012',
    customer_id: 1,
    loan_id: 101,
    schedule_id: 1004,
    amount: 2200,
    payment_date: '2026-09-10 14:30:00',
    payment_method: 'CASH',
    reference_number: 'REC-9230',
    status: 'COMPLETED',
    notes: 'Week 4 installment',
    loan_number: 'LN-2026-004',
    collector_name: 'Admin Field Manager',
  },
  {
    id: 3,
    payment_number: 'RCP-20260905-0019',
    customer_id: 3,
    loan_id: 104,
    schedule_id: null,
    amount: 1100,
    payment_date: '2026-09-05 16:00:00',
    payment_method: 'CASH',
    reference_number: 'REC-9102',
    status: 'COMPLETED',
    notes: 'Week 5 installment',
    loan_number: 'LN-2026-006',
    collector_name: 'Admin Field Manager',
  },
  {
    id: 4,
    payment_number: 'RCP-20260904-0015',
    customer_id: 5,
    loan_id: 106,
    schedule_id: 1007,
    amount: 2000,
    payment_date: '2026-09-04 10:15:00',
    payment_method: 'CASH',
    reference_number: 'REC-8841',
    status: 'COMPLETED',
    notes: 'Week 2 installment',
    loan_number: 'LN-2026-010',
    collector_name: 'Admin Field Manager',
  },
];

const INITIAL_ORGANIZATIONS = [
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

    // Stateful in-memory repositories
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.schedules = JSON.parse(JSON.stringify(INITIAL_PAYMENT_SCHEDULE));
    this.payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
    this.organizations = JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS));
    this.adminProfile = {
      id: 2,
      name: 'Admin Field Manager',
      email: 'ops@fundlending.com',
      phone: '+91 88888 88888',
      role: 'Branch Operations Officer',
      role_tag: 'BRANCH ADMIN / OPERATIONS',
      organization: 'Apex Finance Ltd',
      org_code: 'ORG-APEX',
      branch: 'Triplicane Main Branch',
      assigned_route: 'Triplicane & Saidapet Field Route',
      today_collections: 4000,
      lifetime_collections: 512000,
    };
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('finance_token', token);
    else localStorage.removeItem('finance_token');
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  // ==========================================
  // AUTH
  // ==========================================
  async login(identifier, password) {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.setToken(json.data.token);
          return json.data;
        }
      }
    } catch (_) {}

    // Fallback Mock Login
    const fakeToken = `mock-token-${Date.now()}`;
    this.setToken(fakeToken);
    const userProfile =
      identifier === 'admin@fundlending.com' || identifier === '8888888888'
        ? MOCK_USERS.admin
        : identifier === '9999999999'
        ? MOCK_USERS.superadmin
        : MOCK_USERS.user;

    return { token: fakeToken, user: userProfile };
  }

  // ==========================================
  // USER / BORROWER MANAGEMENT
  // ==========================================
  async createUser(data) {
    try {
      const res = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (_) {}

    // Mock Fallback
    const nextId = this.users.length + 1;
    const isShop = data.role === 'SHOPKEEPER';
    const newUser = {
      id: nextId,
      customerId: nextId,
      customer_code: `CUST-00${nextId}`,
      customerCode: `CUST-00${nextId}`,
      name: (data.name || data.fullName || '').trim(),
      phone: (data.phone || '').trim(),
      email: data.email ? data.email.trim() : `${(data.name || 'user').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      role: data.role || 'COMMON_CUSTOMER',
      type_label: isShop ? 'Merchant (Daily)' : 'Borrower (Weekly)',
      shop_name: data.shop_name || data.shopName || (isShop ? `${data.name} Store` : ''),
      shopName: data.shop_name || data.shopName || (isShop ? `${data.name} Store` : ''),
      address: data.address || '',
      city: data.city || 'Chennai',
      occupation: data.occupation || '',
      status: data.status || 'ACTIVE',
      notes: data.notes || '',
      dateJoined: data.dateJoined || new Date().toISOString().slice(0, 10),
      joined_date: data.dateJoined || new Date().toISOString().slice(0, 10),
      activeLoansCount: 0,
      completedLoansCount: 0,
      outstandingAmount: 0,
      totalBorrowed: 0,
      totalPaid: 0,
      financialSummary: {
        totalBorrowed: 0,
        totalPayable: 0,
        totalPaid: 0,
        outstanding: 0,
        activeLoansCount: 0,
        completedLoansCount: 0,
        nextDue: null,
        lastPayment: null,
      },
      loans: [],
      active_loan: null,
      paymentHistory: [],
    };

    this.users.unshift(newUser);
    return newUser;
  }

  // Alias for backward compatibility
  async addUser(data) {
    return this.createUser(data);
  }

  async getUsers(params = {}) {
    try {
      const queryStr = new URLSearchParams(params).toString();
      const res = await fetch(`${this.baseUrl}/users?${queryStr}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data.users || json.data;
        }
      }
    } catch (_) {}

    // Mock Fallback
    let result = [...this.users];
    if (params.search) {
      const s = params.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.phone.includes(s) ||
          (u.customerCode && u.customerCode.toLowerCase().includes(s)) ||
          (u.shopName && u.shopName.toLowerCase().includes(s))
      );
    }
    if (params.status && params.status !== 'ALL') {
      result = result.filter((u) => u.status === params.status);
    }
    if (params.role && params.role !== 'ALL') {
      result = result.filter((u) => u.role === params.role);
    }
    return result;
  }

  async getUserById(id) {
    try {
      const res = await fetch(`${this.baseUrl}/users/${id}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (_) {}

    // Mock Fallback
    const u = this.users.find((user) => user.id === Number(id) || user.customerId === Number(id));
    if (!u) return this.users[0];

    // Compute user payment history
    const history = this.payments.filter((p) => p.customer_id === u.id || p.customer_id === u.customerId);

    // Compute Ongoing and Completed loans
    const allUserLoans = u.loans || (u.active_loan ? [u.active_loan] : []);
    const ongoingLoans = allUserLoans.filter((l) => l.status === 'ACTIVE' || (l.remaining_balance || 0) > 0);
    
    // Default completed loans if none in array
    const completedLoans = allUserLoans.filter((l) => l.status === 'COMPLETED') || [];
    if (completedLoans.length === 0 && (u.completedLoansCount || 0) > 0) {
      for (let i = 1; i <= (u.completedLoansCount || 2); i++) {
        completedLoans.push({
          id: 500 + i,
          loan_code: `LN-2025-00${i}`,
          loanNumber: `LN-2025-00${i}`,
          loan_name: `Loan Cycle #${i} (${u.role === 'SHOPKEEPER' ? 'Daily Merchant' : 'Weekly Loan'})`,
          principal: 10000 * i,
          principal_amount: 10000 * i,
          total_repayable: Math.round(10000 * i * (u.role === 'SHOPKEEPER' ? 1.125 : 1.1)),
          total_repaid: Math.round(10000 * i * (u.role === 'SHOPKEEPER' ? 1.125 : 1.1)),
          frequency: u.role === 'SHOPKEEPER' ? 'DAILY' : 'WEEKLY',
          paid_installments: u.role === 'SHOPKEEPER' ? 25 : 10,
          total_installments: u.role === 'SHOPKEEPER' ? 25 : 10,
          status: 'COMPLETED',
          disbursed_date: `2025-0${i + 2}-10`,
          settled_date: `2025-0${i + 4}-20`,
          rating: '100% On-Time (Flawless)',
        });
      }
    }

    return {
      ...u,
      ongoingLoans,
      completedLoans,
      paymentHistory: history,
      financialSummary: {
        totalBorrowed: u.totalBorrowed || 30000,
        totalRepaid: u.totalPaid || 20000,
        outstanding: u.outstandingAmount || 0,
        completedCount: completedLoans.length,
        activeCount: ongoingLoans.length,
        creditRating: u.credit_rating || 'A+',
        repaymentReliability: '100% On-Time Record',
      },
    };
  }

  async updateUser(id, data) {
    try {
      const res = await fetch(`${this.baseUrl}/users/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (_) {}

    // Mock Fallback
    const u = this.users.find((user) => user.id === Number(id));
    if (u) {
      if (data.name) u.name = data.name;
      if (data.phone) u.phone = data.phone;
      if (data.address !== undefined) u.address = data.address;
      if (data.city !== undefined) u.city = data.city;
      if (data.role) u.role = data.role;
      if (data.status) u.status = data.status;
      if (data.notes !== undefined) u.notes = data.notes;
      if (data.occupation !== undefined) u.occupation = data.occupation;
      if (data.shopName !== undefined) {
        u.shopName = data.shopName;
        u.shop_name = data.shopName;
      }
    }
    return u;
  }

  async updateUserStatus(id, status) {
    return this.updateUser(id, { status });
  }

  // ==========================================
  // LOANS & PAYMENT SCHEDULE GENERATION
  // ==========================================
  async createLoan(data) {
    try {
      const res = await fetch(`${this.baseUrl}/loans`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (_) {}

    // Mock Fallback
    const parsedPrincipal = parseFloat(data.principal || data.principalAmount || 20000);
    const frequency = data.frequency || data.repaymentFrequency || 'WEEKLY';
    const installments = frequency === 'DAILY' ? 25 : (parseInt(data.installments, 10) || 10);
    const interestRate = frequency === 'DAILY' ? 0.125 : 0.10;
    const totalRepayable = Math.round(parsedPrincipal * (1 + interestRate));
    const installmentAmt = Math.round(totalRepayable / installments);
    const loanCode = `LN-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newLoan = {
      id: Date.now(),
      loan_code: loanCode,
      loanNumber: loanCode,
      loan_name: data.loan_name || `${frequency === 'DAILY' ? 'Daily Merchant' : 'Weekly Personal'} Loan`,
      principal: parsedPrincipal,
      principal_amount: parsedPrincipal,
      total_repayable: totalRepayable,
      total_repayment_amount: totalRepayable,
      installment_amount: installmentAmt,
      frequency,
      repayment_frequency: frequency,
      paid_installments: 0,
      total_installments: installments,
      disbursed_date: new Date().toISOString().slice(0, 10),
      next_due_date: new Date(Date.now() + (frequency === 'DAILY' ? 1 : 7) * 86400000).toISOString().slice(0, 10),
      remaining_balance: totalRepayable,
      status: 'ACTIVE',
    };

    // Attach to user
    const targetUser = this.users.find((u) => u.id === Number(data.userId || data.customerId));
    if (targetUser) {
      if (!targetUser.loans) targetUser.loans = [];
      targetUser.loans.push(newLoan);
      targetUser.active_loan = newLoan;
      targetUser.activeLoansCount = (targetUser.activeLoansCount || 0) + 1;
      targetUser.outstandingAmount = (targetUser.outstandingAmount || 0) + totalRepayable;
      targetUser.totalBorrowed = (targetUser.totalBorrowed || 0) + parsedPrincipal;
    }

    // Generate Schedules
    for (let i = 1; i <= installments; i++) {
      const dueDate = new Date(Date.now() + (frequency === 'DAILY' ? i : i * 7) * 86400000)
        .toISOString()
        .slice(0, 10);

      this.schedules.push({
        scheduleId: Date.now() + i,
        loanId: newLoan.id,
        userId: targetUser ? targetUser.id : 1,
        customerId: targetUser ? targetUser.id : 1,
        customerName: targetUser ? targetUser.name : 'Borrower',
        customerPhone: targetUser ? targetUser.phone : '',
        customerAddress: targetUser ? targetUser.address : '',
        shopName: targetUser ? targetUser.shopName : '',
        customerType: targetUser ? targetUser.role : 'COMMON_CUSTOMER',
        loanNumber: loanCode,
        frequency,
        installmentNumber: i,
        dueDate,
        expectedAmount: installmentAmt,
        paidAmount: 0,
        balance: installmentAmt,
        status: 'UNPAID',
        paidAt: null,
      });
    }

    return newLoan;
  }

  async getLoans() {
    const allLoans = [];
    for (const u of this.users) {
      if (u.loans) {
        for (const l of u.loans) {
          allLoans.push({ ...l, customerName: u.name, customerPhone: u.phone, customerId: u.id });
        }
      }
    }
    return allLoans;
  }

  // ==========================================
  // DYNAMIC PAYMENT REPORTING & WEEK NAVIGATION
  // ==========================================
  async getPaymentReport({ startDate, endDate, frequency, status }) {
    try {
      const q = new URLSearchParams({
        start_date: startDate || '',
        end_date: endDate || '',
        frequency: frequency || 'ALL',
        status: status || 'ALL',
      }).toString();

      const res = await fetch(`${this.baseUrl}/reports/payments?${q}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (_) {}

    // Mock Fallback Calculation
    const today = new Date().toISOString().slice(0, 10);
    const from = startDate || today;
    const to = endDate || today;

    // Filter schedules within date range
    let matched = this.schedules.filter((s) => {
      if (from && to) {
        return s.dueDate >= from && s.dueDate <= to;
      }
      return true;
    });

    if (frequency && frequency !== 'ALL') {
      matched = matched.filter((s) => s.frequency === frequency);
    }

    let expectedTotal = 0;
    let collectedTotal = 0;
    let outstandingTotal = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let partialCount = 0;
    let overdueCount = 0;

    const formattedRecords = matched.map((s) => {
      const exp = parseFloat(s.expectedAmount || 0);
      const paid = parseFloat(s.paidAmount || 0);
      const bal = Math.max(0, exp - paid);

      let calcStatus = 'UNPAID';
      let sortPriority = 2; // UNPAID

      if (bal === 0 || paid >= exp) {
        calcStatus = 'PAID';
        sortPriority = 4; // PAID bottom
        paidCount++;
      } else if (paid > 0) {
        calcStatus = 'PARTIAL';
        sortPriority = 3; // PARTIAL middle
        partialCount++;
      } else if (s.dueDate < today) {
        calcStatus = 'OVERDUE';
        sortPriority = 1; // OVERDUE top
        overdueCount++;
      } else {
        calcStatus = 'UNPAID';
        sortPriority = 2; // UNPAID top
        unpaidCount++;
      }

      expectedTotal += exp;
      collectedTotal += paid;
      outstandingTotal += bal;

      return {
        ...s,
        balance: bal,
        status: calcStatus,
        sortPriority,
      };
    });

    // Sort strictly: OVERDUE (1) -> UNPAID (2) -> PARTIAL (3) -> PAID (4)
    formattedRecords.sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) {
        return a.sortPriority - b.sortPriority;
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const finalRecords =
      status && status !== 'ALL'
        ? formattedRecords.filter((r) => r.status === status)
        : formattedRecords;

    return {
      period: { start: from, end: to },
      summary: {
        expected: expectedTotal,
        collected: collectedTotal,
        outstanding: outstandingTotal,
        paid_count: paidCount,
        unpaid_count: unpaidCount,
        partial_count: partialCount,
        overdue_count: overdueCount,
        total_records: finalRecords.length,
      },
      records: finalRecords,
    };
  }

  // ==========================================
  // PAYMENT RECORDING (IMMUTABLE TRANSACTION)
  // ==========================================
  async recordPayment(paymentData) {
    try {
      const res = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (_) {}

    // Mock Fallback Transaction Engine
    const amt = parseFloat(paymentData.amount);
    if (isNaN(amt) || amt <= 0) throw new Error('Invalid payment amount');

    const paymentNum = `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const scheduleId = paymentData.scheduleId || paymentData.schedule_id;
    const loanId = paymentData.loanId || paymentData.loan_id;
    const userId = paymentData.userId || paymentData.customerId;

    // 1. Update Schedule Row
    const schedule = this.schedules.find((s) => s.scheduleId === Number(scheduleId));
    if (schedule) {
      schedule.paidAmount = (schedule.paidAmount || 0) + amt;
      schedule.balance = Math.max(0, schedule.expectedAmount - schedule.paidAmount);
      schedule.status = schedule.balance === 0 ? 'PAID' : 'PARTIAL';
      schedule.paidAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    }

    // 2. Update User & Loan
    const u = this.users.find((user) => user.id === Number(userId) || user.customerId === Number(userId));
    if (u) {
      u.outstandingAmount = Math.max(0, (u.outstandingAmount || 0) - amt);
      u.totalPaid = (u.totalPaid || 0) + amt;

      const targetLoan = u.loans
        ? u.loans.find((l) => l.id === Number(loanId) || l.loan_code === paymentData.loanNumber)
        : u.active_loan;

      if (targetLoan) {
        targetLoan.remaining_balance = Math.max(0, targetLoan.remaining_balance - amt);
        targetLoan.paid_installments = (targetLoan.paid_installments || 0) + 1;

        if (targetLoan.remaining_balance === 0) {
          targetLoan.status = 'COMPLETED';
          u.completedLoansCount = (u.completedLoansCount || 0) + 1;
          u.activeLoansCount = Math.max(0, (u.activeLoansCount || 1) - 1);
        }
      }
    }

    // 3. Create Immutable Payment Record
    const newPayment = {
      id: Date.now(),
      payment_number: paymentNum,
      customer_id: userId,
      loan_id: loanId,
      schedule_id: scheduleId,
      amount: amt,
      payment_date: paymentData.paymentDate || new Date().toISOString().replace('T', ' ').slice(0, 19),
      payment_method: paymentData.paymentMethod || 'CASH',
      reference_number: paymentData.referenceNumber || paymentNum,
      status: 'COMPLETED',
      notes: paymentData.notes || 'Collection receipt',
      loan_number: paymentData.loanNumber || (schedule ? schedule.loanNumber : 'LN-2026'),
      collector_name: 'Admin Field Manager',
    };
    this.payments.unshift(newPayment);

    // 4. Update Admin today collections
    this.adminProfile.today_collections = (this.adminProfile.today_collections || 0) + amt;

    return {
      success: true,
      paymentNumber: paymentNum,
      amountCollected: amt,
      schedule,
      payment: newPayment,
    };
  }

  async getPaymentHistory(userId) {
    if (userId) {
      return this.payments.filter((p) => p.customer_id === Number(userId));
    }
    return this.payments;
  }

  // Legacy helper aliases
  async getWeeklyDues() {
    const report = await this.getPaymentReport({ frequency: 'WEEKLY' });
    return report.records.map((r) => ({
      id: r.scheduleId,
      customer_id: r.userId,
      customer_name: r.customerName,
      customer_code: `CUST-00${r.userId}`,
      phone: r.customerPhone,
      loan_code: r.loanNumber,
      installment_week: `Week ${r.installmentNumber}`,
      due_date: r.dueDate,
      due_amount: r.expectedAmount,
      remaining_balance: r.balance,
      status: r.status,
      paid_date: r.paidAt,
      payment_mode: 'CASH',
      receipt_no: `RCP-${r.scheduleId}`,
    }));
  }

  async collectWeeklyDue(dueId, paymentMode = 'CASH') {
    const schedule = this.schedules.find((s) => s.scheduleId === Number(dueId));
    if (schedule) {
      return await this.recordPayment({
        scheduleId: schedule.scheduleId,
        loanId: schedule.loanId,
        userId: schedule.userId,
        amount: schedule.balance || schedule.expectedAmount,
        paymentMethod: paymentMode,
        paymentDate: new Date().toISOString().slice(0, 10),
      });
    }
    return { receipt_no: 'RCP-001' };
  }

  async getDailyCollections() {
    const report = await this.getPaymentReport({ frequency: 'DAILY' });
    return report.records.map((r) => ({
      id: r.scheduleId,
      customer_id: r.userId,
      shopkeeper_name: r.customerName,
      shop_name: r.shopName || r.customerName,
      market_location: 'Local Bazaar Route',
      stall_no: 'Shop #12',
      phone: r.customerPhone,
      loan_code: r.loanNumber,
      installment_day: `Day ${r.installmentNumber}`,
      due_amount: r.expectedAmount,
      collected_amount: r.paidAmount,
      payment_mode: 'CASH',
      status: r.status === 'PAID' ? 'COLLECTED' : (r.status === 'OVERDUE' ? 'MISSED' : 'PENDING_VISIT'),
      collected_time: r.paidAt ? r.paidAt.slice(11, 16) : null,
      receipt_no: `DLY-${r.scheduleId}`,
      agent: 'Admin Field Manager',
    }));
  }

  async collectDailyInstallment(collectionId, paymentMode = 'CASH') {
    return this.collectWeeklyDue(collectionId, paymentMode);
  }

  async recordDailyCollection(collectionId, paymentMode = 'CASH') {
    return this.collectWeeklyDue(collectionId, paymentMode);
  }

  // ==========================================
  // DASHBOARD & ADMIN METRICS
  // ==========================================
  async getAdminDashboardMetrics() {
    try {
      const res = await fetch(`${this.baseUrl}/reports/dashboard`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          return {
            totalPrincipalDisbursed: d.moneyCurrentlyLent || 750000,
            todayDailyCollected: d.todayCollection || 4000,
            weeklyCollected: d.monthlyCollection || 38000,
            outstandingBalance: d.outstandingPrincipal || 270000,
            totalActiveUsers: d.loanCounts?.activeLoans || this.users.filter((u) => u.status === 'ACTIVE').length,
            overdueBorrowersCount: d.loanCounts?.overdueLoans || 3,
            repaymentRate: 98.4,
            availableCash: d.availableCash || 285400,
          };
        }
      }
    } catch (_) {}

    const totalActive = this.users.filter((u) => u.status === 'ACTIVE').length;
    const totalOut = this.users.reduce((sum, u) => sum + (u.outstandingAmount || 0), 0);
    const totalDisbursed = this.users.reduce((sum, u) => sum + (u.totalBorrowed || 0), 0);

    return {
      totalPrincipalDisbursed: totalDisbursed || 750000,
      todayDailyCollected: this.adminProfile.today_collections || 4000,
      weeklyCollected: 42000,
      outstandingBalance: totalOut || 270000,
      totalActiveUsers: totalActive,
      overdueBorrowersCount: 2,
      repaymentRate: 98.4,
      availableCash: 285400,
    };
  }

  // ==========================================
  // SHOPKEEPERS (DAILY MARKET COLLECTION)
  // ==========================================
  async getShopkeepers() {
    try {
      const res = await fetch(`${this.baseUrl}/shopkeepers`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (_) {}

    // Synchronize and map from internal users
    const shopUsers = this.users.filter((u) => u.role === 'SHOPKEEPER' || u.shop_name || u.stall_no);
    if (shopUsers.length === 0) {
      // Return predefined rich mock shopkeepers
      return [
        {
          id: 2,
          customer_code: 'CUST-002',
          name: 'Murugan Supermarket',
          shop_name: 'Murugan Supermarket & Provisions',
          market_location: 'Saidapet Bazaar Route',
          stall_no: 'Shop #12-B',
          phone: '9840112233',
          credit_limit: 80000,
          today_collection_status: 'PENDING',
          daily_collection_target: 1800,
          total_principal_given: 40000,
          total_outstanding: 18000,
          status: 'ACTIVE',
          today_entries: [
            { loan_code: 'LN-2026-005', amount: 1800, status: 'PENDING', collected_amount: 0 },
          ],
          loans: [
            {
              id: 103,
              loan_code: 'LN-2026-005',
              loan_name: 'Daily Grocery Stocking',
              principal: 40000,
              total_repayable: 45000,
              installment_amount: 1800,
              frequency: 'DAILY',
              paid_installments: 15,
              total_installments: 25,
              remaining_balance: 18000,
              status: 'ACTIVE',
            },
          ],
        },
        {
          id: 4,
          customer_code: 'CUST-004',
          name: 'Selvam Tea Stall',
          shop_name: 'Selvam Tea & Bakery',
          market_location: 'T. Nagar Market Corridor',
          stall_no: 'Stall #05-Corner',
          phone: '9444123456',
          credit_limit: 30000,
          today_collection_status: 'MISSED',
          daily_collection_target: 675,
          total_principal_given: 15000,
          total_outstanding: 12825,
          status: 'ACTIVE',
          today_entries: [
            { loan_code: 'LN-2026-007', amount: 675, status: 'MISSED', collected_amount: 0 },
          ],
          loans: [
            {
              id: 104,
              loan_code: 'LN-2026-007',
              loan_name: 'Tea Leaves & Milk Supply',
              principal: 15000,
              total_repayable: 16875,
              installment_amount: 675,
              frequency: 'DAILY',
              paid_installments: 6,
              total_installments: 25,
              remaining_balance: 12825,
              status: 'ACTIVE',
            },
          ],
        },
        {
          id: 5,
          customer_code: 'CUST-005',
          name: 'Priya Sweets & Snacks',
          shop_name: 'Priya Sweets Stall',
          market_location: 'Triplicane High Road',
          stall_no: 'Stall #28',
          phone: '9840554433',
          credit_limit: 60000,
          today_collection_status: 'COLLECTED',
          daily_collection_target: 1200,
          total_principal_given: 30000,
          total_outstanding: 8400,
          status: 'ACTIVE',
          today_entries: [
            { loan_code: 'LN-2026-012', amount: 1200, status: 'COLLECTED', collected_amount: 1200 },
          ],
          loans: [
            {
              id: 105,
              loan_code: 'LN-2026-012',
              loan_name: 'Festival Sweet Raw Materials',
              principal: 30000,
              total_repayable: 33750,
              installment_amount: 1200,
              frequency: 'DAILY',
              paid_installments: 21,
              total_installments: 25,
              remaining_balance: 8400,
              status: 'ACTIVE',
            },
          ],
        },
      ];
    }

    return shopUsers.map((u) => {
      const activeDailyLoan = (u.loans || []).find((l) => l.frequency === 'DAILY' && l.status === 'ACTIVE');
      const dailyTarget = activeDailyLoan ? activeDailyLoan.installment_amount : 1500;
      const todayStatus = u.today_collection_status || 'PENDING';

      return {
        id: u.id,
        customer_code: u.customer_code || u.customerCode || `SHOP-${u.id}`,
        name: u.name,
        shop_name: u.shop_name || u.shopName || `${u.name}'s Shop`,
        market_location: u.market_location || u.city || 'Saidapet Bazaar Route',
        stall_no: u.stall_no || `Stall #${u.id + 10}`,
        phone: u.phone,
        credit_limit: u.credit_limit || 50000,
        today_collection_status: todayStatus,
        daily_collection_target: dailyTarget,
        total_principal_given: u.totalBorrowed || 30000,
        total_outstanding: u.outstandingAmount || 15000,
        status: u.status || 'ACTIVE',
        today_entries: [
          {
            loan_code: activeDailyLoan ? activeDailyLoan.loan_code : `LN-${u.id}`,
            amount: dailyTarget,
            status: todayStatus,
            collected_amount: todayStatus === 'COLLECTED' ? dailyTarget : 0,
          },
        ],
        loans: u.loans || [],
      };
    });
  }

  async recordShopkeeperCollection(shopId, loanCode, paymentMode = 'UPI', customAmount = null) {
    const shop = this.users.find((u) => u.id === Number(shopId) || u.customerId === Number(shopId));
    const targetLoan = shop && shop.loans ? shop.loans.find((l) => l.loan_code === loanCode || l.loanNumber === loanCode) : null;
    const amount = customAmount ? parseFloat(customAmount) : (targetLoan ? targetLoan.installment_amount : 1500);

    const receiptNo = `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (shop) {
      shop.today_collection_status = 'COLLECTED';
      if (shop.outstandingAmount) {
        shop.outstandingAmount = Math.max(0, shop.outstandingAmount - amount);
      }
      if (shop.totalPaid !== undefined) {
        shop.totalPaid += amount;
      }
    }

    if (targetLoan) {
      targetLoan.paid_installments = (targetLoan.paid_installments || 0) + 1;
      targetLoan.remaining_balance = Math.max(0, (targetLoan.remaining_balance || 0) - amount);
      if (targetLoan.remaining_balance <= 0) {
        targetLoan.status = 'COMPLETED';
      }
    }

    // Record immutable payment
    const paymentRecord = {
      id: Date.now(),
      receiptNumber: receiptNo,
      receipt_number: receiptNo,
      customer_id: Number(shopId),
      customer_name: shop ? shop.name : 'Shopkeeper',
      customer_phone: shop ? shop.phone : '',
      loan_id: targetLoan ? targetLoan.id : 1,
      loan_code: loanCode,
      amount,
      payment_method: paymentMode,
      payment_date: new Date().toISOString().slice(0, 10),
      notes: `Daily collection for ${loanCode} via ${paymentMode}`,
    };
    this.payments.unshift(paymentRecord);

    return {
      success: true,
      receiptNumber: receiptNo,
      receipt_number: receiptNo,
      amount,
      payment_mode: paymentMode,
      date: new Date().toISOString().slice(0, 10),
      collected_at: new Date().toLocaleTimeString(),
    };
  }

  async createShopkeeper(data) {
    const nextId = this.users.length + 1;
    const initialLoan = parseFloat(data.initial_loan_amount || data.initialLoanAmount || 20000);

    const newShop = {
      id: nextId,
      customerId: nextId,
      customer_code: `CUST-0${nextId}`,
      customerCode: `CUST-0${nextId}`,
      name: data.owner_name || data.name,
      shop_name: data.shop_name || `${data.owner_name}'s Store`,
      shopName: data.shop_name || `${data.owner_name}'s Store`,
      market_location: data.market_location || 'Saidapet Bazaar Route',
      stall_no: data.stall_no || `Stall #${nextId}`,
      phone: data.phone,
      email: data.email || '',
      role: 'SHOPKEEPER',
      type_label: 'Merchant (Daily)',
      status: 'ACTIVE',
      credit_limit: parseFloat(data.credit_limit || 50000),
      occupation: 'Market Shopkeeper / Retailer',
      city: data.market_location || 'Saidapet, Chennai',
      address: `${data.stall_no || 'Stall'}, ${data.market_location || 'Market'}, Chennai`,
      dateJoined: new Date().toISOString().slice(0, 10),
      joined_date: new Date().toISOString().slice(0, 10),
      activeLoansCount: initialLoan > 0 ? 1 : 0,
      completedLoansCount: 0,
      outstandingAmount: initialLoan > 0 ? Math.round(initialLoan * 1.125) : 0,
      totalBorrowed: initialLoan,
      totalPaid: 0,
      today_collection_status: 'PENDING',
      loans: [],
    };

    if (initialLoan > 0) {
      const loanCode = `LN-2026-${Math.floor(100 + Math.random() * 900)}`;
      const totalRepay = Math.round(initialLoan * 1.125);
      const installmentAmt = Math.round(totalRepay / 25);

      newShop.loans.push({
        id: Date.now(),
        loan_code: loanCode,
        loanNumber: loanCode,
        loan_name: 'Initial Daily Micro-Loan',
        principal: initialLoan,
        principal_amount: initialLoan,
        total_repayable: totalRepay,
        installment_amount: installmentAmt,
        frequency: 'DAILY',
        paid_installments: 0,
        total_installments: 25,
        disbursed_date: new Date().toISOString().slice(0, 10),
        next_due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        remaining_balance: totalRepay,
        status: 'ACTIVE',
      });
    }

    this.users.unshift(newShop);
    return newShop;
  }

  // ==========================================
  // WEEKLY CUSTOMERS (WEEKLY CYCLE LENDING)
  // ==========================================
  async getWeeklyCustomers() {
    try {
      const res = await fetch(`${this.baseUrl}/weekly-customers`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (_) {}

    // Filter weekly customers
    const weeklyUsers = this.users.filter(
      (u) => u.role === 'COMMON_CUSTOMER' || (u.loans && u.loans.some((l) => l.frequency === 'WEEKLY'))
    );

    const today = new Date().toISOString().slice(0, 10);

    return weeklyUsers.map((u) => {
      const activeWeeklyLoan = (u.loans || []).find((l) => l.frequency === 'WEEKLY' && l.status === 'ACTIVE') || (u.loans && u.loans[0]) || null;
      const weeklyDue = activeWeeklyLoan ? activeWeeklyLoan.installment_amount : 2200;
      const nextDueDate = activeWeeklyLoan ? activeWeeklyLoan.next_due_date : '2026-09-15';
      const paidInstallments = activeWeeklyLoan ? activeWeeklyLoan.paid_installments : 4;
      const totalInstallments = activeWeeklyLoan ? activeWeeklyLoan.total_installments : 10;

      let currentWeekStatus = 'UNPAID';
      if (paidInstallments >= totalInstallments) {
        currentWeekStatus = 'PAID';
      } else if (nextDueDate && nextDueDate < today) {
        currentWeekStatus = 'OVERDUE';
      } else if (u.totalPaid && u.totalPaid > 0) {
        currentWeekStatus = 'UNPAID';
      }

      // Generate or retrieve 10-week schedule
      const fullSchedule = [];
      for (let i = 1; i <= (totalInstallments || 10); i++) {
        const isPaid = i <= paidInstallments;
        const dueD = new Date(Date.now() + (i - paidInstallments) * 7 * 86400000).toISOString().slice(0, 10);
        fullSchedule.push({
          installment_no: i,
          due_date: dueD,
          amount: weeklyDue,
          status: isPaid ? 'PAID' : dueD < today ? 'OVERDUE' : 'UNPAID',
          paid_date: isPaid ? '2026-09-05' : null,
          receipt_no: isPaid ? `RCP-WK0${i}-882` : null,
        });
      }

      return {
        id: u.id,
        customer_code: u.customer_code || u.customerCode || `CUST-0${u.id}`,
        name: u.name,
        phone: u.phone,
        email: u.email,
        address: u.address || 'Chennai, Tamil Nadu',
        occupation: u.occupation || 'Self Employed',
        credit_limit: u.credit_limit || 50000,
        status: u.status || 'ACTIVE',
        weekly_installment: weeklyDue,
        current_week_due: weeklyDue,
        current_week_due_date: nextDueDate,
        current_week_status: currentWeekStatus,
        paid_installments: paidInstallments,
        total_installments: totalInstallments,
        total_borrowed: u.totalBorrowed || 30000,
        outstanding_balance: u.outstandingAmount || 13200,
        active_loan: activeWeeklyLoan,
        loans: u.loans || [],
        schedule: fullSchedule,
      };
    });
  }

  async recordWeeklyCollection(customerId, loanCode, paymentMode = 'UPI', customAmount = null) {
    const user = this.users.find((u) => u.id === Number(customerId) || u.customerId === Number(customerId));
    const targetLoan = user && user.loans ? user.loans.find((l) => l.loan_code === loanCode || l.loanNumber === loanCode) : null;
    const amount = customAmount ? parseFloat(customAmount) : (targetLoan ? targetLoan.installment_amount : 2200);

    const receiptNo = `RCP-WK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (user) {
      if (user.outstandingAmount) {
        user.outstandingAmount = Math.max(0, user.outstandingAmount - amount);
      }
      if (user.totalPaid !== undefined) {
        user.totalPaid += amount;
      }
    }

    if (targetLoan) {
      targetLoan.paid_installments = (targetLoan.paid_installments || 0) + 1;
      targetLoan.remaining_balance = Math.max(0, (targetLoan.remaining_balance || 0) - amount);
      if (targetLoan.remaining_balance <= 0) {
        targetLoan.status = 'COMPLETED';
      }
    }

    // Record immutable payment
    const paymentRecord = {
      id: Date.now(),
      receiptNumber: receiptNo,
      receipt_number: receiptNo,
      customer_id: Number(customerId),
      customer_name: user ? user.name : 'Weekly Customer',
      customer_phone: user ? user.phone : '',
      loan_id: targetLoan ? targetLoan.id : 1,
      loan_code: loanCode,
      amount,
      payment_method: paymentMode,
      payment_date: new Date().toISOString().slice(0, 10),
      notes: `Weekly installment for ${loanCode} via ${paymentMode}`,
    };
    this.payments.unshift(paymentRecord);

    return {
      success: true,
      receiptNumber: receiptNo,
      receipt_number: receiptNo,
      amount,
      payment_mode: paymentMode,
      date: new Date().toISOString().slice(0, 10),
      collected_at: new Date().toLocaleTimeString(),
    };
  }

  // ==========================================
  // FIELD AGENTS (ROUTE COLLECTION OFFICERS)
  // ==========================================
  async getFieldAgents() {
    try {
      const res = await fetch(`${this.baseUrl}/field-agents`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (_) {}

    return [
      {
        id: 1,
        agent_code: 'FA-01',
        name: 'Vigneshwaran M',
        phone: '9840223344',
        assigned_route: 'Saidapet Bazaar Route',
        assigned_borrowers: 34,
        daily_target: 28500,
        today_collected: 24200,
        cash_in_hand: 18400,
        upi_collected: 5800,
        status: 'ON_ROUTE', // 'ON_ROUTE', 'IDLE', 'OFF_DUTY'
        collection_rate: 85,
        rating: '4.9 ★',
        last_sync: '10 mins ago',
      },
      {
        id: 2,
        agent_code: 'FA-02',
        name: 'Karthik Raja',
        phone: '9790112233',
        assigned_route: 'T. Nagar Market Corridor',
        assigned_borrowers: 42,
        daily_target: 36000,
        today_collected: 36000,
        cash_in_hand: 22000,
        upi_collected: 14000,
        status: 'COMPLETED',
        collection_rate: 100,
        rating: '5.0 ★',
        last_sync: '2 mins ago',
      },
      {
        id: 3,
        agent_code: 'FA-03',
        name: 'Saravanan S',
        phone: '9444332211',
        assigned_route: 'Triplicane High Road',
        assigned_borrowers: 28,
        daily_target: 22000,
        today_collected: 15400,
        cash_in_hand: 12000,
        upi_collected: 3400,
        status: 'ON_ROUTE',
        collection_rate: 70,
        rating: '4.7 ★',
        last_sync: '15 mins ago',
      },
      {
        id: 4,
        agent_code: 'FA-04',
        name: 'Dinesh Kumar',
        phone: '9884556677',
        assigned_route: 'Mylapore Tank Area',
        assigned_borrowers: 20,
        daily_target: 18000,
        today_collected: 0,
        cash_in_hand: 0,
        upi_collected: 0,
        status: 'OFF_DUTY',
        collection_rate: 0,
        rating: '4.8 ★',
        last_sync: 'Yesterday',
      },
    ];
  }

  async createFieldAgent(data) {
    const nextId = Date.now();
    return {
      id: nextId,
      agent_code: `FA-0${Math.floor(5 + Math.random() * 5)}`,
      name: data.name,
      phone: data.phone,
      assigned_route: data.assigned_route || 'Saidapet Bazaar Route',
      assigned_borrowers: 0,
      daily_target: parseFloat(data.daily_target || 25000),
      today_collected: 0,
      cash_in_hand: 0,
      upi_collected: 0,
      status: 'IDLE',
      collection_rate: 0,
      rating: '5.0 ★',
      last_sync: 'Just now',
    };
  }

  async handoverCash(agentId, amount) {
    return {
      success: true,
      handover_receipt: `HND-${Date.now().toString().slice(-6)}`,
      agent_id: agentId,
      amount: parseFloat(amount),
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  // ==========================================
  // BRANCH STAFF & ADMIN MANAGEMENT
  // ==========================================
  async getBranchStaff() {
    try {
      const res = await fetch(`${this.baseUrl}/branch-staff`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (_) {}

    return [
      {
        id: 1,
        staff_code: 'ADM-01',
        name: 'Rajesh Kumar',
        email: 'rajesh.ops@apexfinance.com',
        phone: '9876543210',
        designation: 'Branch Operations Manager',
        role: 'BRANCH_MANAGER',
        permissions: ['LOAN_APPROVE', 'DISBURSAL_EXEC', 'REPORTS_AUDIT', 'USER_GOVERN'],
        status: 'ACTIVE',
        last_login: 'Today, 09:15 AM',
        two_factor_enabled: true,
        joined_date: '2025-01-15',
      },
      {
        id: 2,
        staff_code: 'ADM-02',
        name: 'Priya Sundaram',
        email: 'priya.credit@apexfinance.com',
        phone: '9840112233',
        designation: 'Credit & Underwriting Officer',
        role: 'LOAN_OFFICER',
        permissions: ['LOAN_CREATE', 'LOAN_APPROVE', 'KYC_VERIFY'],
        status: 'ACTIVE',
        last_login: 'Today, 10:30 AM',
        two_factor_enabled: true,
        joined_date: '2025-03-20',
      },
      {
        id: 3,
        staff_code: 'ADM-03',
        name: 'Manoj Prabhakar',
        email: 'manoj.cashier@apexfinance.com',
        phone: '9444123456',
        designation: 'Head Cashier & Vault Auditor',
        role: 'CASHIER',
        permissions: ['PAYMENT_COLLECT', 'CASH_VAULT_DEPOSIT', 'EXPENSE_LOG'],
        status: 'ACTIVE',
        last_login: 'Today, 08:45 AM',
        two_factor_enabled: false,
        joined_date: '2025-05-10',
      },
      {
        id: 4,
        staff_code: 'ADM-04',
        name: 'Anand R',
        email: 'anand.kyc@apexfinance.com',
        phone: '9790554433',
        designation: 'Borrower KYC & Field Verifier',
        role: 'VERIFIER',
        permissions: ['USER_CREATE', 'KYC_VERIFY', 'REPORT_VIEW'],
        status: 'INACTIVE',
        last_login: '3 days ago',
        two_factor_enabled: true,
        joined_date: '2025-08-01',
      },
    ];
  }

  async createBranchStaff(data) {
    const nextId = Date.now();
    return {
      id: nextId,
      staff_code: `ADM-0${Math.floor(5 + Math.random() * 5)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      designation: data.designation || 'Branch Administrative Officer',
      role: data.role || 'LOAN_OFFICER',
      permissions: data.permissions || ['USER_CREATE', 'PAYMENT_COLLECT'],
      status: 'ACTIVE',
      last_login: 'Never',
      two_factor_enabled: data.two_factor_enabled || false,
      joined_date: new Date().toISOString().slice(0, 10),
    };
  }

  async getAdminProfile() {
    return this.adminProfile;
  }

  async updateAdminProfile(updated) {
    Object.assign(this.adminProfile, updated);
    return this.adminProfile;
  }

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
