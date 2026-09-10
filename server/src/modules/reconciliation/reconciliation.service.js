const { query, withTransaction } = require('../../config/database');

/**
 * Compare derived System Cash vs Actual Physical Cash
 */
async function performReconciliation({ fundAccountId, actualCash, notes, userId }) {
  const parsedActual = parseFloat(actualCash);
  if (isNaN(parsedActual) || parsedActual < 0) {
    throw new Error('Actual cash count must be a non-negative number.');
  }

  // 1. Calculate system cash from ledger
  const [balanceRow] = await query(
    `SELECT COALESCE(SUM(CASE WHEN direction = 'IN' THEN amount ELSE -amount END), 0) AS systemCash
     FROM fund_transactions WHERE fund_account_id = ?`,
    [fundAccountId]
  );
  const systemCash = parseFloat(balanceRow[0]?.systemCash || 0);
  const discrepancy = Math.round((parsedActual - systemCash) * 100) / 100;
  const status = discrepancy === 0 ? 'BALANCED' : 'DISCREPANCY_PENDING';

  const [result] = await query(
    `INSERT INTO reconciliations 
     (fund_account_id, reconciliation_date, system_cash, actual_cash, discrepancy, status, reconciled_by, notes)
     VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)`,
    [fundAccountId, systemCash, parsedActual, discrepancy, status, userId, notes || null]
  );

  return {
    id: result.insertId,
    fundAccountId,
    systemCash,
    actualCash: parsedActual,
    discrepancy,
    status,
  };
}

/**
 * Record an auditable reconciliation adjustment with central ledger entry
 */
async function recordAdjustment({ reconciliationId, adjustmentType, amount, reason, userId }) {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Adjustment amount must be a positive number.');
  }
  if (!reason) throw new Error('A reason is required to record a reconciliation adjustment.');

  return await withTransaction(async (conn) => {
    // 1. Lock reconciliation record
    const [recs] = await conn.query(`SELECT * FROM reconciliations WHERE id = ? FOR UPDATE`, [reconciliationId]);
    if (recs.length === 0) throw new Error('Reconciliation record not found.');
    const rec = recs[0];

    if (rec.status === 'BALANCED') {
      throw new Error('This reconciliation is already balanced. No adjustment needed.');
    }
    if (rec.status === 'ADJUSTED') {
      throw new Error('This reconciliation has already been adjusted.');
    }

    // 2. Determine ledger direction:
    // SHORTAGE: actual cash is less than system cash -> cash goes OUT
    // SURPLUS: actual cash is more than system cash -> cash goes IN
    const direction = adjustmentType === 'SHORTAGE' ? 'OUT' : 'IN';
    const txNumber = `TX-ADJ-REC-${rec.id}-${Date.now()}`;

    const [txResult] = await conn.query(
      `INSERT INTO fund_transactions 
       (transaction_number, fund_account_id, transaction_date, transaction_type, direction, amount, reference_type, reference_id, description, created_by)
       VALUES (?, ?, NOW(), 'ADJUSTMENT', ?, ?, 'RECONCILIATION', ?, ?, ?)`,
      [
        txNumber,
        rec.fund_account_id,
        direction,
        parsedAmount,
        rec.id,
        `Reconciliation adjustment (${adjustmentType}): ${reason}`,
        userId,
      ]
    );

    // 3. Insert reconciliation adjustment record
    await conn.query(
      `INSERT INTO reconciliation_adjustments 
       (reconciliation_id, adjustment_type, amount, fund_transaction_id, reason, authorized_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [rec.id, adjustmentType, parsedAmount, txResult.insertId, reason, userId]
    );

    // 4. Update reconciliation status to ADJUSTED
    await conn.query(`UPDATE reconciliations SET status = 'ADJUSTED' WHERE id = ?`, [rec.id]);

    return {
      reconciliationId: rec.id,
      adjustmentType,
      amount: parsedAmount,
      direction,
      status: 'ADJUSTED',
    };
  });
}

/**
 * List reconciliations history
 */
async function getReconciliationsList(page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const reconciliations = await query(
    `SELECT 
       r.*,
       fa.account_name,
       fa.account_code,
       u.name AS reconciled_by_name,
       ra.adjustment_type,
       ra.reason AS adjustment_reason,
       ra.authorized_by,
       auth_u.name AS authorized_by_name
     FROM reconciliations r
     JOIN fund_accounts fa ON r.fund_account_id = fa.id
     JOIN users u ON r.reconciled_by = u.id
     LEFT JOIN reconciliation_adjustments ra ON r.id = ra.reconciliation_id
     LEFT JOIN users auth_u ON ra.authorized_by = auth_u.id
     ORDER BY r.reconciliation_date DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return reconciliations;
}

module.exports = {
  performReconciliation,
  recordAdjustment,
  getReconciliationsList,
};
