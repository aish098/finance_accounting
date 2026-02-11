const db = require('./src/config/db');

async function checkDuplicates() {
    try {
        const [rows] = await db.query('SELECT code, name, type, COUNT(*) as count FROM accounts GROUP BY code, name, type HAVING count > 1');
        console.log('Duplicate accounts found:', JSON.stringify(rows, null, 2));
        
        const [allAccounts] = await db.query('SELECT id, code, name, type FROM accounts ORDER BY code, name');
        console.log('All accounts:', JSON.stringify(allAccounts, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkDuplicates();
