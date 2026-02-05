const journalRepository = require('../repositories/journalRepository');
const accountRepository = require('../repositories/accountRepository');
const db = require('../config/db');

class JournalService {
    async createJournalEntry(entryData, items) {
        await this.validateEntry(entryData, items);

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const entryId = await journalRepository.createEntry(entryData, items, connection);
            await connection.commit();
            return entryId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async validateEntry(entryData, items) {
        // Validation: Total Debit must equal Total Credit
        const totalDebit = items.reduce((sum, item) => sum + parseFloat(item.debit || 0), 0);
        const totalCredit = items.reduce((sum, item) => sum + parseFloat(item.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new Error(`Unbalanced entry: Total Debit (${totalDebit.toFixed(2)}) does not equal Total Credit (${totalCredit.toFixed(2)})`);
        }

        if (items.length < 2) {
            throw new Error('A journal entry must have at least two line items');
        }

        // Adjusting Entry specific validations
        if (entryData.entry_type === 'adjusting') {
            const accountIds = items.map(item => item.account_id);
            const accounts = await accountRepository.getByIds(accountIds);
            const accountsMap = accounts.reduce((map, acc) => { map[acc.id] = acc; return map; }, {});

            let hasBalanceSheetAccount = false;
            let hasIncomeStatementAccount = false;
            let hasCashAccount = false;

            for (const item of items) {
                const account = accountsMap[item.account_id];
                if (!account) throw new Error(`Invalid account ID: ${item.account_id}`);

                // Cash account check (assuming code '1000' or similar name-based check if needed)
                if (account.code === '1000' || account.name.toLowerCase().includes('cash')) {
                    hasCashAccount = true;
                }

                if (['Asset', 'Liability', 'Equity'].includes(account.type)) {
                    hasBalanceSheetAccount = true;
                }
                if (['Revenue', 'Expense'].includes(account.type)) {
                    hasIncomeStatementAccount = true;
                }
            }

            if (hasCashAccount) {
                throw new Error('Adjusting entries must not involve cash accounts.');
            }

            if (!hasBalanceSheetAccount || !hasIncomeStatementAccount) {
                throw new Error('Adjusting entries must affect at least one Balance Sheet account and one Income Statement account.');
            }
        }
    }

    async getAllEntries(userId, filters = {}) {
        return await journalRepository.getAll(userId, filters);
    }

    async getEntryDetails(id, userId) {
        return await journalRepository.getById(id, userId);
    }

    async updateJournalEntry(entryId, userId, entryData, items) {
        const existing = await journalRepository.getById(entryId, userId);
        if (!existing) throw new Error('Journal entry not found');

        await this.validateEntry(entryData, items);

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await journalRepository.updateEntry(entryId, entryData, items, connection);
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteJournalEntry(entryId, userId) {
        const existing = await journalRepository.getById(entryId, userId);
        if (!existing) throw new Error('Journal entry not found');
        await journalRepository.deleteEntry(entryId, userId);
    }
}

module.exports = new JournalService();
