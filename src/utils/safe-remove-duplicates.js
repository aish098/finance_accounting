require('dotenv').config();
const pool = require('../config/db');

async function safeRemoveDuplicates() {
    let connection;
    try {
        connection = await pool.getConnection();
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
                console.log(`Processing duplicates for code: ${dup.code}`);
                
                // Get all accounts with this code, ordered by ID
                const [accounts] = await connection.execute(
                    'SELECT id FROM accounts WHERE code = ? ORDER BY id ASC',
                    [dup.code]
                );

                const primaryId = accounts[0].id;
                const duplicateIds = accounts.slice(1).map(a => a.id);

                console.log(`Primary ID: ${primaryId}, Duplicate IDs: ${duplicateIds.join(', ')}`);

                // Update journal_items for each duplicate ID
                for (const dupId of duplicateIds) {
                    const [result] = await connection.execute(
                        'UPDATE journal_items SET account_id = ? WHERE account_id = ?',
                        [primaryId, dupId]
                    );
                    console.log(`Updated ${result.affectedRows} journal items from account ID ${dupId} to ${primaryId}`);
                }

                // Now safe to delete duplicates
                const [delResult] = await connection.query(
                    'DELETE FROM accounts WHERE id IN (?)',
                    [duplicateIds]
                );
                console.log(`Deleted ${delResult.affectedRows} duplicate accounts for code ${dup.code}`);
            }
        }

        // 2. Optional: Find duplicate names (if any remain with different codes but same name/type)
        const [dupNames] = await connection.execute(`
            SELECT name, type, COUNT(*) as count 
            FROM accounts 
            GROUP BY name, type 
            HAVING count > 1
        `);

        if (dupNames.length > 0) {
            console.log(`Found ${dupNames.length} duplicate account names within the same type.`);
            for (const dup of dupNames) {
                console.log(`Processing duplicates for name: ${dup.name} (${dup.type})`);
                
                const [accounts] = await connection.execute(
                    'SELECT id FROM accounts WHERE name = ? AND type = ? ORDER BY id ASC',
                    [dup.name, dup.type]
                );

                const primaryId = accounts[0].id;
                const duplicateIds = accounts.slice(1).map(a => a.id);

                for (const dupId of duplicateIds) {
                    const [result] = await connection.execute(
                        'UPDATE journal_items SET account_id = ? WHERE account_id = ?',
                        [primaryId, dupId]
                    );
                    console.log(`Updated ${result.affectedRows} journal items from account ID ${dupId} to ${primaryId}`);
                }

                await connection.query(
                    'DELETE FROM accounts WHERE id IN (?)',
                    [duplicateIds]
                );
                console.log(`Deleted ${duplicateIds.length} duplicate accounts for name ${dup.name}`);
            }
        }

        console.log('Cleanup complete.');
    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

safeRemoveDuplicates();
