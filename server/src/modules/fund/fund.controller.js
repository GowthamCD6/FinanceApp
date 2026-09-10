const fundService = require('./fund.service');
const { query } = require('../../config/database');

async function getSummary(req, res) {
  try {
    const summary = await fundService.getFundSummary();
    return res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Fund summary error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function addCapital(req, res) {
  try {
    const { fundAccountId, amount, description } = req.body;
    if (!fundAccountId || !amount) {
      return res.status(400).json({ success: false, message: 'fundAccountId and amount are required.' });
    }

    const result = await fundService.injectCapital({
      fundAccountId: Number(fundAccountId),
      amount: parseFloat(amount),
      description,
      userId: req.user.id,
    });

    return res.status(201).json({ success: true, message: 'Capital injected successfully.', data: result });
  } catch (error) {
    console.error('Add capital error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getAccounts(req, res) {
  try {
    const accounts = await query(`SELECT * FROM fund_accounts WHERE status = 'ACTIVE'`);
    return res.json({ success: true, data: accounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getCirculationTrail(req, res) {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const trail = await fundService.getCirculationTrail(limit);
    return res.json({ success: true, data: trail });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getSummary,
  addCapital,
  getAccounts,
  getCirculationTrail,
};
