const loanService = require('../services/loan.service');
const { query } = require('../config/database');

async function createLoan(req, res) {
  try {
    const orgId = req.body.organizationId || req.body.organization_id || req.headers['x-organization-id'] || req.user?.organization_id || 1;
    const branchId = req.body.branchId || req.body.branch_id || req.branchId || req.headers['x-branch-id'] || req.user?.branch_id || null;
    const result = await loanService.createLoanApplication({ ...req.body, organizationId: orgId, branchId }, req.user.id);
    return res.status(201).json({ success: true, message: 'Loan application created.', data: result });
  } catch (error) {
    console.error('Create loan error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function approveLoan(req, res) {
  try {
    const result = await loanService.approveLoan(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Loan approved successfully.', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function disburseLoan(req, res) {
  try {
    const fundAccountId = req.body?.fundAccountId || 1;
    const fundingSource = req.body?.funding_source || req.body?.fundingSource || 'VAULT';

    const result = await loanService.disburseLoan({
      loanId: req.params.id,
      fundAccountId: Number(fundAccountId),
      userId: req.user.id,
      fundingSource,
    });

    return res.json({ success: true, message: 'Loan disbursed and installments generated.', data: result });
  } catch (error) {
    console.error('Disburse loan error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getLoans(req, res) {
  try {
    const { status, customerId, frequency, page, limit, organizationId, branchId } = req.query;
    const orgId = organizationId || req.headers['x-organization-id'] || req.organizationId || req.user?.organization_id || null;
    const effectiveBranchId = branchId || req.branchId || req.headers['x-branch-id'] || req.user?.branch_id || null;
    const result = await loanService.getLoans({
      status,
      customerId,
      frequency,
      organizationId: orgId,
      branchId: effectiveBranchId,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getLoanById(req, res) {
  try {
    const loan = await loanService.getLoanById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found.' });
    }
    return res.json({ success: true, data: loan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getProducts(req, res) {
  try {
    const products = await query(`
      SELECT lp.*, lpol.minimum_amount, lpol.maximum_amount, lpol.number_of_installments, lpol.income_type, lpol.income_value
      FROM loan_products lp
      LEFT JOIN loan_policies lpol ON lp.id = lpol.product_id AND lpol.status = 'ACTIVE'
      WHERE lp.status = 'ACTIVE'
    `);
    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function createRepeatLoan(req, res) {
  try {
    const { customerId, requestedAmount, notes } = req.body;
    const result = await loanService.createRepeatLoan({
      customerId: customerId || req.params.customerId,
      requestedAmount: parseFloat(requestedAmount || '15000'),
      notes,
      userId: req.user.id,
    });
    return res.status(201).json({
      success: true,
      message: 'Repeat loan created successfully with parent loan linkage.',
      data: result,
    });
  } catch (error) {
    console.error('Create repeat loan error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  createLoan,
  createRepeatLoan,
  approveLoan,
  disburseLoan,
  getLoans,
  getLoanById,
  getProducts,
};

