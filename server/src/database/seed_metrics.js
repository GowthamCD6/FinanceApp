const { query } = require('../config/database');

async function seedApiMetrics() {
  console.log('🌱 Seeding realistic API telemetry into api_metrics...');

  const endpoints = [
    { method: 'POST', path: '/api/payments/collect', avgLat: 42, errorChance: 0.01, weight: 35 },
    { method: 'GET', path: '/api/loans', avgLat: 38, errorChance: 0.005, weight: 25 },
    { method: 'POST', path: '/api/loans', avgLat: 64, errorChance: 0.02, weight: 12 },
    { method: 'GET', path: '/api/customers', avgLat: 28, errorChance: 0.005, weight: 20 },
    { method: 'POST', path: '/api/customers', avgLat: 52, errorChance: 0.015, weight: 8 },
    { method: 'POST', path: '/api/auth/login', avgLat: 68, errorChance: 0.03, weight: 18 },
    { method: 'GET', path: '/api/organizations', avgLat: 32, errorChance: 0.0, weight: 15 },
    { method: 'GET', path: '/api/funds/summary', avgLat: 45, errorChance: 0.01, weight: 14 },
    { method: 'GET', path: '/api/reports/summary', avgLat: 58, errorChance: 0.01, weight: 10 },
    { method: 'GET', path: '/api/governance/categories', avgLat: 22, errorChance: 0.0, weight: 8 },
    { method: 'GET', path: '/api/reconciliation', avgLat: 75, errorChance: 0.02, weight: 6 },
    { method: 'POST', path: '/api/funds/capital', avgLat: 82, errorChance: 0.02, weight: 5 },
  ];

  const ips = [
    '103.21.244.18',
    '157.48.120.45',
    '49.207.210.92',
    '182.73.189.14',
    '106.51.78.204',
    '122.172.84.11',
    '117.211.89.50',
    '127.0.0.1',
  ];

  const now = new Date();
  const rows = [];

  // Generate records over the past 30 days
  // More dense in the last 24 hours (hourly traffic simulation with peak hours between 9am - 8pm)
  for (let d = 29; d >= 0; d--) {
    const isToday = d === 0;
    const recordsToday = isToday ? 350 : Math.floor(80 + Math.random() * 90);

    for (let i = 0; i < recordsToday; i++) {
      // Pick random hour with business hour weight
      let hour;
      if (Math.random() < 0.8) {
        // Business hours 9 to 20
        hour = 9 + Math.floor(Math.random() * 12);
      } else {
        // Off hours
        hour = Math.floor(Math.random() * 24);
      }
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);

      const recordDate = new Date(now.getTime() - d * 24 * 3600 * 1000);
      recordDate.setHours(hour, minute, second);

      // Don't generate future timestamps
      if (recordDate > now) continue;

      // Select endpoint based on weight
      const totalWeight = endpoints.reduce((s, e) => s + e.weight, 0);
      let randWeight = Math.random() * totalWeight;
      let chosenEp = endpoints[0];
      for (const ep of endpoints) {
        if (randWeight < ep.weight) {
          chosenEp = ep;
          break;
        }
        randWeight -= ep.weight;
      }

      // Latency calculation with slight jitter
      const jitter = (Math.random() - 0.5) * (chosenEp.avgLat * 0.6);
      const latency = Math.max(12, Math.round(chosenEp.avgLat + jitter));

      // Status code
      let statusCode = 200;
      if (chosenEp.method === 'POST') statusCode = 201;

      const isError = Math.random() < chosenEp.errorChance;
      if (isError) {
        statusCode = Math.random() < 0.7 ? 400 : Math.random() < 0.5 ? 401 : 500;
      }

      const ip = ips[Math.floor(Math.random() * ips.length)];
      const orgId = Math.random() < 0.9 ? 1 + Math.floor(Math.random() * 7) : null;
      const userId = Math.random() < 0.8 ? 1 + Math.floor(Math.random() * 5) : null;

      const dateStr = recordDate.toISOString().slice(0, 19).replace('T', ' ');

      rows.push([
        chosenEp.path,
        chosenEp.method,
        statusCode,
        latency,
        orgId,
        userId,
        ip,
        dateStr,
      ]);
    }
  }

  // Insert in batches of 200
  const batchSize = 200;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = batch.flat();

    await query(
      `INSERT INTO api_metrics (endpoint, method, status_code, response_time_ms, organization_id, user_id, ip_address, created_at)
       VALUES ${placeholders}`,
      flatValues
    );
  }

  console.log(`✅ Successfully seeded ${rows.length} realistic API telemetry events into api_metrics.`);
}

seedApiMetrics()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
