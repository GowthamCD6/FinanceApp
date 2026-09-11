const reportService = require('./report.service');

async function getDashboard(req, res) {
  try {
    const data = await reportService.getDashboardMetrics();
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard report error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getCashFlow(req, res) {
  try {
    const { from, to } = req.query;
    const data = await reportService.getCashFlowReport(from, to);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getPaymentReport(req, res) {
  try {
    const { start_date, end_date, frequency, status } = req.query;
    const data = await reportService.getPaymentReport({
      startDate: start_date,
      endDate: end_date,
      frequency,
      status,
    });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Payment report error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getDashboard,
  getCashFlow,
  getOverdue,
  getPaymentReport,
};
