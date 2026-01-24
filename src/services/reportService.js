const reportRepository = require('../repositories/reportRepository');

class ReportService {
    async generateTrialBalance() {
        const data = await reportRepository.getTrialBalance();
        
        const trialBalance = data.map(account => {
            const totalDebit = parseFloat(account.total_debit || 0);
            const totalCredit = parseFloat(account.total_credit || 0);
            
            let debitBalance = 0;
            let creditBalance = 0;

            if (totalDebit > totalCredit) {
                debitBalance = totalDebit - totalCredit;
            } else {
                creditBalance = totalCredit - totalDebit;
            }

            return {
                account_id: account.id,
                account_code: account.code,
                account_name: account.name,
                debit: debitBalance,
                credit: creditBalance
            };
        });

        const totals = trialBalance.reduce((acc, row) => {
            acc.debit += row.debit;
            acc.credit += row.credit;
            return acc;
        }, { debit: 0, credit: 0 });

        return {
            rows: trialBalance,
            totals: totals
        };
    }

    async generateProfitAndLoss(startDate, endDate) {
        // Implementation for P&L
        const data = await reportRepository.getTrialBalance(); // Using same aggregation for now
        
        const revenue = [];
        const expenses = [];
        
        let totalRevenue = 0;
        let totalExpenses = 0;

        data.forEach(account => {
            const totalDebit = parseFloat(account.total_debit || 0);
            const totalCredit = parseFloat(account.total_credit || 0);
            const balance = totalCredit - totalDebit; // Revenue/Expense usually credit normal or debit normal

            if (account.type === 'Revenue') {
                const net = totalCredit - totalDebit;
                if (net !== 0) {
                    revenue.push({ name: account.name, amount: net });
                    totalRevenue += net;
                }
            } else if (account.type === 'Expense') {
                const net = totalDebit - totalCredit;
                if (net !== 0) {
                    expenses.push({ name: account.name, amount: net });
                    totalExpenses += net;
                }
            }
        });

        return {
            revenue,
            expenses,
            totalRevenue,
            totalExpenses,
            netIncome: totalRevenue - totalExpenses
        };
    }

    async generateBalanceSheet() {
        const data = await reportRepository.getTrialBalance();
        
        const assets = [];
        const liabilities = [];
        const equity = [];
        
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;

        // Calculate Net Income for Retained Earnings
        const pnL = await this.generateProfitAndLoss();
        const netIncome = pnL.netIncome;

        data.forEach(account => {
            const totalDebit = parseFloat(account.total_debit || 0);
            const totalCredit = parseFloat(account.total_credit || 0);

            if (account.type === 'Asset') {
                const net = totalDebit - totalCredit;
                if (net !== 0) {
                    assets.push({ name: account.name, amount: net });
                    totalAssets += net;
                }
            } else if (account.type === 'Liability') {
                const net = totalCredit - totalDebit;
                if (net !== 0) {
                    liabilities.push({ name: account.name, amount: net });
                    totalLiabilities += net;
                }
            } else if (account.type === 'Equity') {
                const net = totalCredit - totalDebit;
                if (net !== 0) {
                    equity.push({ name: account.name, amount: net });
                    totalEquity += net;
                }
            }
        });

        // Add Net Income to Equity (Retained Earnings)
        equity.push({ name: 'Net Income (Current Period)', amount: netIncome });
        totalEquity += netIncome;

        return {
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalLiabilitiesAndEquity: totalLiabilities + totalEquity
        };
    }
}

module.exports = new ReportService();
