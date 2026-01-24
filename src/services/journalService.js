const journalRepository = require('../repositories/journalRepository');
const db = require('../config/db');

class JournalService {
    async createJournalEntry(entryData, items) {
        // Validation: Total Debit must equal Total Credit
        const totalDebit = items.reduce((sum, item) => sum + parseFloat(item.debit || 0), 0);
        const totalCredit = items.reduce((sum, item) => sum + parseFloat(item.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new Error(`Unbalanced entry: Total Debit (${totalDebit}) does not equal Total Credit (${totalCredit})`);
        }

        if (items.length < 2) {
            throw new Error('A journal entry must have at least two line items');
        }

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

    async getAllEntries() {
        return await journalRepository.getAll();
    }

    async getEntryDetails(id) {
        return await journalRepository.getById(id);
    }
}

module.exports = new JournalService();
