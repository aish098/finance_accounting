const db = require('../config/db');

class ReportRepository {
    async getTrialBalance(userId) {
        const query = `
            SELECT 
                a.id, 
                a.code, 
                a.name, 
                a.type, 
                a.normal_balance,
                SUM(CASE WHEN je.created_by = ? THEN ji.debit ELSE 0 END) as total_debit,
                SUM(CASE WHEN je.created_by = ? THEN ji.credit ELSE 0 END) as total_credit
            FROM accounts a
            LEFT JOIN journal_items ji ON a.id = ji.account_id
            LEFT JOIN journal_entries je ON ji.journal_entry_id = je.id
            GROUP BY a.id, a.code, a.name, a.type, a.normal_balance
            ORDER BY a.code ASC
        `;
        const [rows] = await db.query(query, [userId, userId]);
        return rows;
    }

    async getLedgerEntries(userId, accountId, startDate, endDate) {
        let query = `
            SELECT 
                je.entry_date, 
                je.reference, 
                je.description, 
                ji.debit, 
                ji.credit
            FROM journal_items ji
            JOIN journal_entries je ON ji.journal_entry_id = je.id
            WHERE ji.account_id = ? AND je.created_by = ?
        `;
        const params = [accountId, userId];

        if (startDate) {
            query += ' AND je.entry_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND je.entry_date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY je.entry_date ASC, je.id ASC';
        
        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = new ReportRepository();
