const reportService = require('../services/reportService');

class ReportController {
    async getTrialBalance(req, res) {
        try {
            const report = await reportService.generateTrialBalance();
            res.json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProfitAndLoss(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const report = await reportService.generateProfitAndLoss(startDate, endDate);
            res.json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBalanceSheet(req, res) {
        try {
            const report = await reportService.generateBalanceSheet();
            res.json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ReportController();
