const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/trial-balance', (req, res) => reportController.getTrialBalance(req, res));
router.get('/profit-loss', (req, res) => reportController.getProfitAndLoss(req, res));
router.get('/balance-sheet', (req, res) => reportController.getBalanceSheet(req, res));

module.exports = router;
