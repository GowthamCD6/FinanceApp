import { ENV } from '../config/env';

class ApiService {
  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
    this.token = null;
    this.organizationId = null;
    this.branchId = null;
  }

  setToken(token) {
    this.token = token;
  }

  setOrganizationId(orgId) {
    this.organizationId = orgId;
  }

  setBranchId(branchId) {
    this.branchId = branchId;
  }

  setBaseUrl(url) {
    this.baseUrl = url;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(this.organizationId ? { 'x-organization-id': String(this.organizationId) } : {}),
      ...(this.branchId && this.branchId !== 'ALL' ? { 'x-branch-id': String(this.branchId) } : {}),
      ...options.headers,
    };

    const candidateHosts = ENV.FALLBACK_HOSTS || [this.baseUrl];
    let lastError = null;

    for (const host of candidateHosts) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ENV.API_TIMEOUT_MS || 8000);

      try {
        const response = await fetch(`${host}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.message || `HTTP ${response.status}`);
        }
        // Remember working host
        this.baseUrl = host;
        return json;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        // If it's an HTTP error response from server (e.g. 400, 401, 403, 404), server was reached so don't try other hosts
        if (error.message && (error.message.startsWith('HTTP ') || error.message.includes('password') || error.message.includes('registered') || error.message.includes('required') || error.message.includes('deactivated'))) {
          throw error;
        }
        // Otherwise (network timeout / connection refused), try next host in list
      }
    }

    if (lastError && lastError.name === 'AbortError') {
      throw new Error('Network request timed out. Please check backend server.');
    }
    throw lastError || new Error('Network request failed. Please check backend server.');
  }

  // 1. AUTH & PROFILES
  async login(identifier, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    const token = res.data?.token || res.token;
    if (token) {
      this.setToken(token);
    }
    return res.data || res;
  }

  // 2. CUSTOMERS
  async getCustomers() {
    const res = await this.request('/customers');
    return res.data?.customers || res.data || [];
  }

  async getWeeklyCustomers() {
    const res = await this.request('/customers/weekly-customers');
    return res.data?.customers || res.data || [];
  }

  async getShopkeepers() {
    const res = await this.request('/customers/shopkeepers');
    return res.data?.customers || res.data || [];
  }

  async getMonthlyCustomers() {
    const res = await this.request('/customers/monthly-customers');
    return res.data?.customers || res.data || [];
  }

  async getCustomerLifecycle(customerId) {
    const res = await this.request(`/customers/${customerId}/lifecycle`);
    return res.data;
  }

  async getCustomerPortalDashboard() {
    const res = await this.request('/customers/me/dashboard');
    return res.data;
  }

  async createCustomer(customerData) {
    const res = await this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
    return res.data;
  }

  // 3. LOANS & REPEAT LOANS
  async getLoans() {
    const res = await this.request('/loans');
    return res.data?.loans || res.data || [];
  }

  async getLoanById(loanId) {
    const res = await this.request(`/loans/${loanId}`);
    return res.data;
  }

  async getProducts() {
    const res = await this.request('/loans/products');
    return res.data;
  }

  async createLoan(loanData) {
    const res = await this.request('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
    return res.data;
  }

  async approveLoan(loanId) {
    const res = await this.request(`/loans/${loanId}/approve`, {
      method: 'POST',
    });
    return res.data;
  }

  async disburseLoan(loanId, fundAccountId = 1) {
    const res = await this.request(`/loans/${loanId}/disburse`, {
      method: 'POST',
      body: JSON.stringify({ fundAccountId }),
    });
    return res.data;
  }

  async createRepeatLoan(customerId, requestedAmount = 15000, notes = '') {
    const res = await this.request('/loans/repeat', {
      method: 'POST',
      body: JSON.stringify({ customerId, requestedAmount, notes }),
    });
    return res.data;
  }

  // 4. COLLECTIONS & PAYMENTS (Splits into Principal & Lending Income)
  async collectPayment(loanId, amount, paymentMethod = 'CASH', fundAccountId = 1) {
    const res = await this.request('/payments/collect', {
      method: 'POST',
      body: JSON.stringify({ loanId, amount, paymentMethod, fundAccountId }),
    });
    return res.data;
  }

  // 5. CENTRAL FUND & CIRCULATION
  async getFundSummary() {
    const res = await this.request('/funds/summary');
    return res.data;
  }

  async getFundCirculationTrail() {
    const res = await this.request('/funds/circulation');
    return res.data;
  }

  async injectCapital(amount, description = 'Additional Capital Injected') {
    const res = await this.request('/funds/capital', {
      method: 'POST',
      body: JSON.stringify({ fundAccountId: 1, amount, description }),
    });
    return res.data;
  }

  // 6. EXPENSES (Available Cash ↓, Expenses ↑, Profit ↓)
  async recordExpense(expenseData) {
    const res = await this.request('/funds/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    return res.data;
  }

  // 7. MULTI-TENANT ORGANIZATIONS & STATUS
  async getOrganizations() {
    const res = await this.request('/organizations');
    return res.data;
  }

  async createOrganization(orgData) {
    const res = await this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
    return res.data;
  }

  async updateOrganizationStatus(id, status) {
    const res = await this.request(`/organizations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  }

  async updateCustomerStatus(id, status, reason) {
    const res = await this.request(`/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return res.data;
  }

  // 8. LENDING CONFIG & INTEREST RATES
  async getLendingConfig(orgId = 1) {
    const res = await this.request(`/organizations/${orgId}/lending-config`);
    return res.data || res;
  }

  async updateLendingConfig(orgId = 1, config) {
    const res = await this.request(`/organizations/${orgId}/lending-config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return res.data || res;
  }

  async getDefaultCategories() {
    const res = await this.request('/governance/categories');
    return res.data || res || [];
  }

  async createDefaultCategory(data) {
    const res = await this.request('/governance/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data || res;
  }

  async updateDefaultCategory(code, data) {
    const res = await this.request(`/governance/categories/${code}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data || res;
  }

  async deleteDefaultCategory(code) {
    const res = await this.request(`/governance/categories/${code}`, {
      method: 'DELETE',
    });
    return res.data || res;
  }

  // 9. BORROWERS / USERS MANAGEMENT
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    const res = await this.request(endpoint);
    return res.data?.users || res.data || res || [];
  }

  async getUserById(id) {
    const res = await this.request(`/users/${id}`);
    return res.data || res;
  }

  async createUser(userData) {
    const res = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.data || res;
  }

  async updateUser(id, userData) {
    const res = await this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return res.data || res;
  }

  async updateUserStatus(id, status, reason = '') {
    const res = await this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return res.data || res;
  }
}

export const apiService = new ApiService();
export default apiService;
