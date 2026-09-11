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
  getApiMetrics: async (filters = {}) => {
    const range = (filters.timeRange || '24h').toLowerCase();
    
    // Determine interval and grouping
    let intervalCondition = 'created_at >= NOW() - INTERVAL 24 HOUR';
    let timeGroupSql = "DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')";
    let timeLabelFormat = '%H:00';
    
    if (range === '7d') {
      intervalCondition = 'created_at >= NOW() - INTERVAL 7 DAY';
      timeGroupSql = "DATE(created_at)";
      timeLabelFormat = '%d %b';
    } else if (range === '30d') {
      intervalCondition = 'created_at >= NOW() - INTERVAL 30 DAY';
      timeGroupSql = "DATE(created_at)";
      timeLabelFormat = '%d %b';
    }

    // 1. Overall Totals in Time Window
    const [summary] = await query(`
      SELECT 
        COUNT(*) as total_requests,
        COALESCE(AVG(response_time_ms), 42.0) as avg_latency,
        COALESCE(MAX(response_time_ms), 0) as max_latency,
        COALESCE(MIN(response_time_ms), 0) as min_latency,
        SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as count_2xx,
        SUM(CASE WHEN status_code >= 400 AND status_code < 500 THEN 1 ELSE 0 END) as count_4xx,
        SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as count_5xx
      FROM api_metrics
      WHERE ${intervalCondition}
    `);

    const totalRequests = Number(summary?.total_requests || 0);
    const count2xx = Number(summary?.count_2xx || 0);
    const count4xx = Number(summary?.count_4xx || 0);
    const count5xx = Number(summary?.count_5xx || 0);
    const totalErrors = count4xx + count5xx;

    const successRate = totalRequests > 0 ? ((count2xx / totalRequests) * 100).toFixed(1) : '100.0';
    const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(1) : '0.0';
    const avgLatencyMs = Number(summary?.avg_latency || 38.5).toFixed(1);

    // 2. Approximate P95 Latency
    const p95Rows = await query(`
      SELECT response_time_ms 
      FROM api_metrics 
      WHERE ${intervalCondition} 
      ORDER BY response_time_ms ASC
    `);
    let p95LatencyMs = avgLatencyMs;
    if (p95Rows.length > 0) {
      const p95Index = Math.floor(p95Rows.length * 0.95);
      p95LatencyMs = Number(p95Rows[Math.min(p95Index, p95Rows.length - 1)].response_time_ms || 45).toFixed(1);
    }

    // 3. Time Series Breakdown (Hourly or Daily)
    const timeSeriesRows = await query(`
      SELECT 
        ${timeGroupSql} as time_bucket,
        DATE_FORMAT(created_at, '${timeLabelFormat}') as label,
        COUNT(*) as total,
        SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count,
        ROUND(AVG(response_time_ms), 1) as avg_latency
      FROM api_metrics
      WHERE ${intervalCondition}
      GROUP BY time_bucket, label
      ORDER BY time_bucket ASC
    `);

    // 4. Per-Endpoint Telemetry Breakdown
    const endpointRows = await query(`
      SELECT 
        method,
        endpoint,
        COUNT(*) as total_calls,
        ROUND(AVG(response_time_ms), 1) as avg_latency,
        ROUND(MIN(response_time_ms), 1) as min_latency,
        ROUND(MAX(response_time_ms), 1) as max_latency,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count,
        MAX(created_at) as last_called_at
      FROM api_metrics
      WHERE ${intervalCondition}
      GROUP BY method, endpoint
      ORDER BY total_calls DESC
    `);

    const endpointStats = endpointRows.map((ep) => {
      const calls = Number(ep.total_calls || 0);
      const errors = Number(ep.error_count || 0);
      const epErrorRate = calls > 0 ? ((errors / calls) * 100).toFixed(1) : '0.0';
      const avgLat = Number(ep.avg_latency || 0);

      let status = 'OPTIMAL';
      if (errors > 0 || avgLat > 120) status = 'HEALTHY';
      if (epErrorRate > 5 || avgLat > 250) status = 'DEGRADED';

      return {
        method: ep.method,
        endpoint: ep.endpoint,
        total_calls: calls,
        avg_latency: `${avgLat}ms`,
        min_latency: `${ep.min_latency || 0}ms`,
        max_latency: `${ep.max_latency || 0}ms`,
        error_count: errors,
        error_rate: `${epErrorRate}%`,
        status,
        last_called_at: ep.last_called_at,
      };
    });

    // 5. Status Code Breakdown
    const statusRows = await query(`
      SELECT status_code, COUNT(*) as count 
      FROM api_metrics 
      WHERE ${intervalCondition}
      GROUP BY status_code
      ORDER BY count DESC
    `);

    // 6. Recent Raw Invocation Logs (last 50)
    const recentLogs = await query(`
      SELECT id, endpoint, method, status_code, response_time_ms, ip_address, created_at 
      FROM api_metrics 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    return {
      timeRange: range,
      summary: {
        totalRequests,
        avgLatencyMs,
        p95LatencyMs,
        successRate: `${successRate}%`,
        errorRate: `${errorRate}%`,
        count2xx,
        count4xx,
        count5xx,
        uniqueEndpoints: endpointStats.length,
      },
      timeSeries: timeSeriesRows,
      endpointStats,
      statusBreakdown: statusRows,
      recentLogs,
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
