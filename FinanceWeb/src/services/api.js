import {
  MOCK_USERS,
  MOCK_FUND_SUMMARY,
  MOCK_CUSTOMERS,
} from './mockData';

// Initial Users/Borrowers with complete attributes matching Fund App
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
    credit_limit: 25000,
    occupation: 'Fabrication Technician',
    city: 'Triplicane, Chennai',
    address: '42, North Car Street, Triplicane, Chennai',
    joined_date: '2025-05-12',
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
    repayment_discipline: '100% On-Time',
  },
  {
    id: 2,
    customer_code: 'CUST-002',
    name: 'Murugan Supermarket',
    phone: '9840112233',
    email: 'murugan.retail@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'ACTIVE',
    credit_limit: 50000,
    occupation: 'Retail Grocery Store Owner',
    city: 'Saidapet, Chennai',
    address: '12 Bazaar Road, Saidapet, Chennai',
    joined_date: '2025-07-04',
    active_loan: {
      loan_code: 'LN-2026-005',
      principal: 40000,
      total_repayable: 45000,
      installment_amount: 1800,
      frequency: 'DAILY',
      paid_installments: 14,
      total_installments: 25,
      next_due_date: '2026-09-10',
      remaining_balance: 19800,
      status: 'ACTIVE',
    },
    lifecycle_completed: 2,
    repayment_discipline: 'Flawless Daily Track',
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
    credit_limit: 20000,
    occupation: 'Tailoring & Garment Works',
    city: 'Mylapore, Chennai',
    address: '78 Temple View, Mylapore, Chennai',
    joined_date: '2025-09-18',
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
    phone: '9444123456',
    email: 'selvamtea@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'DEFAULTER',
    credit_limit: 15000,
    occupation: 'Tea Stall Owner',
    city: 'T. Nagar, Chennai',
    address: '5 Bus Stand Corner, T. Nagar, Chennai',
    joined_date: '2025-11-02',
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
    phone: '9841238901',
    email: 'venkat.food@gmail.com',
    role: 'SHOPKEEPER',
    type_label: 'Merchant (Daily)',
    status: 'ACTIVE',
    credit_limit: 30000,
    occupation: 'Street Fast Food Stall',
    city: 'Triplicane, Chennai',
    address: '88 High Road, Triplicane, Chennai',
    joined_date: '2026-01-10',
    active_loan: {
      loan_code: 'LN-2026-010',
      principal: 25000,
      total_repayable: 28125,
      installment_amount: 1125,
      frequency: 'DAILY',
      paid_installments: 10,
      total_installments: 25,
      next_due_date: '2026-09-10',
      remaining_balance: 16875,
      status: 'ACTIVE',
    },
    lifecycle_completed: 1,
    repayment_discipline: 'On Track',
  },
  {
    id: 6,
    customer_code: 'CUST-006',
    name: 'Revathi Flower Stall',
    phone: '9789123450',
    email: 'revathi.flowers@gmail.com',
    role: 'COMMON_CUSTOMER',
    type_label: 'Borrower (Weekly)',
    status: 'ACTIVE',
    credit_limit: 15000,
    occupation: 'Flower Vendor',
    city: 'Mylapore, Chennai',
    address: 'Near Kapaleeshwarar Temple, Mylapore',
    joined_date: '2026-02-05',
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
    customer_id: 7,
    customer_name: 'Gopalakrishnan Dry Cleaners',
    customer_code: 'CUST-007',
    phone: '9840998877',
    loan_code: 'LN-2026-012',
    installment_week: 'Week 7 of 10',
    due_date: '2026-09-11',
    due_amount: 1650,
    remaining_balance: 4950,
    status: 'PENDING',
    paid_date: null,
    payment_mode: null,
    receipt_no: null,
  },
  {
    id: 105,
    customer_id: 8,
    customer_name: 'Karpagam Tailoring',
    customer_code: 'CUST-008',
    phone: '9444332211',
    loan_code: 'LN-2026-014',
    installment_week: 'Week 2 of 10',
    due_date: '2026-09-08',
    due_amount: 1100,
    remaining_balance: 9900,
    status: 'OVERDUE',
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
    customer_code: 'CUST-002',
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
    customer_id: 5,
    customer_name: 'Venkatesh Fast Food',
    customer_code: 'CUST-005',
    phone: '9841238901',
    loan_code: 'LN-2026-010',
    installment_day: 'Day 11 of 25',
    due_amount: 1125,
    collected_amount: 1125,
    payment_mode: 'CASH',
    status: 'COLLECTED',
    collected_time: '01:15 PM',
    receipt_no: 'DLY-8802',
    agent: 'Admin Field Manager',
  },
  {
    id: 203,
    customer_id: 9,
    customer_name: 'Sri Krishna Sweets Corner',
    customer_code: 'CUST-009',
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
    id: 204,
    customer_id: 10,
    customer_name: 'Balaji Mobile Accessories',
    customer_code: 'CUST-010',
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
    id: 205,
    customer_id: 4,
    customer_name: 'Selvam Tea Stall',
    customer_code: 'CUST-004',
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
  today_collections: 2925,
  lifetime_collections: 485000,
  active_borrowers_assigned: 86,
  compliance_score: 99.4,
  permissions: [
    'User Enrollment & Borrower Onboarding',
    'Loan Application Registration',
    'Rapid Repayment Collection (Cash / UPI)',
    'Daily Collection Sheet Reconciliation',
    'Day-End Route Cash Settlement',
    'Weekly Dues Inspection & Reports',
  ],
};

class ApiService {
  constructor() {
    this.baseUrl = '/api';
    this.token = localStorage.getItem('finance_token') || null;

    // In-memory state
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.weeklyDues = JSON.parse(JSON.stringify(INITIAL_WEEKLY_DUES));
    this.dailyCollections = JSON.parse(JSON.stringify(INITIAL_DAILY_COLLECTIONS));
    this.adminProfile = { ...INITIAL_ADMIN_PROFILE };
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
      status: 'ACTIVE',
      credit_limit: parseFloat(data.credit_limit) || 25000,
      occupation: data.occupation ? data.occupation.trim() : (isMerchant ? 'Retail Merchant' : 'Self-Employed'),
      city: data.city ? data.city.trim() : 'Chennai',
      address: data.address ? data.address.trim() : 'Chennai, Tamil Nadu',
      joined_date: new Date().toISOString().split('T')[0],
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
      if (u && u.active_loan) {
        u.active_loan.paid_installments += 1;
        u.active_loan.remaining_balance = Math.max(0, u.active_loan.remaining_balance - target.due_amount);
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
    };
  }
}

export const api = new ApiService();
export default api;
