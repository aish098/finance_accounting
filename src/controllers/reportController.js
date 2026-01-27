const reportService = require('../services/reportService');

class ReportController {
    async getTrialBalance(req, res) {
        try {
            const userId = req.user.id;
            const report = await reportService.generateTrialBalance(userId);
            res.json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProfitAndLoss(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate } = req.query;
            const report = await reportService.generateProfitAndLoss(userId, startDate, endDate);
            res.json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBalanceSheet(req, res) {
        try {
            const userId = req.user.id;
            const report = await reportService.generateBalanceSheet(userId);
            res.json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLedger(req, res) {
        try {
            const userId = req.user.id;
            const { accountId, startDate, endDate } = req.query;
            const ledger = await reportService.getLedger(userId, accountId, startDate, endDate);
            res.json(ledger);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ReportController();
