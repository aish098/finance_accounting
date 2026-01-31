const db = require('../config/db');

class AccountRepository {
    async getAll() {
        const [rows] = await db.query('SELECT * FROM accounts ORDER BY code ASC');
        return rows;
    }

    async getById(id) {
        const [rows] = await db.query('SELECT * FROM accounts WHERE id = ?', [id]);
        return rows[0];
    }

    async getByCode(code, excludeId = null) {
        let query = 'SELECT * FROM accounts WHERE code = ?';
        const params = [code];
        if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
        const [rows] = await db.query(query, params);
        return rows[0];
    }

    async create(accountData) {
        const { code, name, type, normal_balance, description } = accountData;
        const [result] = await db.query(
            'INSERT INTO accounts (code, name, type, normal_balance, description) VALUES (?, ?, ?, ?, ?)',
            [code, name, type, normal_balance, description]
        );
        return result.insertId;
    }

    async update(id, accountData) {
        const { code, name, type, normal_balance, description } = accountData;
        await db.query(
            'UPDATE accounts SET code = ?, name = ?, type = ?, normal_balance = ?, description = ? WHERE id = ?',
            [code, name, type, normal_balance, description, id]
        );
    }

    async hasTransactions(accountId) {
        const [rows] = await db.query(
            'SELECT 1 FROM journal_items WHERE account_id = ? LIMIT 1',
            [accountId]
        );
        return rows.length > 0;
    }

    async delete(id) {
        await db.query('DELETE FROM accounts WHERE id = ?', [id]);
    }
}

module.exports = new AccountRepository();
