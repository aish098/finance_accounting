rrequire('dotenv').config();
const mysql = require('mysql2/promise');

async function removeDuplicates() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // 1. Find duplicate codes
        const [duplicates] = await connection.execute(`
            SELECT code, COUNT(*) as count 
            FROM accounts 
            GROUP BY code 
            HAVING count > 1
        `);

        if (duplicates.length === 0) {
            console.log('No duplicate account codes found.');
        } else {
            console.log(`Found ${duplicates.length} account codes with duplicates.`);
            for (const dup of duplicates) {
                console.log(`Removing duplicates for code: ${dup.code}`);
                // Keep the one with the smallest ID
                await connection.execute(`
                    DELETE t1 FROM accounts t1
                    INNER JOIN accounts t2 
                    WHERE t1.id > t2.id AND t1.code = t2.code AND t1.code = ?
                `, [dup.code]);
            }
        }

        // 2. Find duplicate names (optional but good to check)
        const [dupNames] = await connection.execute(`
            SELECT name, type, COUNT(*) as count 
            FROM accounts 
            GROUP BY name, type 
            HAVING count > 1
        `);

        if (dupNames.length > 0) {
            console.log(`Found ${dupNames.length} duplicate account names within the same type.`);
            for (const dup of dupNames) {
                console.log(`Removing duplicates for name: ${dup.name} (${dup.type})`);
                await connection.execute(`
                    DELETE t1 FROM accounts t1
                    INNER JOIN accounts t2 
                    WHERE t1.id > t2.id AND t1.name = t2.name AND t1.type = t2.type AND t1.name = ? AND t1.type = ?
                `, [dup.name, dup.type]);
            }
        }

        console.log('Cleanup complete.');
    } catch (err) {
        console.error('Error during cleanup:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

removeDuplicates();
