const reportRepository = require('../repositories/reportRepository');

class ReportService {
    async generateTrialBalance(userId, startDate, endDate, entryType = null) {
        const data = await reportRepository.getTrialBalance(userId, startDate, endDate, entryType);
        
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
                credit: creditBalance,
                total_debit: totalDebit,
                total_credit: totalCredit,
                normal_balance: account.normal_balance
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

    async generateAdjustedTrialBalance(userId, startDate, endDate) {
        const unadjusted = await this.generateTrialBalance(userId, startDate, endDate, 'regular');
        const adjusting = await this.generateTrialBalance(userId, startDate, endDate, 'adjusting');
        
        const adjustedRows = unadjusted.rows.map((uRow, index) => {
            const aRow = adjusting.rows[index];
            
            // Calculate adjusted balance
            const netDebit = uRow.total_debit + aRow.total_debit;
            const netCredit = uRow.total_credit + aRow.total_credit;
            
            let finalDebit = 0;
            let finalCredit = 0;
            if (netDebit > netCredit) {
                finalDebit = netDebit - netCredit;
            } else {
                finalCredit = netCredit - netDebit;
            }

            return {
                account_code: uRow.account_code,
                account_name: uRow.account_name,
                unadjusted_debit: uRow.debit,
                unadjusted_credit: uRow.credit,
                adjusting_debit: aRow.total_debit,
                adjusting_credit: aRow.total_credit,
                adjusted_debit: finalDebit,
                adjusted_credit: finalCredit
            };
        });

        const totals = adjustedRows.reduce((acc, row) => {
            acc.unadjusted_debit += row.unadjusted_debit;
            acc.unadjusted_credit += row.unadjusted_credit;
            acc.adjusting_debit += row.adjusting_debit;
            acc.adjusting_credit += row.adjusting_credit;
            acc.adjusted_debit += row.adjusted_debit;
            acc.adjusted_credit += row.adjusted_credit;
            return acc;
        }, { 
            unadjusted_debit: 0, unadjusted_credit: 0, 
            adjusting_debit: 0, adjusting_credit: 0, 
            adjusted_debit: 0, adjusted_credit: 0 
        });

        return {
            rows: adjustedRows,
            totals: totals
        };
    }

    async generateProfitAndLoss(userId, startDate, endDate) {
        // Profit & Loss always uses adjusted data (regular + adjusting)
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
