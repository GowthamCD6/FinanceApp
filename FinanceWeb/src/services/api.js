// ==============================================================================
// Finance Management Platform — Production REST API Service Layer
// Direct Live Integration with Backend Server & TiDB Cloud Database
// ==============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Core HTTP Request Wrapper with Auth Header and Error Handling
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('finance_token') || sessionStorage.getItem('finance_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json.message || `Server request failed with status ${res.status}`);
    }

    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // 1. AUTHENTICATION & SESSION
  auth: {
    login: async (credentials) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (data?.token) {
        localStorage.setItem('finance_token', data.token);
        if (data.user) {
          localStorage.setItem('finance_user', JSON.stringify(data.user));
        }
      }
      return data;
    },
    logout: () => {
      localStorage.removeItem('finance_token');
      localStorage.removeItem('finance_user');
      sessionStorage.clear();
    },
    getCurrentUser: async () => {
      return await request('/auth/me');
    },
  },

  // 2. ORGANIZATIONS (MULTI-TENANT)
  organizations: {
    getAll: async () => {
      return await request('/organizations');
    },
    getById: async (id) => {
      return await request(`/organizations/${id}`);
    },
    create: async (orgData) => {
      return await request('/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData),
      });
    },
    update: async (id, orgData) => {
      return await request(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orgData),
      });
    },
    updateStatus: async (id, status) => {
      return await request(`/organizations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    getBranches: async (orgId) => {
      return await request(`/organizations/${orgId}/branches`);
    },
    createBranch: async (orgId, branchData) => {
      return await request(`/organizations/${orgId}/branches`, {
        method: 'POST',
        body: JSON.stringify(branchData),
      });
    },
  },

  // 3. USERS & SUPERADMIN USERS
  users: {
    getAll: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/users${queryStr ? `?${queryStr}` : ''}`);
    },
    getById: async (id) => {
      return await request(`/users/${id}`);
    },
    create: async (userData) => {
      return await request('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    update: async (id, userData) => {
      return await request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },
    updateStatus: async (id, status) => {
      return await request(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  // 4. CUSTOMERS (BORROWERS & SHOPKEEPERS)
  customers: {
    getAll: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      const res = await request(`/customers${queryStr ? `?${queryStr}` : ''}`);
      return res?.customers || res || [];
    },
    getById: async (id) => {
      return await request(`/customers/${id}`);
    },
    getLifecycle: async (id) => {
      return await request(`/customers/${id}/lifecycle`);
    },
    create: async (customerData) => {
      return await request('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
    },
    update: async (id, customerData) => {
      return await request(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customerData),
      });
    },
    updateStatus: async (id, status, reason = '') => {
      return await request(`/customers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      });
    },
    addNote: async (id, note) => {
      return await request(`/customers/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
    },
  },

  // 5. LOANS & POLICIES
  loans: {
    getAll: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      const res = await request(`/loans${queryStr ? `?${queryStr}` : ''}`);
      return res?.loans || res || [];
    },
    getById: async (id) => {
      return await request(`/loans/${id}`);
    },
    getProducts: async () => {
      return await request('/loans/products');
    },
    create: async (loanData) => {
      return await request('/loans', {
        method: 'POST',
        body: JSON.stringify(loanData),
      });
    },
    approve: async (id) => {
      return await request(`/loans/${id}/approve`, {
        method: 'POST',
      });
    },
    disburse: async (id, fundAccountId = 1) => {
      return await request(`/loans/${id}/disburse`, {
        method: 'POST',
        body: JSON.stringify({ fundAccountId }),
      });
    },
    createRepeat: async (customerId, requestedAmount, notes = '') => {
      return await request('/loans/repeat', {
        method: 'POST',
        body: JSON.stringify({ customerId, requestedAmount, notes }),
      });
    },
  },

  // 6. PAYMENTS & REPAYMENTS
  payments: {
    getAll: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/payments${queryStr ? `?${queryStr}` : ''}`);
    },
    collect: async (paymentData) => {
      return await request('/payments/collect', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    },
    getById: async (id) => {
      return await request(`/payments/${id}`);
    },
  },

  // 7. CENTRAL FUND & CIRCULATION
  funds: {
    getSummary: async () => {
      return await request('/funds/summary');
    },
    getCirculationTrail: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/funds/circulation${queryStr ? `?${queryStr}` : ''}`);
    },
    injectCapital: async (data) => {
      return await request('/funds/capital', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    recordExpense: async (expenseData) => {
      return await request('/funds/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
    },
    getExpenses: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/funds/expenses${queryStr ? `?${queryStr}` : ''}`);
    },
  },

  // 8. REPORTS & ANALYTICS
  reports: {
    getDashboardSummary: async () => {
      return await request('/reports/summary');
    },
    getCollections: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/reports/collections${queryStr ? `?${queryStr}` : ''}`);
    },
    getOutstanding: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/reports/outstanding${queryStr ? `?${queryStr}` : ''}`);
    },
    getPortfolio: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/reports/portfolio${queryStr ? `?${queryStr}` : ''}`);
    },
    getProfit: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/reports/profit${queryStr ? `?${queryStr}` : ''}`);
    },
    getCashFlow: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/reports/cash-flow${queryStr ? `?${queryStr}` : ''}`);
    },
  },

  // 9. RECONCILIATIONS
  reconciliation: {
    getAll: async () => {
      return await request('/reconciliation');
    },
    perform: async (data) => {
      return await request('/reconciliation', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    createAdjustment: async (data) => {
      return await request('/reconciliation/adjustments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // 10. GOVERNANCE & SUPERADMIN SETTINGS
  governance: {
    getDefaultCategories: async () => {
      return await request('/governance/categories');
    },
    updateDefaultCategory: async (code, data) => {
      return await request(`/governance/categories/${code}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    getPrivacyPolicies: async () => {
      return await request('/governance/privacy-policy');
    },
    updatePrivacyPolicy: async (data) => {
      return await request('/governance/privacy-policy', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    getAppVersions: async (platform) => {
      return await request(`/governance/app-versions${platform ? `?platform=${platform}` : ''}`);
    },
    createAppVersion: async (data) => {
      return await request('/governance/app-versions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    getAuditLogs: async (params = {}) => {
      const queryStr = new URLSearchParams(params).toString();
      return await request(`/governance/audit-logs${queryStr ? `?${queryStr}` : ''}`);
    },
    getApiMetrics: async () => {
      return await request('/governance/api-metrics');
    },
    getSettings: async () => {
      return await request('/governance/settings');
    },
    updateSetting: async (key, value) => {
      return await request(`/governance/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
    },
  },
};

export default api;
