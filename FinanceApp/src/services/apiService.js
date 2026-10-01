import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

class ApiService {
  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
    this.token = null;
    this.organizationId = null;
    this.branchId = null;
    this.sessionTerminatedCallback = null;

    // Fast-restore previously verified working backend host
    AsyncStorage.getItem('api_working_host')
      .then((savedHost) => {
        if (savedHost) {
          this.baseUrl = savedHost;
        }
      })
      .catch(() => {});
  }

  onSessionTerminated(callback) {
    this.sessionTerminatedCallback = callback;
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
    if (url) {
      AsyncStorage.setItem('api_working_host', url).catch(() => {});
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(this.organizationId ? { 'x-organization-id': String(this.organizationId) } : {}),
      ...(this.branchId && this.branchId !== 'ALL' ? { 'x-branch-id': String(this.branchId) } : {}),
      ...options.headers,
    };

    // Prioritize already working host first to eliminate multi-second latency
    const fallbackList = ENV.FALLBACK_HOSTS || [ENV.API_BASE_URL];
    const candidateHosts = this.baseUrl
      ? [this.baseUrl, ...fallbackList.filter((h) => h !== this.baseUrl)]
      : fallbackList;

    let lastError = null;

    for (let i = 0; i < candidateHosts.length; i++) {
      const host = candidateHosts[i];
      const isPrimary = host === this.baseUrl;
      const timeoutMs = isPrimary ? (ENV.API_TIMEOUT_MS || 8000) : 2000;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${host}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const json = await response.json();
        if (!response.ok) {
          if (
            (response.status === 401 || response.status === 403) &&
            typeof this.sessionTerminatedCallback === 'function' &&
            (json.reason === 'FORCE_LOGOUT' ||
             json.reason === 'ACCOUNT_DEACTIVATED' ||
             (json.message && /deactivated|suspended|logged out/i.test(json.message)))
          ) {
            this.sessionTerminatedCallback(json);
          }
          throw new Error(json.message || `HTTP ${response.status}`);
        }
        // Remember and persist working host for instant subsequent requests
        if (this.baseUrl !== host) {
          this.baseUrl = host;
          AsyncStorage.setItem('api_working_host', host).catch(() => {});
        }
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

  // Generic makeRequest helper for compatibility with custom subpage calls
  async makeRequest(endpoint, options = {}) {
    const formattedEndpoint = endpoint.startsWith('/api')
      ? endpoint.replace(/^\/api/, '')
      : endpoint;
    const res = await this.request(formattedEndpoint, options);
    // Return mock response object with json() method if expected by caller
    return {
      ok: true,
      status: 200,
      json: async () => res,
      data: res.data || res,
      success: res.success !== undefined ? res.success : true,
      message: res.message || 'Success',
      ...res,
    };
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

  async getProfile() {
    try {
      const res = await this.request('/user/profile');
      return {
        success: true,
        data: res.data || res,
        message: res.message || 'Profile retrieved',
      };
    } catch (e) {
      return {
        success: false,
        data: null,
        message: e.message,
      };
    }
  }

  async updateProfile(profileData) {
    const res = await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return {
      success: true,
      data: res.data || res,
      message: res.message || 'Profile updated successfully',
    };
  }

  async getUserPreferences() {
    try {
      const res = await this.request('/user/preferences');
      return {
        success: true,
        data: res.data || res,
      };
    } catch (e) {
      return {
        success: false,
        data: null,
        message: e.message,
      };
    }
  }

  async saveUserPreferences(preferences) {
    const res = await this.request('/user/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
    return {
      success: true,
      data: res.data || res,
    };
  }

  async updateUserPreferences(preferences) {
    return this.saveUserPreferences(preferences);
  }



  // 2. CUSTOMERS
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

  async getCustomers(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.customerType && params.customerType !== 'ALL') query.append('customerType', params.customerType);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.organizationId) query.append('organizationId', params.organizationId);
    if (params.branchId) query.append('branchId', params.branchId);
    query.append('limit', params.limit || '200');

    const qs = query.toString();
    const endpoint = `/customers${qs ? `?${qs}` : ''}`;
    const res = await this.request(endpoint);
    return res.data?.customers || res.data || res || [];
  }

  async createCustomer(customerData) {
    const res = await this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
    return res.data;
  }

  // 3. LOANS & REPEAT LOANS
  async getLoans(params = {}) {
    let queryStr = '';
    if (params && Object.keys(params).length > 0) {
      queryStr = '?' + Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    }
    const res = await this.request(`/loans${queryStr}`);
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

  async disburseLoan(loanId, fundAccountId = 1, fundingSource = 'VAULT') {
    const res = await this.request(`/loans/${loanId}/disburse`, {
      method: 'POST',
      body: JSON.stringify({ fundAccountId, funding_source: fundingSource }),
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

  async getLoanById(loanId) {
    const res = await this.request(`/loans/${loanId}`);
    return res.data || res;
  }

  async updateLoan(loanId, loanData) {
    const res = await this.request(`/loans/${loanId}`, {
      method: 'PUT',
      body: JSON.stringify(loanData),
    });
    return res.data || res;
  }

  async updateLoanCollectionMode(loanId, collectionMode) {
    const res = await this.request(`/loans/${loanId}/collection-mode`, {
      method: 'PATCH',
      body: JSON.stringify({ collectionMode }),
    });
    return res.data || res;
  }

  async deleteLoan(loanId) {
    const res = await this.request(`/loans/${loanId}`, {
      method: 'DELETE',
    });
    return res.data || res;
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

  async injectCapital(amount, description = 'Additional Capital Injected', fundAccountId = 1) {
    const res = await this.request('/funds/capital', {
      method: 'POST',
      body: JSON.stringify({ fundAccountId, amount, description }),
    });
    return res.data || res;
  }

  async withdrawProfit(amount, description = 'Admin Profit Withdrawal', paymentMethod = 'BANK_TRANSFER', fundAccountId = 1) {
    const res = await this.request('/funds/withdraw-profit', {
      method: 'POST',
      body: JSON.stringify({ fundAccountId, amount, description, paymentMethod }),
    });
    return res.data || res;
  }

  async transferProfitToNetCapital(amount, description = 'Profit transferred to net capital', fundAccountId = 1) {
    const res = await this.request('/funds/transfer-profit', {
      method: 'POST',
      body: JSON.stringify({ fundAccountId, amount, description }),
    });
    return res.data || res;
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

  async getAllUsers() {
    try {
      const res = await this.request('/users');
      return {
        success: true,
        data: res.data?.users || res.data || res || [],
      };
    } catch (e) {
      return {
        success: false,
        data: [],
        message: e.message,
      };
    }
  }

  async forceLogout(userId, reason = 'Forced logout by administrator') {
    const res = await this.request('/users/force-logout', {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    });
    return res;
  }

  async blockUser(id, reason = 'Account deactivated by administrator') {
    const res = await this.request('/users/block', {
      method: 'POST',
      body: JSON.stringify({ userId: id, reason }),
    });
    return res;
  }

  async unblockUser(id) {
    const res = await this.request('/users/unblock', {
      method: 'POST',
      body: JSON.stringify({ userId: id }),
    });
    return res;
  }

  async verifySession(userId) {
    const endpoint = userId ? `/users/session/verify?userId=${userId}` : '/users/session/verify';
    const res = await this.request(endpoint);
    return res;
  }

  async updatePassword({ userId, newPassword, currentPassword }) {
    const res = await this.request('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ userId, newPassword, currentPassword }),
    });
    return {
      success: true,
      data: res.data || res,
      message: res.message || 'Password updated successfully',
    };
  }

  // 12. REPORTS & ANALYTICS
  async getPaymentReport(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) {
      query.append('start_date', params.startDate);
      query.append('startDate', params.startDate);
    }
    if (params.endDate) {
      query.append('end_date', params.endDate);
      query.append('endDate', params.endDate);
    }
    if (params.frequency && params.frequency !== 'ALL') query.append('frequency', params.frequency);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.organizationId) query.append('organizationId', params.organizationId);
    if (params.branchId) query.append('branchId', params.branchId);

    const qs = query.toString();
    const endpoint = `/reports/payments${qs ? `?${qs}` : ''}`;
    const res = await this.request(endpoint);
    return res.data || res;
  }

  async getReportsDashboard() {
    const res = await this.request('/reports/dashboard');
    return res.data || res;
  }

  // 13. LOCATION & BIOMETRIC PERMISSIONS (Profile Features)
  async saveMyLocation(locationData) {
    const res = await this.request('/users/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
    return {
      success: true,
      data: res.data || res,
      message: 'Location saved successfully',
    };
  }

  async getMyLocation(userId) {
    const endpoint = userId ? `/users/locations?userId=${userId}` : '/users/locations';
    try {
      const res = await this.request(endpoint);
      return {
        success: true,
        data: res.data || res,
      };
    } catch (e) {
      return {
        success: false,
        data: null,
        message: e.message,
      };
    }
  }

  async getUserLocations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/users/locations?${queryString}` : '/admin/users/locations';
    const res = await this.request(endpoint);
    return res.data || res || [];
  }

  async saveBiometricSetting(settingData) {
    const res = await this.request('/users/security/biometrics', {
      method: 'POST',
      body: JSON.stringify(settingData),
    });
    return {
      success: true,
      data: res.data || res,
      message: 'Biometric setting updated successfully',
    };
  }

  async getBiometricSetting(userId) {
    const res = await this.request(`/users/security/biometrics?userId=${userId}`);
    return res.data || res;
  }

  // 14. NOTIFICATION PREFERENCES
  async getNotificationPreferences(userId) {
    const endpoint = userId ? `/users/preferences/notifications?userId=${userId}` : '/users/preferences/notifications';
    try {
      const res = await this.request(endpoint);
      return res.data || res;
    } catch (e) {
      console.warn('Failed to load notification preferences:', e.message);
      return null;
    }
  }

  async saveNotificationPreferences(userId, prefs) {
    const res = await this.request('/users/preferences/notifications', {
      method: 'POST',
      body: JSON.stringify({ userId, ...prefs }),
    });
    return res.data || res;
  }

  async recordPayment(paymentData) {
    const res = await this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return res.data || res;
  }
}

export const apiService = new ApiService();
export { ApiService };
export default apiService;

