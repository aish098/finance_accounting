const db = require('../config/db');
const bcrypt = require('bcryptjs');
const journalService = require('../services/journalService');

async function seed() {
    try {
        console.log('Seeding started...');
        
        // 1. Create Admin User
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
        let adminId;
        if (users.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const [result] = await db.query(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                ['admin', hashedPassword, 'admin']
            );
            adminId = result.insertId;
            console.log('Admin user created: admin / admin123');
        } else {
            adminId = users[0].id;
        }

        // 2. Initial Investment Entry (Cash Dr, Owner Equity Cr)
        const [cashAccount] = await db.query('SELECT id FROM accounts WHERE code = "1000"');
        const [equityAccount] = await db.query('SELECT id FROM accounts WHERE code = "3000"');
        
        const [existingInv] = await db.query('SELECT id FROM journal_entries WHERE reference = ?', ['INV-001']);
        
        if (cashAccount[0] && equityAccount[0] && existingInv.length === 0) {
            await journalService.createJournalEntry(
                {
                    entry_date: new Date().toISOString().split('T')[0],
                    reference: 'INV-001',
                    description: 'Initial Capital Investment',
                    created_by: adminId
                },
                [
                    { account_id: cashAccount[0].id, debit: 10000, credit: 0 },
                    { account_id: equityAccount[0].id, debit: 0, credit: 10000 }
                ]
            );
            console.log('Initial investment entry seeded.');
        } else if (existingInv.length > 0) {
            console.log('Initial investment entry already exists.');
        }

        // 3. Rent Expense (Rent Expense Dr, Cash Cr)
        const [rentAccount] = await db.query('SELECT id FROM accounts WHERE code = "5100"');
        const [existingExp] = await db.query('SELECT id FROM journal_entries WHERE reference = ?', ['EXP-001']);
        
        if (rentAccount[0] && cashAccount[0] && existingExp.length === 0) {
            await journalService.createJournalEntry(
                {
                    entry_date: new Date().toISOString().split('T')[0],
                    reference: 'EXP-001',
                    description: 'Office Rent Payment',
                    created_by: adminId
                },
                [
                    { account_id: rentAccount[0].id, debit: 1200, credit: 0 },
                    { account_id: cashAccount[0].id, debit: 0, credit: 1200 }
                ]
            );
            console.log('Rent expense entry seeded.');
        } else if (existingExp.length > 0) {
            console.log('Rent expense entry already exists.');
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
