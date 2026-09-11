const { query } = require('../../config/database');

const governanceService = {
  // 1. DEFAULT CATEGORIES
  getDefaultCategories: async () => {
    return await query(`SELECT * FROM default_category_configs ORDER BY id ASC`);
  },

  updateDefaultCategory: async (code, data) => {
    const { name, description, max_users_per_branch, default_min_loan, default_max_loan, default_interest_rate, repayment_frequency, tenure_installments, grace_period_days, status } = data;
    await query(
      `UPDATE default_category_configs 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           max_users_per_branch = COALESCE(?, max_users_per_branch),
           default_min_loan = COALESCE(?, default_min_loan),
           default_max_loan = COALESCE(?, default_max_loan),
           default_interest_rate = COALESCE(?, default_interest_rate),
           repayment_frequency = COALESCE(?, repayment_frequency),
           tenure_installments = COALESCE(?, tenure_installments),
           grace_period_days = COALESCE(?, grace_period_days),
           status = COALESCE(?, status)
       WHERE category_code = ?`,
      [name, description, max_users_per_branch, default_min_loan, default_max_loan, default_interest_rate, repayment_frequency, tenure_installments, grace_period_days, status, code]
    );
    const [updated] = await query(`SELECT * FROM default_category_configs WHERE category_code = ?`, [code]);
    return updated;
  },

  // 2. PRIVACY POLICIES
  getPrivacyPolicies: async () => {
    return await query(`SELECT * FROM privacy_policies ORDER BY created_at DESC`);
  },

  getActivePrivacyPolicy: async () => {
    const [policy] = await query(`SELECT * FROM privacy_policies WHERE status = 'PUBLISHED_ACTIVE' ORDER BY effective_date DESC LIMIT 1`);
    return policy || null;
  },

  updatePrivacyPolicy: async (data) => {
    const { version, title, content, effective_date, status, author_name } = data;
    await query(
      `INSERT INTO privacy_policies (version, title, content, effective_date, status, author_name)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), effective_date=VALUES(effective_date), status=VALUES(status), author_name=VALUES(author_name)`,
      [version || 'v2.1', title, content, effective_date || new Date().toISOString().slice(0, 10), status || 'PUBLISHED_ACTIVE', author_name || 'Super Admin']
    );
    return await governanceService.getActivePrivacyPolicy();
  },

  // 3. APP VERSIONS / MOBILE UPDATES
  getAppVersions: async (platform) => {
    if (platform) {
      return await query(`SELECT * FROM app_versions WHERE platform = ? ORDER BY version_code DESC`, [platform]);
    }
    return await query(`SELECT * FROM app_versions ORDER BY created_at DESC`);
  },

  createAppVersion: async (data) => {
    const { platform, version_name, version_code, release_title, release_notes, download_url, min_supported_version, force_update, status } = data;
    const res = await query(
      `INSERT INTO app_versions (platform, version_name, version_code, release_title, release_notes, download_url, min_supported_version, force_update, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [platform || 'ANDROID', version_name, version_code || 1, release_title, release_notes, download_url, min_supported_version, force_update ? 1 : 0, status || 'ACTIVE']
    );
    const [created] = await query(`SELECT * FROM app_versions WHERE id = ?`, [res.insertId]);
    return created;
  },

  // 4. AUDIT LOGS
  getAuditLogs: async (filters = {}) => {
    let sql = `SELECT a.*, u.name as user_name, u.email as user_email, o.name as organization_name 
               FROM audit_logs a 
               LEFT JOIN users u ON a.user_id = u.id 
               LEFT JOIN organizations o ON a.organization_id = o.id 
               WHERE 1=1`;
    const params = [];
    if (filters.organization_id) {
      sql += ` AND a.organization_id = ?`;
      params.push(filters.organization_id);
    }
    if (filters.action) {
      sql += ` AND a.action LIKE ?`;
      params.push(`%${filters.action}%`);
    }
    sql += ` ORDER BY a.created_at DESC LIMIT 100`;
    return await query(sql, params);
  },

  // 5. API METRICS & TELEMETRY
  getApiMetrics: async () => {
    const totalRequests = await query(`SELECT COUNT(*) as count FROM api_metrics`);
    const avgResponse = await query(`SELECT AVG(response_time_ms) as avg_latency FROM api_metrics`);
    const recentMetrics = await query(`SELECT * FROM api_metrics ORDER BY created_at DESC LIMIT 50`);
    const statusBreakdown = await query(`SELECT status_code, COUNT(*) as count FROM api_metrics GROUP BY status_code`);
    return {
      totalRequests: totalRequests[0]?.count || 0,
      avgLatencyMs: Number(avgResponse[0]?.avg_latency || 42).toFixed(1),
      statusBreakdown,
      recentLogs: recentMetrics,
    };
  },

  // 6. SYSTEM SETTINGS
  getSystemSettings: async () => {
    return await query(`SELECT * FROM system_settings ORDER BY setting_group ASC, setting_key ASC`);
  },

  updateSystemSetting: async (key, value) => {
    await query(`UPDATE system_settings SET setting_value = ? WHERE setting_key = ?`, [value, key]);
    const [updated] = await query(`SELECT * FROM system_settings WHERE setting_key = ?`, [key]);
    return updated;
  },
};

module.exports = governanceService;
