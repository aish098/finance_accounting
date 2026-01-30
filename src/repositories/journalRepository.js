const db = require('../config/db');

class JournalRepository {
    async createEntry(entryData, items, connection) {
        const { entry_date, reference, description, created_by } = entryData;
        const [result] = await connection.query(
            'INSERT INTO journal_entries (entry_date, reference, description, created_by) VALUES (?, ?, ?, ?)',
            [entry_date, reference, description, created_by]
        );
        const journal_entry_id = result.insertId;

        for (const item of items) {
            await connection.query(
                'INSERT INTO journal_items (journal_entry_id, account_id, debit, credit) VALUES (?, ?, ?, ?)',
                [journal_entry_id, item.account_id, item.debit || 0, item.credit || 0]
            );
        }

        return journal_entry_id;
    }

    async getAll(userId) {
        const [rows] = await db.query(`
            SELECT je.*, u.username as created_by_name 
            FROM journal_entries je
            LEFT JOIN users u ON je.created_by = u.id
            WHERE je.created_by = ?
            ORDER BY je.entry_date DESC, je.id DESC
        `, [userId]);
        
        if (rows.length === 0) return [];

        const entryIds = rows.map(r => r.id);
        if (entryIds.length === 0) return [];

        const placeholders = entryIds.map(() => '?').join(',');
        const [itemRows] = await db.query(
            `SELECT * FROM journal_items WHERE journal_entry_id IN (${placeholders})`,
            entryIds
        );

        return rows.map(row => {
            const rowId = Number(row.id);
            const items = itemRows.filter(item => Number(item.journal_entry_id) === rowId);
            return { ...row, items };
        });
    }

    async getById(id, userId) {
        const [entryRows] = await db.query('SELECT * FROM journal_entries WHERE id = ? AND created_by = ?', [id, userId]);
        if (entryRows.length === 0) return null;

        const [itemRows] = await db.query(`
            SELECT ji.*, a.name as account_name, a.code as account_code 
            FROM journal_items ji
            JOIN accounts a ON ji.account_id = a.id
            WHERE ji.journal_entry_id = ?
        `, [id]);

        return { ...entryRows[0], items: itemRows };
    }
}

module.exports = new JournalRepository();
