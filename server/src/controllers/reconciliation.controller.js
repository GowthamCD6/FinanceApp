const reconciliationService = require('../services/reconciliation.service');

async function performReconciliation(req, res) {
  try {
    const { fundAccountId, actualCash, notes } = req.body;
    if (!fundAccountId || actualCash === undefined) {
      return res.status(400).json({ success: false, message: 'fundAccountId and actualCash count are required.' });
    }

    const result = await reconciliationService.performReconciliation({
      fundAccountId: Number(fundAccountId),
      actualCash: parseFloat(actualCash),
      notes,
      userId: req.user.id,
    });

    return res.status(201).json({ success: true, message: 'Reconciliation recorded.', data: result });
  } catch (error) {
    console.error('Reconciliation error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function recordAdjustment(req, res) {
  try {
    const { adjustmentType, amount, reason } = req.body;
    if (!adjustmentType || !amount || !reason) {
      return res.status(400).json({ success: false, message: 'adjustmentType, amount, and reason are required.' });
    }

    const result = await reconciliationService.recordAdjustment({
      reconciliationId: Number(req.params.id),
      adjustmentType,
      amount: parseFloat(amount),
      reason,
      userId: req.user.id,
    });

    return res.json({ success: true, message: 'Adjustment recorded and ledger updated.', data: result });
  } catch (error) {
    console.error('Adjustment error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getReconciliations(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const list = await reconciliationService.getReconciliationsList(page, limit);
    return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  performReconciliation,
  recordAdjustment,
  getReconciliations,
};
