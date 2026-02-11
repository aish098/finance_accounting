const pool = require('./src/config/db');

async function findDuplicates() {
    try {
        const [rows] = await pool.query('SELECT name, code, COUNT(*) as count FROM accounts GROUP BY name, code HAVING count > 1');
        console.log('Duplicates by name and code:', rows);

        const [rowsByName] = await pool.query('SELECT name, COUNT(*) as count FROM accounts GROUP BY name HAVING count > 1');
        console.log('Duplicates by name only:', rowsByName);

        const [allAccounts] = await pool.query('SELECT * FROM accounts ORDER BY code');
        console.log('All accounts:', allAccounts);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findDuplicates();
