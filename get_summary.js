const db = require('./src/config/db');

async function getSummary() {
    try {
        const [accounts] = await db.query('SELECT code, name, type, normal_balance FROM accounts ORDER BY code');
        const [entries] = await db.query(`
            SELECT 
                je.id, je.entry_date, je.reference, je.entry_type, je.description, 
                ji.account_id, a.name as account_name, ji.debit, ji.credit 
            FROM journal_entries je 
            JOIN journal_items ji ON je.id = ji.journal_entry_id 
            JOIN accounts a ON ji.account_id = a.id 
            ORDER BY je.entry_date DESC, je.id DESC
        `);

        console.log('--- CHART OF ACCOUNTS ---');
        accounts.forEach(a => {
            console.log(`[${a.code}] ${a.name} (${a.type}) - Normal: ${a.normal_balance}`);
        });

        console.log('\n--- JOURNAL ENTRIES ---');
        const grouped = entries.reduce((acc, row) => {
            if (!acc[row.id]) acc[row.id] = { 
                date: row.entry_date, 
                ref: row.reference, 
                type: row.entry_type, 
                desc: row.description, 
                items: [] 
            };
            acc[row.id].items.push(row);
            return acc;
        }, {});

        Object.values(grouped).forEach(e => {
            const dateStr = e.date instanceof Date ? e.date.toISOString().split('T')[0] : e.date;
            console.log(`\nDate: ${dateStr} | Ref: ${e.ref} | Type: ${e.type.toUpperCase()}`);
            console.log(`Description: ${e.desc}`);
            e.items.forEach(i => {
                const d = parseFloat(i.debit) || 0;
                const c = parseFloat(i.credit) || 0;
                console.log(`  - ${i.account_name.padEnd(30)} | Debit: ${d.toFixed(2).padStart(10)} | Credit: ${c.toFixed(2).padStart(10)}`);
            });
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        process.exit(0);
    }
}

getSummary();
