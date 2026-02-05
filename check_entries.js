const db = require('./src/config/db');

async function check() {
    try {
        const [rows] = await db.query('SELECT entry_type, COUNT(*) as count FROM journal_entries GROUP BY entry_type');
        console.log('Journal Entry Types Summary:', rows);
        const [all] = await db.query('SELECT id, reference, entry_type FROM journal_entries LIMIT 10');
        console.log('Recent Entries Sample:', all);
        process.exit(0);
    } catch (e) {
        console.error('Error checking database:', e.message);
        process.exit(1);
    }
}

check();
