const reportRepository = require('../repositories/reportRepository');

class ReportService {
    async generateTrialBalance(userId, startDate, endDate) {
        const data = await reportRepository.getTrialBalance(userId, startDate, endDate);
        
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

    async generateProfitAndLoss(userId, startDate, endDate) {
        const data = await reportRepository.getTrialBalance(userId, startDate, endDate);
        
        const revenue = [];
        const expenses = [];
        
        let totalRevenue = 0;
        let totalExpenses = 0;

        data.forEach(account => {
            const totalDebit = parseFloat(account.total_debit || 0);
            const totalCredit = parseFloat(account.total_credit || 0);

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

    async generateBalanceSheet(userId, startDate, endDate) {
        // Balance sheet is "as of" a date. We use endDate for the snapshot.
        const data = await reportRepository.getTrialBalance(userId, null, endDate);
        
        const assets = [];
        const liabilities = [];
        const equity = [];
        
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        let cumulativeRevenue = 0;
        let cumulativeExpenses = 0;

        // Calculate Net Income for the specific requested period
        const pnL = await this.generateProfitAndLoss(userId, startDate, endDate);
        const currentNetIncome = pnL.netIncome;

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
            } else if (account.type === 'Revenue') {
                cumulativeRevenue += (totalCredit - totalDebit);
            } else if (account.type === 'Expense') {
                cumulativeExpenses += (totalDebit - totalCredit);
            }
        });

        // Retained Earnings logic (Total Net Income - Current Period Net Income)
        const totalNetIncome = cumulativeRevenue - cumulativeExpenses;
        const priorRetainedEarnings = totalNetIncome - currentNetIncome;

        if (Math.abs(priorRetainedEarnings) > 0.001) {
            equity.push({ name: 'Retained Earnings (Prior Periods)', amount: priorRetainedEarnings });
            totalEquity += priorRetainedEarnings;
        }

        // Add Net Income to Equity
        equity.push({ name: 'Net Income (Current Period)', amount: currentNetIncome });
        totalEquity += currentNetIncome;

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

    async getLedger(userId, accountId, startDate, endDate) {
        return await reportRepository.getLedgerEntries(userId, accountId, startDate, endDate);
    }
}

module.exports = new ReportService();
