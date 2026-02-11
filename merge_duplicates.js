const db = require('./src/config/db');

async function mergeDuplicateNames() {
    let connection;
    try {
        connection = await db.getConnection();
        console.log('Connected to database.');

        // Find duplicate names (case-insensitive for some systems, but we'll group by name)
        const [dupNames] = await connection.execute(`
            SELECT name, type, COUNT(*) as count 
            FROM accounts 
            GROUP BY name, type 
            HAVING count > 1
        `);

        if (dupNames.length === 0) {
            console.log('No duplicate account names found.');
        } else {
            console.log(`Found ${dupNames.length} duplicate account names.`);
            for (const dup of dupNames) {
                console.log(`\nProcessing duplicates for name: "${dup.name}" (${dup.type})`);
                
                // Get all accounts with this name and type, ordered by ID
                const [accounts] = await connection.execute(
                    'SELECT id, code FROM accounts WHERE name = ? AND type = ? ORDER BY id ASC',
                    [dup.name, dup.type]
                );

                // We keep the one with the smallest ID (usually the original)
                const primaryId = accounts[0].id;
                const duplicateIds = accounts.slice(1).map(a => a.id);

                console.log(`Primary ID: ${primaryId} (Code: ${accounts[0].code})`);
                console.log(`Duplicate IDs: ${duplicateIds.join(', ')}`);

                // Remap journal items
                for (const dupId of duplicateIds) {
                    const [result] = await connection.execute(
                        'UPDATE journal_items SET account_id = ? WHERE account_id = ?',
                        [primaryId, dupId]
                    );
                    console.log(`   - Remapped ${result.affectedRows} journal items from account ID ${dupId}`);
                }

                // Delete the duplicates
                const [delResult] = await connection.query(
                    'DELETE FROM accounts WHERE id IN (?)',
                    [duplicateIds]
                );
                console.log(`   - Deleted ${delResult.affectedRows} duplicate account records.`);
            }
        }

        console.log('\nCleanup complete.');
    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

mergeDuplicateNames();
