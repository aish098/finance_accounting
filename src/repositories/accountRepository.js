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
}

module.exports = new AccountRepository();
